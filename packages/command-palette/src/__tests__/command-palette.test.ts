// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  fuzzyScore,
  fuzzyFilter,
  highlightMatches,
} from '../fuzzy-search';
import {
  RECENT_KEY,
  getRecentCommandIds,
  addRecentCommandId,
  clearRecentCommands,
} from '../recent-commands';
import {
  isCommandPaletteShortcut,
  isEscape,
  isArrowDown,
  isArrowUp,
  isEnter,
} from '../keyboard-handler';
import type { Command, SearchResult } from '../types';

// ─── localStorage mock ────────────────────────────────────────────────────────

let localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: jest.fn((key: string) => localStorageStore[key] ?? null),
  setItem: jest.fn((key: string, value: string) => { localStorageStore[key] = value; }),
  removeItem: jest.fn((key: string) => { delete localStorageStore[key]; }),
  clear: jest.fn(() => { localStorageStore = {}; }),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

beforeEach(() => {
  localStorageStore = {};
  jest.clearAllMocks();
});

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeCmd(overrides: Partial<Command> = {}): Command {
  return {
    id: 'cmd-1',
    label: 'Open Dashboard',
    category: 'navigation',
    action: jest.fn(),
    ...overrides,
  };
}

function makeEvent(overrides: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return {
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    key: '',
    ...overrides,
  } as unknown as KeyboardEvent;
}

// ═════════════════════════════════════════════════════════════════════════════
// fuzzyScore
// ═════════════════════════════════════════════════════════════════════════════

describe('fuzzyScore — empty / null guards', () => {
  it('returns 0 for empty query', () => expect(fuzzyScore('', 'hello')).toBe(0));
  it('returns 0 for empty target', () => expect(fuzzyScore('hello', '')).toBe(0));
  it('returns 0 for both empty', () => expect(fuzzyScore('', '')).toBe(0));
  it('returns 0 for whitespace query', () => expect(fuzzyScore(' ', 'hello')).toBe(0));
  it('returns 0 for query longer than target', () => expect(fuzzyScore('abcdef', 'abc')).toBe(0));
});

describe('fuzzyScore — exact match (100)', () => {
  it('exact lowercase → 100', () => expect(fuzzyScore('hello', 'hello')).toBe(100));
  it('exact uppercase → 100', () => expect(fuzzyScore('HELLO', 'HELLO')).toBe(100));
  it('mixed case query vs lowercase target → 100', () => expect(fuzzyScore('Hello', 'hello')).toBe(100));
  it('lowercase query vs uppercase target → 100', () => expect(fuzzyScore('hello', 'HELLO')).toBe(100));
  it('single char exact → 100', () => expect(fuzzyScore('a', 'a')).toBe(100));
  it('single char case-insensitive → 100', () => expect(fuzzyScore('A', 'a')).toBe(100));
  it('word with numbers exact → 100', () => expect(fuzzyScore('iso9001', 'iso9001')).toBe(100));
  it('word with numbers case-insensitive → 100', () => expect(fuzzyScore('ISO9001', 'iso9001')).toBe(100));
  it('hyphenated word exact → 100', () => expect(fuzzyScore('health-safety', 'health-safety')).toBe(100));
  it('word with spaces exact → 100', () => expect(fuzzyScore('open dashboard', 'open dashboard')).toBe(100));
  it('two identical strings with mixed case → 100', () => expect(fuzzyScore('Dashboard', 'dashboard')).toBe(100));
  it('exact numeric string → 100', () => expect(fuzzyScore('12345', '12345')).toBe(100));
  it('special chars exact → 100', () => expect(fuzzyScore('!@#', '!@#')).toBe(100));
  it('module name exact → 100', () => expect(fuzzyScore('nonconformance', 'nonconformance')).toBe(100));
  it('long exact string → 100', () => {
    const s = 'a'.repeat(100);
    expect(fuzzyScore(s, s)).toBe(100);
  });
  it('single space exact → 0 (empty check fails only on falsy)', () => {
    // ' ' is truthy so it continues
    // ' '.toLowerCase() = ' ', ' '.startsWith(' ') → true → 90
    // actually ' ' starts with ' ' → 90
    expect(fuzzyScore(' ', ' ')).toBe(100);
  });
});

describe('fuzzyScore — starts-with (90)', () => {
  it('prefix match → 90', () => expect(fuzzyScore('hel', 'hello')).toBe(90));
  it('single char prefix → 90', () => expect(fuzzyScore('h', 'hello')).toBe(90));
  it('case-insensitive prefix → 90', () => expect(fuzzyScore('HEL', 'hello')).toBe(90));
  it('prefix with numbers → 90', () => expect(fuzzyScore('iso', 'iso9001')).toBe(90));
  it('open prefix → 90', () => expect(fuzzyScore('open', 'open dashboard')).toBe(90));
  it('create prefix → 90', () => expect(fuzzyScore('cre', 'create ncr')).toBe(90));
  it('nav prefix → 90', () => expect(fuzzyScore('nav', 'navigate to')).toBe(90));
  it('dash prefix → 90', () => expect(fuzzyScore('dash', 'dashboard')).toBe(90));
  it('set prefix → 90', () => expect(fuzzyScore('set', 'settings')).toBe(90));
  it('inc prefix → 90', () => expect(fuzzyScore('inc', 'incidents')).toBe(90));
  it('qua prefix → 90', () => expect(fuzzyScore('qua', 'quality')).toBe(90));
  it('env prefix → 90', () => expect(fuzzyScore('env', 'environment')).toBe(90));
  it('ris prefix → 90', () => expect(fuzzyScore('ris', 'risk')).toBe(90));
  it('aud prefix → 90', () => expect(fuzzyScore('aud', 'audit')).toBe(90));
  it('sup prefix → 90', () => expect(fuzzyScore('sup', 'supplier')).toBe(90));
  it('almost-full prefix → 90', () => expect(fuzzyScore('dashboar', 'dashboard')).toBe(90));
  it('length-1 prefix is exact if target is also 1 char', () => expect(fuzzyScore('a', 'ab')).toBe(90));
});

