import {
  createEvent,
  createTimeline,
  addEvent,
  removeEvent,
  sortByTimestamp,
  filterEvents,
  getEventById,
  getEventsByActor,
  getEventsByCategory,
  getEventsBySeverity,
  getStats,
  mergeTimelines,
  paginateEvents,
  isValidCategory,
  isValidSeverity,
  getLatestEvent,
  getEarliestEvent,
  countEventsByActor,
} from '../src/index';
import type {
  EventCategory,
  EventSeverity,
  Timeline,
  TimelineEvent,
  TimelineFilter,
} from '../src/index';

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------
const ALL_CATEGORIES: EventCategory[] = [
  'create', 'update', 'delete', 'view', 'export', 'import',
  'approve', 'reject', 'escalate', 'comment', 'assign', 'complete', 'cancel', 'system',
];
const ALL_SEVERITIES: EventSeverity[] = ['info', 'warning', 'error', 'critical'];

// Helper: build a minimal TimelineEvent without calling createEvent so tests are isolated
function makeEvent(overrides: Partial<TimelineEvent> & { id: string }): TimelineEvent {
  return {
    entityId: 'ent-1',
    entityType: 'Incident',
    category: 'create',
    severity: 'info',
    actor: 'user@example.com',
    description: 'Test event',
    timestamp: 1_000_000,
    ...overrides,
  };
}

// Helper: build a timeline with N events at sequential timestamps
function makeTimeline(n: number, base = 1_000_000): Timeline {
  const events: TimelineEvent[] = [];
  for (let i = 0; i < n; i++) {
    events.push(makeEvent({ id: `evt-${i}`, timestamp: base + i * 1000 }));
  }
  return createTimeline('ent-1', 'Incident', events);
}

// ---------------------------------------------------------------------------
// 1. createEvent
// ---------------------------------------------------------------------------
describe('createEvent', () => {
  it('stores id correctly', () => {
    const e = createEvent('id-1', 'ent', 'Type', 'create', 'info', 'actor', 'desc', 100);
    expect(e.id).toBe('id-1');
  });

  it('stores entityId correctly', () => {
    const e = createEvent('id-1', 'my-entity', 'Type', 'create', 'info', 'actor', 'desc', 100);
    expect(e.entityId).toBe('my-entity');
  });

  it('stores entityType correctly', () => {
    const e = createEvent('id-1', 'ent', 'MyType', 'create', 'info', 'actor', 'desc', 100);
    expect(e.entityType).toBe('MyType');
  });

  it('stores category correctly', () => {
    const e = createEvent('id-1', 'ent', 'Type', 'update', 'info', 'actor', 'desc', 100);
    expect(e.category).toBe('update');
  });

  it('stores severity correctly', () => {
    const e = createEvent('id-1', 'ent', 'Type', 'create', 'critical', 'actor', 'desc', 100);
    expect(e.severity).toBe('critical');
  });

  it('stores actor correctly', () => {
    const e = createEvent('id-1', 'ent', 'Type', 'create', 'info', 'bob@corp.com', 'desc', 100);
    expect(e.actor).toBe('bob@corp.com');
  });

  it('stores description correctly', () => {
    const e = createEvent('id-1', 'ent', 'Type', 'create', 'info', 'actor', 'My description', 100);
    expect(e.description).toBe('My description');
  });

  it('stores explicit timestamp correctly', () => {
    const e = createEvent('id-1', 'ent', 'Type', 'create', 'info', 'actor', 'desc', 999);
    expect(e.timestamp).toBe(999);
  });

  it('uses Date.now() when timestamp is omitted', () => {
    const before = Date.now();
    const e = createEvent('id-1', 'ent', 'Type', 'create', 'info', 'actor', 'desc');
    const after = Date.now();
    expect(e.timestamp).toBeGreaterThanOrEqual(before);
    expect(e.timestamp).toBeLessThanOrEqual(after);
  });

  it('stores metadata when provided', () => {
    const meta = { key: 'value', num: 42 };
    const e = createEvent('id-1', 'ent', 'Type', 'create', 'info', 'actor', 'desc', 100, meta);
    expect(e.metadata).toEqual(meta);
  });

  it('omits metadata key when not provided', () => {
    const e = createEvent('id-1', 'ent', 'Type', 'create', 'info', 'actor', 'desc', 100);
    expect(e.metadata).toBeUndefined();
  });

  it('handles empty description', () => {
    const e = createEvent('id-1', 'ent', 'Type', 'create', 'info', 'actor', '', 100);
    expect(e.description).toBe('');
  });

  it('handles empty metadata object', () => {
    const e = createEvent('id-1', 'ent', 'Type', 'create', 'info', 'actor', 'desc', 100, {});
    expect(e.metadata).toEqual({});
  });

  it('handles metadata with nested objects', () => {
    const meta = { nested: { a: 1 } };
    const e = createEvent('id-1', 'ent', 'Type', 'create', 'info', 'actor', 'desc', 100, meta);
    expect(e.metadata).toEqual(meta);
  });

  it('handles timestamp of 0', () => {
    const e = createEvent('id-1', 'ent', 'Type', 'create', 'info', 'actor', 'desc', 0);
    expect(e.timestamp).toBe(0);
  });

  it('handles very large timestamp', () => {
    const ts = Number.MAX_SAFE_INTEGER;
    const e = createEvent('id-1', 'ent', 'Type', 'create', 'info', 'actor', 'desc', ts);
    expect(e.timestamp).toBe(ts);
  });

  it('returns a plain object (not a class instance)', () => {
    const e = createEvent('id-1', 'ent', 'Type', 'create', 'info', 'actor', 'desc', 100);
    expect(typeof e).toBe('object');
  });

  it('does not carry tags by default', () => {
    const e = createEvent('id-1', 'ent', 'Type', 'create', 'info', 'actor', 'desc', 100);
    expect(e.tags).toBeUndefined();
  });

  // Test every category via loop (14 tests)
  ALL_CATEGORIES.forEach((cat) => {
    it(`stores category '${cat}'`, () => {
      const e = createEvent('id', 'ent', 'T', cat, 'info', 'a', 'd', 1);
      expect(e.category).toBe(cat);
    });
  });

  // Test every severity via loop (4 tests)
  ALL_SEVERITIES.forEach((sev) => {
    it(`stores severity '${sev}'`, () => {
      const e = createEvent('id', 'ent', 'T', 'create', sev, 'a', 'd', 1);
      expect(e.severity).toBe(sev);
    });
  });

  // Multiple events created independently have correct ids (10 tests)
  Array.from({ length: 10 }, (_, i) => `event-id-${i}`).forEach((id) => {
    it(`createEvent preserves id '${id}'`, () => {
      const e = createEvent(id, 'ent', 'T', 'create', 'info', 'a', 'd', 1);
      expect(e.id).toBe(id);
    });
  });
});

// ---------------------------------------------------------------------------
// 2. createTimeline
// ---------------------------------------------------------------------------
describe('createTimeline', () => {
  it('stores entityId', () => {
    const t = createTimeline('ent-abc', 'Invoice');
    expect(t.entityId).toBe('ent-abc');
  });

  it('stores entityType', () => {
    const t = createTimeline('ent-1', 'Incident');
    expect(t.entityType).toBe('Incident');
  });

  it('defaults events to empty array', () => {
    const t = createTimeline('ent-1', 'Incident');
    expect(t.events).toEqual([]);
  });

  it('accepts pre-existing events array', () => {
    const events = [makeEvent({ id: 'e1' })];
    const t = createTimeline('ent-1', 'Incident', events);
    expect(t.events).toHaveLength(1);
  });

  it('stores provided events correctly', () => {
    const events = [makeEvent({ id: 'e1' }), makeEvent({ id: 'e2' })];
    const t = createTimeline('ent-1', 'Incident', events);
    expect(t.events[0].id).toBe('e1');
    expect(t.events[1].id).toBe('e2');
  });

  it('returns an object with three keys: entityId, entityType, events', () => {
    const t = createTimeline('ent-1', 'Incident');
    expect(Object.keys(t).sort()).toEqual(['entityId', 'entityType', 'events'].sort());
  });

  it('does not mutate the passed events array', () => {
    const events = [makeEvent({ id: 'e1' })];
    const original = [...events];
    createTimeline('ent-1', 'Incident', events);
    expect(events).toEqual(original);
  });

  it('handles empty string entityId', () => {
    const t = createTimeline('', 'Type');
    expect(t.entityId).toBe('');
  });

  it('handles empty string entityType', () => {
    const t = createTimeline('ent', '');
    expect(t.entityType).toBe('');
  });

  // 10 different entity types
  ['Incident', 'Risk', 'Audit', 'Document', 'Asset', 'Complaint', 'Contract', 'Employee', 'Supplier', 'Chemical'].forEach((et) => {
    it(`creates timeline with entityType '${et}'`, () => {
      const t = createTimeline('ent', et);
      expect(t.entityType).toBe(et);
    });
  });
});

// ---------------------------------------------------------------------------
// 3. addEvent
// ---------------------------------------------------------------------------
describe('addEvent', () => {
  it('appends event to empty timeline', () => {
    const t = createTimeline('ent', 'Type');
    const e = makeEvent({ id: 'e1' });
    const t2 = addEvent(t, e);
    expect(t2.events).toHaveLength(1);
  });

  it('appended event is the correct event', () => {
    const t = createTimeline('ent', 'Type');
    const e = makeEvent({ id: 'e1' });
    const t2 = addEvent(t, e);
    expect(t2.events[0].id).toBe('e1');
  });

  it('does not mutate original timeline', () => {
    const t = createTimeline('ent', 'Type');
    const e = makeEvent({ id: 'e1' });
    addEvent(t, e);
    expect(t.events).toHaveLength(0);
  });

  it('preserves existing events', () => {
    const e1 = makeEvent({ id: 'e1' });
    const t = createTimeline('ent', 'Type', [e1]);
    const e2 = makeEvent({ id: 'e2' });
    const t2 = addEvent(t, e2);
    expect(t2.events).toHaveLength(2);
    expect(t2.events[0].id).toBe('e1');
  });

  it('preserves entityId from original timeline', () => {
    const t = createTimeline('original-ent', 'Type');
    const e = makeEvent({ id: 'e1' });
    const t2 = addEvent(t, e);
    expect(t2.entityId).toBe('original-ent');
  });

  it('preserves entityType from original timeline', () => {
    const t = createTimeline('ent', 'OriginalType');
    const e = makeEvent({ id: 'e1' });
    const t2 = addEvent(t, e);
    expect(t2.entityType).toBe('OriginalType');
  });

  it('can add multiple events sequentially', () => {
    let t = createTimeline('ent', 'Type');
    for (let i = 0; i < 5; i++) t = addEvent(t, makeEvent({ id: `e${i}` }));
    expect(t.events).toHaveLength(5);
  });

  it('events are in insertion order', () => {
    let t = createTimeline('ent', 'Type');
    for (let i = 0; i < 5; i++) t = addEvent(t, makeEvent({ id: `e${i}` }));
    for (let i = 0; i < 5; i++) expect(t.events[i].id).toBe(`e${i}`);
  });

  it('returned timeline events array is a new array reference', () => {
    const t = createTimeline('ent', 'Type');
    const e = makeEvent({ id: 'e1' });
    const t2 = addEvent(t, e);
    expect(t2.events).not.toBe(t.events);
  });

  // Adding events with all categories
  ALL_CATEGORIES.forEach((cat) => {
    it(`addEvent works for category '${cat}'`, () => {
      const t = createTimeline('ent', 'Type');
      const e = makeEvent({ id: `e-${cat}`, category: cat });
      const t2 = addEvent(t, e);
      expect(t2.events[0].category).toBe(cat);
    });
  });

  // Adding events with all severities
  ALL_SEVERITIES.forEach((sev) => {
    it(`addEvent works for severity '${sev}'`, () => {
      const t = createTimeline('ent', 'Type');
      const e = makeEvent({ id: `e-${sev}`, severity: sev });
      const t2 = addEvent(t, e);
      expect(t2.events[0].severity).toBe(sev);
    });
  });
});

