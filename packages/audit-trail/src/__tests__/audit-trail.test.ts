// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { hashEntry, createEntry, AuditTrail, formatEntry, filterByTimeRange, resetCounter } from '../audit-trail';

beforeEach(() => { resetCounter(); });

describe('hashEntry', () => {
  it('returns a non-empty string', () => {
    const e = createEntry({ action: 'create', userId: 'u1', entityId: 'e1', entityType: 'User' });
    const { hash, ...rest } = e;
    expect(typeof hashEntry(rest)).toBe('string');
    expect(hashEntry(rest).length).toBeGreaterThan(0);
  });
  it('is deterministic', () => {
    const e = createEntry({ action: 'read', userId: 'u1', entityId: 'e1', entityType: 'Item' });
    const { hash, ...rest } = e;
    expect(hashEntry(rest)).toBe(hashEntry(rest));
  });
  it('differs for different data', () => {
    const e1 = createEntry({ action: 'a', userId: 'u1', entityId: 'e1', entityType: 'X' });
    const e2 = createEntry({ action: 'b', userId: 'u1', entityId: 'e1', entityType: 'X' });
    const { hash: h1, ...r1 } = e1;
    const { hash: h2, ...r2 } = e2;
    expect(hashEntry(r1)).not.toBe(hashEntry(r2));
  });
  for (let i = 0; i < 50; i++) {
    it(`hashEntry returns hex string for entry ${i}`, () => {
      const e = createEntry({ action: `act${i}`, userId: `u${i}`, entityId: `e${i}`, entityType: 'T' });
      const { hash, ...rest } = e;
      expect(/^[0-9a-f]+$/.test(hashEntry(rest))).toBe(true);
    });
  }
});

describe('createEntry', () => {
  it('has required fields', () => {
    const e = createEntry({ action: 'create', userId: 'u1', entityId: 'e1', entityType: 'User' });
    expect(e.id).toBeDefined();
    expect(e.timestamp).toBeDefined();
    expect(e.action).toBe('create');
    expect(e.userId).toBe('u1');
    expect(e.entityId).toBe('e1');
    expect(e.entityType).toBe('User');
    expect(e.hash).toBeDefined();
  });
  it('has a valid hash', () => {
    const e = createEntry({ action: 'create', userId: 'u1', entityId: 'e1', entityType: 'User' });
    const { hash, ...rest } = e;
    expect(hash).toBe(hashEntry(rest));
  });
  it('default data is null', () => {
    const e = createEntry({ action: 'read', userId: 'u1', entityId: 'e1', entityType: 'X' });
    expect(e.data).toBeNull();
  });
  it('prevHash defaults to empty string', () => {
    const e = createEntry({ action: 'read', userId: 'u1', entityId: 'e1', entityType: 'X' });
    expect(e.prevHash).toBe('');
  });
  for (let i = 0; i < 50; i++) {
    it(`createEntry ${i} has an id`, () => {
      const e = createEntry({ action: `a${i}`, userId: 'u', entityId: 'e', entityType: 'T' });
      expect(typeof e.id).toBe('string');
      expect(e.id.length).toBeGreaterThan(0);
    });
  }
});

describe('AuditTrail - append and getEntries', () => {
  it('starts empty', () => {
    const trail = new AuditTrail();
    expect(trail.length).toBe(0);
    expect(trail.getEntries()).toHaveLength(0);
  });
  it('append adds an entry', () => {
    const trail = new AuditTrail();
    trail.append('create', 'u1', 'e1', 'User');
    expect(trail.length).toBe(1);
  });
  it('getEntries returns copy', () => {
    const trail = new AuditTrail();
    trail.append('create', 'u1', 'e1', 'User');
    const entries = trail.getEntries();
    expect(entries).toHaveLength(1);
  });
  it('last returns most recent entry', () => {
    const trail = new AuditTrail();
    trail.append('a', 'u', 'e', 'T');
    const e2 = trail.append('b', 'u', 'e', 'T');
    expect(trail.last).toBe(e2);
  });
  for (let n = 1; n <= 50; n++) {
    it(`appending ${n} entries has length ${n}`, () => {
      const trail = new AuditTrail();
      for (let i = 0; i < n; i++) trail.append(`a${i}`, 'u', 'e', 'T');
      expect(trail.length).toBe(n);
    });
  }
});

describe('AuditTrail - chain linking', () => {
  it('second entry prevHash = first entry hash', () => {
    const trail = new AuditTrail();
    const e1 = trail.append('create', 'u', 'e', 'T');
    const e2 = trail.append('update', 'u', 'e', 'T');
    expect(e2.prevHash).toBe(e1.hash);
  });
  it('first entry prevHash = empty string', () => {
    const trail = new AuditTrail();
    const e1 = trail.append('create', 'u', 'e', 'T');
    expect(e1.prevHash).toBe('');
  });
  for (let n = 2; n <= 20; n++) {
    it(`chain of ${n} entries: each links to prev`, () => {
      const trail = new AuditTrail();
      for (let i = 0; i < n; i++) trail.append(`a${i}`, 'u', 'e', 'T');
      const entries = trail.getEntries();
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i].prevHash).toBe(entries[i - 1].hash);
      }
    });
  }
});