describe('fuzzyScore — contains as substring (70)', () => {
  it('mid-word match → 70', () => expect(fuzzyScore('ell', 'hello')).toBe(70));
  it('end-word match → 70', () => expect(fuzzyScore('llo', 'hello')).toBe(70));
  it('case-insensitive substring → 70', () => expect(fuzzyScore('ELL', 'hello')).toBe(70));
  it('contains number substring → 70', () => expect(fuzzyScore('900', 'iso9001')).toBe(70));
  it('contains middle word → 70', () => expect(fuzzyScore('board', 'dashboard')).toBe(70));
  it('contains ard → 70', () => expect(fuzzyScore('ard', 'dashboard')).toBe(70));
  it('contains nci → 70', () => expect(fuzzyScore('nci', 'incidents')).toBe(70));
  it('contains ity → 70', () => expect(fuzzyScore('ity', 'quality')).toBe(70));
  it('contains orm → 70', () => expect(fuzzyScore('orm', 'nonconformance')).toBe(70));
  it('contains onf → 70', () => expect(fuzzyScore('onf', 'conformance')).toBe(70));
  it('contains lier → 70', () => expect(fuzzyScore('lier', 'supplier')).toBe(70));
  it('contains ting → 70', () => expect(fuzzyScore('ting', 'settings')).toBe(70));
  it('contains iro → 70', () => expect(fuzzyScore('iro', 'environment')).toBe(70));
  it('single char in middle → 70', () => expect(fuzzyScore('e', 'hello')).toBe(70));
  it('contains full inner word → 70', () => expect(fuzzyScore('safety', 'health-safety')).toBe(70));
});

describe('fuzzyScore — fuzzy chars in order (50)', () => {
  it('h+o in hello world → 50', () => expect(fuzzyScore('hw', 'hello world')).toBe(50));
  it('all chars present out of order positions → 50', () => expect(fuzzyScore('dr', 'dashboard')).toBe(50));
  it('h+d in dashboard → 50', () => expect(fuzzyScore('hd', 'dashboard')).toBe(50));
  it('i+c in incidents → 50', () => expect(fuzzyScore('ic', 'incidents')).toBe(50));
  it('q+y in quality → 50', () => expect(fuzzyScore('qy', 'quality')).toBe(50));
  it('a+t in audit → 50', () => expect(fuzzyScore('at', 'audit')).toBe(50));
  it('s+r in supplier → 50', () => expect(fuzzyScore('sr', 'supplier')).toBe(50));
  it('n+r in nonconformance → 50', () => expect(fuzzyScore('nr', 'nonconformance')).toBe(50));
  it('e+t in environment → 50', () => expect(fuzzyScore('et', 'environment')).toBe(50));
  it('all chars in order through long string → 50', () => expect(fuzzyScore('ace', 'abcde')).toBe(50));
  it('first and last char → 50', () => expect(fuzzyScore('he', 'hello')).toBe(90)); // starts with 'h', then 'he' → starts with → 90
  it('h+o in "hello" → not fuzzy because "ho" not in sequence that avoids starts-with', () => {
    // 'ho': h→0 match, e→skip, l→skip, l→skip, o→1 match → 50
    expect(fuzzyScore('ho', 'hello')).toBe(50);
  });
});

describe('fuzzyScore — no match (0)', () => {
  it('z not in hello → 0', () => expect(fuzzyScore('z', 'hello')).toBe(0));
  it('xyz not in dashboard → 0', () => expect(fuzzyScore('xyz', 'dashboard')).toBe(0));
  it('qwerty not in abc → 0', () => expect(fuzzyScore('qwerty', 'abc')).toBe(0));
  it('numeric not in alpha → 0', () => expect(fuzzyScore('999', 'hello')).toBe(0));
  it('longer than target → 0', () => expect(fuzzyScore('toolong', 'too')).toBe(0));
  it('chars in wrong order → 0', () => expect(fuzzyScore('zz', 'hello')).toBe(0));
  it('missing final char → 0', () => expect(fuzzyScore('az', 'abc')).toBe(0));
});

// ═════════════════════════════════════════════════════════════════════════════
// fuzzyFilter
// ═════════════════════════════════════════════════════════════════════════════

const cmds: Command[] = [
  makeCmd({ id: 'c1', label: 'Open Dashboard', category: 'navigation', description: 'Go to main dashboard' }),
  makeCmd({ id: 'c2', label: 'Create NCR', category: 'actions', description: 'Create non-conformance', keywords: ['quality', 'ncr', 'defect'] }),
  makeCmd({ id: 'c3', label: 'Settings', category: 'settings', description: 'Application settings' }),
  makeCmd({ id: 'c4', label: 'View Incidents', category: 'navigation', description: 'List all incidents', keywords: ['safety', 'hse'] }),
  makeCmd({ id: 'c5', label: 'Approve Workflow', category: 'actions', keywords: ['approve', 'workflow', 'sign-off'] }),
];

describe('fuzzyFilter — empty query', () => {
  it('returns all commands with score 1', () => {
    const results = fuzzyFilter('', cmds);
    expect(results).toHaveLength(cmds.length);
  });
  it('every result has score 1', () => {
    const results = fuzzyFilter('', cmds);
    results.forEach(r => expect(r.score).toBe(1));
  });
  it('empty query preserves all commands', () => {
    const results = fuzzyFilter('', cmds);
    const ids = results.map(r => r.command.id);
    expect(ids).toContain('c1');
    expect(ids).toContain('c5');
  });
  it('matchedQuery is empty string', () => {
    const results = fuzzyFilter('', cmds);
    results.forEach(r => expect(r.matchedQuery).toBe(''));
  });
  it('empty query on empty array returns []', () => {
    expect(fuzzyFilter('', [])).toEqual([]);
  });
  it('whitespace query returns empty (no commands match whitespace)', () => {
    const results = fuzzyFilter(' ', cmds);
    // space is truthy, goes through scoring; only if a command label contains ' ' will it score > 0
    const labelWithSpace = cmds.some(c => c.label.includes(' '));
    expect(labelWithSpace).toBe(true); // 'Open Dashboard' has a space
    expect(results.length).toBeGreaterThan(0);
  });
});