// ---------------------------------------------------------------------------
// 4. removeEvent
// ---------------------------------------------------------------------------
describe('removeEvent', () => {
  it('removes the specified event', () => {
    const e = makeEvent({ id: 'e1' });
    const t = createTimeline('ent', 'Type', [e]);
    const t2 = removeEvent(t, 'e1');
    expect(t2.events).toHaveLength(0);
  });

  it('does not mutate original timeline', () => {
    const e = makeEvent({ id: 'e1' });
    const t = createTimeline('ent', 'Type', [e]);
    removeEvent(t, 'e1');
    expect(t.events).toHaveLength(1);
  });

  it('leaves array unchanged for non-existent id', () => {
    const e = makeEvent({ id: 'e1' });
    const t = createTimeline('ent', 'Type', [e]);
    const t2 = removeEvent(t, 'no-such-id');
    expect(t2.events).toHaveLength(1);
  });

  it('removes only the matching event when multiple exist', () => {
    const events = [makeEvent({ id: 'e1' }), makeEvent({ id: 'e2' }), makeEvent({ id: 'e3' })];
    const t = createTimeline('ent', 'Type', events);
    const t2 = removeEvent(t, 'e2');
    expect(t2.events.map(e => e.id)).toEqual(['e1', 'e3']);
  });

  it('preserves entityId', () => {
    const t = createTimeline('my-ent', 'Type', [makeEvent({ id: 'e1' })]);
    expect(removeEvent(t, 'e1').entityId).toBe('my-ent');
  });

  it('preserves entityType', () => {
    const t = createTimeline('ent', 'MyType', [makeEvent({ id: 'e1' })]);
    expect(removeEvent(t, 'e1').entityType).toBe('MyType');
  });

  it('handles removal from empty timeline gracefully', () => {
    const t = createTimeline('ent', 'Type');
    const t2 = removeEvent(t, 'non-existent');
    expect(t2.events).toHaveLength(0);
  });

  it('returned events array is new reference', () => {
    const e = makeEvent({ id: 'e1' });
    const t = createTimeline('ent', 'Type', [e]);
    const t2 = removeEvent(t, 'e1');
    expect(t2.events).not.toBe(t.events);
  });

  it('removing all events one by one yields empty array', () => {
    let t = makeTimeline(5);
    for (let i = 0; i < 5; i++) t = removeEvent(t, `evt-${i}`);
    expect(t.events).toHaveLength(0);
  });

  it('id matching is exact (case-sensitive)', () => {
    const e = makeEvent({ id: 'EventA' });
    const t = createTimeline('ent', 'Type', [e]);
    const t2 = removeEvent(t, 'eventa');
    expect(t2.events).toHaveLength(1);
  });

  // Remove events for each index in a 14-event timeline (14 tests)
  Array.from({ length: 14 }, (_, i) => i).forEach((i) => {
    it(`removes event at index ${i} from 14-event timeline`, () => {
      const events = ALL_CATEGORIES.map((cat, idx) =>
        makeEvent({ id: `e-${idx}`, category: cat })
      );
      const t = createTimeline('ent', 'Type', events);
      const t2 = removeEvent(t, `e-${i}`);
      expect(t2.events).toHaveLength(13);
      expect(t2.events.find(e => e.id === `e-${i}`)).toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------
// 5. sortByTimestamp
// ---------------------------------------------------------------------------
describe('sortByTimestamp', () => {
  const unsorted = [
    makeEvent({ id: 'e3', timestamp: 3000 }),
    makeEvent({ id: 'e1', timestamp: 1000 }),
    makeEvent({ id: 'e2', timestamp: 2000 }),
  ];

  it('sorts ascending by default', () => {
    const sorted = sortByTimestamp(unsorted);
    expect(sorted[0].timestamp).toBe(1000);
    expect(sorted[1].timestamp).toBe(2000);
    expect(sorted[2].timestamp).toBe(3000);
  });

  it("sorts ascending when direction is 'asc'", () => {
    const sorted = sortByTimestamp(unsorted, 'asc');
    expect(sorted.map(e => e.id)).toEqual(['e1', 'e2', 'e3']);
  });

  it("sorts descending when direction is 'desc'", () => {
    const sorted = sortByTimestamp(unsorted, 'desc');
    expect(sorted.map(e => e.id)).toEqual(['e3', 'e2', 'e1']);
  });

  it('does not mutate the original array', () => {
    const original = [...unsorted];
    sortByTimestamp(unsorted, 'asc');
    expect(unsorted[0].id).toBe(original[0].id);
  });

  it('returns a new array reference', () => {
    const sorted = sortByTimestamp(unsorted);
    expect(sorted).not.toBe(unsorted);
  });

  it('handles single-element array (asc)', () => {
    const events = [makeEvent({ id: 'e1', timestamp: 500 })];
    expect(sortByTimestamp(events)).toEqual(events);
  });

  it('handles single-element array (desc)', () => {
    const events = [makeEvent({ id: 'e1', timestamp: 500 })];
    expect(sortByTimestamp(events, 'desc')).toEqual(events);
  });

  it('handles empty array', () => {
    expect(sortByTimestamp([])).toEqual([]);
  });

  it('handles already-sorted ascending array', () => {
    const events = [
      makeEvent({ id: 'e1', timestamp: 100 }),
      makeEvent({ id: 'e2', timestamp: 200 }),
      makeEvent({ id: 'e3', timestamp: 300 }),
    ];
    const sorted = sortByTimestamp(events, 'asc');
    expect(sorted.map(e => e.id)).toEqual(['e1', 'e2', 'e3']);
  });

  it('handles already-sorted descending array sorted asc', () => {
    const events = [
      makeEvent({ id: 'e3', timestamp: 300 }),
      makeEvent({ id: 'e2', timestamp: 200 }),
      makeEvent({ id: 'e1', timestamp: 100 }),
    ];
    const sorted = sortByTimestamp(events, 'asc');
    expect(sorted.map(e => e.id)).toEqual(['e1', 'e2', 'e3']);
  });

  it('handles duplicate timestamps (stable relative order is not guaranteed, but both present)', () => {
    const events = [
      makeEvent({ id: 'eA', timestamp: 1000 }),
      makeEvent({ id: 'eB', timestamp: 1000 }),
    ];
    const sorted = sortByTimestamp(events);
    expect(sorted.map(e => e.id).sort()).toEqual(['eA', 'eB']);
  });

  it('returns correct length', () => {
    expect(sortByTimestamp(unsorted)).toHaveLength(3);
  });

  // Sort 14-element array forward and reverse (28 tests)
  Array.from({ length: 14 }, (_, i) => i).forEach((i) => {
    it(`asc sort: element at index ${i} has correct id`, () => {
      const events = Array.from({ length: 14 }, (_, j) =>
        makeEvent({ id: `e-${j}`, timestamp: (j + 1) * 1000 })
      );
      const sorted = sortByTimestamp(events, 'asc');
      expect(sorted[i].id).toBe(`e-${i}`);
    });

    it(`desc sort: element at index ${i} has correct id`, () => {
      const events = Array.from({ length: 14 }, (_, j) =>
        makeEvent({ id: `e-${j}`, timestamp: (j + 1) * 1000 })
      );
      const sorted = sortByTimestamp(events, 'desc');
      expect(sorted[i].id).toBe(`e-${13 - i}`);
    });
  });
});

// ---------------------------------------------------------------------------
// 6. filterEvents
// ---------------------------------------------------------------------------
describe('filterEvents', () => {
  const base = 1_000_000;
  const events: TimelineEvent[] = [
    makeEvent({ id: 'e1', timestamp: base + 0,    category: 'create',  severity: 'info',     actor: 'alice', tags: ['tag1'] }),
    makeEvent({ id: 'e2', timestamp: base + 1000, category: 'update',  severity: 'warning',  actor: 'bob',   tags: ['tag2'] }),
    makeEvent({ id: 'e3', timestamp: base + 2000, category: 'delete',  severity: 'error',    actor: 'alice', tags: ['tag1', 'tag2'] }),
    makeEvent({ id: 'e4', timestamp: base + 3000, category: 'approve', severity: 'critical', actor: 'carol', tags: ['tag3'] }),
    makeEvent({ id: 'e5', timestamp: base + 4000, category: 'reject',  severity: 'info',     actor: 'bob',   tags: ['tag1', 'tag3'] }),
  ];

  it('returns all events with empty filter', () => {
    expect(filterEvents(events, {})).toHaveLength(5);
  });

  it('filters by fromTimestamp (inclusive)', () => {
    const result = filterEvents(events, { fromTimestamp: base + 2000 });
    expect(result).toHaveLength(3);
    expect(result.map(e => e.id)).toEqual(['e3', 'e4', 'e5']);
  });

  it('filters by toTimestamp (inclusive)', () => {
    const result = filterEvents(events, { toTimestamp: base + 2000 });
    expect(result).toHaveLength(3);
    expect(result.map(e => e.id)).toEqual(['e1', 'e2', 'e3']);
  });

  it('filters by fromTimestamp and toTimestamp together', () => {
    const result = filterEvents(events, { fromTimestamp: base + 1000, toTimestamp: base + 3000 });
    expect(result).toHaveLength(3);
    expect(result.map(e => e.id)).toEqual(['e2', 'e3', 'e4']);
  });

  it('returns empty when fromTimestamp > toTimestamp', () => {
    const result = filterEvents(events, { fromTimestamp: base + 4000, toTimestamp: base });
    expect(result).toHaveLength(0);
  });

  it('filters by single category', () => {
    const result = filterEvents(events, { categories: ['create'] });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('e1');
  });

  it('filters by multiple categories', () => {
    const result = filterEvents(events, { categories: ['create', 'update'] });
    expect(result).toHaveLength(2);
  });

  it('filters by single severity', () => {
    const result = filterEvents(events, { severities: ['info'] });
    expect(result).toHaveLength(2);
    expect(result.map(e => e.id)).toEqual(['e1', 'e5']);
  });

  it('filters by multiple severities', () => {
    const result = filterEvents(events, { severities: ['info', 'critical'] });
    expect(result).toHaveLength(3);
  });

  it('filters by single actor', () => {
    const result = filterEvents(events, { actors: ['alice'] });
    expect(result).toHaveLength(2);
  });

  it('filters by multiple actors', () => {
    const result = filterEvents(events, { actors: ['alice', 'carol'] });
    expect(result).toHaveLength(3);
  });

  it('filters by tags (any tag match)', () => {
    const result = filterEvents(events, { tags: ['tag1'] });
    expect(result.map(e => e.id).sort()).toEqual(['e1', 'e3', 'e5'].sort());
  });

  it('filters by tag3', () => {
    const result = filterEvents(events, { tags: ['tag3'] });
    expect(result.map(e => e.id).sort()).toEqual(['e4', 'e5'].sort());
  });

  it('excludes events without tags when tag filter applied', () => {
    const eventsWithUntagged = [
      ...events,
      makeEvent({ id: 'e6', timestamp: base + 5000, category: 'view', severity: 'info', actor: 'dave' }),
    ];
    const result = filterEvents(eventsWithUntagged, { tags: ['tag1'] });
    expect(result.find(e => e.id === 'e6')).toBeUndefined();
  });

  it('combined: actor + severity filter', () => {
    const result = filterEvents(events, { actors: ['bob'], severities: ['warning'] });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('e2');
  });

  it('combined: category + severity filter', () => {
    const result = filterEvents(events, { categories: ['reject'], severities: ['info'] });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('e5');
  });

  it('combined: fromTimestamp + category filter', () => {
    const result = filterEvents(events, { fromTimestamp: base + 2000, categories: ['delete'] });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('e3');
  });

  it('returns empty on empty input', () => {
    expect(filterEvents([], { categories: ['create'] })).toHaveLength(0);
  });

  it('returns empty when no events match', () => {
    const result = filterEvents(events, { actors: ['nobody'] });
    expect(result).toHaveLength(0);
  });

  it('does not mutate original events array', () => {
    const len = events.length;
    filterEvents(events, { categories: ['create'] });
    expect(events).toHaveLength(len);
  });

  // Filter by each category individually (14 tests)
  ALL_CATEGORIES.forEach((cat) => {
    it(`filterEvents by category '${cat}' returns only those events`, () => {
      const catEvents = [
        makeEvent({ id: `cat-${cat}`, category: cat }),
        makeEvent({ id: 'other', category: cat === 'create' ? 'update' : 'create' }),
      ];
      const result = filterEvents(catEvents, { categories: [cat] });
      expect(result.every(e => e.category === cat)).toBe(true);
    });
  });

  // Filter by each severity individually (4 tests)
  ALL_SEVERITIES.forEach((sev) => {
    it(`filterEvents by severity '${sev}' returns only those events`, () => {
      const sevEvents = [
        makeEvent({ id: `sev-${sev}`, severity: sev }),
        makeEvent({ id: 'other', severity: sev === 'info' ? 'warning' : 'info' }),
      ];
      const result = filterEvents(sevEvents, { severities: [sev] });
      expect(result.every(e => e.severity === sev)).toBe(true);
    });
  });

  // Filter with range windows (10 tests)
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`fromTimestamp window ${i}: events in [base+${i*1000}, base+${(i+1)*1000}]`, () => {
      const rangeEvents = Array.from({ length: 10 }, (_, j) =>
        makeEvent({ id: `re-${j}`, timestamp: base + j * 1000 })
      );
      const result = filterEvents(rangeEvents, {
        fromTimestamp: base + i * 1000,
        toTimestamp: base + i * 1000,
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(`re-${i}`);
    });
  });
});

// ---------------------------------------------------------------------------
// 7. getEventById
// ---------------------------------------------------------------------------
describe('getEventById', () => {
  it('finds an existing event', () => {
    const e = makeEvent({ id: 'e1' });
    const t = createTimeline('ent', 'Type', [e]);
    expect(getEventById(t, 'e1')).toBeDefined();
  });

  it('returns correct event', () => {
    const e = makeEvent({ id: 'e1', description: 'hello' });
    const t = createTimeline('ent', 'Type', [e]);
    expect(getEventById(t, 'e1')?.description).toBe('hello');
  });

  it('returns undefined for non-existent id', () => {
    const t = createTimeline('ent', 'Type', [makeEvent({ id: 'e1' })]);
    expect(getEventById(t, 'nope')).toBeUndefined();
  });

  it('returns undefined on empty timeline', () => {
    const t = createTimeline('ent', 'Type');
    expect(getEventById(t, 'e1')).toBeUndefined();
  });

  it('finds last event in a long timeline', () => {
    const t = makeTimeline(20);
    expect(getEventById(t, 'evt-19')).toBeDefined();
  });

  it('returns first event in a long timeline', () => {
    const t = makeTimeline(20);
    expect(getEventById(t, 'evt-0')?.id).toBe('evt-0');
  });

  it('matching is case-sensitive', () => {
    const e = makeEvent({ id: 'EventA' });
    const t = createTimeline('ent', 'Type', [e]);
    expect(getEventById(t, 'eventa')).toBeUndefined();
  });

  // Lookup 14 events by id (14 tests)
  Array.from({ length: 14 }, (_, i) => i).forEach((i) => {
    it(`getEventById finds 'e${i}' in 14-event timeline`, () => {
      const events = Array.from({ length: 14 }, (_, j) => makeEvent({ id: `e${j}` }));
      const t = createTimeline('ent', 'Type', events);
      expect(getEventById(t, `e${i}`)?.id).toBe(`e${i}`);
    });
  });
});

// ---------------------------------------------------------------------------
// 8. getEventsByActor
// ---------------------------------------------------------------------------
describe('getEventsByActor', () => {
  it('returns all events for a given actor', () => {
    const t = createTimeline('ent', 'Type', [
      makeEvent({ id: 'e1', actor: 'alice' }),
      makeEvent({ id: 'e2', actor: 'bob' }),
      makeEvent({ id: 'e3', actor: 'alice' }),
    ]);
    expect(getEventsByActor(t, 'alice')).toHaveLength(2);
  });

  it('returns empty array for unknown actor', () => {
    const t = createTimeline('ent', 'Type', [makeEvent({ id: 'e1', actor: 'alice' })]);
    expect(getEventsByActor(t, 'nobody')).toHaveLength(0);
  });

  it('returns empty array on empty timeline', () => {
    const t = createTimeline('ent', 'Type');
    expect(getEventsByActor(t, 'alice')).toHaveLength(0);
  });

  it('returned events all have the correct actor', () => {
    const t = createTimeline('ent', 'Type', [
      makeEvent({ id: 'e1', actor: 'alice' }),
      makeEvent({ id: 'e2', actor: 'alice' }),
    ]);
    const result = getEventsByActor(t, 'alice');
    expect(result.every(e => e.actor === 'alice')).toBe(true);
  });

  it('matching is case-sensitive', () => {
    const t = createTimeline('ent', 'Type', [makeEvent({ id: 'e1', actor: 'Alice' })]);
    expect(getEventsByActor(t, 'alice')).toHaveLength(0);
  });

  it('returns single matching event', () => {
    const t = createTimeline('ent', 'Type', [
      makeEvent({ id: 'e1', actor: 'alice' }),
      makeEvent({ id: 'e2', actor: 'bob' }),
    ]);
    expect(getEventsByActor(t, 'alice')).toHaveLength(1);
  });

  // 10 different actors (10 tests)
  ['alice', 'bob', 'carol', 'dave', 'eve', 'frank', 'grace', 'heidi', 'ivan', 'judy'].forEach((actor, i) => {
    it(`getEventsByActor finds events for actor '${actor}'`, () => {
      const events = ['alice', 'bob', 'carol', 'dave', 'eve', 'frank', 'grace', 'heidi', 'ivan', 'judy'].map(
        (a, j) => makeEvent({ id: `e${j}`, actor: a })
      );
      const t = createTimeline('ent', 'Type', events);
      const result = getEventsByActor(t, actor);
      expect(result).toHaveLength(1);
      expect(result[0].actor).toBe(actor);
    });
  });

  // Actor with multiple events across categories (14 tests)
  ALL_CATEGORIES.forEach((cat) => {
    it(`getEventsByActor returns event with category '${cat}' for actor 'alice'`, () => {
      const e = makeEvent({ id: `e-${cat}`, actor: 'alice', category: cat });
      const t = createTimeline('ent', 'Type', [e]);
      const result = getEventsByActor(t, 'alice');
      expect(result[0].category).toBe(cat);
    });
  });
});

// ---------------------------------------------------------------------------
// 9. getEventsByCategory
// ---------------------------------------------------------------------------
describe('getEventsByCategory', () => {
  // Comprehensive loop over all 14 categories (14 × 5 = 70 tests)
  ALL_CATEGORIES.forEach((cat) => {
    const otherCat: EventCategory = cat === 'create' ? 'update' : 'create';
    const events = [
      makeEvent({ id: `e-${cat}-1`, category: cat }),
      makeEvent({ id: `e-${cat}-2`, category: cat }),
      makeEvent({ id: `e-other`,    category: otherCat }),
    ];
    const t = createTimeline('ent', 'Type', events);

    it(`getEventsByCategory('${cat}') returns correct count`, () => {
      expect(getEventsByCategory(t, cat)).toHaveLength(2);
    });

    it(`getEventsByCategory('${cat}') excludes other categories`, () => {
      const result = getEventsByCategory(t, cat);
      expect(result.every(e => e.category === cat)).toBe(true);
    });

    it(`getEventsByCategory('${cat}') on empty timeline returns []`, () => {
      expect(getEventsByCategory(createTimeline('e', 'T'), cat)).toHaveLength(0);
    });

    it(`getEventsByCategory('${cat}') ids are correct`, () => {
      const result = getEventsByCategory(t, cat);
      expect(result.map(e => e.id).sort()).toEqual([`e-${cat}-1`, `e-${cat}-2`].sort());
    });

    it(`getEventsByCategory does not mutate timeline for '${cat}'`, () => {
      const len = t.events.length;
      getEventsByCategory(t, cat);
      expect(t.events).toHaveLength(len);
    });
  });
});

// ---------------------------------------------------------------------------
// 10. getEventsBySeverity
// ---------------------------------------------------------------------------
describe('getEventsBySeverity', () => {
  // Comprehensive loop over all 4 severities (4 × 5 = 20 tests)
  ALL_SEVERITIES.forEach((sev) => {
    const otherSev: EventSeverity = sev === 'info' ? 'warning' : 'info';
    const events = [
      makeEvent({ id: `e-${sev}-1`, severity: sev }),
      makeEvent({ id: `e-${sev}-2`, severity: sev }),
      makeEvent({ id: 'e-other',    severity: otherSev }),
    ];
    const t = createTimeline('ent', 'Type', events);

    it(`getEventsBySeverity('${sev}') returns correct count`, () => {
      expect(getEventsBySeverity(t, sev)).toHaveLength(2);
    });

    it(`getEventsBySeverity('${sev}') excludes other severities`, () => {
      const result = getEventsBySeverity(t, sev);
      expect(result.every(e => e.severity === sev)).toBe(true);
    });

    it(`getEventsBySeverity('${sev}') on empty timeline returns []`, () => {
      expect(getEventsBySeverity(createTimeline('e', 'T'), sev)).toHaveLength(0);
    });

    it(`getEventsBySeverity('${sev}') returns correct ids`, () => {
      const result = getEventsBySeverity(t, sev);
      expect(result.map(e => e.id).sort()).toEqual([`e-${sev}-1`, `e-${sev}-2`].sort());
    });

    it(`getEventsBySeverity does not mutate timeline for '${sev}'`, () => {
      const len = t.events.length;
      getEventsBySeverity(t, sev);
      expect(t.events).toHaveLength(len);
    });
  });
});

// ---------------------------------------------------------------------------
// 11. getStats
// ---------------------------------------------------------------------------
describe('getStats', () => {
  it('totalEvents is 0 for empty timeline', () => {
    expect(getStats(createTimeline('e', 'T')).totalEvents).toBe(0);
  });

  it('uniqueActors is 0 for empty timeline', () => {
    expect(getStats(createTimeline('e', 'T')).uniqueActors).toBe(0);
  });

  it('firstEventAt is undefined for empty timeline', () => {
    expect(getStats(createTimeline('e', 'T')).firstEventAt).toBeUndefined();
  });

  it('lastEventAt is undefined for empty timeline', () => {
    expect(getStats(createTimeline('e', 'T')).lastEventAt).toBeUndefined();
  });

  it('all category counts are 0 for empty timeline', () => {
    const stats = getStats(createTimeline('e', 'T'));
    for (const cat of ALL_CATEGORIES) expect(stats.eventsByCategory[cat]).toBe(0);
  });

  it('all severity counts are 0 for empty timeline', () => {
    const stats = getStats(createTimeline('e', 'T'));
    for (const sev of ALL_SEVERITIES) expect(stats.eventsBySeverity[sev]).toBe(0);
  });

  it('totalEvents is 1 for single-event timeline', () => {
    const t = createTimeline('e', 'T', [makeEvent({ id: 'e1' })]);
    expect(getStats(t).totalEvents).toBe(1);
  });

  it('uniqueActors is 1 for single actor', () => {
    const t = createTimeline('e', 'T', [makeEvent({ id: 'e1', actor: 'alice' })]);
    expect(getStats(t).uniqueActors).toBe(1);
  });

  it('firstEventAt equals timestamp for single event', () => {
    const t = createTimeline('e', 'T', [makeEvent({ id: 'e1', timestamp: 5000 })]);
    expect(getStats(t).firstEventAt).toBe(5000);
  });

  it('lastEventAt equals timestamp for single event', () => {
    const t = createTimeline('e', 'T', [makeEvent({ id: 'e1', timestamp: 5000 })]);
    expect(getStats(t).lastEventAt).toBe(5000);
  });

  it('category count increments for matching category', () => {
    const t = createTimeline('e', 'T', [makeEvent({ id: 'e1', category: 'create' })]);
    expect(getStats(t).eventsByCategory['create']).toBe(1);
  });

  it('severity count increments for matching severity', () => {
    const t = createTimeline('e', 'T', [makeEvent({ id: 'e1', severity: 'critical' })]);
    expect(getStats(t).eventsBySeverity['critical']).toBe(1);
  });

  it('firstEventAt is minimum timestamp across events', () => {
    const events = [
      makeEvent({ id: 'e1', timestamp: 3000 }),
      makeEvent({ id: 'e2', timestamp: 1000 }),
      makeEvent({ id: 'e3', timestamp: 2000 }),
    ];
    const t = createTimeline('e', 'T', events);
    expect(getStats(t).firstEventAt).toBe(1000);
  });

  it('lastEventAt is maximum timestamp across events', () => {
    const events = [
      makeEvent({ id: 'e1', timestamp: 3000 }),
      makeEvent({ id: 'e2', timestamp: 1000 }),
      makeEvent({ id: 'e3', timestamp: 2000 }),
    ];
    const t = createTimeline('e', 'T', events);
    expect(getStats(t).lastEventAt).toBe(3000);
  });

  it('uniqueActors counts distinct actors', () => {
    const events = [
      makeEvent({ id: 'e1', actor: 'alice' }),
      makeEvent({ id: 'e2', actor: 'alice' }),
      makeEvent({ id: 'e3', actor: 'bob' }),
    ];
    const t = createTimeline('e', 'T', events);
    expect(getStats(t).uniqueActors).toBe(2);
  });

  it('totalEvents matches count', () => {
    const t = makeTimeline(10);
    expect(getStats(t).totalEvents).toBe(10);
  });

  it('getStats eventsByCategory has all 14 keys', () => {
    const stats = getStats(createTimeline('e', 'T'));
    expect(Object.keys(stats.eventsByCategory)).toHaveLength(14);
  });

  it('getStats eventsBySeverity has all 4 keys', () => {
    const stats = getStats(createTimeline('e', 'T'));
    expect(Object.keys(stats.eventsBySeverity)).toHaveLength(4);
  });

  // Each category count is tracked individually (14 tests)
  ALL_CATEGORIES.forEach((cat) => {
    it(`getStats counts category '${cat}' correctly`, () => {
      const events = [
        makeEvent({ id: `e1-${cat}`, category: cat }),
        makeEvent({ id: `e2-${cat}`, category: cat }),
      ];
      const t = createTimeline('e', 'T', events);
      const stats = getStats(t);
      expect(stats.eventsByCategory[cat]).toBe(2);
      // Other categories still 0
      for (const other of ALL_CATEGORIES.filter(c => c !== cat)) {
        expect(stats.eventsByCategory[other]).toBe(0);
      }
    });
  });

  // Each severity count is tracked individually (4 tests)
  ALL_SEVERITIES.forEach((sev) => {
    it(`getStats counts severity '${sev}' correctly`, () => {
      const events = [
        makeEvent({ id: `e1-${sev}`, severity: sev }),
        makeEvent({ id: `e2-${sev}`, severity: sev }),
        makeEvent({ id: `e3-${sev}`, severity: sev }),
      ];
      const t = createTimeline('e', 'T', events);
      const stats = getStats(t);
      expect(stats.eventsBySeverity[sev]).toBe(3);
    });
  });

  // Multiple actors (10 tests)
  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`getStats counts ${n} unique actor(s)`, () => {
      const events = Array.from({ length: n }, (_, i) =>
        makeEvent({ id: `ea-${i}`, actor: `actor-${i}` })
      );
      const t = createTimeline('e', 'T', events);
      expect(getStats(t).uniqueActors).toBe(n);
    });
  });
});

// ---------------------------------------------------------------------------
// 12. mergeTimelines
// ---------------------------------------------------------------------------
describe('mergeTimelines', () => {
  it('merges two timelines into one', () => {
    const a = createTimeline('ent', 'Type', [makeEvent({ id: 'e1', timestamp: 1000 })]);
    const b = createTimeline('ent', 'Type', [makeEvent({ id: 'e2', timestamp: 2000 })]);
    const merged = mergeTimelines(a, b);
    expect(merged.events).toHaveLength(2);
  });

  it('deduplicates events with same id', () => {
    const e = makeEvent({ id: 'e1', timestamp: 1000 });
    const a = createTimeline('ent', 'Type', [e]);
    const b = createTimeline('ent', 'Type', [e]);
    const merged = mergeTimelines(a, b);
    expect(merged.events).toHaveLength(1);
  });

  it('merged events are sorted ascending by timestamp', () => {
    const a = createTimeline('ent', 'Type', [makeEvent({ id: 'e2', timestamp: 2000 })]);
    const b = createTimeline('ent', 'Type', [makeEvent({ id: 'e1', timestamp: 1000 })]);
    const merged = mergeTimelines(a, b);
    expect(merged.events[0].id).toBe('e1');
    expect(merged.events[1].id).toBe('e2');
  });

  it('preserves entityId from first timeline', () => {
    const a = createTimeline('ent-a', 'Type', []);
    const b = createTimeline('ent-b', 'Type', []);
    expect(mergeTimelines(a, b).entityId).toBe('ent-a');
  });

  it('preserves entityType from first timeline', () => {
    const a = createTimeline('ent', 'TypeA', []);
    const b = createTimeline('ent', 'TypeB', []);
    expect(mergeTimelines(a, b).entityType).toBe('TypeA');
  });

  it('merges with empty first timeline', () => {
    const a = createTimeline('ent', 'Type', []);
    const b = createTimeline('ent', 'Type', [makeEvent({ id: 'e1', timestamp: 1000 })]);
    expect(mergeTimelines(a, b).events).toHaveLength(1);
  });

  it('merges with empty second timeline', () => {
    const a = createTimeline('ent', 'Type', [makeEvent({ id: 'e1', timestamp: 1000 })]);
    const b = createTimeline('ent', 'Type', []);
    expect(mergeTimelines(a, b).events).toHaveLength(1);
  });

  it('merges two empty timelines', () => {
    const a = createTimeline('ent', 'Type', []);
    const b = createTimeline('ent', 'Type', []);
    expect(mergeTimelines(a, b).events).toHaveLength(0);
  });

  it('does not mutate either input timeline', () => {
    const a = createTimeline('ent', 'Type', [makeEvent({ id: 'e1', timestamp: 1000 })]);
    const b = createTimeline('ent', 'Type', [makeEvent({ id: 'e2', timestamp: 2000 })]);
    mergeTimelines(a, b);
    expect(a.events).toHaveLength(1);
    expect(b.events).toHaveLength(1);
  });

  it('keeps first occurrence when ids duplicate', () => {
    const e1a = makeEvent({ id: 'e1', description: 'from a', timestamp: 1000 });
    const e1b = makeEvent({ id: 'e1', description: 'from b', timestamp: 2000 });
    const a = createTimeline('ent', 'Type', [e1a]);
    const b = createTimeline('ent', 'Type', [e1b]);
    const merged = mergeTimelines(a, b);
    expect(merged.events[0].description).toBe('from a');
  });

  // Merge timelines of sizes 1..10 (10 tests)
  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`merges two timelines of size ${n} each (distinct ids)`, () => {
      const a = createTimeline('ent', 'Type',
        Array.from({ length: n }, (_, i) => makeEvent({ id: `a-${i}`, timestamp: i * 100 }))
      );
      const b = createTimeline('ent', 'Type',
        Array.from({ length: n }, (_, i) => makeEvent({ id: `b-${i}`, timestamp: (n + i) * 100 }))
      );
      const merged = mergeTimelines(a, b);
      expect(merged.events).toHaveLength(n * 2);
    });
  });

  // Verify sort order in merged (10 tests)
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`merged timeline element at index ${i} has ascending timestamp`, () => {
      const allEvents = Array.from({ length: 10 }, (_, j) =>
        makeEvent({ id: `m-${j}`, timestamp: (j + 1) * 500 })
      );
      const a = createTimeline('ent', 'Type', allEvents.slice(0, 5));
      const b = createTimeline('ent', 'Type', allEvents.slice(5));
      const merged = mergeTimelines(a, b);
      if (i < merged.events.length - 1) {
        expect(merged.events[i].timestamp).toBeLessThanOrEqual(merged.events[i + 1].timestamp);
      } else {
        expect(merged.events[i]).toBeDefined();
      }
    });
  });
});