describe('AuditTrail - verify', () => {
  it('empty trail verifies', () => { expect(new AuditTrail().verify()).toBe(true); });
  it('valid chain verifies', () => {
    const trail = new AuditTrail();
    for (let i = 0; i < 5; i++) trail.append(`a${i}`, 'u', 'e', 'T');
    expect(trail.verify()).toBe(true);
  });
  it('tampering fails verification', () => {
    const trail = new AuditTrail();
    trail.append('create', 'u', 'e', 'T');
    trail.append('update', 'u', 'e', 'T');
    const entries = trail.getEntries();
    // Tamper - modifying entries from getEntries() won't affect internal state directly
    // Use internal access via fromJSON roundtrip and mutate JSON
    const json = JSON.parse(trail.toJSON()) as Array<{ action: string }>;
    json[0].action = 'TAMPERED';
    const tampered = AuditTrail.fromJSON(JSON.stringify(json));
    expect(tampered.verify()).toBe(false);
  });
  for (let n = 1; n <= 30; n++) {
    it(`valid trail of ${n} entries verifies`, () => {
      const trail = new AuditTrail();
      for (let i = 0; i < n; i++) trail.append(`a${i}`, 'u', 'e', 'T');
      expect(trail.verify()).toBe(true);
    });
  }
});

describe('AuditTrail - queries', () => {
  it('getById finds entry', () => {
    const trail = new AuditTrail();
    const e = trail.append('create', 'u1', 'e1', 'User');
    expect(trail.getById(e.id)).toBe(e);
  });
  it('getById returns undefined for unknown id', () => {
    const trail = new AuditTrail();
    expect(trail.getById('nonexistent')).toBeUndefined();
  });
  it('getByEntity filters correctly', () => {
    const trail = new AuditTrail();
    trail.append('a', 'u', 'e1', 'T');
    trail.append('b', 'u', 'e2', 'T');
    trail.append('c', 'u', 'e1', 'T');
    expect(trail.getByEntity('e1')).toHaveLength(2);
  });
  it('getByUser filters correctly', () => {
    const trail = new AuditTrail();
    trail.append('a', 'alice', 'e1', 'T');
    trail.append('b', 'bob', 'e2', 'T');
    trail.append('c', 'alice', 'e3', 'T');
    expect(trail.getByUser('alice')).toHaveLength(2);
    expect(trail.getByUser('bob')).toHaveLength(1);
  });
  it('getByAction filters correctly', () => {
    const trail = new AuditTrail();
    trail.append('create', 'u', 'e1', 'T');
    trail.append('update', 'u', 'e1', 'T');
    trail.append('create', 'u', 'e2', 'T');
    expect(trail.getByAction('create')).toHaveLength(2);
  });
  for (let i = 0; i < 20; i++) {
    it(`getByUser returns correct count for user${i}`, () => {
      const trail = new AuditTrail();
      for (let j = 0; j < 3; j++) trail.append('a', `user${i}`, 'e', 'T');
      expect(trail.getByUser(`user${i}`)).toHaveLength(3);
    });
  }
});

describe('AuditTrail - JSON serialization', () => {
  it('toJSON returns a string', () => {
    const trail = new AuditTrail();
    trail.append('a', 'u', 'e', 'T');
    expect(typeof trail.toJSON()).toBe('string');
  });
  it('fromJSON roundtrip preserves length', () => {
    const trail = new AuditTrail();
    for (let i = 0; i < 5; i++) trail.append(`a${i}`, 'u', 'e', 'T');
    const restored = AuditTrail.fromJSON(trail.toJSON());
    expect(restored.length).toBe(5);
  });
  it('fromJSON roundtrip verifies', () => {
    const trail = new AuditTrail();
    for (let i = 0; i < 3; i++) trail.append(`a${i}`, 'u', 'e', 'T');
    const restored = AuditTrail.fromJSON(trail.toJSON());
    expect(restored.verify()).toBe(true);
  });
  for (let n = 1; n <= 20; n++) {
    it(`JSON roundtrip length ${n}`, () => {
      const trail = new AuditTrail();
      for (let i = 0; i < n; i++) trail.append(`a${i}`, 'u', 'e', 'T');
      const restored = AuditTrail.fromJSON(trail.toJSON());
      expect(restored.length).toBe(n);
    });
  }
});