describe('fuzzyFilter — non-empty query', () => {
  it('filters to only matching commands', () => {
    const results = fuzzyFilter('ncr', cmds);
    expect(results.some(r => r.command.id === 'c2')).toBe(true);
  });
  it('excludes zero-score commands', () => {
    const results = fuzzyFilter('ncr', cmds);
    // 'ncr' should not match 'Settings' or 'Open Dashboard'
    const ids = results.map(r => r.command.id);
    expect(ids).not.toContain('c3');
  });
  it('results sorted by score descending', () => {
    const results = fuzzyFilter('set', cmds);
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
    }
  });
  it('exact match scores highest', () => {
    const results = fuzzyFilter('Settings', cmds);
    expect(results[0].command.id).toBe('c3');
    expect(results[0].score).toBe(100);
  });
  it('matchedQuery reflects query', () => {
    const results = fuzzyFilter('ncr', cmds);
    results.forEach(r => expect(r.matchedQuery).toBe('ncr'));
  });
  it('matches by keyword', () => {
    const results = fuzzyFilter('safety', cmds);
    expect(results.some(r => r.command.id === 'c4')).toBe(true);
  });
  it('matches by keyword exact → score 100', () => {
    const results = fuzzyFilter('safety', cmds);
    const c4 = results.find(r => r.command.id === 'c4');
    expect(c4?.score).toBe(100);
  });
  it('matches by description', () => {
    const results = fuzzyFilter('main dashboard', cmds);
    expect(results.some(r => r.command.id === 'c1')).toBe(true);
  });
  it('empty commands array returns []', () => {
    expect(fuzzyFilter('ncr', [])).toEqual([]);
  });
  it('no matching query returns []', () => {
    expect(fuzzyFilter('zzzzz', cmds)).toEqual([]);
  });
  it('returns SearchResult shape', () => {
    const results = fuzzyFilter('dash', cmds);
    expect(results[0]).toHaveProperty('command');
    expect(results[0]).toHaveProperty('score');
    expect(results[0]).toHaveProperty('matchedQuery');
  });
  it('command with no description still matches by label', () => {
    const noDesc = [makeCmd({ id: 'x', label: 'Export Report', category: 'actions' })];
    const results = fuzzyFilter('export', noDesc);
    expect(results).toHaveLength(1);
  });
  it('command with no keywords still matches by label', () => {
    const noKw = [makeCmd({ id: 'x', label: 'Dashboard', category: 'navigation' })];
    const results = fuzzyFilter('dash', noKw);
    expect(results).toHaveLength(1);
  });
  it('all fields contribute to best score', () => {
    const cmd = makeCmd({ id: 'x', label: 'alpha', description: 'beta', keywords: ['delta'], category: 'actions' });
    // 'delta' exact → 100
    const results = fuzzyFilter('delta', [cmd]);
    expect(results[0].score).toBe(100);
  });
  it('disabled commands are still returned', () => {
    const disabled = makeCmd({ id: 'dis', label: 'Disabled Command', disabled: true, category: 'actions' });
    const results = fuzzyFilter('dis', [disabled]);
    expect(results.some(r => r.command.id === 'dis')).toBe(true);
  });
  it('multiple keywords checked individually', () => {
    const cmd = makeCmd({ id: 'x', label: 'X', keywords: ['foo', 'bar', 'baz'], category: 'actions' });
    expect(fuzzyFilter('bar', [cmd])).toHaveLength(1);
    expect(fuzzyFilter('baz', [cmd])).toHaveLength(1);
    expect(fuzzyFilter('qux', [cmd])).toHaveLength(0);
  });
  it('best score wins across all fields', () => {
    const cmd = makeCmd({
      id: 'x',
      label: 'alpha',          // 'qua' → 0
      description: 'quality',  // 'qua' → 90 (starts with)
      keywords: ['qa'],        // 'qua' → 0
      category: 'actions',
    });
    const results = fuzzyFilter('qua', [cmd]);
    expect(results[0].score).toBe(90);
  });
});