// ---------------------------------------------------------------------------
// 13. paginateEvents
// ---------------------------------------------------------------------------
describe('paginateEvents', () => {
  const events = Array.from({ length: 25 }, (_, i) => makeEvent({ id: `e${i}`, timestamp: i * 1000 }));

  it('returns first page correctly', () => {
    const page = paginateEvents(events, 0, 10);
    expect(page).toHaveLength(10);
    expect(page[0].id).toBe('e0');
  });

  it('returns second page correctly', () => {
    const page = paginateEvents(events, 1, 10);
    expect(page).toHaveLength(10);
    expect(page[0].id).toBe('e10');
  });

  it('returns partial last page', () => {
    const page = paginateEvents(events, 2, 10);
    expect(page).toHaveLength(5);
    expect(page[0].id).toBe('e20');
  });

  it('returns empty for page beyond range', () => {
    const page = paginateEvents(events, 10, 10);
    expect(page).toHaveLength(0);
  });

  it('returns empty for empty array', () => {
    expect(paginateEvents([], 0, 10)).toHaveLength(0);
  });

  it('pageSize 1 returns single event', () => {
    const page = paginateEvents(events, 0, 1);
    expect(page).toHaveLength(1);
    expect(page[0].id).toBe('e0');
  });

  it('pageSize 1 page 5 returns correct event', () => {
    const page = paginateEvents(events, 5, 1);
    expect(page[0].id).toBe('e5');
  });

  it('pageSize equal to array length returns all', () => {
    const page = paginateEvents(events, 0, events.length);
    expect(page).toHaveLength(events.length);
  });

  it('pageSize larger than array returns all', () => {
    const page = paginateEvents(events, 0, 1000);
    expect(page).toHaveLength(events.length);
  });

  it('does not mutate original array', () => {
    const len = events.length;
    paginateEvents(events, 0, 10);
    expect(events).toHaveLength(len);
  });

  it('page 0 size 5 returns first 5', () => {
    const page = paginateEvents(events, 0, 5);
    expect(page.map(e => e.id)).toEqual(['e0', 'e1', 'e2', 'e3', 'e4']);
  });

  it('page 1 size 5 returns next 5', () => {
    const page = paginateEvents(events, 1, 5);
    expect(page.map(e => e.id)).toEqual(['e5', 'e6', 'e7', 'e8', 'e9']);
  });

  it('page 4 size 5 returns last 5 of 25', () => {
    const page = paginateEvents(events, 4, 5);
    expect(page.map(e => e.id)).toEqual(['e20', 'e21', 'e22', 'e23', 'e24']);
  });

  // Verify every page of pageSize=5 in a 25-event array (5 tests)
  Array.from({ length: 5 }, (_, p) => p).forEach((p) => {
    it(`page ${p} of size 5 from 25-event array has 5 items`, () => {
      expect(paginateEvents(events, p, 5)).toHaveLength(5);
    });
  });

  // Verify single-item pages for first 10 events (10 tests)
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`pageSize=1 page=${i} returns event e${i}`, () => {
      const page = paginateEvents(events, i, 1);
      expect(page[0].id).toBe(`e${i}`);
    });
  });

  // Verify page 2 of various sizes
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((size) => {
    it(`paginateEvents page=2 size=${size} starts at correct index`, () => {
      const slice = paginateEvents(events, 2, size);
      expect(slice[0].id).toBe(`e${2 * size}`);
    });
  });
});