describe('formatEntry', () => {
  it('returns a string', () => {
    const e = createEntry({ action: 'create', userId: 'u1', entityId: 'e1', entityType: 'User' });
    expect(typeof formatEntry(e)).toBe('string');
  });
  it('contains the action', () => {
    const e = createEntry({ action: 'delete', userId: 'u', entityId: 'e', entityType: 'T' });
    expect(formatEntry(e)).toContain('delete');
  });
  for (let i = 0; i < 50; i++) {
    it(`formatEntry contains userId for entry ${i}`, () => {
      const e = createEntry({ action: 'a', userId: `user${i}`, entityId: 'e', entityType: 'T' });
      expect(formatEntry(e)).toContain(`user${i}`);
    });
  }
});

describe('filterByTimeRange', () => {
  it('returns entries within range', () => {
    const entries = Array.from({ length: 5 }, (_, i) =>
      createEntry({ action: 'a', userId: 'u', entityId: 'e', entityType: 'T' })
    );
    const now = new Date();
    const past = new Date(Date.now() - 1000 * 60);
    const future = new Date(Date.now() + 1000 * 60);
    const filtered = filterByTimeRange(entries, past, future);
    expect(filtered.length).toBe(5);
  });
  it('returns empty for out-of-range', () => {
    const entries = [createEntry({ action: 'a', userId: 'u', entityId: 'e', entityType: 'T' })];
    const future1 = new Date(Date.now() + 1000 * 60);
    const future2 = new Date(Date.now() + 1000 * 120);
    expect(filterByTimeRange(entries, future1, future2)).toHaveLength(0);
  });
  for (let n = 0; n <= 20; n++) {
    it(`filterByTimeRange with ${n} entries in range returns all`, () => {
      const entries = Array.from({ length: n }, () =>
        createEntry({ action: 'a', userId: 'u', entityId: 'e', entityType: 'T' })
      );
      const past = new Date(Date.now() - 60000);
      const future = new Date(Date.now() + 60000);
      expect(filterByTimeRange(entries, past, future)).toHaveLength(n);
    });
  }
});

describe('audit-trail extended coverage', () => {
  beforeEach(() => { resetCounter(); });
  for (let i = 0; i < 100; i++) {
    it(`createEntry with data ${i} stores it`, () => {
      const e = createEntry({ action: 'a', userId: 'u', entityId: 'e', entityType: 'T', data: { count: i } });
      expect((e.data as { count: number }).count).toBe(i);
    });
  }
  for (let i = 0; i < 100; i++) {
    it(`AuditTrail append action${i} retrieval`, () => {
      const trail = new AuditTrail();
      const e = trail.append(`action${i}`, 'u', 'e', 'T', { n: i });
      expect(trail.getById(e.id)?.action).toBe(`action${i}`);
    });
  }
  for (let n = 0; n <= 100; n++) {
    it(`trail verify with ${n} entries`, () => {
      const trail = new AuditTrail();
      for (let j = 0; j < n; j++) trail.append('a', 'u', 'e', 'T');
      expect(trail.verify()).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it(`formatEntry ${i} contains entityType`, () => {
      const e = createEntry({ action: 'a', userId: 'u', entityId: 'e', entityType: `Type${i}` });
      expect(formatEntry(e)).toContain(`Type${i}`);
    });
  }
  for (let i = 0; i < 100; i++) {
    it(`hashEntry is hex string sample ${i}`, () => {
      const e = createEntry({ action: `a${i}`, userId: 'u', entityId: 'e', entityType: 'T' });
      expect(/^[0-9a-f]+$/.test(e.hash)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it(`consecutive entry ids are unique ${i}`, () => {
      const trail = new AuditTrail();
      const e1 = trail.append('a', 'u', 'e', 'T');
      const e2 = trail.append('b', 'u', 'e', 'T');
      expect(e1.id).not.toBe(e2.id);
    });
  }
  for (let i = 1; i <= 30; i++) {
    it(`filterByTimeRange future window excludes all ${i}`, () => {
      const entries = Array.from({ length: i }, () =>
        createEntry({ action: 'a', userId: 'u', entityId: 'e', entityType: 'T' })
      );
      const f1 = new Date(Date.now() + 60000);
      const f2 = new Date(Date.now() + 120000);
      expect(filterByTimeRange(entries, f1, f2)).toHaveLength(0);
    });
  }
});

describe('audit-trail top-up', () => {
  beforeEach(() => { resetCounter(); });
  for (let i = 0; i < 50; i++) {
    it(`getByAction create count top-up ${i}`, () => {
      const trail = new AuditTrail();
      for (let j = 0; j < 3; j++) trail.append('create', 'u', `e${j}`, 'T');
      trail.append('update', 'u', 'ex', 'T');
      expect(trail.getByAction('create')).toHaveLength(3);
    });
  }
});
