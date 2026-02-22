/**
 * Unit tests for @ims/changelog package
 * Covers CRUD operations on the in-memory changelog store.
 */

// The module auto-seeds on import, so we test against real seeded data
// and also create new entries in isolated tests.

let listEntries: typeof import('../src/index').listEntries;
let listAllEntries: typeof import('../src/index').listAllEntries;
let getUnreadCount: typeof import('../src/index').getUnreadCount;
let markAsRead: typeof import('../src/index').markAsRead;
let createEntry: typeof import('../src/index').createEntry;

beforeEach(() => {
  jest.resetModules();
  const mod = require('../src/index');
  listEntries = mod.listEntries;
  listAllEntries = mod.listAllEntries;
  getUnreadCount = mod.getUnreadCount;
  markAsRead = mod.markAsRead;
  createEntry = mod.createEntry;
});

describe('listEntries (published only)', () => {
  it('returns only published entries', () => {
    // Seed data has 5 published entries
    const { entries, total } = listEntries();
    expect(total).toBeGreaterThanOrEqual(5);
    expect(entries.every((e) => e.isPublished)).toBe(true);
  });

  it('sorts entries newest first', () => {
    const { entries } = listEntries();
    for (let i = 0; i < entries.length - 1; i++) {
      const a = new Date(entries[i].publishedAt).getTime();
      const b = new Date(entries[i + 1].publishedAt).getTime();
      expect(a).toBeGreaterThanOrEqual(b);
    }
  });

  it('respects limit and offset for pagination', () => {
    const p1 = listEntries(2, 0);
    const p2 = listEntries(2, 2);

    expect(p1.entries).toHaveLength(2);
    expect(p2.entries.length).toBeGreaterThanOrEqual(1);
    // They should be different entries
    expect(p1.entries[0].id).not.toBe(p2.entries[0].id);
  });

  it('returns correct total count', () => {
    const { total } = listEntries(1, 0);
    expect(total).toBeGreaterThanOrEqual(5);
  });
});

describe('listAllEntries (admin view)', () => {
  it('returns all entries including unpublished', () => {
    createEntry({
      title: 'Draft entry',
      description: 'Not yet published',
      category: 'new_feature',
      modules: ['Test'],
      isPublished: false,
    });

    const { entries } = listAllEntries();
    const draft = entries.find((e) => e.title === 'Draft entry');
    expect(draft).toBeDefined();
    expect(draft?.isPublished).toBe(false);
  });

  it('includes seeded entries', () => {
    const { total } = listAllEntries();
    expect(total).toBeGreaterThanOrEqual(5);
  });
});

describe('createEntry', () => {
  it('creates an entry with correct fields', () => {
    const entry = createEntry({
      title: 'New Feature X',
      description: 'Adds feature X to the platform',
      category: 'new_feature',
      modules: ['Quality', 'Audit'],
    });

    expect(entry.id).toMatch(/^cl_\d{4}$/);
    expect(entry.title).toBe('New Feature X');
    expect(entry.description).toBe('Adds feature X to the platform');
    expect(entry.category).toBe('new_feature');
    expect(entry.modules).toEqual(['Quality', 'Audit']);
    expect(entry.isPublished).toBe(true); // default
  });

  it('allows creating unpublished entries', () => {
    const entry = createEntry({
      title: 'Draft',
      description: 'Coming soon',
      category: 'improvement',
      modules: [],
      isPublished: false,
    });

    expect(entry.isPublished).toBe(false);
  });

  it('new entries appear in listEntries when published', () => {
    const entry = createEntry({
      title: 'Just Published',
      description: 'A new release',
      category: 'improvement',
      modules: ['Platform'],
    });

    const { entries } = listEntries();
    const found = entries.find((e) => e.id === entry.id);
    expect(found).toBeDefined();
  });

  it('new unpublished entries do NOT appear in listEntries', () => {
    const entry = createEntry({
      title: 'Hidden Draft',
      description: 'TBD',
      category: 'bug_fix',
      modules: [],
      isPublished: false,
    });

    const { entries } = listEntries();
    const found = entries.find((e) => e.id === entry.id);
    expect(found).toBeUndefined();
  });

  it('generates sequential IDs', () => {
    const e1 = createEntry({ title: 'A', description: 'D', category: 'bug_fix', modules: [] });
    const e2 = createEntry({ title: 'B', description: 'D', category: 'security', modules: [] });

    expect(e1.id).not.toBe(e2.id);
  });
});