// ---------------------------------------------------------------------------
// 14. isValidCategory
// ---------------------------------------------------------------------------
describe('isValidCategory', () => {
  // All valid categories (14 tests)
  ALL_CATEGORIES.forEach((cat) => {
    it(`isValidCategory('${cat}') returns true`, () => {
      expect(isValidCategory(cat)).toBe(true);
    });
  });

  // Invalid strings (10 tests)
  ['', 'Create', 'CREATE', 'unknown', 'read', 'write', 'execute', 'modify', 'close', 'open'].forEach((s) => {
    it(`isValidCategory('${s}') returns false`, () => {
      expect(isValidCategory(s)).toBe(false);
    });
  });

  it('returns false for random string', () => {
    expect(isValidCategory('foobar')).toBe(false);
  });

  it('returns false for number-like string', () => {
    expect(isValidCategory('123')).toBe(false);
  });

  it('returns false for whitespace', () => {
    expect(isValidCategory(' create')).toBe(false);
  });

  it('returns false for category with trailing space', () => {
    expect(isValidCategory('create ')).toBe(false);
  });

  it('returns false for null string representation', () => {
    expect(isValidCategory('null')).toBe(false);
  });

  it('returns false for undefined string representation', () => {
    expect(isValidCategory('undefined')).toBe(false);
  });

  // Combination test: all valid should be true, double-check set size
  it('exactly 14 categories are valid', () => {
    const valid = ALL_CATEGORIES.filter(c => isValidCategory(c));
    expect(valid).toHaveLength(14);
  });
});