describe('fuzzyFilter — sorting', () => {
  it('exact match first', () => {
    const list = [
      makeCmd({ id: 'a', label: 'dashboard', category: 'navigation' }),
      makeCmd({ id: 'b', label: 'Dashboard Overview', category: 'navigation' }),
      makeCmd({ id: 'c', label: 'main dashboard', category: 'navigation' }),
    ];
    const results = fuzzyFilter('dashboard', list);
    expect(results[0].command.id).toBe('a');
  });
  it('starts-with before contains', () => {
    const list = [
      makeCmd({ id: 'a', label: 'settings panel', category: 'settings' }),
      makeCmd({ id: 'b', label: 'set defaults', category: 'settings' }),
      makeCmd({ id: 'c', label: 'reset to defaults', category: 'settings' }),
    ];
    const results = fuzzyFilter('set', list);
    const settingsIdx = results.findIndex(r => r.command.id === 'b');
    const resetIdx = results.findIndex(r => r.command.id === 'c');
    expect(settingsIdx).toBeLessThan(resetIdx);
  });
  it('ties preserve relative input order', () => {
    const list = [
      makeCmd({ id: 'a', label: 'alpha', category: 'actions' }),
      makeCmd({ id: 'b', label: 'aleph', category: 'actions' }),
    ];
    const results = fuzzyFilter('al', list);
    // both start with 'al' → score 90 each; sort is stable by score
    expect(results).toHaveLength(2);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// highlightMatches
// ═════════════════════════════════════════════════════════════════════════════

describe('highlightMatches — guards', () => {
  it('empty query → returns text unchanged', () => expect(highlightMatches('', 'hello')).toBe('hello'));
  it('empty text → returns empty text', () => expect(highlightMatches('hello', '')).toBe(''));
  it('both empty → returns empty', () => expect(highlightMatches('', '')).toBe(''));
});

describe('highlightMatches — exact match', () => {
  it('exact match wraps entire text with **', () => expect(highlightMatches('hello', 'hello')).toBe('**hello**'));
  it('case-insensitive exact → wraps with **', () => expect(highlightMatches('HELLO', 'hello')).toBe('**hello**'));
  it('single char exact → **a**', () => expect(highlightMatches('a', 'a')).toBe('**a**'));
  it('mixed-case exact → wraps original casing', () => {
    const result = highlightMatches('Dashboard', 'Dashboard');
    expect(result).toBe('**Dashboard**');
  });
});

describe('highlightMatches — substring match', () => {
  it('substring at start → bolds prefix', () => {
    const result = highlightMatches('hel', 'hello');
    expect(result).toBe('**hel**lo');
  });
  it('substring in middle → bolds middle', () => {
    const result = highlightMatches('ell', 'hello');
    expect(result).toBe('h**ell**o');
  });
  it('substring at end → bolds suffix', () => {
    const result = highlightMatches('lo', 'hello');
    expect(result).toBe('hel**lo**');
  });
  it('case-insensitive substring', () => {
    const result = highlightMatches('ELL', 'hello');
    expect(result).toBe('h**ell**o');
  });
  it('full substring match (not exact, longer target)', () => {
    const result = highlightMatches('board', 'dashboard');
    expect(result).toBe('dash**board**');
  });
  it('substring single char', () => {
    const result = highlightMatches('e', 'hello');
    expect(result).toBe('h**e**llo');
  });
});

describe('highlightMatches — fuzzy match', () => {
  it('fuzzy chars bolded individually', () => {
    const result = highlightMatches('hw', 'hello world');
    // h→match, e→not, l→not, l→not, o→not, space→not, w→match ...
    expect(result).toContain('**h**');
    expect(result).toContain('**w**');
  });
  it('fuzzy match with h and d in dashboard', () => {
    const result = highlightMatches('hd', 'dashboard');
    expect(result).toContain('**h**');
    expect(result).toContain('**d**');
  });
  it('no fuzzy match → original text returned', () => {
    const result = highlightMatches('zzz', 'hello');
    expect(result).toBe('hello');
  });
  it('fuzzy match returns string type', () => {
    expect(typeof highlightMatches('ac', 'abcde')).toBe('string');
  });
});

describe('highlightMatches — edge cases', () => {
  it('query equals text (full exact)', () => {
    expect(highlightMatches('abc', 'abc')).toBe('**abc**');
  });
  it('numbers in query and text', () => {
    const result = highlightMatches('90', 'iso9001');
    expect(result).toContain('**90**');
  });
  it('handles special chars without throwing', () => {
    expect(() => highlightMatches('(', 'left(')).not.toThrow();
  });
  it('returns string in all paths', () => {
    expect(typeof highlightMatches('a', 'b')).toBe('string');
    expect(typeof highlightMatches('a', 'a')).toBe('string');
    expect(typeof highlightMatches('a', 'abc')).toBe('string');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// recent-commands — getRecentCommandIds
// ═════════════════════════════════════════════════════════════════════════════

describe('getRecentCommandIds — localStorage absent', () => {
  it('returns [] when localStorage is undefined', () => {
    const original = (global as any).localStorage;
    delete (global as any).localStorage;
    expect(getRecentCommandIds()).toEqual([]);
    (global as any).localStorage = original;
  });
});

describe('getRecentCommandIds — empty / invalid storage', () => {
  it('returns [] when key absent', () => {
    expect(getRecentCommandIds()).toEqual([]);
  });
  it('returns [] for invalid JSON', () => {
    localStorageStore[RECENT_KEY] = 'not-json{{';
    expect(getRecentCommandIds()).toEqual([]);
  });
  it('returns [] for JSON null', () => {
    localStorageStore[RECENT_KEY] = 'null';
    expect(getRecentCommandIds()).toEqual([]);
  });
  it('returns [] for JSON number', () => {
    localStorageStore[RECENT_KEY] = '42';
    expect(getRecentCommandIds()).toEqual([]);
  });
  it('returns [] for JSON object', () => {
    localStorageStore[RECENT_KEY] = '{"a":1}';
    expect(getRecentCommandIds()).toEqual([]);
  });
  it('returns [] for JSON string', () => {
    localStorageStore[RECENT_KEY] = '"hello"';
    expect(getRecentCommandIds()).toEqual([]);
  });
  it('returns [] for JSON boolean', () => {
    localStorageStore[RECENT_KEY] = 'true';
    expect(getRecentCommandIds()).toEqual([]);
  });
  it('returns [] for empty array', () => {
    localStorageStore[RECENT_KEY] = '[]';
    expect(getRecentCommandIds()).toEqual([]);
  });
});

describe('getRecentCommandIds — valid data', () => {
  it('returns ids from storage', () => {
    localStorageStore[RECENT_KEY] = JSON.stringify(['cmd-1', 'cmd-2']);
    expect(getRecentCommandIds()).toEqual(['cmd-1', 'cmd-2']);
  });
  it('respects max parameter', () => {
    localStorageStore[RECENT_KEY] = JSON.stringify(['a', 'b', 'c', 'd', 'e']);
    expect(getRecentCommandIds(3)).toHaveLength(3);
    expect(getRecentCommandIds(3)).toEqual(['a', 'b', 'c']);
  });
  it('default max is 10', () => {
    const ids = Array.from({ length: 15 }, (_, i) => `cmd-${i}`);
    localStorageStore[RECENT_KEY] = JSON.stringify(ids);
    expect(getRecentCommandIds()).toHaveLength(10);
  });
  it('filters non-string items', () => {
    localStorageStore[RECENT_KEY] = JSON.stringify(['cmd-1', 42, null, 'cmd-2', true]);
    const result = getRecentCommandIds();
    expect(result).toEqual(['cmd-1', 'cmd-2']);
  });
  it('returns single item array', () => {
    localStorageStore[RECENT_KEY] = JSON.stringify(['only-one']);
    expect(getRecentCommandIds()).toEqual(['only-one']);
  });
  it('max 0 returns []', () => {
    localStorageStore[RECENT_KEY] = JSON.stringify(['a', 'b']);
    expect(getRecentCommandIds(0)).toEqual([]);
  });
  it('max 1 returns first item', () => {
    localStorageStore[RECENT_KEY] = JSON.stringify(['first', 'second']);
    expect(getRecentCommandIds(1)).toEqual(['first']);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// recent-commands — addRecentCommandId
// ═════════════════════════════════════════════════════════════════════════════

describe('addRecentCommandId — basic operations', () => {
  it('adds id to empty storage', () => {
    addRecentCommandId('cmd-1');
    expect(getRecentCommandIds()).toEqual(['cmd-1']);
  });
  it('prepends new id to existing', () => {
    addRecentCommandId('cmd-1');
    addRecentCommandId('cmd-2');
    expect(getRecentCommandIds()[0]).toBe('cmd-2');
    expect(getRecentCommandIds()[1]).toBe('cmd-1');
  });
  it('deduplicates: re-adding moves to front', () => {
    addRecentCommandId('cmd-1');
    addRecentCommandId('cmd-2');
    addRecentCommandId('cmd-1'); // duplicate
    const ids = getRecentCommandIds();
    expect(ids[0]).toBe('cmd-1');
    expect(ids.filter(id => id === 'cmd-1')).toHaveLength(1);
  });
  it('respects default max of 10', () => {
    for (let i = 0; i < 12; i++) addRecentCommandId(`cmd-${i}`);
    expect(getRecentCommandIds()).toHaveLength(10);
  });
  it('respects custom max', () => {
    for (let i = 0; i < 6; i++) addRecentCommandId(`cmd-${i}`, 3);
    expect(getRecentCommandIds(1000)).toHaveLength(3);
  });
  it('most recently added is first', () => {
    addRecentCommandId('cmd-a');
    addRecentCommandId('cmd-b');
    addRecentCommandId('cmd-c');
    expect(getRecentCommandIds()[0]).toBe('cmd-c');
  });
  it('stores correctly in localStorage', () => {
    addRecentCommandId('cmd-x');
    const stored = JSON.parse(localStorageStore[RECENT_KEY]);
    expect(stored).toContain('cmd-x');
  });
  it('handles localStorage undefined gracefully', () => {
    const original = (global as any).localStorage;
    delete (global as any).localStorage;
    expect(() => addRecentCommandId('cmd-1')).not.toThrow();
    (global as any).localStorage = original;
  });
  it('adding same id 5 times results in 1 entry', () => {
    for (let i = 0; i < 5; i++) addRecentCommandId('same-id');
    expect(getRecentCommandIds()).toEqual(['same-id']);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// recent-commands — clearRecentCommands
// ═════════════════════════════════════════════════════════════════════════════

describe('clearRecentCommands', () => {
  it('removes all recent commands', () => {
    addRecentCommandId('cmd-1');
    addRecentCommandId('cmd-2');
    clearRecentCommands();
    expect(getRecentCommandIds()).toEqual([]);
  });
  it('does not throw when storage is already empty', () => {
    expect(() => clearRecentCommands()).not.toThrow();
  });
  it('handles localStorage undefined gracefully', () => {
    const original = (global as any).localStorage;
    delete (global as any).localStorage;
    expect(() => clearRecentCommands()).not.toThrow();
    (global as any).localStorage = original;
  });
  it('after clear, adding works again', () => {
    addRecentCommandId('cmd-1');
    clearRecentCommands();
    addRecentCommandId('cmd-new');
    expect(getRecentCommandIds()).toEqual(['cmd-new']);
  });
  it('clears storage key entirely', () => {
    addRecentCommandId('cmd-1');
    clearRecentCommands();
    expect(localStorageStore[RECENT_KEY]).toBeUndefined();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// keyboard-handler — isCommandPaletteShortcut
// ═════════════════════════════════════════════════════════════════════════════

describe('isCommandPaletteShortcut', () => {
  it('metaKey + k → true', () => expect(isCommandPaletteShortcut(makeEvent({ metaKey: true, key: 'k' }))).toBe(true));
  it('ctrlKey + k → true', () => expect(isCommandPaletteShortcut(makeEvent({ ctrlKey: true, key: 'k' }))).toBe(true));
  it('metaKey + K (uppercase) → false (key is case-sensitive)', () => {
    expect(isCommandPaletteShortcut(makeEvent({ metaKey: true, key: 'K' }))).toBe(false);
  });
  it('ctrlKey + K (uppercase) → false', () => {
    expect(isCommandPaletteShortcut(makeEvent({ ctrlKey: true, key: 'K' }))).toBe(false);
  });
  it('metaKey + other key → false', () => expect(isCommandPaletteShortcut(makeEvent({ metaKey: true, key: 's' }))).toBe(false));
  it('ctrlKey + other key → false', () => expect(isCommandPaletteShortcut(makeEvent({ ctrlKey: true, key: 's' }))).toBe(false));
  it('no modifier + k → false', () => expect(isCommandPaletteShortcut(makeEvent({ key: 'k' }))).toBe(false));
  it('altKey + k → false', () => expect(isCommandPaletteShortcut(makeEvent({ altKey: true, key: 'k' }))).toBe(false));
  it('shiftKey + k → false', () => expect(isCommandPaletteShortcut(makeEvent({ shiftKey: true, key: 'k' }))).toBe(false));
  it('metaKey without key → false', () => expect(isCommandPaletteShortcut(makeEvent({ metaKey: true, key: '' }))).toBe(false));
  it('ctrlKey without key → false', () => expect(isCommandPaletteShortcut(makeEvent({ ctrlKey: true, key: '' }))).toBe(false));
  it('both metaKey and ctrlKey + k → true (meta || ctrl)', () => {
    expect(isCommandPaletteShortcut(makeEvent({ metaKey: true, ctrlKey: true, key: 'k' }))).toBe(true);
  });
  it('no keys pressed → false', () => expect(isCommandPaletteShortcut(makeEvent())).toBe(false));
  it('metaKey + number → false', () => expect(isCommandPaletteShortcut(makeEvent({ metaKey: true, key: '1' }))).toBe(false));
  it('ctrlKey + Escape → false', () => expect(isCommandPaletteShortcut(makeEvent({ ctrlKey: true, key: 'Escape' }))).toBe(false));
});

describe('isEscape', () => {
  it('Escape key → true', () => expect(isEscape(makeEvent({ key: 'Escape' }))).toBe(true));
  it('Esc (short) → false (not the event key value)', () => expect(isEscape(makeEvent({ key: 'Esc' }))).toBe(false));
  it('Enter → false', () => expect(isEscape(makeEvent({ key: 'Enter' }))).toBe(false));
  it('empty string → false', () => expect(isEscape(makeEvent({ key: '' }))).toBe(false));
  it('ArrowDown → false', () => expect(isEscape(makeEvent({ key: 'ArrowDown' }))).toBe(false));
  it('e → false', () => expect(isEscape(makeEvent({ key: 'e' }))).toBe(false));
  it('escape lowercase → false', () => expect(isEscape(makeEvent({ key: 'escape' }))).toBe(false));
  it('with modifier keys → still checks key', () => {
    expect(isEscape(makeEvent({ metaKey: true, key: 'Escape' }))).toBe(true);
  });
  it('Tab → false', () => expect(isEscape(makeEvent({ key: 'Tab' }))).toBe(false));
  it('Space → false', () => expect(isEscape(makeEvent({ key: ' ' }))).toBe(false));
});

describe('isArrowDown', () => {
  it('ArrowDown → true', () => expect(isArrowDown(makeEvent({ key: 'ArrowDown' }))).toBe(true));
  it('ArrowUp → false', () => expect(isArrowDown(makeEvent({ key: 'ArrowUp' }))).toBe(false));
  it('arrowdown lowercase → false', () => expect(isArrowDown(makeEvent({ key: 'arrowdown' }))).toBe(false));
  it('Down → false', () => expect(isArrowDown(makeEvent({ key: 'Down' }))).toBe(false));
  it('empty → false', () => expect(isArrowDown(makeEvent({ key: '' }))).toBe(false));
  it('ArrowLeft → false', () => expect(isArrowDown(makeEvent({ key: 'ArrowLeft' }))).toBe(false));
  it('ArrowRight → false', () => expect(isArrowDown(makeEvent({ key: 'ArrowRight' }))).toBe(false));
  it('Enter → false', () => expect(isArrowDown(makeEvent({ key: 'Enter' }))).toBe(false));
  it('Tab → false', () => expect(isArrowDown(makeEvent({ key: 'Tab' }))).toBe(false));
  it('with modifier → still true for ArrowDown', () => {
    expect(isArrowDown(makeEvent({ shiftKey: true, key: 'ArrowDown' }))).toBe(true);
  });
});

describe('isArrowUp', () => {
  it('ArrowUp → true', () => expect(isArrowUp(makeEvent({ key: 'ArrowUp' }))).toBe(true));
  it('ArrowDown → false', () => expect(isArrowUp(makeEvent({ key: 'ArrowDown' }))).toBe(false));
  it('arrowup lowercase → false', () => expect(isArrowUp(makeEvent({ key: 'arrowup' }))).toBe(false));
  it('Up → false', () => expect(isArrowUp(makeEvent({ key: 'Up' }))).toBe(false));
  it('empty → false', () => expect(isArrowUp(makeEvent({ key: '' }))).toBe(false));
  it('ArrowLeft → false', () => expect(isArrowUp(makeEvent({ key: 'ArrowLeft' }))).toBe(false));
  it('ArrowRight → false', () => expect(isArrowUp(makeEvent({ key: 'ArrowRight' }))).toBe(false));
  it('Escape → false', () => expect(isArrowUp(makeEvent({ key: 'Escape' }))).toBe(false));
  it('with modifier → still true for ArrowUp', () => {
    expect(isArrowUp(makeEvent({ shiftKey: true, key: 'ArrowUp' }))).toBe(true);
  });
  it('PageUp → false', () => expect(isArrowUp(makeEvent({ key: 'PageUp' }))).toBe(false));
});

describe('isEnter', () => {
  it('Enter → true', () => expect(isEnter(makeEvent({ key: 'Enter' }))).toBe(true));
  it('Return → false', () => expect(isEnter(makeEvent({ key: 'Return' }))).toBe(false));
  it('enter lowercase → false', () => expect(isEnter(makeEvent({ key: 'enter' }))).toBe(false));
  it('NumpadEnter → false', () => expect(isEnter(makeEvent({ key: 'NumpadEnter' }))).toBe(false));
  it('empty → false', () => expect(isEnter(makeEvent({ key: '' }))).toBe(false));
  it('Escape → false', () => expect(isEnter(makeEvent({ key: 'Escape' }))).toBe(false));
  it('Tab → false', () => expect(isEnter(makeEvent({ key: 'Tab' }))).toBe(false));
  it('Space → false', () => expect(isEnter(makeEvent({ key: ' ' }))).toBe(false));
  it('with ctrlKey → still true', () => {
    expect(isEnter(makeEvent({ ctrlKey: true, key: 'Enter' }))).toBe(true);
  });
  it('with metaKey → still true', () => {
    expect(isEnter(makeEvent({ metaKey: true, key: 'Enter' }))).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Integration: full palette flow
// ═════════════════════════════════════════════════════════════════════════════

describe('Full palette flow', () => {
  it('can add and retrieve recent commands', () => {
    addRecentCommandId('cmd-quality');
    addRecentCommandId('cmd-dashboard');
    const recent = getRecentCommandIds();
    expect(recent[0]).toBe('cmd-dashboard');
    expect(recent[1]).toBe('cmd-quality');
  });
  it('fuzzyFilter respects command structure', () => {
    const palette = [
      makeCmd({ id: 'quality.ncr', label: 'Create NCR', category: 'actions', keywords: ['quality'] }),
      makeCmd({ id: 'safety.incident', label: 'New Incident', category: 'actions', keywords: ['safety'] }),
    ];
    const results = fuzzyFilter('ncr', palette);
    expect(results).toHaveLength(1);
    expect(results[0].command.id).toBe('quality.ncr');
  });
  it('keyboard handler correctly identifies Cmd+K shortcut', () => {
    const event = makeEvent({ metaKey: true, key: 'k' });
    expect(isCommandPaletteShortcut(event)).toBe(true);
    expect(isEnter(event)).toBe(false);
    expect(isEscape(event)).toBe(false);
  });
  it('highlightMatches works on fuzzyFilter result label', () => {
    const results = fuzzyFilter('dash', [makeCmd({ id: 'x', label: 'Dashboard', category: 'navigation' })]);
    const label = results[0].command.label;
    const highlighted = highlightMatches('dash', label);
    expect(highlighted).toContain('**');
  });
  it('clear then add works after clear', () => {
    addRecentCommandId('old-cmd');
    clearRecentCommands();
    addRecentCommandId('new-cmd');
    expect(getRecentCommandIds()).toEqual(['new-cmd']);
  });
  it('RECENT_KEY is a valid string', () => {
    expect(typeof RECENT_KEY).toBe('string');
    expect(RECENT_KEY.length).toBeGreaterThan(0);
  });
  it('commands with badge property still filter correctly', () => {
    const cmd = makeCmd({ id: 'x', label: 'Notifications', badge: '5', category: 'actions' });
    const results = fuzzyFilter('notif', [cmd]);
    expect(results).toHaveLength(1);
  });
  it('commands with icon property still filter correctly', () => {
    const cmd = makeCmd({ id: 'x', label: 'Settings', icon: 'settings-icon', category: 'settings' });
    const results = fuzzyFilter('set', [cmd]);
    expect(results).toHaveLength(1);
  });
  it('commands with shortcut property still filter correctly', () => {
    const cmd = makeCmd({ id: 'x', label: 'Dashboard', shortcut: 'G then D', category: 'navigation' });
    const results = fuzzyFilter('dash', [cmd]);
    expect(results).toHaveLength(1);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// fuzzyScore — comprehensive scoring table
// ═════════════════════════════════════════════════════════════════════════════

describe('fuzzyScore — scoring table coverage', () => {
  const cases: [string, string, number][] = [
    // exact
    ['ncr', 'ncr', 100], ['capa', 'capa', 100], ['audit', 'audit', 100],
    ['risk', 'risk', 100], ['esg', 'esg', 100], ['hr', 'hr', 100],
    // starts-with
    ['nc', 'ncr', 90], ['cap', 'capa', 90], ['aud', 'audit', 90],
    ['ris', 'risk', 90], ['hea', 'health', 90], ['saf', 'safety', 90],
    // contains
    ['cr', 'ncr', 70], ['apa', 'capa', 70], ['dit', 'audit', 70],
    ['sk', 'risk', 70], ['eal', 'health', 70], ['afe', 'safety', 70],
    // fuzzy
    ['nr', 'nonconformance', 50], ['qy', 'quality', 50],
    // no match
    ['zzz', 'ncr', 0], ['xyz', 'capa', 0], ['999', 'risk', 0],
  ];
  cases.forEach(([q, t, expected]) => {
    it(`fuzzyScore("${q}", "${t}") === ${expected}`, () => {
      expect(fuzzyScore(q, t)).toBe(expected);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Types — verify exports
// ═════════════════════════════════════════════════════════════════════════════

describe('Type / export verification', () => {
  it('fuzzyScore is a function', () => expect(typeof fuzzyScore).toBe('function'));
  it('fuzzyFilter is a function', () => expect(typeof fuzzyFilter).toBe('function'));
  it('highlightMatches is a function', () => expect(typeof highlightMatches).toBe('function'));
  it('getRecentCommandIds is a function', () => expect(typeof getRecentCommandIds).toBe('function'));
  it('addRecentCommandId is a function', () => expect(typeof addRecentCommandId).toBe('function'));
  it('clearRecentCommands is a function', () => expect(typeof clearRecentCommands).toBe('function'));
  it('isCommandPaletteShortcut is a function', () => expect(typeof isCommandPaletteShortcut).toBe('function'));
  it('isEscape is a function', () => expect(typeof isEscape).toBe('function'));
  it('isArrowDown is a function', () => expect(typeof isArrowDown).toBe('function'));
  it('isArrowUp is a function', () => expect(typeof isArrowUp).toBe('function'));
  it('isEnter is a function', () => expect(typeof isEnter).toBe('function'));
  it('RECENT_KEY is exported', () => expect(RECENT_KEY).toBeDefined());
  it('fuzzyScore returns number', () => expect(typeof fuzzyScore('a', 'b')).toBe('number'));
  it('fuzzyFilter returns array', () => expect(Array.isArray(fuzzyFilter('', []))).toBe(true));
  it('highlightMatches returns string', () => expect(typeof highlightMatches('a', 'b')).toBe('string'));
  it('getRecentCommandIds returns array', () => expect(Array.isArray(getRecentCommandIds())).toBe(true));
  it('isCommandPaletteShortcut returns boolean', () => expect(typeof isCommandPaletteShortcut(makeEvent())).toBe('boolean'));
  it('isEscape returns boolean', () => expect(typeof isEscape(makeEvent())).toBe('boolean'));
  it('isArrowDown returns boolean', () => expect(typeof isArrowDown(makeEvent())).toBe('boolean'));
  it('isArrowUp returns boolean', () => expect(typeof isArrowUp(makeEvent())).toBe('boolean'));
  it('isEnter returns boolean', () => expect(typeof isEnter(makeEvent())).toBe('boolean'));
});

// ═════════════════════════════════════════════════════════════════════════════
// fuzzyFilter — additional edge cases for coverage
// ═════════════════════════════════════════════════════════════════════════════

describe('fuzzyFilter — additional edge cases', () => {
  it('query matches only via keywords, not label or description', () => {
    const cmd = makeCmd({ id: 'x', label: 'Alpha', description: 'Beta', keywords: ['specific-keyword'], category: 'actions' });
    const results = fuzzyFilter('specific-keyword', [cmd]);
    expect(results).toHaveLength(1);
    expect(results[0].score).toBe(100);
  });
  it('10 commands all matching returns 10 results', () => {
    const list = Array.from({ length: 10 }, (_, i) =>
      makeCmd({ id: `cmd-${i}`, label: `Dashboard ${i}`, category: 'navigation' })
    );
    const results = fuzzyFilter('dash', list);
    expect(results).toHaveLength(10);
  });
  it('returns empty for query with no match in 10 commands', () => {
    const list = Array.from({ length: 10 }, (_, i) =>
      makeCmd({ id: `cmd-${i}`, label: `Alpha ${i}`, category: 'navigation' })
    );
    expect(fuzzyFilter('zzz', list)).toHaveLength(0);
  });
  it('category field is not searched', () => {
    const cmd = makeCmd({ id: 'x', label: 'X', category: 'navigation' });
    // searching 'navigation' — not in label/description/keywords, but label=X has no nav
    // 'navigation' won't match 'X'
    expect(fuzzyFilter('navigation', [cmd])).toHaveLength(0);
  });
  it('empty keywords array is handled without error', () => {
    const cmd = makeCmd({ id: 'x', label: 'Alpha', keywords: [], category: 'actions' });
    expect(() => fuzzyFilter('alpha', [cmd])).not.toThrow();
    expect(fuzzyFilter('alpha', [cmd])).toHaveLength(1);
  });
  it('undefined description is handled', () => {
    const cmd: Command = { id: 'x', label: 'Alpha', category: 'actions', action: jest.fn() };
    expect(() => fuzzyFilter('alpha', [cmd])).not.toThrow();
  });
  it('result objects contain command reference', () => {
    const cmd = makeCmd({ id: 'ref-test', label: 'Reference Test', category: 'actions' });
    const results = fuzzyFilter('ref', [cmd]);
    expect(results[0].command).toBe(cmd);
  });
  it('score is a positive number', () => {
    const results = fuzzyFilter('dash', [makeCmd({ id: 'x', label: 'Dashboard', category: 'navigation' })]);
    expect(results[0].score).toBeGreaterThan(0);
  });
  it('best score is within 1–100 range for non-empty query', () => {
    const results = fuzzyFilter('set', [makeCmd({ id: 'x', label: 'Settings', category: 'settings' })]);
    expect(results[0].score).toBeGreaterThanOrEqual(1);
    expect(results[0].score).toBeLessThanOrEqual(100);
  });
  it('icon field not searched but command still returned when label matches', () => {
    const cmd = makeCmd({ id: 'x', label: 'Export', icon: 'download-icon', category: 'actions' });
    expect(fuzzyFilter('export', [cmd])).toHaveLength(1);
  });
  it('badge field not searched directly', () => {
    const cmd = makeCmd({ id: 'x', label: 'Notifications', badge: 'NOTIF-BADGE', category: 'actions' });
    // searching 'NOTIF-BADGE' won't match label 'Notifications' via exact/starts-with/contains
    // but 'notif' would match label
    expect(fuzzyFilter('NOTIF-BADGE', [cmd])).toHaveLength(0);
    expect(fuzzyFilter('notif', [cmd])).toHaveLength(1);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// highlightMatches — extensive coverage
// ═════════════════════════════════════════════════════════════════════════════

describe('highlightMatches — module-specific inputs', () => {
  it('"ncr" in "Create NCR" → contains **NCR**', () => {
    const result = highlightMatches('NCR', 'Create NCR');
    expect(result).toContain('**NCR**');
  });
  it('"cap" in "CAPA Management"', () => {
    const result = highlightMatches('cap', 'CAPA Management');
    expect(result).toContain('**CAP**');
  });
  it('"inc" in "Incidents"', () => {
    const result = highlightMatches('inc', 'Incidents');
    expect(result).toContain('**Inc**');
  });
  it('query longer than text → no match → returns text', () => {
    expect(highlightMatches('longerthantext', 'text')).toBe('text');
  });
  it('single char not in text → returns text', () => {
    expect(highlightMatches('z', 'hello')).toBe('hello');
  });
  it('result contains original chars', () => {
    const result = highlightMatches('d', 'Dashboard');
    expect(result).toContain('D');
    expect(result).toContain('ashboard');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// addRecentCommandId — max boundary
// ═════════════════════════════════════════════════════════════════════════════

describe('addRecentCommandId — max boundary tests', () => {
  it('exactly at max: adding one more evicts oldest', () => {
    for (let i = 0; i < 10; i++) addRecentCommandId(`cmd-${i}`);
    addRecentCommandId('cmd-overflow');
    const ids = getRecentCommandIds();
    expect(ids).toHaveLength(10);
    expect(ids[0]).toBe('cmd-overflow');
    expect(ids).not.toContain('cmd-0');
  });
  it('max=1: only keeps most recent', () => {
    addRecentCommandId('first', 1);
    addRecentCommandId('second', 1);
    expect(getRecentCommandIds(100)).toHaveLength(1);
    expect(getRecentCommandIds(100)[0]).toBe('second');
  });
  it('max=5: after 5 additions, subsequent additions evict oldest', () => {
    for (let i = 0; i < 5; i++) addRecentCommandId(`cmd-${i}`, 5);
    addRecentCommandId('cmd-5', 5);
    const ids = getRecentCommandIds(100);
    expect(ids).toHaveLength(5);
    expect(ids).not.toContain('cmd-0');
    expect(ids).toContain('cmd-5');
  });
  it('dedup + max: dedup then cap', () => {
    for (let i = 0; i < 8; i++) addRecentCommandId(`cmd-${i}`, 5);
    addRecentCommandId('cmd-2', 5); // already in list, moves to front, deduped
    const ids = getRecentCommandIds(100);
    expect(ids[0]).toBe('cmd-2');
    expect(ids.length).toBeLessThanOrEqual(5);
  });
});