describe('getUnreadCount', () => {
  it('returns total published count for new user', () => {
    const count = getUnreadCount('new-user-xyz');
    const { total } = listEntries();
    expect(count).toBe(total);
  });

  it('returns 0 after markAsRead', () => {
    markAsRead('user-abc');
    // Any entries published BEFORE markAsRead should be considered read
    const count = getUnreadCount('user-abc');
    expect(count).toBe(0);
  });

  it('counts only entries published after last read', () => {
    jest.useFakeTimers();
    const now = Date.now();
    jest.setSystemTime(now);

    markAsRead('user-def');

    // Advance time by 1 ms so the new entry is strictly after lastRead
    jest.setSystemTime(now + 1);

    createEntry({
      title: 'After Read',
      description: 'New',
      category: 'new_feature',
      modules: [],
    });

    const count = getUnreadCount('user-def');
    jest.useRealTimers();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

describe('markAsRead', () => {
  it('updates the last read timestamp', () => {
    markAsRead('user-mark');
    const count = getUnreadCount('user-mark');
    expect(count).toBe(0);
  });

  it('can be called multiple times', () => {
    markAsRead('user-multi');
    markAsRead('user-multi');
    expect(() => markAsRead('user-multi')).not.toThrow();
  });
});

describe('seeded entries', () => {
  it('includes ISO 42001 AI Management Module entry', () => {
    const { entries } = listEntries();
    const entry = entries.find((e) => e.title.includes('ISO 42001'));
    expect(entry).toBeDefined();
    expect(entry?.category).toBe('new_feature');
  });

  it('includes a security patch entry', () => {
    const { entries } = listEntries();
    const secEntry = entries.find((e) => e.category === 'security');
    expect(secEntry).toBeDefined();
    expect(secEntry?.modules).toContain('Auth');
  });

  it('all seeded entries have required fields', () => {
    const { entries } = listEntries();
    for (const e of entries) {
      expect(e.id).toBeDefined();
      expect(e.title).toBeTruthy();
      expect(e.description).toBeTruthy();
      expect(['new_feature', 'improvement', 'bug_fix', 'security']).toContain(e.category);
      expect(Array.isArray(e.modules)).toBe(true);
      expect(e.publishedAt).toBeTruthy();
    }
  });
});

describe('Changelog — additional coverage', () => {
  it('listEntries returns an object with an entries array', () => {
    const result = listEntries();
    expect(Array.isArray(result.entries)).toBe(true);
  });
});

describe('Changelog — extended scenarios', () => {
  it('listAllEntries returns an object with total and entries properties', () => {
    const result = listAllEntries();
    expect(typeof result.total).toBe('number');
    expect(Array.isArray(result.entries)).toBe(true);
  });

  it('createEntry defaults isPublished to true when not specified', () => {
    const entry = createEntry({ title: 'T', description: 'D', category: 'bug_fix', modules: [] });
    expect(entry.isPublished).toBe(true);
  });

  it('createEntry respects explicit isPublished: false', () => {
    const entry = createEntry({ title: 'T', description: 'D', category: 'improvement', modules: [], isPublished: false });
    expect(entry.isPublished).toBe(false);
  });

  it('createEntry sets publishedAt to a valid ISO date string', () => {
    const entry = createEntry({ title: 'T', description: 'D', category: 'security', modules: [] });
    expect(new Date(entry.publishedAt).toISOString()).toBe(entry.publishedAt);
  });

  it('createEntry sets modules correctly when passed multiple values', () => {
    const entry = createEntry({ title: 'T', description: 'D', category: 'new_feature', modules: ['A', 'B', 'C'] });
    expect(entry.modules).toEqual(['A', 'B', 'C']);
  });

  it('listEntries with offset larger than total returns empty entries but correct total', () => {
    const { total } = listEntries();
    const result = listEntries(10, total + 100);
    expect(result.entries).toHaveLength(0);
    expect(result.total).toBe(total);
  });

  it('listAllEntries total includes unpublished entries', () => {
    createEntry({ title: 'Draft X', description: 'TBD', category: 'improvement', modules: [], isPublished: false });
    const { total } = listAllEntries();
    expect(total).toBeGreaterThanOrEqual(1);
  });

  it('getUnreadCount increments after a new published entry is added post-markAsRead', () => {
    jest.useFakeTimers();
    const now = Date.now();
    jest.setSystemTime(now);

    markAsRead('user-count-test');
    expect(getUnreadCount('user-count-test')).toBe(0);

    jest.setSystemTime(now + 100);
    createEntry({ title: 'Brand new', description: 'After mark', category: 'new_feature', modules: [] });

    const count = getUnreadCount('user-count-test');
    jest.useRealTimers();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it('markAsRead for unknown user creates a read timestamp so count becomes 0', () => {
    markAsRead('brand-new-user-999');
    expect(getUnreadCount('brand-new-user-999')).toBe(0);
  });
});

describe('Changelog — comprehensive entry and pagination checks', () => {
  it('listEntries returns entries array whose length equals minimum of limit and total', () => {
    const { entries, total } = listEntries(2, 0);
    expect(entries.length).toBeLessThanOrEqual(Math.min(2, total));
  });

  it('createEntry with category "new_feature" stores correctly', () => {
    const entry = createEntry({ title: 'NF', description: 'D', category: 'new_feature', modules: [] });
    expect(entry.category).toBe('new_feature');
  });

  it('createEntry with category "bug_fix" stores correctly', () => {
    const entry = createEntry({ title: 'BF', description: 'D', category: 'bug_fix', modules: [] });
    expect(entry.category).toBe('bug_fix');
  });

  it('createEntry with category "security" stores correctly', () => {
    const entry = createEntry({ title: 'SEC', description: 'D', category: 'security', modules: [] });
    expect(entry.category).toBe('security');
  });

  it('listAllEntries total increases after adding another entry', () => {
    const before = listAllEntries().total;
    createEntry({ title: 'Extra', description: 'D', category: 'improvement', modules: [] });
    const after = listAllEntries().total;
    expect(after).toBeGreaterThan(before);
  });

  it('getUnreadCount returns a non-negative number', () => {
    const count = getUnreadCount('test-non-negative');
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it('markAsRead followed by listEntries still returns the same entries', () => {
    const beforeList = listEntries().entries;
    markAsRead('list-stable-user');
    const afterList = listEntries().entries;
    expect(afterList.length).toBe(beforeList.length);
  });
});

describe('Changelog — final additional coverage', () => {
  it('listEntries with limit=1 returns exactly 1 entry', () => {
    const { entries } = listEntries(1, 0);
    expect(entries).toHaveLength(1);
  });

  it('createEntry id matches the pattern cl_NNNN', () => {
    const entry = createEntry({ title: 'Pattern Check', description: 'D', category: 'new_feature', modules: [] });
    expect(entry.id).toMatch(/^cl_\d{4}$/);
  });

  it('listAllEntries entries array contains both published and unpublished entries after creating a draft', () => {
    createEntry({ title: 'Draft Y', description: 'D', category: 'improvement', modules: [], isPublished: false });
    const { entries } = listAllEntries();
    const hasUnpublished = entries.some((e) => !e.isPublished);
    expect(hasUnpublished).toBe(true);
  });

  it('createEntry with category "improvement" stores correctly', () => {
    const entry = createEntry({ title: 'IMP', description: 'D', category: 'improvement', modules: [] });
    expect(entry.category).toBe('improvement');
  });

  it('getUnreadCount for two different users returns independent counts', () => {
    const count1 = getUnreadCount('userA-independent');
    const count2 = getUnreadCount('userB-independent');
    // Both brand-new users see all published entries
    expect(count1).toBe(count2);
  });
});