// ---------------------------------------------------------------------------
// 15. isValidSeverity
// ---------------------------------------------------------------------------
describe('isValidSeverity', () => {
  // All valid severities (4 tests)
  ALL_SEVERITIES.forEach((sev) => {
    it(`isValidSeverity('${sev}') returns true`, () => {
      expect(isValidSeverity(sev)).toBe(true);
    });
  });

  // Invalid strings (10 tests)
  ['', 'Info', 'INFO', 'high', 'low', 'medium', 'extreme', 'none', 'fatal', 'debug'].forEach((s) => {
    it(`isValidSeverity('${s}') returns false`, () => {
      expect(isValidSeverity(s)).toBe(false);
    });
  });

  it('returns false for random string', () => {
    expect(isValidSeverity('foobar')).toBe(false);
  });

  it('returns false for severity with space prefix', () => {
    expect(isValidSeverity(' info')).toBe(false);
  });

  it('returns false for severity with space suffix', () => {
    expect(isValidSeverity('info ')).toBe(false);
  });

  it('exactly 4 severities are valid', () => {
    const valid = ALL_SEVERITIES.filter(s => isValidSeverity(s));
    expect(valid).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// 16. getLatestEvent
// ---------------------------------------------------------------------------
describe('getLatestEvent', () => {
  it('returns undefined for empty timeline', () => {
    expect(getLatestEvent(createTimeline('e', 'T'))).toBeUndefined();
  });

  it('returns the only event in single-event timeline', () => {
    const e = makeEvent({ id: 'e1', timestamp: 5000 });
    const t = createTimeline('e', 'T', [e]);
    expect(getLatestEvent(t)?.id).toBe('e1');
  });

  it('returns event with highest timestamp', () => {
    const events = [
      makeEvent({ id: 'e1', timestamp: 1000 }),
      makeEvent({ id: 'e2', timestamp: 3000 }),
      makeEvent({ id: 'e3', timestamp: 2000 }),
    ];
    const t = createTimeline('e', 'T', events);
    expect(getLatestEvent(t)?.id).toBe('e2');
  });

  it('handles already-sorted ascending array', () => {
    const events = [
      makeEvent({ id: 'e1', timestamp: 100 }),
      makeEvent({ id: 'e2', timestamp: 200 }),
      makeEvent({ id: 'e3', timestamp: 300 }),
    ];
    const t = createTimeline('e', 'T', events);
    expect(getLatestEvent(t)?.id).toBe('e3');
  });

  it('does not mutate timeline', () => {
    const t = makeTimeline(5);
    const len = t.events.length;
    getLatestEvent(t);
    expect(t.events).toHaveLength(len);
  });

  it('returns event with max timestamp when timestamps are unsorted', () => {
    const timestamps = [9000, 1000, 5000, 3000, 7000];
    const events = timestamps.map((ts, i) => makeEvent({ id: `e${i}`, timestamp: ts }));
    const t = createTimeline('e', 'T', events);
    expect(getLatestEvent(t)?.timestamp).toBe(9000);
  });

  // getLatestEvent from timelines of size 1..10 (10 tests)
  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`getLatestEvent from ${n}-event timeline returns event with max timestamp`, () => {
      const events = Array.from({ length: n }, (_, i) =>
        makeEvent({ id: `e${i}`, timestamp: (i + 1) * 1000 })
      );
      const t = createTimeline('e', 'T', events);
      expect(getLatestEvent(t)?.timestamp).toBe(n * 1000);
    });
  });

  // Verify returned event id from 14-event timelines (14 tests)
  ALL_CATEGORIES.forEach((cat, i) => {
    it(`getLatestEvent for '${cat}' category event at max timestamp`, () => {
      const events = ALL_CATEGORIES.map((c, j) =>
        makeEvent({ id: `e-${j}`, category: c, timestamp: (j + 1) * 100 })
      );
      const t = createTimeline('e', 'T', events);
      const latest = getLatestEvent(t);
      expect(latest?.timestamp).toBe(ALL_CATEGORIES.length * 100);
    });
  });
});

// ---------------------------------------------------------------------------
// 17. getEarliestEvent
// ---------------------------------------------------------------------------
describe('getEarliestEvent', () => {
  it('returns undefined for empty timeline', () => {
    expect(getEarliestEvent(createTimeline('e', 'T'))).toBeUndefined();
  });

  it('returns the only event in single-event timeline', () => {
    const e = makeEvent({ id: 'e1', timestamp: 5000 });
    const t = createTimeline('e', 'T', [e]);
    expect(getEarliestEvent(t)?.id).toBe('e1');
  });

  it('returns event with lowest timestamp', () => {
    const events = [
      makeEvent({ id: 'e1', timestamp: 2000 }),
      makeEvent({ id: 'e2', timestamp: 1000 }),
      makeEvent({ id: 'e3', timestamp: 3000 }),
    ];
    const t = createTimeline('e', 'T', events);
    expect(getEarliestEvent(t)?.id).toBe('e2');
  });

  it('handles already-sorted descending array', () => {
    const events = [
      makeEvent({ id: 'e3', timestamp: 300 }),
      makeEvent({ id: 'e2', timestamp: 200 }),
      makeEvent({ id: 'e1', timestamp: 100 }),
    ];
    const t = createTimeline('e', 'T', events);
    expect(getEarliestEvent(t)?.id).toBe('e1');
  });

  it('does not mutate timeline', () => {
    const t = makeTimeline(5);
    const len = t.events.length;
    getEarliestEvent(t);
    expect(t.events).toHaveLength(len);
  });

  it('returns event with timestamp 0', () => {
    const events = [
      makeEvent({ id: 'e1', timestamp: 0 }),
      makeEvent({ id: 'e2', timestamp: 1000 }),
    ];
    const t = createTimeline('e', 'T', events);
    expect(getEarliestEvent(t)?.timestamp).toBe(0);
  });

  // getEarliestEvent from timelines of size 1..10 (10 tests)
  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`getEarliestEvent from ${n}-event timeline returns event with min timestamp`, () => {
      const events = Array.from({ length: n }, (_, i) =>
        makeEvent({ id: `e${i}`, timestamp: (i + 1) * 1000 })
      );
      const t = createTimeline('e', 'T', events);
      expect(getEarliestEvent(t)?.timestamp).toBe(1000);
    });
  });

  // Verify getEarliestEvent with shuffled timestamps (10 tests)
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`getEarliestEvent shuffle seed ${i}: min timestamp is 1`, () => {
      const timestamps = Array.from({ length: 10 }, (_, j) => j + 1);
      // simple pseudo-shuffle: reverse some elements based on i
      const shuffled = [...timestamps.slice(i), ...timestamps.slice(0, i)];
      const events = shuffled.map((ts, j) => makeEvent({ id: `e${j}`, timestamp: ts }));
      const t = createTimeline('e', 'T', events);
      expect(getEarliestEvent(t)?.timestamp).toBe(1);
    });
  });
});

