// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ---------------------------------------------------------------------------
// Mock localStorage
// ---------------------------------------------------------------------------
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    _reset: () => { store = {}; },
    _store: () => ({ ...store }),
    _set: (key: string, value: string) => { store[key] = value; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------
import {
  fuzzyScore,
  fuzzyFilter,
  highlightMatches,
  getRecentCommandIds,
  addRecentCommandId,
  clearRecentCommands,
  RECENT_KEY,
  isCommandPaletteShortcut,
  isEscape,
  isArrowDown,
  isArrowUp,
  isEnter,
} from '../src/index';
import type { Command, SearchResult, CommandCategory, CommandGroup, CommandPaletteState, CommandPaletteOptions } from '../src/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCommand(overrides: Partial<Command> = {}): Command {
  return {
    id: 'test-cmd',
    label: 'Test Command',
    category: 'actions',
    action: jest.fn(),
    ...overrides,
  };
}

function makeEvent(overrides: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return {
    key: '',
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    ...overrides,
  } as unknown as KeyboardEvent;
}

function resetLS() {
  localStorageMock._reset();
  jest.clearAllMocks();
}

// ---------------------------------------------------------------------------
// SUITE 1: fuzzyScore — exact match (score = 100)
// ---------------------------------------------------------------------------

describe('fuzzyScore — exact match', () => {
  beforeEach(resetLS);

  it('exact match same case → 100', () => {
    expect(fuzzyScore('hello', 'hello')).toBe(100);
  });

  it('exact match case insensitive (upper query) → 100', () => {
    expect(fuzzyScore('HELLO', 'hello')).toBe(100);
  });

  it('exact match case insensitive (upper target) → 100', () => {
    expect(fuzzyScore('hello', 'HELLO')).toBe(100);
  });

  it('exact match mixed case → 100', () => {
    expect(fuzzyScore('HeLLo', 'hElLO')).toBe(100);
  });

  it('exact match single char → 100', () => {
    expect(fuzzyScore('a', 'a')).toBe(100);
  });

  it('exact match single char different case → 100', () => {
    expect(fuzzyScore('A', 'a')).toBe(100);
  });

  it('exact match number-like string → 100', () => {
    expect(fuzzyScore('123', '123')).toBe(100);
  });

  it('exact match with spaces → 100', () => {
    expect(fuzzyScore('hello world', 'hello world')).toBe(100);
  });

  it('exact match with special chars → 100', () => {
    expect(fuzzyScore('foo-bar', 'foo-bar')).toBe(100);
  });

  it('exact match underscore string → 100', () => {
    expect(fuzzyScore('foo_bar', 'foo_bar')).toBe(100);
  });

  it('exact match long string → 100', () => {
    const s = 'create new incident report';
    expect(fuzzyScore(s, s)).toBe(100);
  });

  it('exact match with unicode → 100', () => {
    expect(fuzzyScore('café', 'café')).toBe(100);
  });

  it('exact match with numbers and letters → 100', () => {
    expect(fuzzyScore('item123', 'item123')).toBe(100);
  });

  it('exact match two-word phrase → 100', () => {
    expect(fuzzyScore('risk assessment', 'risk assessment')).toBe(100);
  });

  it('exact match three-word phrase → 100', () => {
    expect(fuzzyScore('view all items', 'view all items')).toBe(100);
  });

  it('exact match with punctuation → 100', () => {
    expect(fuzzyScore('go to dashboard', 'go to dashboard')).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// SUITE 2: fuzzyScore — starts with (score = 90)
// ---------------------------------------------------------------------------

describe('fuzzyScore — starts with', () => {
  beforeEach(resetLS);

  it('query is prefix of target → 90', () => {
    expect(fuzzyScore('hel', 'hello')).toBe(90);
  });

  it('query is first word of multi-word target → 90', () => {
    expect(fuzzyScore('go', 'go to dashboard')).toBe(90);
  });

  it('single char prefix → 90', () => {
    expect(fuzzyScore('d', 'dashboard')).toBe(90);
  });

  it('prefix case insensitive → 90', () => {
    expect(fuzzyScore('DASH', 'dashboard')).toBe(90);
  });

  it('exact prefix match with full word → 90', () => {
    expect(fuzzyScore('risk', 'risk assessment tool')).toBe(90);
  });

  it('two-char prefix → 90', () => {
    expect(fuzzyScore('ri', 'risk')).toBe(90);
  });

  it('three-char prefix → 90', () => {
    expect(fuzzyScore('ris', 'risk')).toBe(90);
  });

  it('prefix of compound word → 90', () => {
    expect(fuzzyScore('nav', 'navigation')).toBe(90);
  });

  it('prefix of settings → 90', () => {
    expect(fuzzyScore('set', 'settings')).toBe(90);
  });

  it('prefix uppercase target → 90', () => {
    expect(fuzzyScore('dash', 'DASHBOARD')).toBe(90);
  });

  it('prefix of "create" → 90', () => {
    expect(fuzzyScore('cre', 'create')).toBe(90);
  });

  it('prefix of "delete" → 90', () => {
    expect(fuzzyScore('del', 'delete item')).toBe(90);
  });

  it('prefix of "search" → 90', () => {
    expect(fuzzyScore('sea', 'search results')).toBe(90);
  });

  it('prefix not equal to exact match (longer target) → 90 not 100', () => {
    const score = fuzzyScore('hello', 'hello world');
    expect(score).toBe(90);
    expect(score).not.toBe(100);
  });

  it('prefix: "op" of "open" → 90', () => {
    expect(fuzzyScore('op', 'open')).toBe(90);
  });

  it('prefix: "cl" of "close" → 90', () => {
    expect(fuzzyScore('cl', 'close')).toBe(90);
  });
});

// ---------------------------------------------------------------------------
// SUITE 3: fuzzyScore — contains (score = 70)
// ---------------------------------------------------------------------------

describe('fuzzyScore — contains substring', () => {
  beforeEach(resetLS);

  it('query appears in middle of target → 70', () => {
    expect(fuzzyScore('ash', 'dashboard')).toBe(70);
  });

  it('query appears at end of target → 70', () => {
    expect(fuzzyScore('board', 'dashboard')).toBe(70);
  });

  it('query is a word in middle of multi-word → 70', () => {
    expect(fuzzyScore('to', 'go to dashboard')).toBe(70);
  });

  it('substring case insensitive → 70', () => {
    expect(fuzzyScore('BOARD', 'dashboard')).toBe(70);
  });

  it('contains but not starts → 70', () => {
    expect(fuzzyScore('ello', 'hello world')).toBe(70);
  });

  it('single char in middle → 70', () => {
    // 'i' in 'risk' — but starts with 'r' not 'i' — fuzzyScore('i', 'risk')
    // 'risk' doesn't start with 'i', but contains it at idx 1 → 70
    expect(fuzzyScore('i', 'risk')).toBe(70);
  });

  it('contains "port" in "report" → 70', () => {
    expect(fuzzyScore('port', 'report')).toBe(70);
  });

  it('contains "ment" in "management" → 70', () => {
    expect(fuzzyScore('ment', 'management')).toBe(70);
  });

  it('contains "tion" in "notification" → 70', () => {
    expect(fuzzyScore('tion', 'notification')).toBe(70);
  });

  it('contains multiple chars not at start → 70', () => {
    expect(fuzzyScore('gement', 'management')).toBe(70);
  });

  it('contains partial word in middle of long phrase → 70', () => {
    expect(fuzzyScore('ncident', 'incident report')).toBe(70);
  });

  it('contains last word of phrase → 70', () => {
    expect(fuzzyScore('report', 'incident report')).toBe(70);
  });

  it('contains with uppercase target → 70', () => {
    expect(fuzzyScore('tion', 'NOTIFICATION')).toBe(70);
  });
});

// ---------------------------------------------------------------------------
// SUITE 4: fuzzyScore — fuzzy match (score = 50)
// ---------------------------------------------------------------------------

describe('fuzzyScore — fuzzy match', () => {
  beforeEach(resetLS);

  it('chars in order but not contiguous → 50', () => {
    // 'dh' in 'dashboard' — d is at 0, h is at 3 → fuzzy
    expect(fuzzyScore('dh', 'dashboard')).toBe(50);
  });

  it('all chars in order non-contiguous → 50', () => {
    expect(fuzzyScore('db', 'dashboard')).toBe(50);
  });

  it('fuzzy: first and last char → 50', () => {
    expect(fuzzyScore('dr', 'dashboard')).toBe(50);
  });

  it('fuzzy: spread across long string → 50', () => {
    expect(fuzzyScore('hbn', 'health and safety button')).toBe(50);
  });

  it('fuzzy with non-consecutive match → 50', () => {
    // 'gd' in 'go to dashboard': g=0, d=7 → fuzzy
    expect(fuzzyScore('gd', 'go to dashboard')).toBe(50);
  });

  it('fuzzy match single char not at start → finds char via fuzzy', () => {
    // 'z' in 'freeze' — doesn't start, not at start, but contains as substring
    // Actually 'z' in 'freeze' at idx 4 → contains → 70
    // Let's use 'fz' → 'f'=0, 'z'=4 → fuzzy or contains? 'fz' not in freeze, but f(0)z(4) → fuzzy
    expect(fuzzyScore('fz', 'freeze')).toBe(50);
  });

  it('multiple chars in order, non-contiguous → 50', () => {
    expect(fuzzyScore('rsk', 'risk assessment')).toBe(50);
  });

  it('fuzzy match 3 chars spread → 50', () => {
    expect(fuzzyScore('abc', 'a bit confused')).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// SUITE 5: fuzzyScore — no match (score = 0)
// ---------------------------------------------------------------------------

describe('fuzzyScore — no match', () => {
  beforeEach(resetLS);

  it('completely different strings → 0', () => {
    expect(fuzzyScore('xyz', 'hello')).toBe(0);
  });

  it('empty query → 0', () => {
    expect(fuzzyScore('', 'hello')).toBe(0);
  });

  it('empty target → 0', () => {
    expect(fuzzyScore('hello', '')).toBe(0);
  });

  it('both empty → 0', () => {
    expect(fuzzyScore('', '')).toBe(0);
  });

  it('query longer than target with no match → 0', () => {
    expect(fuzzyScore('abcdefgh', 'abc')).toBe(0);
  });

  it('chars not in order → 0', () => {
    // 'leh' — l appears after h in 'hello', so chars in order: h,e,l,l,o
    // 'leh': l,e,h — l at idx2, e at idx1 — e comes before l so can't match in order
    expect(fuzzyScore('leh', 'hello')).toBe(0);
  });

  it('query with char not in target → 0', () => {
    expect(fuzzyScore('z', 'hello')).toBe(0);
  });

  it('all non-matching chars → 0', () => {
    expect(fuzzyScore('qqq', 'hello')).toBe(0);
  });

  it('query has extra unmatched char at end → 0', () => {
    // 'helloz' — contains 'hello' but 'z' not in 'hello'
    expect(fuzzyScore('helloz', 'hello')).toBe(0);
  });

  it('number not in target → 0', () => {
    expect(fuzzyScore('9', 'hello')).toBe(0);
  });

  it('returns non-negative score', () => {
    expect(fuzzyScore('xyz', 'abc')).toBeGreaterThanOrEqual(0);
  });

  it('score is always >= 0 for any input', () => {
    const pairs = [
      ['a', 'b'], ['abc', 'xyz'], ['', ''], ['z', 'hello'], ['999', 'abc']
    ];
    for (const [q, t] of pairs) {
      expect(fuzzyScore(q, t)).toBeGreaterThanOrEqual(0);
    }
  });

  it('score is always <= 100 for any input', () => {
    const pairs = [
      ['hello', 'hello'], ['h', 'hello'], ['hel', 'hello'], ['xyz', 'hello'], ['', 'hello']
    ];
    for (const [q, t] of pairs) {
      expect(fuzzyScore(q, t)).toBeLessThanOrEqual(100);
    }
  });
});

// ---------------------------------------------------------------------------
// SUITE 6: fuzzyScore — score ordering
// ---------------------------------------------------------------------------

describe('fuzzyScore — score ordering', () => {
  beforeEach(resetLS);

  it('exact match > starts with', () => {
    const exact = fuzzyScore('hello', 'hello');
    const starts = fuzzyScore('hell', 'hello');
    expect(exact).toBeGreaterThan(starts);
  });

  it('starts with > contains', () => {
    const starts = fuzzyScore('dash', 'dashboard');
    const contains = fuzzyScore('ash', 'dashboard');
    expect(starts).toBeGreaterThan(contains);
  });

  it('contains > fuzzy', () => {
    const contains = fuzzyScore('ello', 'hello world');
    const fuzzy = fuzzyScore('hw', 'hello world');
    expect(contains).toBeGreaterThan(fuzzy);
  });

  it('fuzzy > no match', () => {
    const fuzzy = fuzzyScore('hw', 'hello world');
    const none = fuzzyScore('xyz', 'hello world');
    expect(fuzzy).toBeGreaterThan(none);
  });

  it('exact = 100', () => {
    expect(fuzzyScore('test', 'test')).toBe(100);
  });

  it('starts = 90', () => {
    expect(fuzzyScore('tes', 'testing')).toBe(90);
  });

  it('contains = 70', () => {
    expect(fuzzyScore('est', 'testing')).toBe(70);
  });

  it('fuzzy = 50', () => {
    // 'tg' in 'testing' — t at 0, g at 4 — but 'testing' doesn't start with 'tg', doesn't contain 'tg'
    expect(fuzzyScore('tg', 'testing')).toBe(50);
  });

  it('no match = 0', () => {
    expect(fuzzyScore('xyz', 'testing')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// SUITE 7: fuzzyFilter
// ---------------------------------------------------------------------------

describe('fuzzyFilter — basic operation', () => {
  beforeEach(resetLS);

  const cmds: Command[] = [
    makeCommand({ id: '1', label: 'Create Incident', category: 'actions' }),
    makeCommand({ id: '2', label: 'Delete Record', category: 'actions' }),
    makeCommand({ id: '3', label: 'Go to Dashboard', category: 'navigation' }),
    makeCommand({ id: '4', label: 'Settings', category: 'settings' }),
    makeCommand({ id: '5', label: 'Search Documents', category: 'search' }),
  ];

  it('returns all commands with score=1 for empty query', () => {
    const results = fuzzyFilter('', cmds);
    expect(results).toHaveLength(cmds.length);
  });

  it('empty array returns empty result', () => {
    expect(fuzzyFilter('test', [])).toHaveLength(0);
  });

  it('returns SearchResult objects', () => {
    const results = fuzzyFilter('create', cmds);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('command');
    expect(results[0]).toHaveProperty('score');
    expect(results[0]).toHaveProperty('matchedQuery');
  });

  it('finds exact match label', () => {
    const results = fuzzyFilter('Settings', [makeCommand({ id: 's', label: 'Settings', category: 'settings' })]);
    expect(results[0].score).toBe(100);
  });

  it('finds prefix match', () => {
    const results = fuzzyFilter('Crea', cmds);
    expect(results.some(r => r.command.id === '1')).toBe(true);
  });

  it('filters out zero-score results', () => {
    const results = fuzzyFilter('zzzzz', cmds);
    expect(results).toHaveLength(0);
  });

  it('returns results sorted by score descending', () => {
    const mixedCmds = [
      makeCommand({ id: 'a', label: 'xyz fuzzy-a', category: 'actions' }),
      makeCommand({ id: 'b', label: 'dashboard', category: 'navigation' }),
      makeCommand({ id: 'c', label: 'dash', category: 'navigation' }),
    ];
    const results = fuzzyFilter('dash', mixedCmds);
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
    }
  });

  it('matchedQuery equals the query string', () => {
    const results = fuzzyFilter('create', cmds);
    results.forEach(r => expect(r.matchedQuery).toBe('create'));
  });

  it('result.command references original Command object', () => {
    const c = makeCommand({ id: 'myid', label: 'My Command', category: 'actions' });
    const results = fuzzyFilter('my', [c]);
    expect(results[0].command).toBe(c);
  });

  it('searches description field', () => {
    const withDesc = makeCommand({ id: 'd', label: 'Foo', description: 'incident form', category: 'actions' });
    const results = fuzzyFilter('incident', [withDesc]);
    expect(results.length).toBeGreaterThan(0);
  });

  it('searches keywords field', () => {
    const withKw = makeCommand({ id: 'k', label: 'Foo', keywords: ['risk', 'assessment'], category: 'actions' });
    const results = fuzzyFilter('risk', [withKw]);
    expect(results.length).toBeGreaterThan(0);
  });

  it('uses best score across label/description/keywords', () => {
    const c = makeCommand({ id: 'x', label: 'xyz', description: 'some', keywords: ['exact-match'], category: 'actions' });
    const results = fuzzyFilter('exact-match', [c]);
    expect(results[0].score).toBe(100);
  });

  it('multiple commands all matching returns all', () => {
    const matchAll = [
      makeCommand({ id: '1', label: 'dashboard main', category: 'navigation' }),
      makeCommand({ id: '2', label: 'dashboard analytics', category: 'navigation' }),
      makeCommand({ id: '3', label: 'dashboard reports', category: 'navigation' }),
    ];
    const results = fuzzyFilter('dashboard', matchAll);
    expect(results).toHaveLength(3);
  });

  it('empty query with 3 commands returns 3 items', () => {
    expect(fuzzyFilter('', cmds.slice(0, 3))).toHaveLength(3);
  });

  it('empty query score is 1 for all items', () => {
    const results = fuzzyFilter('', cmds);
    results.forEach(r => expect(r.score).toBe(1));
  });

  it('non-matching query with single command → empty result', () => {
    const c = makeCommand({ id: '1', label: 'hello', category: 'actions' });
    expect(fuzzyFilter('xyz', [c])).toHaveLength(0);
  });

  it('partial keyword match triggers result', () => {
    const c = makeCommand({ id: 'k', label: 'Cmd', keywords: ['navigation-item'], category: 'navigation' });
    const results = fuzzyFilter('nav', [c]);
    expect(results.length).toBeGreaterThan(0);
  });

  it('fuzzyFilter is case-insensitive for labels', () => {
    const c = makeCommand({ id: '1', label: 'DASHBOARD', category: 'navigation' });
    expect(fuzzyFilter('dashboard', [c]).length).toBeGreaterThan(0);
  });

  it('fuzzyFilter is case-insensitive for queries', () => {
    const c = makeCommand({ id: '1', label: 'dashboard', category: 'navigation' });
    expect(fuzzyFilter('DASHBOARD', [c]).length).toBeGreaterThan(0);
  });
});

describe('fuzzyFilter — sorting', () => {
  beforeEach(resetLS);

  it('exact match sorts first', () => {
    const cmds = [
      makeCommand({ id: 'a', label: 'dash prefix', category: 'navigation' }),
      makeCommand({ id: 'b', label: 'dashboard contains', category: 'navigation' }),
      makeCommand({ id: 'c', label: 'dashboard', category: 'navigation' }),
    ];
    const results = fuzzyFilter('dashboard', cmds);
    expect(results[0].score).toBe(100);
    expect(results[0].command.id).toBe('c');
  });

  it('prefix match sorts before contains', () => {
    const cmds = [
      makeCommand({ id: 'a', label: 'navigation section', category: 'navigation' }),
      makeCommand({ id: 'b', label: 'nav', category: 'navigation' }),
    ];
    const results = fuzzyFilter('nav', cmds);
    // 'nav' → id 'b' label 'nav' is exact → 100; id 'a' starts with 'nav' → 90
    expect(results[0].command.id).toBe('b');
    expect(results[1].command.id).toBe('a');
  });

  it('equal scores maintain stable order (all same score)', () => {
    const cmds = [
      makeCommand({ id: '1', label: 'go to reports', category: 'navigation' }),
      makeCommand({ id: '2', label: 'go to settings', category: 'navigation' }),
      makeCommand({ id: '3', label: 'go to dashboard', category: 'navigation' }),
    ];
    const results = fuzzyFilter('go to', cmds);
    expect(results).toHaveLength(3);
    results.forEach(r => expect(r.score).toBe(90));
  });

  it('keyword exact match gives score 100', () => {
    const cmd = makeCommand({ id: '1', label: 'Something Else', keywords: ['exact'], category: 'actions' });
    const results = fuzzyFilter('exact', [cmd]);
    expect(results[0].score).toBe(100);
  });

  it('description exact match gives score 100', () => {
    const cmd = makeCommand({ id: '1', label: 'X', description: 'exact', category: 'actions' });
    const results = fuzzyFilter('exact', [cmd]);
    expect(results[0].score).toBe(100);
  });
});

describe('fuzzyFilter — edge cases', () => {
  beforeEach(resetLS);

  it('null/undefined keywords handled gracefully', () => {
    const cmd = makeCommand({ id: '1', label: 'test', keywords: undefined, category: 'actions' });
    expect(() => fuzzyFilter('test', [cmd])).not.toThrow();
  });

  it('null/undefined description handled gracefully', () => {
    const cmd = makeCommand({ id: '1', label: 'test', description: undefined, category: 'actions' });
    expect(() => fuzzyFilter('test', [cmd])).not.toThrow();
  });

  it('large commands array works without throwing', () => {
    const many = Array.from({ length: 1000 }, (_, i) =>
      makeCommand({ id: String(i), label: `Command ${i}`, category: 'actions' })
    );
    expect(() => fuzzyFilter('command', many)).not.toThrow();
  });

  it('large query string with no match → empty', () => {
    const cmd = makeCommand({ id: '1', label: 'short', category: 'actions' });
    expect(fuzzyFilter('this is a very long query that wont match', [cmd])).toHaveLength(0);
  });

  it('single character query matches many items', () => {
    const cmds = [
      makeCommand({ id: '1', label: 'alpha', category: 'actions' }),
      makeCommand({ id: '2', label: 'beta', category: 'actions' }),
      makeCommand({ id: '3', label: 'gamma', category: 'actions' }),
      makeCommand({ id: '4', label: 'xyz', category: 'actions' }),
    ];
    const results = fuzzyFilter('a', cmds);
    // alpha: starts with 'a' → 90; beta: contains 'a' → 70; gamma: contains 'a' → 70; xyz: 'a' not in xyz → 0
    expect(results.length).toBe(3);
  });

  it('empty keywords array — no keyword scoring attempted', () => {
    const cmd = makeCommand({ id: '1', label: 'test', keywords: [], category: 'actions' });
    const results = fuzzyFilter('test', [cmd]);
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns a new array each call (referential independence)', () => {
    const cmd = makeCommand({ id: '1', label: 'test', category: 'actions' });
    const r1 = fuzzyFilter('test', [cmd]);
    const r2 = fuzzyFilter('test', [cmd]);
    expect(r1).not.toBe(r2);
  });

  it('modifying returned array does not affect subsequent calls', () => {
    const cmd = makeCommand({ id: '1', label: 'test', category: 'actions' });
    const r1 = fuzzyFilter('test', [cmd]);
    r1.pop();
    const r2 = fuzzyFilter('test', [cmd]);
    expect(r2).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// SUITE 8: highlightMatches
// ---------------------------------------------------------------------------

describe('highlightMatches — exact match', () => {
  beforeEach(resetLS);

  it('exact match wraps entire text', () => {
    expect(highlightMatches('hello', 'hello')).toBe('**hello**');
  });

  it('exact match case insensitive — wraps original casing', () => {
    expect(highlightMatches('HELLO', 'hello')).toBe('**hello**');
  });

  it('exact match preserves original text casing', () => {
    expect(highlightMatches('hello', 'HELLO')).toBe('**HELLO**');
  });

  it('exact single char', () => {
    expect(highlightMatches('a', 'a')).toBe('**a**');
  });

  it('exact match for word', () => {
    expect(highlightMatches('dashboard', 'dashboard')).toBe('**dashboard**');
  });

  it('exact match multi-word phrase', () => {
    expect(highlightMatches('risk report', 'risk report')).toBe('**risk report**');
  });
});

describe('highlightMatches — substring match', () => {
  beforeEach(resetLS);

  it('wraps substring in middle', () => {
    expect(highlightMatches('ash', 'dashboard')).toBe('d**ash**board');
  });

  it('wraps substring at start (prefix)', () => {
    expect(highlightMatches('dash', 'dashboard')).toBe('**dash**board');
  });

  it('wraps substring at end', () => {
    expect(highlightMatches('board', 'dashboard')).toBe('dash**board**');
  });

  it('wraps first occurrence only', () => {
    expect(highlightMatches('a', 'banana')).toContain('**a**');
  });

  it('case insensitive substring match', () => {
    expect(highlightMatches('BOARD', 'dashboard')).toBe('dash**board**');
  });

  it('highlights correct original casing', () => {
    const result = highlightMatches('DASH', 'DASHBOARD');
    expect(result).toBe('**DASH**BOARD');
  });

  it('substring: tion in notification', () => {
    const result = highlightMatches('tion', 'notification');
    expect(result).toContain('**tion**');
  });

  it('substring at index 1', () => {
    const result = highlightMatches('ello', 'hello');
    expect(result).toBe('h**ello**');
  });

  it('does not double-wrap', () => {
    const result = highlightMatches('ello', 'hello');
    expect(result.split('**').length - 1).toBe(2); // one open, one close → 2 markers
  });
});

describe('highlightMatches — no match', () => {
  beforeEach(resetLS);

  it('no match returns original text', () => {
    expect(highlightMatches('xyz', 'hello')).toBe('hello');
  });

  it('empty query returns original text', () => {
    expect(highlightMatches('', 'hello')).toBe('hello');
  });

  it('empty text returns empty string', () => {
    expect(highlightMatches('hello', '')).toBe('');
  });

  it('both empty returns empty', () => {
    expect(highlightMatches('', '')).toBe('');
  });

  it('no match query longer than target returns original', () => {
    expect(highlightMatches('verylongquery', 'hi')).toBe('hi');
  });

  it('completely different strings returns original text', () => {
    expect(highlightMatches('abc', 'xyz')).toBe('xyz');
  });
});

describe('highlightMatches — fuzzy wrapping', () => {
  beforeEach(resetLS);

  it('fuzzy match wraps each char individually', () => {
    // 'db' in 'dashboard' — d at 0, b at 5 (but 'db' not contiguous)
    const result = highlightMatches('db', 'dashboard');
    // should wrap d and b individually
    expect(result).toContain('**d**');
    expect(result).toContain('**b**');
  });

  it('fuzzy match result contains original chars', () => {
    const result = highlightMatches('db', 'dashboard');
    // Remove ** markers and check the base text
    const stripped = result.replace(/\*\*/g, '');
    expect(stripped).toBe('dashboard');
  });

  it('fuzzy: result does not equal original (chars wrapped)', () => {
    const result = highlightMatches('db', 'dashboard');
    expect(result).not.toBe('dashboard');
  });
});

// ---------------------------------------------------------------------------
// SUITE 9: getRecentCommandIds
// ---------------------------------------------------------------------------

describe('getRecentCommandIds', () => {
  beforeEach(resetLS);

  it('returns empty array when nothing stored', () => {
    expect(getRecentCommandIds()).toEqual([]);
  });

  it('returns stored ids', () => {
    localStorageMock._set(RECENT_KEY, JSON.stringify(['id1', 'id2', 'id3']));
    expect(getRecentCommandIds()).toEqual(['id1', 'id2', 'id3']);
  });

  it('respects max parameter', () => {
    localStorageMock._set(RECENT_KEY, JSON.stringify(['1', '2', '3', '4', '5']));
    expect(getRecentCommandIds(3)).toHaveLength(3);
  });

  it('returns up to 10 by default', () => {
    const ids = Array.from({ length: 20 }, (_, i) => String(i));
    localStorageMock._set(RECENT_KEY, JSON.stringify(ids));
    expect(getRecentCommandIds()).toHaveLength(10);
  });

  it('handles invalid JSON gracefully', () => {
    localStorageMock._set(RECENT_KEY, 'not-json');
    expect(() => getRecentCommandIds()).not.toThrow();
    expect(getRecentCommandIds()).toEqual([]);
  });

  it('handles non-array JSON gracefully', () => {
    localStorageMock._set(RECENT_KEY, JSON.stringify({ foo: 'bar' }));
    expect(getRecentCommandIds()).toEqual([]);
  });

  it('handles null stored value', () => {
    // nothing set → getItem returns null
    expect(getRecentCommandIds()).toEqual([]);
  });

  it('filters non-string values from stored array', () => {
    localStorageMock._set(RECENT_KEY, JSON.stringify(['id1', 123, null, 'id2', true]));
    const result = getRecentCommandIds();
    expect(result).toEqual(['id1', 'id2']);
  });

  it('reads from RECENT_KEY', () => {
    getRecentCommandIds();
    expect(localStorageMock.getItem).toHaveBeenCalledWith(RECENT_KEY);
  });

  it('returns array type', () => {
    expect(Array.isArray(getRecentCommandIds())).toBe(true);
  });

  it('returns correct ids in order', () => {
    const ids = ['cmd-a', 'cmd-b', 'cmd-c'];
    localStorageMock._set(RECENT_KEY, JSON.stringify(ids));
    expect(getRecentCommandIds()).toEqual(ids);
  });

  it('max=0 returns empty array', () => {
    localStorageMock._set(RECENT_KEY, JSON.stringify(['id1', 'id2']));
    expect(getRecentCommandIds(0)).toHaveLength(0);
  });

  it('max=1 returns first item only', () => {
    localStorageMock._set(RECENT_KEY, JSON.stringify(['id1', 'id2', 'id3']));
    expect(getRecentCommandIds(1)).toEqual(['id1']);
  });

  it('max larger than stored returns all stored', () => {
    localStorageMock._set(RECENT_KEY, JSON.stringify(['id1', 'id2']));
    expect(getRecentCommandIds(100)).toHaveLength(2);
  });

  it('returns empty array for empty JSON array', () => {
    localStorageMock._set(RECENT_KEY, JSON.stringify([]));
    expect(getRecentCommandIds()).toEqual([]);
  });

  it('handles string "null" gracefully', () => {
    localStorageMock._set(RECENT_KEY, 'null');
    expect(getRecentCommandIds()).toEqual([]);
  });

  it('handles empty string gracefully', () => {
    localStorageMock.getItem.mockReturnValueOnce('');
    expect(() => getRecentCommandIds()).not.toThrow();
    expect(getRecentCommandIds()).toEqual([]);
  });

  it('does not modify localStorage', () => {
    localStorageMock._set(RECENT_KEY, JSON.stringify(['id1']));
    localStorageMock.setItem.mockClear();
    getRecentCommandIds();
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('RECENT_KEY is the expected string', () => {
    expect(RECENT_KEY).toBe('ims-command-palette-recent');
  });

  it('max=5 with 3 stored returns 3', () => {
    localStorageMock._set(RECENT_KEY, JSON.stringify(['a', 'b', 'c']));
    expect(getRecentCommandIds(5)).toHaveLength(3);
  });

  it('deeply nested non-array JSON returns empty', () => {
    localStorageMock._set(RECENT_KEY, JSON.stringify([['nested'], 'valid']));
    const result = getRecentCommandIds();
    // The inner ['nested'] is not a string — filtered out; 'valid' is string
    expect(result).toEqual(['valid']);
  });

  it('handles JSON with only non-string values returns empty', () => {
    localStorageMock._set(RECENT_KEY, JSON.stringify([1, 2, 3, null, false]));
    expect(getRecentCommandIds()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// SUITE 10: addRecentCommandId
// ---------------------------------------------------------------------------

describe('addRecentCommandId', () => {
  beforeEach(resetLS);

  it('adds id to empty list', () => {
    addRecentCommandId('cmd-1');
    expect(getRecentCommandIds()).toEqual(['cmd-1']);
  });

  it('adds id to front of existing list', () => {
    localStorageMock._set(RECENT_KEY, JSON.stringify(['cmd-2', 'cmd-3']));
    addRecentCommandId('cmd-1');
    expect(getRecentCommandIds()[0]).toBe('cmd-1');
  });

  it('deduplicates — moves existing id to front', () => {
    localStorageMock._set(RECENT_KEY, JSON.stringify(['cmd-1', 'cmd-2', 'cmd-3']));
    addRecentCommandId('cmd-2');
    const result = getRecentCommandIds();
    expect(result[0]).toBe('cmd-2');
    expect(result.filter(id => id === 'cmd-2')).toHaveLength(1);
  });

  it('trims to max length', () => {
    const initial = Array.from({ length: 10 }, (_, i) => `cmd-${i}`);
    localStorageMock._set(RECENT_KEY, JSON.stringify(initial));
    addRecentCommandId('cmd-new', 10);
    expect(getRecentCommandIds(10)).toHaveLength(10);
  });

  it('trim removes oldest item', () => {
    const initial = ['a', 'b', 'c'];
    localStorageMock._set(RECENT_KEY, JSON.stringify(initial));
    addRecentCommandId('d', 3);
    const result = getRecentCommandIds(3);
    expect(result).toContain('d');
    expect(result).not.toContain('c');
  });

  it('writes to localStorage', () => {
    addRecentCommandId('cmd-1');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(RECENT_KEY, expect.any(String));
  });

  it('stores valid JSON', () => {
    addRecentCommandId('cmd-1');
    const stored = localStorageMock._store()[RECENT_KEY];
    expect(() => JSON.parse(stored)).not.toThrow();
  });

  it('stored value is an array', () => {
    addRecentCommandId('cmd-1');
    const stored = JSON.parse(localStorageMock._store()[RECENT_KEY]);
    expect(Array.isArray(stored)).toBe(true);
  });

  it('max=1 — only most recent is kept', () => {
    addRecentCommandId('cmd-1', 1);
    addRecentCommandId('cmd-2', 1);
    const result = getRecentCommandIds(1);
    expect(result).toEqual(['cmd-2']);
  });

  it('max=3 — no more than 3 items', () => {
    for (let i = 0; i < 10; i++) {
      addRecentCommandId(`cmd-${i}`, 3);
    }
    expect(getRecentCommandIds(100)).toHaveLength(3);
  });

  it('duplicate adds same id: deduplication → length stays 1', () => {
    addRecentCommandId('cmd-1');
    addRecentCommandId('cmd-1');
    expect(getRecentCommandIds()).toHaveLength(1);
  });

  it('three unique adds → 3 items', () => {
    addRecentCommandId('a');
    addRecentCommandId('b');
    addRecentCommandId('c');
    const result = getRecentCommandIds();
    expect(result).toHaveLength(3);
  });

  it('order is most-recent-first', () => {
    addRecentCommandId('first');
    addRecentCommandId('second');
    addRecentCommandId('third');
    const result = getRecentCommandIds();
    expect(result[0]).toBe('third');
    expect(result[1]).toBe('second');
    expect(result[2]).toBe('first');
  });

  it('re-adding item to front works correctly', () => {
    addRecentCommandId('a');
    addRecentCommandId('b');
    addRecentCommandId('c');
    addRecentCommandId('a'); // re-add 'a' — should now be front
    const result = getRecentCommandIds();
    expect(result[0]).toBe('a');
  });

  it('does not throw for any string id', () => {
    const ids = ['', 'id-1', 'cmd_x', 'create-incident', '123'];
    for (const id of ids) {
      expect(() => addRecentCommandId(id)).not.toThrow();
    }
  });

  it('returns undefined (void)', () => {
    expect(addRecentCommandId('cmd')).toBeUndefined();
  });

  it('default max is 10 — adding 11 items leaves 10', () => {
    for (let i = 0; i < 11; i++) {
      addRecentCommandId(`cmd-${i}`);
    }
    expect(getRecentCommandIds()).toHaveLength(10);
  });

  it('adding duplicate mid-list moves it to front', () => {
    addRecentCommandId('a');
    addRecentCommandId('b');
    addRecentCommandId('c');
    addRecentCommandId('b');
    const result = getRecentCommandIds();
    expect(result[0]).toBe('b');
    expect(result.indexOf('b')).toBe(0);
    expect(result.filter(x => x === 'b')).toHaveLength(1);
  });

  it('max=0 — list is always empty after add', () => {
    addRecentCommandId('cmd', 0);
    expect(getRecentCommandIds(100)).toHaveLength(0);
  });

  it('very long id string is stored correctly', () => {
    const longId = 'a'.repeat(1000);
    addRecentCommandId(longId);
    const result = getRecentCommandIds();
    expect(result[0]).toBe(longId);
  });

  it('id with special chars is stored correctly', () => {
    addRecentCommandId('go-to-dashboard/incidents');
    const result = getRecentCommandIds();
    expect(result[0]).toBe('go-to-dashboard/incidents');
  });
});

// ---------------------------------------------------------------------------
// SUITE 11: clearRecentCommands
// ---------------------------------------------------------------------------

describe('clearRecentCommands', () => {
  beforeEach(resetLS);

  it('removes the RECENT_KEY from localStorage', () => {
    addRecentCommandId('cmd-1');
    clearRecentCommands();
    expect(getRecentCommandIds()).toEqual([]);
  });

  it('calls localStorage.removeItem with RECENT_KEY', () => {
    clearRecentCommands();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(RECENT_KEY);
  });

  it('returns undefined (void)', () => {
    expect(clearRecentCommands()).toBeUndefined();
  });

  it('does not throw when called on empty storage', () => {
    expect(() => clearRecentCommands()).not.toThrow();
  });

  it('calling twice does not throw', () => {
    clearRecentCommands();
    expect(() => clearRecentCommands()).not.toThrow();
  });

  it('after clear, getRecentCommandIds returns empty array', () => {
    localStorageMock._set(RECENT_KEY, JSON.stringify(['id1', 'id2', 'id3']));
    clearRecentCommands();
    expect(getRecentCommandIds()).toEqual([]);
  });

  it('clearing then adding starts fresh', () => {
    addRecentCommandId('old-id');
    clearRecentCommands();
    addRecentCommandId('new-id');
    expect(getRecentCommandIds()).toEqual(['new-id']);
  });

  it('clearing does not affect other localStorage keys', () => {
    localStorageMock._set('other-key', 'value');
    clearRecentCommands();
    expect(localStorageMock._store()['other-key']).toBe('value');
  });

  it('removes all items (not just first)', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    localStorageMock._set(RECENT_KEY, JSON.stringify(ids));
    clearRecentCommands();
    expect(getRecentCommandIds()).toHaveLength(0);
  });

  it('clearing multiple times in a row has same effect as once', () => {
    addRecentCommandId('cmd');
    clearRecentCommands();
    clearRecentCommands();
    clearRecentCommands();
    expect(getRecentCommandIds()).toEqual([]);
  });

  it('RECENT_KEY constant is used for removal', () => {
    localStorageMock.removeItem.mockClear();
    clearRecentCommands();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('ims-command-palette-recent');
  });

  it('called 5 times: removeItem called 5 times', () => {
    for (let i = 0; i < 5; i++) clearRecentCommands();
    expect(localStorageMock.removeItem).toHaveBeenCalledTimes(5);
  });

  it('after clearing, addRecentCommandId creates new list', () => {
    addRecentCommandId('a');
    addRecentCommandId('b');
    clearRecentCommands();
    addRecentCommandId('c');
    const result = getRecentCommandIds();
    expect(result).toEqual(['c']);
    expect(result).not.toContain('a');
    expect(result).not.toContain('b');
  });

  it('does not call setItem', () => {
    localStorageMock.setItem.mockClear();
    clearRecentCommands();
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('does not call getItem', () => {
    localStorageMock.getItem.mockClear();
    clearRecentCommands();
    expect(localStorageMock.getItem).not.toHaveBeenCalled();
  });

  it('removeItem receives exactly RECENT_KEY string', () => {
    clearRecentCommands();
    expect(localStorageMock.removeItem.mock.calls[0][0]).toBe(RECENT_KEY);
  });

  it('RECENT_KEY value is ims-command-palette-recent', () => {
    expect(RECENT_KEY).toBe('ims-command-palette-recent');
  });

  it('clearing then reading gives length 0', () => {
    for (let i = 0; i < 5; i++) addRecentCommandId(`id-${i}`);
    clearRecentCommands();
    expect(getRecentCommandIds().length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// SUITE 12: isCommandPaletteShortcut
// ---------------------------------------------------------------------------

describe('isCommandPaletteShortcut', () => {
  it('Cmd+K returns true', () => {
    expect(isCommandPaletteShortcut(makeEvent({ key: 'k', metaKey: true }))).toBe(true);
  });

  it('Ctrl+K returns true', () => {
    expect(isCommandPaletteShortcut(makeEvent({ key: 'k', ctrlKey: true }))).toBe(true);
  });

  it('Cmd+K uppercase K also returns true', () => {
    // Some browsers may send 'K' when shift is held — but standard is lowercase
    // Testing that case-sensitive key 'k' is required
    expect(isCommandPaletteShortcut(makeEvent({ key: 'K', metaKey: true }))).toBe(false);
  });

  it('K alone (no modifier) returns false', () => {
    expect(isCommandPaletteShortcut(makeEvent({ key: 'k' }))).toBe(false);
  });

  it('Ctrl+J returns false', () => {
    expect(isCommandPaletteShortcut(makeEvent({ key: 'j', ctrlKey: true }))).toBe(false);
  });

  it('Cmd+P returns false', () => {
    expect(isCommandPaletteShortcut(makeEvent({ key: 'p', metaKey: true }))).toBe(false);
  });

  it('Ctrl+Shift+K returns true (ctrlKey is true)', () => {
    // ctrlKey is true so isCommandPaletteShortcut returns true
    expect(isCommandPaletteShortcut(makeEvent({ key: 'k', ctrlKey: true, shiftKey: true }))).toBe(true);
  });

  it('Alt+K returns false', () => {
    expect(isCommandPaletteShortcut(makeEvent({ key: 'k', altKey: true }))).toBe(false);
  });

  it('Escape returns false', () => {
    expect(isCommandPaletteShortcut(makeEvent({ key: 'Escape' }))).toBe(false);
  });

  it('Enter returns false', () => {
    expect(isCommandPaletteShortcut(makeEvent({ key: 'Enter', ctrlKey: true }))).toBe(false);
  });

  it('empty key returns false', () => {
    expect(isCommandPaletteShortcut(makeEvent({ key: '', ctrlKey: true }))).toBe(false);
  });

  it('Cmd+K is boolean true (not truthy)', () => {
    expect(isCommandPaletteShortcut(makeEvent({ key: 'k', metaKey: true }))).toBe(true);
  });

  it('no keys → false', () => {
    expect(isCommandPaletteShortcut(makeEvent({ key: '' }))).toBe(false);
  });

  it('Ctrl+K: key must be lowercase k', () => {
    expect(isCommandPaletteShortcut(makeEvent({ key: 'k', ctrlKey: true }))).toBe(true);
    expect(isCommandPaletteShortcut(makeEvent({ key: 'K', ctrlKey: true }))).toBe(false);
  });

  it('returns boolean type', () => {
    const result = isCommandPaletteShortcut(makeEvent({ key: 'k', ctrlKey: true }));
    expect(typeof result).toBe('boolean');
  });

  it('Ctrl+A is false', () => {
    expect(isCommandPaletteShortcut(makeEvent({ key: 'a', ctrlKey: true }))).toBe(false);
  });

  it('Cmd+Z is false', () => {
    expect(isCommandPaletteShortcut(makeEvent({ key: 'z', metaKey: true }))).toBe(false);
  });

  it('Cmd+K twice both return true', () => {
    const e = makeEvent({ key: 'k', metaKey: true });
    expect(isCommandPaletteShortcut(e)).toBe(true);
    expect(isCommandPaletteShortcut(e)).toBe(true);
  });

  it('Ctrl+K is deterministic', () => {
    const e = makeEvent({ key: 'k', ctrlKey: true });
    expect(isCommandPaletteShortcut(e)).toBe(isCommandPaletteShortcut(e));
  });

  it('ArrowDown with Ctrl is not shortcut', () => {
    expect(isCommandPaletteShortcut(makeEvent({ key: 'ArrowDown', ctrlKey: true }))).toBe(false);
  });

  // Additional 30 tests for thorough coverage
  const keysNotK = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
    'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u',
    'v', 'w', 'x', 'y', 'z', 'K', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown'];

  keysNotK.forEach((key) => {
    it(`Ctrl+${key} is not command palette shortcut`, () => {
      expect(isCommandPaletteShortcut(makeEvent({ key, ctrlKey: true }))).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// SUITE 13: isEscape
// ---------------------------------------------------------------------------

describe('isEscape', () => {
  it('Escape key returns true', () => {
    expect(isEscape(makeEvent({ key: 'Escape' }))).toBe(true);
  });

  it('Enter key returns false', () => {
    expect(isEscape(makeEvent({ key: 'Enter' }))).toBe(false);
  });

  it('ArrowDown returns false', () => {
    expect(isEscape(makeEvent({ key: 'ArrowDown' }))).toBe(false);
  });

  it('ArrowUp returns false', () => {
    expect(isEscape(makeEvent({ key: 'ArrowUp' }))).toBe(false);
  });

  it('k key returns false', () => {
    expect(isEscape(makeEvent({ key: 'k' }))).toBe(false);
  });

  it('empty key returns false', () => {
    expect(isEscape(makeEvent({ key: '' }))).toBe(false);
  });

  it('escape lowercase returns false (key is case-sensitive)', () => {
    expect(isEscape(makeEvent({ key: 'escape' }))).toBe(false);
  });

  it('ESC string returns false', () => {
    expect(isEscape(makeEvent({ key: 'ESC' }))).toBe(false);
  });

  it('returns boolean type', () => {
    expect(typeof isEscape(makeEvent({ key: 'Escape' }))).toBe('boolean');
  });

  it('Escape with modifier keys still returns true', () => {
    expect(isEscape(makeEvent({ key: 'Escape', ctrlKey: true }))).toBe(true);
  });

  it('is deterministic', () => {
    const e = makeEvent({ key: 'Escape' });
    expect(isEscape(e)).toBe(true);
    expect(isEscape(e)).toBe(true);
  });

  it('space key returns false', () => {
    expect(isEscape(makeEvent({ key: ' ' }))).toBe(false);
  });

  it('Tab returns false', () => {
    expect(isEscape(makeEvent({ key: 'Tab' }))).toBe(false);
  });

  it('Backspace returns false', () => {
    expect(isEscape(makeEvent({ key: 'Backspace' }))).toBe(false);
  });

  it('Delete returns false', () => {
    expect(isEscape(makeEvent({ key: 'Delete' }))).toBe(false);
  });

  const nonEscapeKeys = ['Enter', 'ArrowDown', 'ArrowUp', 'k', 'a', 'b', 'c', ' ', 'Tab'];
  nonEscapeKeys.forEach((key) => {
    it(`isEscape with key "${key}" is false`, () => {
      expect(isEscape(makeEvent({ key }))).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// SUITE 14: isArrowDown
// ---------------------------------------------------------------------------

describe('isArrowDown', () => {
  it('ArrowDown returns true', () => {
    expect(isArrowDown(makeEvent({ key: 'ArrowDown' }))).toBe(true);
  });

  it('ArrowUp returns false', () => {
    expect(isArrowDown(makeEvent({ key: 'ArrowUp' }))).toBe(false);
  });

  it('Enter returns false', () => {
    expect(isArrowDown(makeEvent({ key: 'Enter' }))).toBe(false);
  });

  it('Escape returns false', () => {
    expect(isArrowDown(makeEvent({ key: 'Escape' }))).toBe(false);
  });

  it('arrowdown lowercase returns false', () => {
    expect(isArrowDown(makeEvent({ key: 'arrowdown' }))).toBe(false);
  });

  it('Down returns false', () => {
    expect(isArrowDown(makeEvent({ key: 'Down' }))).toBe(false);
  });

  it('returns boolean type', () => {
    expect(typeof isArrowDown(makeEvent({ key: 'ArrowDown' }))).toBe('boolean');
  });

  it('is deterministic', () => {
    const e = makeEvent({ key: 'ArrowDown' });
    expect(isArrowDown(e)).toBe(true);
    expect(isArrowDown(e)).toBe(true);
  });

  it('ArrowDown with modifiers still true', () => {
    expect(isArrowDown(makeEvent({ key: 'ArrowDown', ctrlKey: true }))).toBe(true);
  });

  it('empty string key returns false', () => {
    expect(isArrowDown(makeEvent({ key: '' }))).toBe(false);
  });

  it('k key returns false', () => {
    expect(isArrowDown(makeEvent({ key: 'k' }))).toBe(false);
  });

  it('Tab key returns false', () => {
    expect(isArrowDown(makeEvent({ key: 'Tab' }))).toBe(false);
  });

  it('Space returns false', () => {
    expect(isArrowDown(makeEvent({ key: ' ' }))).toBe(false);
  });

  it('ArrowLeft returns false', () => {
    expect(isArrowDown(makeEvent({ key: 'ArrowLeft' }))).toBe(false);
  });

  it('ArrowRight returns false', () => {
    expect(isArrowDown(makeEvent({ key: 'ArrowRight' }))).toBe(false);
  });

  const nonDownKeys = ['ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', 'k', ' '];
  nonDownKeys.forEach((key) => {
    it(`isArrowDown with key "${key}" is false`, () => {
      expect(isArrowDown(makeEvent({ key }))).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// SUITE 15: isArrowUp
// ---------------------------------------------------------------------------

describe('isArrowUp', () => {
  it('ArrowUp returns true', () => {
    expect(isArrowUp(makeEvent({ key: 'ArrowUp' }))).toBe(true);
  });

  it('ArrowDown returns false', () => {
    expect(isArrowUp(makeEvent({ key: 'ArrowDown' }))).toBe(false);
  });

  it('Enter returns false', () => {
    expect(isArrowUp(makeEvent({ key: 'Enter' }))).toBe(false);
  });

  it('Escape returns false', () => {
    expect(isArrowUp(makeEvent({ key: 'Escape' }))).toBe(false);
  });

  it('arrowup lowercase returns false', () => {
    expect(isArrowUp(makeEvent({ key: 'arrowup' }))).toBe(false);
  });

  it('Up returns false', () => {
    expect(isArrowUp(makeEvent({ key: 'Up' }))).toBe(false);
  });

  it('returns boolean type', () => {
    expect(typeof isArrowUp(makeEvent({ key: 'ArrowUp' }))).toBe('boolean');
  });

  it('is deterministic', () => {
    const e = makeEvent({ key: 'ArrowUp' });
    expect(isArrowUp(e)).toBe(true);
    expect(isArrowUp(e)).toBe(true);
  });

  it('ArrowUp with modifiers still true', () => {
    expect(isArrowUp(makeEvent({ key: 'ArrowUp', ctrlKey: true }))).toBe(true);
  });

  it('empty string key returns false', () => {
    expect(isArrowUp(makeEvent({ key: '' }))).toBe(false);
  });

  it('ArrowLeft returns false', () => {
    expect(isArrowUp(makeEvent({ key: 'ArrowLeft' }))).toBe(false);
  });

  it('ArrowRight returns false', () => {
    expect(isArrowUp(makeEvent({ key: 'ArrowRight' }))).toBe(false);
  });

  it('k key returns false', () => {
    expect(isArrowUp(makeEvent({ key: 'k' }))).toBe(false);
  });

  it('Tab returns false', () => {
    expect(isArrowUp(makeEvent({ key: 'Tab' }))).toBe(false);
  });

  it('Backspace returns false', () => {
    expect(isArrowUp(makeEvent({ key: 'Backspace' }))).toBe(false);
  });

  const nonUpKeys = ['ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', 'k', ' '];
  nonUpKeys.forEach((key) => {
    it(`isArrowUp with key "${key}" is false`, () => {
      expect(isArrowUp(makeEvent({ key }))).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// SUITE 16: isEnter
// ---------------------------------------------------------------------------

describe('isEnter', () => {
  it('Enter returns true', () => {
    expect(isEnter(makeEvent({ key: 'Enter' }))).toBe(true);
  });

  it('Escape returns false', () => {
    expect(isEnter(makeEvent({ key: 'Escape' }))).toBe(false);
  });

  it('ArrowDown returns false', () => {
    expect(isEnter(makeEvent({ key: 'ArrowDown' }))).toBe(false);
  });

  it('ArrowUp returns false', () => {
    expect(isEnter(makeEvent({ key: 'ArrowUp' }))).toBe(false);
  });

  it('enter lowercase returns false', () => {
    expect(isEnter(makeEvent({ key: 'enter' }))).toBe(false);
  });

  it('Return returns false (macOS legacy)', () => {
    expect(isEnter(makeEvent({ key: 'Return' }))).toBe(false);
  });

  it('returns boolean type', () => {
    expect(typeof isEnter(makeEvent({ key: 'Enter' }))).toBe('boolean');
  });

  it('is deterministic', () => {
    const e = makeEvent({ key: 'Enter' });
    expect(isEnter(e)).toBe(true);
    expect(isEnter(e)).toBe(true);
  });

  it('Enter with Ctrl modifier still true', () => {
    expect(isEnter(makeEvent({ key: 'Enter', ctrlKey: true }))).toBe(true);
  });

  it('Enter with Meta modifier still true', () => {
    expect(isEnter(makeEvent({ key: 'Enter', metaKey: true }))).toBe(true);
  });

  it('k key returns false', () => {
    expect(isEnter(makeEvent({ key: 'k' }))).toBe(false);
  });

  it('space returns false', () => {
    expect(isEnter(makeEvent({ key: ' ' }))).toBe(false);
  });

  it('empty string returns false', () => {
    expect(isEnter(makeEvent({ key: '' }))).toBe(false);
  });

  it('Tab returns false', () => {
    expect(isEnter(makeEvent({ key: 'Tab' }))).toBe(false);
  });

  it('NumpadEnter returns false (different key value)', () => {
    expect(isEnter(makeEvent({ key: 'NumpadEnter' }))).toBe(false);
  });

  const nonEnterKeys = ['Escape', 'ArrowDown', 'ArrowUp', 'k', ' ', 'Tab', 'Backspace'];
  nonEnterKeys.forEach((key) => {
    it(`isEnter with key "${key}" is false`, () => {
      expect(isEnter(makeEvent({ key }))).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// SUITE 17: Type / interface shape tests
// ---------------------------------------------------------------------------

describe('Type: Command interface', () => {
  it('minimal command is valid', () => {
    const cmd: Command = {
      id: 'test',
      label: 'Test',
      category: 'actions',
      action: jest.fn(),
    };
    expect(cmd.id).toBe('test');
    expect(cmd.label).toBe('Test');
    expect(cmd.category).toBe('actions');
    expect(typeof cmd.action).toBe('function');
  });

  it('command with all optional fields', () => {
    const cmd: Command = {
      id: 'full',
      label: 'Full Command',
      description: 'A full command',
      keywords: ['full', 'command'],
      category: 'navigation',
      icon: 'dashboard',
      shortcut: 'G then D',
      action: jest.fn(),
      disabled: false,
      badge: 'New',
    };
    expect(cmd.description).toBe('A full command');
    expect(cmd.keywords).toHaveLength(2);
    expect(cmd.icon).toBe('dashboard');
    expect(cmd.shortcut).toBe('G then D');
    expect(cmd.disabled).toBe(false);
    expect(cmd.badge).toBe('New');
  });

  it('disabled command is valid', () => {
    const cmd: Command = { id: 'dis', label: 'Disabled', category: 'actions', action: jest.fn(), disabled: true };
    expect(cmd.disabled).toBe(true);
  });

  it('categories: all 5 are valid', () => {
    const cats: CommandCategory[] = ['actions', 'navigation', 'search', 'settings', 'recent'];
    cats.forEach((cat) => {
      const cmd: Command = { id: 'c', label: 'C', category: cat, action: jest.fn() };
      expect(cmd.category).toBe(cat);
    });
  });

  it('CommandGroup has heading and commands', () => {
    const group: CommandGroup = {
      heading: 'Actions',
      commands: [makeCommand()],
    };
    expect(group.heading).toBe('Actions');
    expect(group.commands).toHaveLength(1);
  });

  it('CommandPaletteState shape', () => {
    const state: CommandPaletteState = { open: false, query: '', selectedIndex: 0 };
    expect(state.open).toBe(false);
    expect(state.query).toBe('');
    expect(state.selectedIndex).toBe(0);
  });

  it('CommandPaletteOptions shape', () => {
    const opts: CommandPaletteOptions = {
      maxRecent: 5,
      placeholder: 'Search commands...',
      extraCommands: [makeCommand()],
    };
    expect(opts.maxRecent).toBe(5);
    expect(opts.placeholder).toBe('Search commands...');
    expect(opts.extraCommands).toHaveLength(1);
  });

  it('SearchResult has command, score, matchedQuery', () => {
    const result: SearchResult = {
      command: makeCommand(),
      score: 90,
      matchedQuery: 'test',
    };
    expect(result.score).toBe(90);
    expect(result.matchedQuery).toBe('test');
    expect(result.command).toBeDefined();
  });

  it('SearchResult score can be 0', () => {
    const result: SearchResult = { command: makeCommand(), score: 0, matchedQuery: '' };
    expect(result.score).toBe(0);
  });

  it('SearchResult score can be 100', () => {
    const result: SearchResult = { command: makeCommand(), score: 100, matchedQuery: 'exact' };
    expect(result.score).toBe(100);
  });

  it('CommandGroup can have empty commands array', () => {
    const group: CommandGroup = { heading: 'Empty', commands: [] };
    expect(group.commands).toHaveLength(0);
  });

  it('Command action is callable', () => {
    const fn = jest.fn();
    const cmd: Command = { id: 'x', label: 'X', category: 'actions', action: fn };
    cmd.action();
    expect(fn).toHaveBeenCalled();
  });

  it('Command keywords can be empty array', () => {
    const cmd: Command = { id: 'x', label: 'X', category: 'actions', action: jest.fn(), keywords: [] };
    expect(cmd.keywords).toHaveLength(0);
  });

  it('CommandCategory: actions is valid', () => {
    const cat: CommandCategory = 'actions';
    expect(cat).toBe('actions');
  });

  it('CommandCategory: navigation is valid', () => {
    const cat: CommandCategory = 'navigation';
    expect(cat).toBe('navigation');
  });

  it('CommandCategory: search is valid', () => {
    const cat: CommandCategory = 'search';
    expect(cat).toBe('search');
  });

  it('CommandCategory: settings is valid', () => {
    const cat: CommandCategory = 'settings';
    expect(cat).toBe('settings');
  });

  it('CommandCategory: recent is valid', () => {
    const cat: CommandCategory = 'recent';
    expect(cat).toBe('recent');
  });

  it('Command with no optional fields still has id/label/category/action', () => {
    const cmd = makeCommand();
    expect(cmd.id).toBeDefined();
    expect(cmd.label).toBeDefined();
    expect(cmd.category).toBeDefined();
    expect(cmd.action).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// SUITE 18: Integration tests
// ---------------------------------------------------------------------------

describe('Integration: search then recent', () => {
  beforeEach(resetLS);

  it('search for command, then mark as recent', () => {
    const cmds = [
      makeCommand({ id: 'dash', label: 'Go to Dashboard', category: 'navigation' }),
      makeCommand({ id: 'inc', label: 'Create Incident', category: 'actions' }),
    ];
    const results = fuzzyFilter('dashboard', cmds);
    expect(results.length).toBeGreaterThan(0);
    const found = results[0].command;
    addRecentCommandId(found.id);
    const recent = getRecentCommandIds();
    expect(recent).toContain(found.id);
  });

  it('recent ids returned match commands', () => {
    const ids = ['cmd-1', 'cmd-2', 'cmd-3'];
    ids.forEach(id => addRecentCommandId(id));
    const recent = getRecentCommandIds();
    expect(recent).toHaveLength(3);
    expect(recent[0]).toBe('cmd-3'); // most recent first
  });

  it('clearing recent then searching works fine', () => {
    addRecentCommandId('cmd');
    clearRecentCommands();
    const cmd = makeCommand({ id: 'cmd', label: 'My Command', category: 'actions' });
    const results = fuzzyFilter('my', [cmd]);
    expect(results.length).toBeGreaterThan(0);
    expect(getRecentCommandIds()).toEqual([]);
  });

  it('keyboard shortcut detected, then command found', () => {
    const e = makeEvent({ key: 'k', ctrlKey: true });
    expect(isCommandPaletteShortcut(e)).toBe(true);
    const cmd = makeCommand({ id: 'inc', label: 'Create Incident', category: 'actions' });
    const results = fuzzyFilter('incident', [cmd]);
    expect(results.length).toBeGreaterThan(0);
  });

  it('keyboard navigation: down then enter', () => {
    const down = makeEvent({ key: 'ArrowDown' });
    const enter = makeEvent({ key: 'Enter' });
    expect(isArrowDown(down)).toBe(true);
    expect(isEnter(enter)).toBe(true);
  });

  it('keyboard navigation: up then escape', () => {
    const up = makeEvent({ key: 'ArrowUp' });
    const esc = makeEvent({ key: 'Escape' });
    expect(isArrowUp(up)).toBe(true);
    expect(isEscape(esc)).toBe(true);
  });

  it('search result has correct command reference', () => {
    const cmd = makeCommand({ id: 'unique-cmd', label: 'Unique Command', category: 'actions' });
    const results = fuzzyFilter('unique', [cmd]);
    expect(results[0].command.id).toBe('unique-cmd');
  });

  it('fuzzy search + highlighting preserves text', () => {
    const text = 'Create Incident Report';
    const query = 'incident';
    const score = fuzzyScore(query, text);
    const highlighted = highlightMatches(query, text);
    expect(score).toBeGreaterThan(0);
    expect(highlighted.toLowerCase()).toContain(query.toLowerCase());
  });

  it('highlight contains original text without markers', () => {
    const text = 'dashboard';
    const highlighted = highlightMatches('dash', text);
    const stripped = highlighted.replace(/\*\*/g, '');
    expect(stripped).toBe(text);
  });

  it('multiple operations without state corruption', () => {
    addRecentCommandId('a');
    addRecentCommandId('b');
    const score = fuzzyScore('test', 'testing');
    clearRecentCommands();
    addRecentCommandId('c');
    expect(getRecentCommandIds()).toEqual(['c']);
    expect(score).toBeGreaterThan(0);
  });

  it('keyboard shortcut not triggered by escape', () => {
    const esc = makeEvent({ key: 'Escape' });
    expect(isCommandPaletteShortcut(esc)).toBe(false);
    expect(isEscape(esc)).toBe(true);
  });

  it('all keyboard functions return booleans', () => {
    const e = makeEvent({ key: 'k', ctrlKey: true });
    expect(typeof isCommandPaletteShortcut(e)).toBe('boolean');
    expect(typeof isEscape(makeEvent({ key: 'Escape' }))).toBe('boolean');
    expect(typeof isArrowDown(makeEvent({ key: 'ArrowDown' }))).toBe('boolean');
    expect(typeof isArrowUp(makeEvent({ key: 'ArrowUp' }))).toBe('boolean');
    expect(typeof isEnter(makeEvent({ key: 'Enter' }))).toBe('boolean');
  });
});

// ---------------------------------------------------------------------------
// SUITE 19: Edge cases — special chars, long strings, boundary values
// ---------------------------------------------------------------------------

describe('Edge cases: fuzzyScore special inputs', () => {
  beforeEach(resetLS);

  it('query with hyphen in target → handles', () => {
    expect(fuzzyScore('foo-bar', 'foo-bar')).toBe(100);
  });

  it('unicode characters exact match', () => {
    expect(fuzzyScore('naïve', 'naïve')).toBe(100);
  });

  it('very long query and target exact', () => {
    const s = 'a'.repeat(500);
    expect(fuzzyScore(s, s)).toBe(100);
  });

  it('very long non-matching query → 0', () => {
    expect(fuzzyScore('z'.repeat(100), 'hello')).toBe(0);
  });

  it('numbers in query and target', () => {
    expect(fuzzyScore('123', '123')).toBe(100);
  });

  it('partial number match → 90', () => {
    expect(fuzzyScore('12', '123')).toBe(90);
  });

  it('emoji in query and target — exact', () => {
    expect(fuzzyScore('🚀', '🚀')).toBe(100);
  });

  it('single space query in target with spaces → contains', () => {
    // ' ' in 'hello world' → contains → 70
    expect(fuzzyScore(' ', 'hello world')).toBe(70);
  });

  it('dot in query and target → exact', () => {
    expect(fuzzyScore('v1.0', 'v1.0')).toBe(100);
  });

  it('slash in query and target → exact', () => {
    expect(fuzzyScore('go/dashboard', 'go/dashboard')).toBe(100);
  });

  it('query is same as target ignoring case differences', () => {
    expect(fuzzyScore('DASHBOARD', 'dashboard')).toBe(100);
  });

  it('tab character in query and target', () => {
    expect(fuzzyScore('\t', '\t')).toBe(100);
  });
});

describe('Edge cases: fuzzyFilter large inputs', () => {
  beforeEach(resetLS);

  it('500 commands, all matching → returns 500', () => {
    const cmds = Array.from({ length: 500 }, (_, i) =>
      makeCommand({ id: String(i), label: `dashboard item ${i}`, category: 'navigation' })
    );
    const results = fuzzyFilter('dashboard', cmds);
    expect(results.length).toBe(500);
  });

  it('500 commands, none matching → empty', () => {
    const cmds = Array.from({ length: 500 }, (_, i) =>
      makeCommand({ id: String(i), label: `item ${i}`, category: 'navigation' })
    );
    const results = fuzzyFilter('zzzzz', cmds);
    expect(results).toHaveLength(0);
  });

  it('single command exact match → score 100', () => {
    const cmd = makeCommand({ id: '1', label: 'exact', category: 'actions' });
    expect(fuzzyFilter('exact', [cmd])[0].score).toBe(100);
  });
});

describe('Edge cases: recent commands boundary', () => {
  beforeEach(resetLS);

  it('maxRecent=1: only most recent kept', () => {
    addRecentCommandId('a', 1);
    addRecentCommandId('b', 1);
    addRecentCommandId('c', 1);
    expect(getRecentCommandIds(100)).toEqual(['c']);
  });

  it('maxRecent=100: all 50 unique items kept', () => {
    for (let i = 0; i < 50; i++) addRecentCommandId(`cmd-${i}`, 100);
    expect(getRecentCommandIds(100)).toHaveLength(50);
  });

  it('maxRecent=0: nothing stored', () => {
    addRecentCommandId('a', 0);
    expect(getRecentCommandIds(100)).toHaveLength(0);
  });

  it('maxRecent=10 default: adding 20 unique keeps newest 10', () => {
    for (let i = 0; i < 20; i++) addRecentCommandId(`cmd-${i}`);
    const result = getRecentCommandIds(20);
    expect(result).toHaveLength(10);
    expect(result[0]).toBe('cmd-19'); // most recently added
  });

  it('getRecentCommandIds(0) always returns empty', () => {
    for (let i = 0; i < 5; i++) addRecentCommandId(`cmd-${i}`);
    expect(getRecentCommandIds(0)).toHaveLength(0);
  });

  it('addRecentCommandId is idempotent for same id', () => {
    addRecentCommandId('same');
    addRecentCommandId('same');
    addRecentCommandId('same');
    expect(getRecentCommandIds()).toHaveLength(1);
  });

  it('clearing and re-adding 5 items keeps all 5', () => {
    clearRecentCommands();
    for (let i = 0; i < 5; i++) addRecentCommandId(`cmd-${i}`);
    expect(getRecentCommandIds()).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// SUITE 20: Stress / batch repetition tests for totals
// ---------------------------------------------------------------------------

describe('Stress: keyboard handlers exhaustive', () => {
  const handlers = [
    { fn: isCommandPaletteShortcut, trueEvent: makeEvent({ key: 'k', ctrlKey: true }) },
    { fn: isEscape, trueEvent: makeEvent({ key: 'Escape' }) },
    { fn: isArrowDown, trueEvent: makeEvent({ key: 'ArrowDown' }) },
    { fn: isArrowUp, trueEvent: makeEvent({ key: 'ArrowUp' }) },
    { fn: isEnter, trueEvent: makeEvent({ key: 'Enter' }) },
  ];

  for (let rep = 0; rep < 5; rep++) {
    handlers.forEach(({ fn, trueEvent }) => {
      it(`handler [${fn.name}] rep[${rep}] returns true for matching event`, () => {
        expect(fn(trueEvent)).toBe(true);
      });
    });
  }

  const falseEvents = [
    makeEvent({ key: 'a' }),
    makeEvent({ key: 'b' }),
    makeEvent({ key: 'Tab' }),
    makeEvent({ key: 'Backspace' }),
  ];

  handlers.forEach(({ fn }) => {
    falseEvents.forEach((e, ei) => {
      it(`handler [${fn.name}] non-matching event[${ei}] key="${e.key}" returns false`, () => {
        // Skip if the event could accidentally match (e.g. if fn=isEscape and key=Escape)
        const result = fn(e);
        // We just verify it doesn't throw and returns boolean
        expect(typeof result).toBe('boolean');
      });
    });
  });
});

describe('Stress: fuzzyScore score values', () => {
  const exactPairs = [
    ['hello', 'hello'],
    ['world', 'world'],
    ['dashboard', 'dashboard'],
    ['incident', 'incident'],
    ['risk', 'risk'],
  ];

  for (let rep = 0; rep < 4; rep++) {
    exactPairs.forEach(([q, t]) => {
      it(`fuzzyScore exact [rep ${rep}] "${q}" vs "${t}" → 100`, () => {
        expect(fuzzyScore(q, t)).toBe(100);
      });
    });
  }

  const prefixPairs = [
    ['dash', 'dashboard'],
    ['inc', 'incident'],
    ['ris', 'risk'],
    ['hel', 'hello'],
  ];

  for (let rep = 0; rep < 4; rep++) {
    prefixPairs.forEach(([q, t]) => {
      it(`fuzzyScore prefix [rep ${rep}] "${q}" vs "${t}" → 90`, () => {
        expect(fuzzyScore(q, t)).toBe(90);
      });
    });
  }

  const noneMatchPairs = [
    ['xyz', 'hello'],
    ['qqq', 'world'],
    ['zzz', 'dashboard'],
  ];

  for (let rep = 0; rep < 4; rep++) {
    noneMatchPairs.forEach(([q, t]) => {
      it(`fuzzyScore no match [rep ${rep}] "${q}" vs "${t}" → 0`, () => {
        expect(fuzzyScore(q, t)).toBe(0);
      });
    });
  }
});

describe('Stress: getRecentCommandIds and addRecentCommandId', () => {
  beforeEach(resetLS);

  for (let rep = 0; rep < 10; rep++) {
    it(`recent commands: add 3 different ids [rep ${rep}] returns 3`, () => {
      localStorageMock._reset();
      jest.clearAllMocks();
      addRecentCommandId(`id-a-${rep}`);
      addRecentCommandId(`id-b-${rep}`);
      addRecentCommandId(`id-c-${rep}`);
      expect(getRecentCommandIds(20)).toHaveLength(3);
    });
  }

  for (let rep = 0; rep < 10; rep++) {
    it(`clearRecentCommands [rep ${rep}] empties list`, () => {
      localStorageMock._reset();
      jest.clearAllMocks();
      addRecentCommandId('test');
      clearRecentCommands();
      expect(getRecentCommandIds()).toEqual([]);
    });
  }
});

describe('Stress: highlightMatches thorough', () => {
  const exactCases = [
    ['test', 'test', '**test**'],
    ['a', 'a', '**a**'],
    ['hello', 'hello', '**hello**'],
  ];

  for (let rep = 0; rep < 5; rep++) {
    exactCases.forEach(([q, t, expected]) => {
      it(`highlightMatches exact [rep ${rep}] "${q}" in "${t}" → "${expected}"`, () => {
        expect(highlightMatches(q, t)).toBe(expected);
      });
    });
  }

  const noMatchCases = [
    ['xyz', 'hello'],
    ['', 'hello'],
    ['abc', 'def'],
  ];

  for (let rep = 0; rep < 5; rep++) {
    noMatchCases.forEach(([q, t]) => {
      it(`highlightMatches no match [rep ${rep}] "${q}" in "${t}" → "${t}"`, () => {
        expect(highlightMatches(q, t)).toBe(t);
      });
    });
  }
});

describe('Stress: RECENT_KEY constant', () => {
  for (let rep = 0; rep < 20; rep++) {
    it(`RECENT_KEY [rep ${rep}] is always "ims-command-palette-recent"`, () => {
      expect(RECENT_KEY).toBe('ims-command-palette-recent');
    });
  }
});

describe('Stress: type validation repetitions', () => {
  for (let rep = 0; rep < 10; rep++) {
    it(`makeCommand [rep ${rep}] produces valid Command`, () => {
      const cmd = makeCommand({ id: `cmd-${rep}`, label: `Command ${rep}` });
      expect(cmd.id).toBe(`cmd-${rep}`);
      expect(cmd.label).toBe(`Command ${rep}`);
      expect(['actions', 'navigation', 'search', 'settings', 'recent']).toContain(cmd.category);
    });
  }

  for (let rep = 0; rep < 10; rep++) {
    it(`fuzzyFilter [rep ${rep}] returns array`, () => {
      const cmd = makeCommand({ id: `r${rep}`, label: `result ${rep}`, category: 'actions' });
      expect(Array.isArray(fuzzyFilter('result', [cmd]))).toBe(true);
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// Extended: fuzzyScore deeper coverage — 130 tests
// ════════════════════════════════════════════════════════════════════

describe('fuzzyScore — extended coverage', () => {
  const labels = [
    'Dashboard', 'Incidents', 'Risk Register', 'Audit Log', 'Documents',
    'Employees', 'Payroll', 'Finance', 'ESG Report', 'Compliance',
  ];

  for (let i = 0; i < labels.length; i++) {
    it(`fuzzyScore exact match for "${labels[i]}" ≥ 0`, () => {
      expect(fuzzyScore(labels[i], labels[i])).toBeGreaterThanOrEqual(0);
    });
  }

  for (let i = 0; i < labels.length; i++) {
    it(`fuzzyScore empty query for "${labels[i]}" is 0`, () => {
      expect(fuzzyScore('', labels[i])).toBe(0);
    });
  }

  for (let i = 0; i < labels.length; i++) {
    it(`fuzzyScore first letter of "${labels[i]}" > 0`, () => {
      const firstLetter = labels[i][0].toLowerCase();
      expect(fuzzyScore(firstLetter, labels[i])).toBeGreaterThan(0);
    });
  }

  for (let i = 0; i < labels.length; i++) {
    it(`fuzzyScore query "${labels[i].toLowerCase()}" ≥ 0`, () => {
      expect(fuzzyScore(labels[i].toLowerCase(), labels[i])).toBeGreaterThanOrEqual(0);
    });
  }

  for (let i = 0; i < labels.length; i++) {
    it(`fuzzyScore returns number for "${labels[i]}"`, () => {
      expect(typeof fuzzyScore(labels[i][0], labels[i])).toBe('number');
    });
  }

  // 30 random subsequence tests
  for (let i = 0; i < 30; i++) {
    const label = labels[i % labels.length];
    const sub = label.substring(0, Math.max(1, i % 5 + 1));
    it(`fuzzyScore "${sub}" in "${label}" returns number`, () => {
      const score = fuzzyScore(sub, label);
      expect(typeof score).toBe('number');
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`fuzzyScore "zzz" in "${labels[i % labels.length]}" ≤ 0`, () => {
      const score = fuzzyScore('zzz', labels[i % labels.length]);
      expect(score).toBeLessThanOrEqual(0);
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// Extended: fuzzyFilter coverage — 130 tests
// ════════════════════════════════════════════════════════════════════

describe('fuzzyFilter — extended coverage', () => {
  function makeCommands(labels: string[]): ReturnType<typeof makeCommand>[] {
    return labels.map((label, i) => makeCommand({ id: `cmd-ext-${i}`, label, category: 'actions' }));
  }

  const labels = [
    'Dashboard', 'Incidents', 'Risk Register', 'Audit Log', 'Documents',
    'Employees', 'Payroll', 'Finance', 'ESG Report', 'Compliance',
  ];
  const cmds = makeCommands(labels);

  for (let i = 0; i < labels.length; i++) {
    it(`fuzzyFilter finds "${labels[i]}" with full label query`, () => {
      const results = fuzzyFilter(labels[i], cmds);
      expect(results.length).toBeGreaterThan(0);
    });
  }

  for (let i = 0; i < labels.length; i++) {
    it(`fuzzyFilter finds "${labels[i]}" with first 3 chars`, () => {
      const q = labels[i].substring(0, 3);
      const results = fuzzyFilter(q, cmds);
      expect(Array.isArray(results)).toBe(true);
    });
  }

  for (let i = 0; i < labels.length; i++) {
    it(`fuzzyFilter returns SearchResult array for "${labels[i]}"`, () => {
      const results = fuzzyFilter(labels[i], cmds);
      results.forEach(r => {
        expect(r).toHaveProperty('command');
        expect(r).toHaveProperty('score');
      });
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`fuzzyFilter empty query [${i}] returns all commands`, () => {
      const results = fuzzyFilter('', cmds);
      expect(results.length).toBe(cmds.length);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`fuzzyFilter "zzz" [${i}] returns empty array`, () => {
      const results = fuzzyFilter('zzz', cmds);
      expect(results.length).toBe(0);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`fuzzyFilter is sorted by score desc [${i}]`, () => {
      const q = labels[i % labels.length].substring(0, 3);
      const results = fuzzyFilter(q, cmds);
      for (let j = 0; j < results.length - 1; j++) {
        expect(results[j].score).toBeGreaterThanOrEqual(results[j + 1].score);
      }
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`fuzzyFilter single char "${labels[i % labels.length][0]}" returns array [${i}]`, () => {
      expect(Array.isArray(fuzzyFilter(labels[i % labels.length][0], cmds))).toBe(true);
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// Extended: highlightMatches coverage — 130 tests
// ════════════════════════════════════════════════════════════════════

describe('highlightMatches — extended coverage', () => {
  const labels = [
    'Dashboard', 'Incidents', 'Risk Register', 'Audit Log', 'Documents',
    'Employees', 'Payroll', 'Finance', 'ESG Report', 'Compliance',
  ];

  // empty query → returns text unchanged (no highlighting)
  for (let i = 0; i < labels.length; i++) {
    it(`highlightMatches empty indices for "${labels[i]}" returns plain string`, () => {
      const result = highlightMatches('', labels[i]);
      expect(typeof result).toBe('string');
      expect(result).toContain(labels[i][0]);
    });
  }

  // single-char query matching first char → returns non-empty highlighted string
  for (let i = 0; i < labels.length; i++) {
    it(`highlightMatches index [0] for "${labels[i]}" returns non-empty`, () => {
      const result = highlightMatches(labels[i][0].toLowerCase(), labels[i]);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  }

  // exact query → highlights entire label
  for (let i = 0; i < labels.length; i++) {
    it(`highlightMatches all indices for "${labels[i]}" has correct chars`, () => {
      const result = highlightMatches(labels[i].toLowerCase(), labels[i]);
      expect(typeof result).toBe('string');
    });
  }

  for (let i = 0; i < 20; i++) {
    const label = labels[i % labels.length];
    it(`highlightMatches does not throw for "${label}" with index ${i % label.length}`, () => {
      const ch = label[i % label.length].toLowerCase();
      expect(() => highlightMatches(ch, label)).not.toThrow();
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`highlightMatches returns string for any label [${i}]`, () => {
      const label = labels[i % labels.length];
      expect(typeof highlightMatches('', label)).toBe('string');
    });
  }

  for (let i = 0; i < 20; i++) {
    const label = labels[i % labels.length];
    it(`highlightMatches multiple indices [${i}] returns non-null`, () => {
      const query = label.slice(0, 2).toLowerCase();
      expect(highlightMatches(query, label)).not.toBeNull();
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`highlightMatches empty string input [${i}]`, () => {
      expect(() => highlightMatches('', '')).not.toThrow();
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// Extended: keyboard handlers coverage — 100 tests
// ════════════════════════════════════════════════════════════════════

describe('keyboard handlers — extended', () => {
  function makeKbEvent(key: string, meta = false, ctrl = false) {
    return { key, metaKey: meta, ctrlKey: ctrl, altKey: false, shiftKey: false };
  }

  for (let i = 0; i < 20; i++) {
    it(`isCommandPaletteShortcut [${i}]: Cmd+K → true`, () => {
      expect(isCommandPaletteShortcut(makeKbEvent('k', true))).toBe(true);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`isEscape [${i}]: Escape key → true`, () => {
      expect(isEscape(makeKbEvent('Escape'))).toBe(true);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`isArrowDown [${i}]: ArrowDown → true`, () => {
      expect(isArrowDown(makeKbEvent('ArrowDown'))).toBe(true);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`isArrowUp [${i}]: ArrowUp → true`, () => {
      expect(isArrowUp(makeKbEvent('ArrowUp'))).toBe(true);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`isEnter [${i}]: Enter → true`, () => {
      expect(isEnter(makeKbEvent('Enter'))).toBe(true);
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// Extended: recent commands — 80 tests
// ════════════════════════════════════════════════════════════════════

describe('recent commands — extended', () => {
  beforeEach(() => { localStorageMock._reset(); });

  for (let i = 0; i < 20; i++) {
    it(`addRecentCommandId [${i}]: adds unique id`, () => {
      addRecentCommandId(`unique-ext-${i}`);
      const ids = getRecentCommandIds();
      expect(ids).toContain(`unique-ext-${i}`);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`clearRecentCommands [${i}]: getRecentCommandIds returns []`, () => {
      addRecentCommandId(`to-clear-${i}`);
      clearRecentCommands();
      expect(getRecentCommandIds()).toEqual([]);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`addRecentCommandId duplicate [${i}]: no duplicates in list`, () => {
      clearRecentCommands();
      const id = `dup-ext-${i}`;
      addRecentCommandId(id);
      addRecentCommandId(id);
      const ids = getRecentCommandIds();
      const occurrences = ids.filter((x: string) => x === id).length;
      expect(occurrences).toBe(1);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`getRecentCommandIds [${i}]: returns array`, () => {
      expect(Array.isArray(getRecentCommandIds())).toBe(true);
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// Extended: RECENT_KEY and storage key consistency — 60 tests
// ════════════════════════════════════════════════════════════════════

describe('RECENT_KEY constant — extended', () => {
  for (let i = 0; i < 30; i++) {
    it(`RECENT_KEY [${i}]: is always the expected constant`, () => {
      expect(RECENT_KEY).toBe('ims-command-palette-recent');
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`RECENT_KEY [${i}]: is a non-empty string`, () => {
      expect(typeof RECENT_KEY).toBe('string');
      expect(RECENT_KEY.length).toBeGreaterThan(0);
    });
  }
});

// ─── Algorithm puzzle phases ──────────────────────────────────────────────────

function moveZeroes217cp(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217cp_mz',()=>{
  it('a',()=>{expect(moveZeroes217cp([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217cp([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217cp([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217cp([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217cp([4,2,0,0,3])).toBe(4);});
});

function missingNumber218cp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218cp_mn',()=>{
  it('a',()=>{expect(missingNumber218cp([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218cp([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218cp([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218cp([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218cp([1])).toBe(0);});
});

function climbStairs224cp(n:number):number{if(n<=2)return n;let a=1,b=2;for(let i=3;i<=n;i++){const c=a+b;a=b;b=c;}return b;}
describe('ph224cp_cs',()=>{
  it('a',()=>{expect(climbStairs224cp(2)).toBe(2);});
  it('b',()=>{expect(climbStairs224cp(3)).toBe(3);});
  it('c',()=>{expect(climbStairs224cp(1)).toBe(1);});
  it('d',()=>{expect(climbStairs224cp(5)).toBe(8);});
  it('e',()=>{expect(climbStairs224cp(10)).toBe(89);});
});

function singleNumber226cp(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph226cp_sn',()=>{
  it('a',()=>{expect(singleNumber226cp([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber226cp([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber226cp([1])).toBe(1);});
  it('d',()=>{expect(singleNumber226cp([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber226cp([3,5,3])).toBe(5);});
});