// ---------------------------------------------------------------------------
// 18. countEventsByActor
// ---------------------------------------------------------------------------
describe('countEventsByActor', () => {
  it('returns empty object for empty timeline', () => {
    expect(countEventsByActor(createTimeline('e', 'T'))).toEqual({});
  });

  it('counts single actor', () => {
    const t = createTimeline('e', 'T', [makeEvent({ id: 'e1', actor: 'alice' })]);
    expect(countEventsByActor(t)).toEqual({ alice: 1 });
  });

  it('counts multiple events for same actor', () => {
    const t = createTimeline('e', 'T', [
      makeEvent({ id: 'e1', actor: 'alice' }),
      makeEvent({ id: 'e2', actor: 'alice' }),
    ]);
    expect(countEventsByActor(t)['alice']).toBe(2);
  });

  it('counts multiple different actors', () => {
    const t = createTimeline('e', 'T', [
      makeEvent({ id: 'e1', actor: 'alice' }),
      makeEvent({ id: 'e2', actor: 'bob' }),
      makeEvent({ id: 'e3', actor: 'alice' }),
    ]);
    const counts = countEventsByActor(t);
    expect(counts['alice']).toBe(2);
    expect(counts['bob']).toBe(1);
  });

  it('does not mutate timeline', () => {
    const t = makeTimeline(5);
    const len = t.events.length;
    countEventsByActor(t);
    expect(t.events).toHaveLength(len);
  });

  it('returns object with correct number of keys', () => {
    const actors = ['alice', 'bob', 'carol'];
    const events = actors.map((a, i) => makeEvent({ id: `e${i}`, actor: a }));
    const t = createTimeline('e', 'T', events);
    expect(Object.keys(countEventsByActor(t))).toHaveLength(3);
  });

  it('actor keys are exact strings', () => {
    const t = createTimeline('e', 'T', [makeEvent({ id: 'e1', actor: 'user@example.com' })]);
    const counts = countEventsByActor(t);
    expect(counts['user@example.com']).toBe(1);
  });

  // Counts for 1..10 events by same actor (10 tests)
  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`countEventsByActor: ${n} events by 'alice'`, () => {
      const events = Array.from({ length: n }, (_, i) =>
        makeEvent({ id: `e${i}`, actor: 'alice' })
      );
      const t = createTimeline('e', 'T', events);
      expect(countEventsByActor(t)['alice']).toBe(n);
    });
  });

  // Each actor from the list (10 tests)
  ['alice', 'bob', 'carol', 'dave', 'eve', 'frank', 'grace', 'heidi', 'ivan', 'judy'].forEach((actor) => {
    it(`countEventsByActor correctly counts actor '${actor}'`, () => {
      const events = ['alice', 'bob', 'carol', 'dave', 'eve', 'frank', 'grace', 'heidi', 'ivan', 'judy'].map(
        (a, i) => makeEvent({ id: `e${i}`, actor: a })
      );
      const t = createTimeline('e', 'T', events);
      expect(countEventsByActor(t)[actor]).toBe(1);
    });
  });

  // Count total from result object
  it('sum of all actor counts equals total events', () => {
    const events = [
      makeEvent({ id: 'e1', actor: 'alice' }),
      makeEvent({ id: 'e2', actor: 'bob' }),
      makeEvent({ id: 'e3', actor: 'alice' }),
      makeEvent({ id: 'e4', actor: 'carol' }),
      makeEvent({ id: 'e5', actor: 'bob' }),
    ];
    const t = createTimeline('e', 'T', events);
    const counts = countEventsByActor(t);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(total).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// 19. Edge / integration scenarios
// ---------------------------------------------------------------------------
describe('Integration and edge cases', () => {
  it('create → add → filter → stats pipeline', () => {
    let t = createTimeline('ent', 'Incident');
    t = addEvent(t, makeEvent({ id: 'e1', category: 'create', severity: 'info', actor: 'alice', timestamp: 1000 }));
    t = addEvent(t, makeEvent({ id: 'e2', category: 'update', severity: 'warning', actor: 'bob', timestamp: 2000 }));
    t = addEvent(t, makeEvent({ id: 'e3', category: 'approve', severity: 'info', actor: 'alice', timestamp: 3000 }));

    const filtered = filterEvents(t.events, { actors: ['alice'] });
    expect(filtered).toHaveLength(2);

    const stats = getStats(t);
    expect(stats.totalEvents).toBe(3);
    expect(stats.uniqueActors).toBe(2);
    expect(stats.eventsByCategory['create']).toBe(1);
    expect(stats.eventsBySeverity['info']).toBe(2);
  });

  it('addEvent + sortByTimestamp produces chronological order', () => {
    let t = createTimeline('ent', 'Type');
    t = addEvent(t, makeEvent({ id: 'e3', timestamp: 3000 }));
    t = addEvent(t, makeEvent({ id: 'e1', timestamp: 1000 }));
    t = addEvent(t, makeEvent({ id: 'e2', timestamp: 2000 }));
    const sorted = sortByTimestamp(t.events);
    expect(sorted.map(e => e.id)).toEqual(['e1', 'e2', 'e3']);
  });

  it('merge + paginate: two timelines merged and paginated correctly', () => {
    const a = createTimeline('ent', 'Type',
      Array.from({ length: 10 }, (_, i) => makeEvent({ id: `a${i}`, timestamp: i * 100 }))
    );
    const b = createTimeline('ent', 'Type',
      Array.from({ length: 10 }, (_, i) => makeEvent({ id: `b${i}`, timestamp: (10 + i) * 100 }))
    );
    const merged = mergeTimelines(a, b);
    const page0 = paginateEvents(merged.events, 0, 10);
    const page1 = paginateEvents(merged.events, 1, 10);
    expect(page0).toHaveLength(10);
    expect(page1).toHaveLength(10);
    expect(page0[0].id).toBe('a0');
    expect(page1[0].id).toBe('b0');
  });

  it('removeEvent then addEvent preserves consistency', () => {
    let t = makeTimeline(5);
    t = removeEvent(t, 'evt-2');
    const newEvent = makeEvent({ id: 'new-evt', timestamp: 999_999 });
    t = addEvent(t, newEvent);
    expect(t.events).toHaveLength(5);
    expect(getEventById(t, 'new-evt')).toBeDefined();
    expect(getEventById(t, 'evt-2')).toBeUndefined();
  });

  it('filterEvents with all criteria combined returns correct subset', () => {
    const events: TimelineEvent[] = [
      makeEvent({ id: 'e1', timestamp: 1000, category: 'create', severity: 'info', actor: 'alice', tags: ['a'] }),
      makeEvent({ id: 'e2', timestamp: 2000, category: 'update', severity: 'warning', actor: 'bob', tags: ['b'] }),
      makeEvent({ id: 'e3', timestamp: 3000, category: 'create', severity: 'info', actor: 'alice', tags: ['a'] }),
      makeEvent({ id: 'e4', timestamp: 4000, category: 'delete', severity: 'error', actor: 'carol', tags: ['a'] }),
    ];
    const filter: TimelineFilter = {
      fromTimestamp: 1000,
      toTimestamp: 3000,
      categories: ['create'],
      severities: ['info'],
      actors: ['alice'],
      tags: ['a'],
    };
    const result = filterEvents(events, filter);
    expect(result).toHaveLength(2);
    expect(result.every(e => e.actor === 'alice')).toBe(true);
  });

  it('countEventsByActor after merge reflects total counts', () => {
    const a = createTimeline('ent', 'Type', [
      makeEvent({ id: 'e1', actor: 'alice', timestamp: 1000 }),
    ]);
    const b = createTimeline('ent', 'Type', [
      makeEvent({ id: 'e2', actor: 'alice', timestamp: 2000 }),
      makeEvent({ id: 'e3', actor: 'bob', timestamp: 3000 }),
    ]);
    const merged = mergeTimelines(a, b);
    const counts = countEventsByActor(merged);
    expect(counts['alice']).toBe(2);
    expect(counts['bob']).toBe(1);
  });

  it('getLatestEvent and getEarliestEvent agree on first == last for single event', () => {
    const t = createTimeline('e', 'T', [makeEvent({ id: 'e1', timestamp: 42000 })]);
    expect(getLatestEvent(t)?.id).toBe(getEarliestEvent(t)?.id);
  });

  it('isValidCategory and isValidSeverity correctly validated in createEvent workflow', () => {
    const cat = 'approve';
    const sev = 'critical';
    expect(isValidCategory(cat)).toBe(true);
    expect(isValidSeverity(sev)).toBe(true);
    const e = createEvent('id', 'ent', 'T', cat, sev, 'actor', 'desc', 100);
    expect(e.category).toBe(cat);
    expect(e.severity).toBe(sev);
  });

  it('full lifecycle: create → update → approve sequence', () => {
    let t = createTimeline('incident-1', 'Incident');
    t = addEvent(t, createEvent('ev-1', 'incident-1', 'Incident', 'create', 'info', 'alice', 'Created', 1000));
    t = addEvent(t, createEvent('ev-2', 'incident-1', 'Incident', 'update', 'info', 'bob', 'Updated', 2000));
    t = addEvent(t, createEvent('ev-3', 'incident-1', 'Incident', 'approve', 'info', 'carol', 'Approved', 3000));

    expect(t.events).toHaveLength(3);
    expect(getEarliestEvent(t)?.category).toBe('create');
    expect(getLatestEvent(t)?.category).toBe('approve');

    const stats = getStats(t);
    expect(stats.totalEvents).toBe(3);
    expect(stats.uniqueActors).toBe(3);
  });

  // Stress: build 100-event timeline and verify stats (5 tests × 20 = 100 it blocks below; we do 5 here)
  it('stress: 100-event timeline total count', () => {
    const t = makeTimeline(100);
    expect(getStats(t).totalEvents).toBe(100);
  });

  it('stress: 100-event timeline firstEventAt', () => {
    const t = makeTimeline(100, 1000);
    expect(getStats(t).firstEventAt).toBe(1000);
  });

  it('stress: 100-event timeline lastEventAt', () => {
    const t = makeTimeline(100, 1000);
    expect(getStats(t).lastEventAt).toBe(1000 + 99 * 1000);
  });

  it('stress: 100-event timeline paginate 10 pages of 10', () => {
    const t = makeTimeline(100);
    for (let p = 0; p < 10; p++) {
      expect(paginateEvents(t.events, p, 10)).toHaveLength(10);
    }
  });

  it('stress: merging two 50-event timelines yields 100 events', () => {
    const a = createTimeline('e', 'T',
      Array.from({ length: 50 }, (_, i) => makeEvent({ id: `a${i}`, timestamp: i }))
    );
    const b = createTimeline('e', 'T',
      Array.from({ length: 50 }, (_, i) => makeEvent({ id: `b${i}`, timestamp: 50 + i }))
    );
    expect(mergeTimelines(a, b).events).toHaveLength(100);
  });
});

// ---------------------------------------------------------------------------
// 20. Immutability and purity guarantees
// ---------------------------------------------------------------------------
describe('Immutability and purity', () => {
  it('addEvent does not share events array with original', () => {
    const t = createTimeline('e', 'T');
    const e = makeEvent({ id: 'e1' });
    const t2 = addEvent(t, e);
    (t2.events as TimelineEvent[]).push(makeEvent({ id: 'extra' }));
    expect(t.events).toHaveLength(0);
  });

  it('removeEvent does not share events array', () => {
    const e = makeEvent({ id: 'e1' });
    const t = createTimeline('e', 'T', [e, makeEvent({ id: 'e2' })]);
    const t2 = removeEvent(t, 'e1');
    expect(t.events).toHaveLength(2);
    expect(t2.events).toHaveLength(1);
  });

  it('sortByTimestamp result is independent of original', () => {
    const events = [makeEvent({ id: 'e2', timestamp: 2 }), makeEvent({ id: 'e1', timestamp: 1 })];
    const sorted = sortByTimestamp(events);
    sorted.push(makeEvent({ id: 'extra', timestamp: 99 }));
    expect(events).toHaveLength(2);
  });

  it('filterEvents result is independent of original', () => {
    const events = [makeEvent({ id: 'e1', category: 'create' })];
    const filtered = filterEvents(events, { categories: ['create'] });
    filtered.push(makeEvent({ id: 'extra', category: 'create' }));
    expect(events).toHaveLength(1);
  });

  it('mergeTimelines result events array is new', () => {
    const a = createTimeline('e', 'T', [makeEvent({ id: 'e1', timestamp: 1 })]);
    const b = createTimeline('e', 'T', [makeEvent({ id: 'e2', timestamp: 2 })]);
    const merged = mergeTimelines(a, b);
    expect(merged.events).not.toBe(a.events);
    expect(merged.events).not.toBe(b.events);
  });

  it('paginateEvents returns a slice, not the original array', () => {
    const events = [makeEvent({ id: 'e1' }), makeEvent({ id: 'e2' })];
    const page = paginateEvents(events, 0, 2);
    expect(page).not.toBe(events);
  });

  it('getStats does not mutate timeline', () => {
    const t = makeTimeline(10);
    const len = t.events.length;
    getStats(t);
    expect(t.events).toHaveLength(len);
  });

  it('countEventsByActor returns new object on each call', () => {
    const t = makeTimeline(3);
    const c1 = countEventsByActor(t);
    const c2 = countEventsByActor(t);
    expect(c1).not.toBe(c2);
  });

  it('getEventsByActor returns new array on each call', () => {
    const t = createTimeline('e', 'T', [makeEvent({ id: 'e1', actor: 'alice' })]);
    const r1 = getEventsByActor(t, 'alice');
    const r2 = getEventsByActor(t, 'alice');
    expect(r1).not.toBe(r2);
  });

  it('getEventsByCategory returns new array on each call', () => {
    const t = createTimeline('e', 'T', [makeEvent({ id: 'e1', category: 'create' })]);
    const r1 = getEventsByCategory(t, 'create');
    const r2 = getEventsByCategory(t, 'create');
    expect(r1).not.toBe(r2);
  });

  it('getEventsBySeverity returns new array on each call', () => {
    const t = createTimeline('e', 'T', [makeEvent({ id: 'e1', severity: 'info' })]);
    const r1 = getEventsBySeverity(t, 'info');
    const r2 = getEventsBySeverity(t, 'info');
    expect(r1).not.toBe(r2);
  });
});

// ---------------------------------------------------------------------------
// 21. Type narrowing via isValidCategory / isValidSeverity
// ---------------------------------------------------------------------------
describe('Type guard correctness', () => {
  it('isValidCategory narrows type: safe to cast when true', () => {
    const raw = 'create';
    if (isValidCategory(raw)) {
      const cat: EventCategory = raw;
      expect(cat).toBe('create');
    }
  });

  it('isValidSeverity narrows type: safe to cast when true', () => {
    const raw = 'error';
    if (isValidSeverity(raw)) {
      const sev: EventSeverity = raw;
      expect(sev).toBe('error');
    }
  });

  // Loop over all categories and use them safely after guard check (14 tests)
  ALL_CATEGORIES.forEach((cat) => {
    it(`type guard allows using '${cat}' as EventCategory`, () => {
      const raw: string = cat;
      if (isValidCategory(raw)) {
        const typedCat: EventCategory = raw;
        expect(typedCat).toBe(cat);
      } else {
        throw new Error(`Expected '${cat}' to be valid`);
      }
    });
  });

  // Loop over all severities and use them safely after guard check (4 tests)
  ALL_SEVERITIES.forEach((sev) => {
    it(`type guard allows using '${sev}' as EventSeverity`, () => {
      const raw: string = sev;
      if (isValidSeverity(raw)) {
        const typedSev: EventSeverity = raw;
        expect(typedSev).toBe(sev);
      } else {
        throw new Error(`Expected '${sev}' to be valid`);
      }
    });
  });
});

// ---------------------------------------------------------------------------
// 22. Metadata and tags edge cases
// ---------------------------------------------------------------------------
describe('Metadata and tags', () => {
  it('event can have multiple tags', () => {
    const e = makeEvent({ id: 'e1', tags: ['a', 'b', 'c'] });
    expect(e.tags).toEqual(['a', 'b', 'c']);
  });

  it('filterEvents matches when any tag in filter list is present', () => {
    const events: TimelineEvent[] = [
      makeEvent({ id: 'e1', tags: ['x'] }),
      makeEvent({ id: 'e2', tags: ['y'] }),
      makeEvent({ id: 'e3', tags: ['x', 'y'] }),
    ];
    const result = filterEvents(events, { tags: ['x'] });
    expect(result.map(e => e.id).sort()).toEqual(['e1', 'e3'].sort());
  });

  it('filterEvents with tags: empty tags array excludes all tagless events', () => {
    const events: TimelineEvent[] = [
      makeEvent({ id: 'e1' }),
      makeEvent({ id: 'e2', tags: ['x'] }),
    ];
    // tags: [] — any tag match with empty set = no match (filter.tags.some returns false always)
    // and events without tags are also excluded
    const result = filterEvents(events, { tags: [] });
    // e1 has no tags → excluded; e2 has tags but no tag matches [] → excluded
    expect(result).toHaveLength(0);
  });

  it('metadata with array values is stored correctly', () => {
    const meta = { items: [1, 2, 3] };
    const e = createEvent('id', 'ent', 'T', 'create', 'info', 'a', 'd', 1, meta);
    expect((e.metadata!['items'] as number[])[0]).toBe(1);
  });

  it('metadata with boolean values is stored correctly', () => {
    const meta = { flag: true };
    const e = createEvent('id', 'ent', 'T', 'create', 'info', 'a', 'd', 1, meta);
    expect(e.metadata!['flag']).toBe(true);
  });

  it('metadata with null value is stored correctly', () => {
    const meta: Record<string, unknown> = { val: null };
    const e = createEvent('id', 'ent', 'T', 'create', 'info', 'a', 'd', 1, meta);
    expect(e.metadata!['val']).toBeNull();
  });

  // 10 different tag combinations (10 tests)
  Array.from({ length: 10 }, (_, i) => `tag-${i}`).forEach((tag) => {
    it(`filterEvents returns correct events for tag '${tag}'`, () => {
      const events: TimelineEvent[] = [
        makeEvent({ id: `match-${tag}`, tags: [tag, 'extra'] }),
        makeEvent({ id: 'no-match', tags: ['other-tag'] }),
      ];
      const result = filterEvents(events, { tags: [tag] });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(`match-${tag}`);
    });
  });
});

// ---------------------------------------------------------------------------
// 23. Additional createTimeline and Timeline structure tests
// ---------------------------------------------------------------------------
describe('Timeline structure', () => {
  it('timeline has entityId property', () => {
    const t = createTimeline('my-id', 'Type');
    expect('entityId' in t).toBe(true);
  });

  it('timeline has entityType property', () => {
    const t = createTimeline('my-id', 'Type');
    expect('entityType' in t).toBe(true);
  });

  it('timeline has events property', () => {
    const t = createTimeline('my-id', 'Type');
    expect('events' in t).toBe(true);
  });

  it('events property is an array', () => {
    const t = createTimeline('my-id', 'Type');
    expect(Array.isArray(t.events)).toBe(true);
  });

  it('createTimeline with 5 events has length 5', () => {
    const events = Array.from({ length: 5 }, (_, i) => makeEvent({ id: `e${i}` }));
    const t = createTimeline('my-id', 'Type', events);
    expect(t.events).toHaveLength(5);
  });

  // Test all entity types used in IMS (10 tests)
  ['Incident', 'Risk', 'Audit', 'Document', 'Asset', 'Complaint', 'Contract', 'Employee', 'Supplier', 'Chemical'].forEach((entityType) => {
    it(`timeline with entityType '${entityType}' has correct entityType`, () => {
      const t = createTimeline('ent', entityType);
      expect(t.entityType).toBe(entityType);
    });
  });

  // Verify events contents are preserved in order
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`createTimeline events[${i}] is preserved from input`, () => {
      const events = Array.from({ length: 10 }, (_, j) => makeEvent({ id: `ev-${j}` }));
      const t = createTimeline('ent', 'Type', events);
      expect(t.events[i].id).toBe(`ev-${i}`);
    });
  });
});

// ---------------------------------------------------------------------------
// 24. Bulk loop: getStats on timelines with exactly one event per category
// ---------------------------------------------------------------------------
describe('getStats category-per-event bulk', () => {
  ALL_CATEGORIES.forEach((cat, idx) => {
    it(`getStats single '${cat}' event: category count is 1, all others 0, total 1`, () => {
      const t = createTimeline('e', 'T', [makeEvent({ id: `e-${idx}`, category: cat })]);
      const stats = getStats(t);
      expect(stats.totalEvents).toBe(1);
      expect(stats.eventsByCategory[cat]).toBe(1);
      for (const other of ALL_CATEGORIES.filter(c => c !== cat)) {
        expect(stats.eventsByCategory[other]).toBe(0);
      }
    });
  });

  ALL_SEVERITIES.forEach((sev, idx) => {
    it(`getStats single '${sev}' event: severity count is 1, all others 0`, () => {
      const t = createTimeline('e', 'T', [makeEvent({ id: `s-${idx}`, severity: sev })]);
      const stats = getStats(t);
      expect(stats.eventsBySeverity[sev]).toBe(1);
      for (const other of ALL_SEVERITIES.filter(s => s !== sev)) {
        expect(stats.eventsBySeverity[other]).toBe(0);
      }
    });
  });
});

// ---------------------------------------------------------------------------
// 25. Paginate edge cases
// ---------------------------------------------------------------------------
describe('paginateEvents additional edge cases', () => {
  it('page=0 size=0 returns empty', () => {
    const events = [makeEvent({ id: 'e1' })];
    expect(paginateEvents(events, 0, 0)).toHaveLength(0);
  });

  it('page=1 size=0 returns empty', () => {
    const events = [makeEvent({ id: 'e1' })];
    expect(paginateEvents(events, 1, 0)).toHaveLength(0);
  });

  // Verify each element of page 0 of size 10 from 30-event array
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`paginateEvents page=0 size=10: element[${i}] has correct id`, () => {
      const events = Array.from({ length: 30 }, (_, j) => makeEvent({ id: `e${j}` }));
      const page = paginateEvents(events, 0, 10);
      expect(page[i].id).toBe(`e${i}`);
    });
  });

  // Verify each element of page 1 of size 10
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`paginateEvents page=1 size=10: element[${i}] has correct id`, () => {
      const events = Array.from({ length: 30 }, (_, j) => makeEvent({ id: `e${j}` }));
      const page = paginateEvents(events, 1, 10);
      expect(page[i].id).toBe(`e${10 + i}`);
    });
  });

  // Verify each element of page 2 of size 10
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`paginateEvents page=2 size=10: element[${i}] has correct id`, () => {
      const events = Array.from({ length: 30 }, (_, j) => makeEvent({ id: `e${j}` }));
      const page = paginateEvents(events, 2, 10);
      expect(page[i].id).toBe(`e${20 + i}`);
    });
  });
});

// ---------------------------------------------------------------------------
// 26. sortByTimestamp — additional ascending ordering checks (25 tests)
// ---------------------------------------------------------------------------
describe('sortByTimestamp additional ordering checks', () => {
  // For each position in a 25-event sorted array, verify the expected id
  Array.from({ length: 25 }, (_, i) => i).forEach((i) => {
    it(`sortByTimestamp asc: position ${i} has id 'p${i}'`, () => {
      const shuffled = Array.from({ length: 25 }, (_, j) => makeEvent({ id: `p${j}`, timestamp: (j + 1) * 10 }));
      // reverse to ensure sorting is actually needed
      const reversed = [...shuffled].reverse();
      const sorted = sortByTimestamp(reversed, 'asc');
      expect(sorted[i].id).toBe(`p${i}`);
    });
  });
});

// ---------------------------------------------------------------------------
// 27. sortByTimestamp — additional descending ordering checks (25 tests)
// ---------------------------------------------------------------------------
describe('sortByTimestamp additional descending checks', () => {
  Array.from({ length: 25 }, (_, i) => i).forEach((i) => {
    it(`sortByTimestamp desc: position ${i} has id 'p${24 - i}'`, () => {
      const events = Array.from({ length: 25 }, (_, j) => makeEvent({ id: `p${j}`, timestamp: (j + 1) * 10 }));
      const sorted = sortByTimestamp(events, 'desc');
      expect(sorted[i].id).toBe(`p${24 - i}`);
    });
  });
});

// ---------------------------------------------------------------------------
// 28. getEventsByCategory — additional single-event coverage (14 tests)
// ---------------------------------------------------------------------------
describe('getEventsByCategory single-hit checks', () => {
  ALL_CATEGORIES.forEach((cat) => {
    it(`getEventsByCategory('${cat}') finds the single matching event`, () => {
      const events = ALL_CATEGORIES.map((c, i) => makeEvent({ id: `ec-${i}`, category: c }));
      const t = createTimeline('ent', 'Type', events);
      const result = getEventsByCategory(t, cat);
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe(cat);
    });
  });
});

// ---------------------------------------------------------------------------
// 29. getEventsBySeverity — additional single-event coverage (4 tests × 10 = 40)
// ---------------------------------------------------------------------------
describe('getEventsBySeverity single-hit bulk', () => {
  Array.from({ length: 10 }, (_, run) => run).forEach((run) => {
    ALL_SEVERITIES.forEach((sev) => {
      it(`run ${run}: getEventsBySeverity('${sev}') in mixed timeline`, () => {
        const events = ALL_SEVERITIES.map((s, i) => makeEvent({ id: `sv-${run}-${i}`, severity: s }));
        const t = createTimeline('ent', 'Type', events);
        const result = getEventsBySeverity(t, sev);
        expect(result).toHaveLength(1);
        expect(result[0].severity).toBe(sev);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// 30. removeEvent — bulk verification across 20-event timeline (20 tests)
// ---------------------------------------------------------------------------
describe('removeEvent bulk', () => {
  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`removeEvent on index ${i} of 20-event timeline leaves 19 events`, () => {
      const events = Array.from({ length: 20 }, (_, j) => makeEvent({ id: `bulk-${j}` }));
      const t = createTimeline('ent', 'Type', events);
      const t2 = removeEvent(t, `bulk-${i}`);
      expect(t2.events).toHaveLength(19);
    });
  });
});

// ---------------------------------------------------------------------------
// 31. getEventById — not-found scenarios (20 tests)
// ---------------------------------------------------------------------------
describe('getEventById not-found bulk', () => {
  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`getEventById returns undefined for 'ghost-${i}' in populated timeline`, () => {
      const t = makeTimeline(10);
      expect(getEventById(t, `ghost-${i}`)).toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------
// 32. filterEvents — by actor with exactly N actors (10 tests)
// ---------------------------------------------------------------------------
describe('filterEvents actor isolation', () => {
  const actorList = ['alice', 'bob', 'carol', 'dave', 'eve', 'frank', 'grace', 'heidi', 'ivan', 'judy'];
  actorList.forEach((actor) => {
    it(`filterEvents isolates actor '${actor}' in 10-actor timeline`, () => {
      const events = actorList.map((a, i) => makeEvent({ id: `act-${i}`, actor: a }));
      const result = filterEvents(events, { actors: [actor] });
      expect(result).toHaveLength(1);
      expect(result[0].actor).toBe(actor);
    });
  });
});

// ---------------------------------------------------------------------------
// 33. countEventsByActor — varying counts (10 tests)
// ---------------------------------------------------------------------------
describe('countEventsByActor varying counts', () => {
  Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
    it(`countEventsByActor: actor 'x' appears exactly ${n} times out of ${n + 5} events`, () => {
      const xEvents = Array.from({ length: n }, (_, i) => makeEvent({ id: `x${i}`, actor: 'x' }));
      const otherEvents = Array.from({ length: 5 }, (_, i) => makeEvent({ id: `o${i}`, actor: `other-${i}` }));
      const t = createTimeline('e', 'T', [...xEvents, ...otherEvents]);
      expect(countEventsByActor(t)['x']).toBe(n);
    });
  });
});

// ---------------------------------------------------------------------------
// 34. getStats — totalEvents for sizes 1–30 (30 tests)
// ---------------------------------------------------------------------------
describe('getStats totalEvents bulk', () => {
  Array.from({ length: 30 }, (_, i) => i + 1).forEach((n) => {
    it(`getStats totalEvents for ${n}-event timeline equals ${n}`, () => {
      expect(getStats(makeTimeline(n)).totalEvents).toBe(n);
    });
  });
});

// ---------------------------------------------------------------------------
// 35. mergeTimelines — deduplication at every position (14 tests)
// ---------------------------------------------------------------------------
describe('mergeTimelines deduplication at each position', () => {
  Array.from({ length: 14 }, (_, i) => i).forEach((i) => {
    it(`mergeTimelines deduplicates the event at original position ${i}`, () => {
      const events = ALL_CATEGORIES.map((cat, j) =>
        makeEvent({ id: `dd-${j}`, category: cat, timestamp: (j + 1) * 100 })
      );
      const a = createTimeline('ent', 'Type', events);
      // b contains only one duplicate (event at position i)
      const b = createTimeline('ent', 'Type', [events[i]]);
      const merged = mergeTimelines(a, b);
      // Total should still be 14 (no duplicates added)
      expect(merged.events).toHaveLength(14);
    });
  });
});

// ---------------------------------------------------------------------------
// 36. paginateEvents — pageSize=3 across 30 events (10 tests)
// ---------------------------------------------------------------------------
describe('paginateEvents pageSize=3', () => {
  const events30 = Array.from({ length: 30 }, (_, i) => makeEvent({ id: `p3-${i}` }));
  Array.from({ length: 10 }, (_, p) => p).forEach((p) => {
    it(`paginateEvents page=${p} size=3 from 30-event array has 3 items`, () => {
      const page = paginateEvents(events30, p, 3);
      expect(page).toHaveLength(3);
    });
  });
});

// ---------------------------------------------------------------------------
// 37. isValidCategory — additional repeated boundary checks (14 tests)
// ---------------------------------------------------------------------------
describe('isValidCategory boundary checks', () => {
  ALL_CATEGORIES.forEach((cat) => {
    it(`isValidCategory returns true for '${cat}' called via loop`, () => {
      const input: string = cat; // widen type to string first
      expect(isValidCategory(input)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// 38. isValidSeverity — additional repeated boundary checks (4 tests × 3 = 12)
// ---------------------------------------------------------------------------
describe('isValidSeverity boundary checks', () => {
  [1, 2, 3].forEach((run) => {
    ALL_SEVERITIES.forEach((sev) => {
      it(`run ${run}: isValidSeverity('${sev}') is true`, () => {
        expect(isValidSeverity(sev)).toBe(true);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// 39. createEvent — entityType variety (14 tests)
// ---------------------------------------------------------------------------
describe('createEvent entityType variety', () => {
  ALL_CATEGORIES.forEach((cat, i) => {
    it(`createEvent with entityType 'Entity-${i}' stores it correctly`, () => {
      const e = createEvent(`id-${i}`, 'ent', `Entity-${i}`, cat, 'info', 'a', 'd', 1);
      expect(e.entityType).toBe(`Entity-${i}`);
    });
  });
});

// ---------------------------------------------------------------------------
// 40. addEvent + removeEvent round-trip (14 tests)
// ---------------------------------------------------------------------------
describe('addEvent + removeEvent round-trip', () => {
  ALL_CATEGORIES.forEach((cat) => {
    it(`addEvent then removeEvent for category '${cat}' restores original length`, () => {
      const initial = makeTimeline(3);
      const initialLen = initial.events.length;
      const newEvent = makeEvent({ id: `rt-${cat}`, category: cat });
      const after = addEvent(initial, newEvent);
      const restored = removeEvent(after, `rt-${cat}`);
      expect(restored.events).toHaveLength(initialLen);
    });
  });
});

// ---------------------------------------------------------------------------
// 41. getLatestEvent vs getEarliestEvent agreement (20 tests)
// ---------------------------------------------------------------------------
describe('getLatestEvent and getEarliestEvent agreement', () => {
  Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
    it(`for ${n}-event timeline, latestEvent.timestamp >= earliestEvent.timestamp`, () => {
      const t = makeTimeline(n);
      const latest = getLatestEvent(t);
      const earliest = getEarliestEvent(t);
      if (latest && earliest) {
        expect(latest.timestamp).toBeGreaterThanOrEqual(earliest.timestamp);
      }
    });
  });
});

// ---------------------------------------------------------------------------
// 42. filterEvents — timestamp boundary at each of 20 events (20 tests)
// ---------------------------------------------------------------------------
describe('filterEvents timestamp boundary per event', () => {
  const boundaryEvents = Array.from({ length: 20 }, (_, i) =>
    makeEvent({ id: `b-${i}`, timestamp: (i + 1) * 1000 })
  );

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`filterEvents fromTimestamp=${(i + 1) * 1000} returns ${20 - i} events`, () => {
      const result = filterEvents(boundaryEvents, { fromTimestamp: (i + 1) * 1000 });
      expect(result).toHaveLength(20 - i);
    });
  });
});

// ---------------------------------------------------------------------------
// 43. getStats uniqueActors count (20 tests)
// ---------------------------------------------------------------------------
describe('getStats uniqueActors for N actors', () => {
  Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
    it(`getStats.uniqueActors === ${n} for ${n} distinct actors`, () => {
      const events = Array.from({ length: n }, (_, i) =>
        makeEvent({ id: `ua-${i}`, actor: `actor-unique-${i}` })
      );
      const t = createTimeline('e', 'T', events);
      expect(getStats(t).uniqueActors).toBe(n);
    });
  });
});
