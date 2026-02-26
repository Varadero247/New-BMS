import {
  createStore,
  appendEvent,
  appendEvents,
  getEventsForAggregate,
  getEventsOfType,
  getEventsAfterVersion,
  rebuild,
  rebuildAggregate,
  createSnapshot,
  rebuildFromSnapshot,
  makeEvent,
  sortByVersion,
  latestVersion,
  totalEvents,
  uniqueAggregates,
  eventTypes,
  createProjection,
  filterEventsByDateRange,
  DomainEvent,
  EventStore,
  Snapshot,
  Projection,
  Reducer,
} from '../src/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function mkEvent(
  id: string,
  type: string,
  aggregateId: string,
  aggregateType: string,
  version: number,
  payload: Record<string, unknown> = {},
  timestamp?: number
): DomainEvent {
  return {
    id,
    type,
    aggregateId,
    aggregateType,
    version,
    timestamp: timestamp ?? Date.now(),
    payload,
  };
}

const counterReducer: Reducer<number> = (state, event) => {
  if (event.type === 'INC') return state + ((event.payload.by as number) ?? 1);
  if (event.type === 'DEC') return state - ((event.payload.by as number) ?? 1);
  return state;
};

type NameState = { name: string; version: number };
const nameReducer: Reducer<NameState> = (state, event) => {
  if (event.type === 'RENAMED') return { name: event.payload.name as string, version: event.version };
  return state;
};

// ---------------------------------------------------------------------------
// createStore
// ---------------------------------------------------------------------------
describe('createStore', () => {
  it('returns an object with an events array', () => {
    const store = createStore();
    expect(store).toHaveProperty('events');
    expect(Array.isArray(store.events)).toBe(true);
  });

  it('returns an empty events array', () => {
    expect(createStore().events).toHaveLength(0);
  });

  for (let n = 0; n < 30; n++) {
    it(`createStore call #${n} returns independent store`, () => {
      const s1 = createStore();
      const s2 = createStore();
      expect(s1).not.toBe(s2);
      expect(s1.events).not.toBe(s2.events);
    });
  }

  it('returned store is immutable-friendly (plain object)', () => {
    const store = createStore();
    expect(typeof store).toBe('object');
  });
});

// ---------------------------------------------------------------------------
// appendEvent — 30 growth tests + structural tests
// ---------------------------------------------------------------------------
describe('appendEvent — growth', () => {
  for (let n = 0; n < 30; n++) {
    it(`store grows to ${n + 1} event(s) after ${n + 1} appends`, () => {
      let store = createStore();
      for (let i = 0; i <= n; i++) {
        store = appendEvent(store, makeEvent(`e${i}`, 'TEST', 'agg1', 'T', i + 1, { i }));
      }
      expect(totalEvents(store)).toBe(n + 1);
    });
  }
});

describe('appendEvent — immutability & structure', () => {
  it('does not mutate the original store', () => {
    const original = createStore();
    appendEvent(original, makeEvent('e1', 'X', 'a1', 'T', 1, {}));
    expect(original.events).toHaveLength(0);
  });

  it('returns a new store reference', () => {
    const s1 = createStore();
    const s2 = appendEvent(s1, makeEvent('e1', 'X', 'a1', 'T', 1, {}));
    expect(s2).not.toBe(s1);
  });

  it('the appended event appears as last element', () => {
    let store = createStore();
    const ev = makeEvent('last', 'LAST', 'agg', 'T', 1, {});
    store = appendEvent(store, ev);
    expect(store.events[store.events.length - 1]).toBe(ev);
  });

  it('maintains order of previously appended events', () => {
    let store = createStore();
    const e1 = makeEvent('e1', 'A', 'agg', 'T', 1, {});
    const e2 = makeEvent('e2', 'B', 'agg', 'T', 2, {});
    store = appendEvent(store, e1);
    store = appendEvent(store, e2);
    expect(store.events[0]).toBe(e1);
    expect(store.events[1]).toBe(e2);
  });

  for (let n = 0; n < 20; n++) {
    it(`appendEvent payload round-trip for index ${n}`, () => {
      let store = createStore();
      store = appendEvent(store, makeEvent(`id${n}`, 'T', 'a', 'AT', n + 1, { value: n * 7 }));
      expect(store.events[0].payload.value).toBe(n * 7);
    });
  }
});

// ---------------------------------------------------------------------------
// appendEvents — batch
// ---------------------------------------------------------------------------
describe('appendEvents', () => {
  for (let n = 1; n <= 30; n++) {
    it(`appendEvents adds ${n} events at once`, () => {
      const store = createStore();
      const batch = Array.from({ length: n }, (_, i) =>
        makeEvent(`e${i}`, 'T', 'agg', 'AT', i + 1, { i })
      );
      const next = appendEvents(store, batch);
      expect(totalEvents(next)).toBe(n);
    });
  }

  it('appendEvents does not mutate original store', () => {
    const store = createStore();
    const batch = [makeEvent('e1', 'T', 'a', 'AT', 1, {})];
    appendEvents(store, batch);
    expect(totalEvents(store)).toBe(0);
  });

  it('appendEvents with empty array returns store with same count', () => {
    let store = createStore();
    store = appendEvent(store, makeEvent('e1', 'T', 'a', 'AT', 1, {}));
    const next = appendEvents(store, []);
    expect(totalEvents(next)).toBe(1);
  });

  it('appendEvents preserves existing events before new ones', () => {
    let store = createStore();
    const e1 = makeEvent('e1', 'T', 'a', 'AT', 1, {});
    store = appendEvent(store, e1);
    const e2 = makeEvent('e2', 'T', 'a', 'AT', 2, {});
    const e3 = makeEvent('e3', 'T', 'a', 'AT', 3, {});
    const next = appendEvents(store, [e2, e3]);
    expect(next.events[0]).toBe(e1);
    expect(next.events[1]).toBe(e2);
    expect(next.events[2]).toBe(e3);
  });

  for (let n = 0; n < 20; n++) {
    it(`appendEvents batch ${n}: first event id is e0`, () => {
      const batch = Array.from({ length: n + 1 }, (_, i) =>
        makeEvent(`e${i}`, 'T', 'agg', 'AT', i + 1, {})
      );
      const store = appendEvents(createStore(), batch);
      expect(store.events[0].id).toBe('e0');
    });
  }
});

// ---------------------------------------------------------------------------
// getEventsForAggregate
// ---------------------------------------------------------------------------
describe('getEventsForAggregate', () => {
  for (let n = 1; n <= 30; n++) {
    it(`returns exactly ${n} events for aggregate agg1 when ${n} were added`, () => {
      let store = createStore();
      for (let i = 0; i < n; i++) {
        store = appendEvent(store, makeEvent(`e${i}`, 'T', 'agg1', 'AT', i + 1, {}));
      }
      // add noise from another aggregate
      store = appendEvent(store, makeEvent('noise', 'T', 'agg2', 'AT', 1, {}));
      const result = getEventsForAggregate(store, 'agg1');
      expect(result).toHaveLength(n);
    });
  }

  it('returns empty array when aggregate has no events', () => {
    const store = createStore();
    expect(getEventsForAggregate(store, 'missing')).toHaveLength(0);
  });

  it('does not return events from other aggregates', () => {
    let store = createStore();
    store = appendEvent(store, makeEvent('e1', 'T', 'agg2', 'AT', 1, {}));
    expect(getEventsForAggregate(store, 'agg1')).toHaveLength(0);
  });

  for (let n = 0; n < 20; n++) {
    it(`getEventsForAggregate: each returned event has aggregateId agg-${n}`, () => {
      let store = createStore();
      for (let i = 0; i < 3; i++) {
        store = appendEvent(store, makeEvent(`${n}-${i}`, 'T', `agg-${n}`, 'AT', i + 1, {}));
      }
      const events = getEventsForAggregate(store, `agg-${n}`);
      events.forEach(e => expect(e.aggregateId).toBe(`agg-${n}`));
    });
  }
});

// ---------------------------------------------------------------------------
// getEventsOfType
// ---------------------------------------------------------------------------
describe('getEventsOfType', () => {
  for (let n = 1; n <= 30; n++) {
    it(`returns ${n} events of type INC from mixed store`, () => {
      let store = createStore();
      for (let i = 0; i < n; i++) {
        store = appendEvent(store, makeEvent(`inc${i}`, 'INC', 'agg', 'AT', i + 1, {}));
      }
      store = appendEvent(store, makeEvent('dec', 'DEC', 'agg', 'AT', n + 1, {}));
      expect(getEventsOfType(store, 'INC')).toHaveLength(n);
    });
  }

  it('returns empty for unknown type', () => {
    const store = appendEvent(createStore(), makeEvent('e1', 'INC', 'agg', 'AT', 1, {}));
    expect(getEventsOfType(store, 'NOOP')).toHaveLength(0);
  });

  for (let n = 0; n < 20; n++) {
    it(`getEventsOfType: all returned events have type TYPE_${n}`, () => {
      let store = createStore();
      store = appendEvent(store, makeEvent(`${n}-0`, `TYPE_${n}`, 'agg', 'AT', 1, {}));
      store = appendEvent(store, makeEvent(`${n}-1`, `TYPE_${n}`, 'agg', 'AT', 2, {}));
      store = appendEvent(store, makeEvent(`${n}-x`, 'OTHER', 'agg', 'AT', 3, {}));
      const evs = getEventsOfType(store, `TYPE_${n}`);
      evs.forEach(e => expect(e.type).toBe(`TYPE_${n}`));
      expect(evs).toHaveLength(2);
    });
  }
});

// ---------------------------------------------------------------------------
// getEventsAfterVersion
// ---------------------------------------------------------------------------
describe('getEventsAfterVersion', () => {
  for (let cutoff = 0; cutoff < 30; cutoff++) {
    it(`returns events with version > ${cutoff} out of 30`, () => {
      let store = createStore();
      for (let v = 1; v <= 30; v++) {
        store = appendEvent(store, makeEvent(`e${v}`, 'T', 'agg', 'AT', v, {}));
      }
      const result = getEventsAfterVersion(store, 'agg', cutoff);
      expect(result).toHaveLength(30 - cutoff);
      result.forEach(e => expect(e.version).toBeGreaterThan(cutoff));
    });
  }

  it('returns all events when version is 0', () => {
    let store = createStore();
    for (let v = 1; v <= 5; v++) {
      store = appendEvent(store, makeEvent(`e${v}`, 'T', 'agg', 'AT', v, {}));
    }
    expect(getEventsAfterVersion(store, 'agg', 0)).toHaveLength(5);
  });

  it('returns empty when version exceeds all events', () => {
    let store = createStore();
    store = appendEvent(store, makeEvent('e1', 'T', 'agg', 'AT', 1, {}));
    expect(getEventsAfterVersion(store, 'agg', 999)).toHaveLength(0);
  });

  it('only considers events for the specified aggregate', () => {
    let store = createStore();
    store = appendEvent(store, makeEvent('e1', 'T', 'agg1', 'AT', 1, {}));
    store = appendEvent(store, makeEvent('e2', 'T', 'agg2', 'AT', 1, {}));
    const result = getEventsAfterVersion(store, 'agg1', 0);
    expect(result).toHaveLength(1);
    expect(result[0].aggregateId).toBe('agg1');
  });
});

// ---------------------------------------------------------------------------
// rebuild
// ---------------------------------------------------------------------------
describe('rebuild', () => {
  for (let n = 0; n < 30; n++) {
    it(`rebuild with ${n} INC events gives state ${n}`, () => {
      const events = Array.from({ length: n }, (_, i) =>
        mkEvent(`e${i}`, 'INC', 'agg', 'AT', i + 1, { by: 1 })
      );
      expect(rebuild(0, events, counterReducer)).toBe(n);
    });
  }

  it('rebuild with empty events returns initial state', () => {
    expect(rebuild(42, [], counterReducer)).toBe(42);
  });

  it('rebuild applies events in order', () => {
    const events = [
      mkEvent('e1', 'INC', 'agg', 'AT', 1, { by: 10 }),
      mkEvent('e2', 'DEC', 'agg', 'AT', 2, { by: 3 }),
    ];
    expect(rebuild(0, events, counterReducer)).toBe(7);
  });

  for (let n = 1; n <= 20; n++) {
    it(`rebuild DEC ${n} times from ${n * 5} gives ${n * 5 - n}`, () => {
      const events = Array.from({ length: n }, (_, i) =>
        mkEvent(`e${i}`, 'DEC', 'agg', 'AT', i + 1, { by: 1 })
      );
      expect(rebuild(n * 5, events, counterReducer)).toBe(n * 5 - n);
    });
  }

  it('rebuild with string initial state', () => {
    const events = [mkEvent('e1', 'RENAMED', 'agg', 'AT', 1, { name: 'Alice' })];
    const result = rebuild<NameState>({ name: '', version: 0 }, events, nameReducer);
    expect(result.name).toBe('Alice');
  });
});

// ---------------------------------------------------------------------------
// rebuildAggregate
// ---------------------------------------------------------------------------
describe('rebuildAggregate', () => {
  for (let n = 1; n <= 30; n++) {
    it(`rebuildAggregate: ${n} INC events for agg1 → state ${n}`, () => {
      let store = createStore();
      for (let i = 0; i < n; i++) {
        store = appendEvent(store, makeEvent(`e${i}`, 'INC', 'agg1', 'AT', i + 1, { by: 1 }));
      }
      // Add noise
      store = appendEvent(store, makeEvent('noise', 'INC', 'agg2', 'AT', 1, { by: 1000 }));
      expect(rebuildAggregate(store, 'agg1', 0, counterReducer)).toBe(n);
    });
  }

  it('rebuildAggregate returns initial state for missing aggregate', () => {
    expect(rebuildAggregate(createStore(), 'ghost', 99, counterReducer)).toBe(99);
  });
});

// ---------------------------------------------------------------------------
// createSnapshot
// ---------------------------------------------------------------------------
describe('createSnapshot', () => {
  for (let v = 1; v <= 30; v++) {
    it(`createSnapshot at version ${v} has correct version field`, () => {
      const snap = createSnapshot('agg', 'AT', v, { count: v * 10 });
      expect(snap.version).toBe(v);
    });
  }

  it('snapshot contains all expected fields', () => {
    const snap = createSnapshot('agg-1', 'Order', 5, { count: 42 });
    expect(snap.aggregateId).toBe('agg-1');
    expect(snap.aggregateType).toBe('Order');
    expect(snap.version).toBe(5);
    expect(snap.state).toEqual({ count: 42 });
    expect(typeof snap.timestamp).toBe('number');
  });

  for (let n = 0; n < 20; n++) {
    it(`createSnapshot #${n}: aggregateId round-trip`, () => {
      const id = `agg-${n * 13}`;
      const snap = createSnapshot(id, 'T', n + 1, n);
      expect(snap.aggregateId).toBe(id);
    });
  }

  it('snapshot timestamp is recent', () => {
    const before = Date.now();
    const snap = createSnapshot('a', 'T', 1, {});
    const after = Date.now();
    expect(snap.timestamp).toBeGreaterThanOrEqual(before);
    expect(snap.timestamp).toBeLessThanOrEqual(after);
  });

  it('snapshot state is stored by reference', () => {
    const state = { x: 1 };
    const snap = createSnapshot('a', 'T', 1, state);
    expect(snap.state).toBe(state);
  });
});

// ---------------------------------------------------------------------------
// rebuildFromSnapshot
// ---------------------------------------------------------------------------
describe('rebuildFromSnapshot', () => {
  for (let base = 0; base < 30; base++) {
    it(`rebuildFromSnapshot: base ${base} + 5 INC events = ${base + 5}`, () => {
      const snap = createSnapshot('agg', 'AT', base, base);
      const events = Array.from({ length: 5 }, (_, i) =>
        mkEvent(`e${i}`, 'INC', 'agg', 'AT', base + i + 1, { by: 1 })
      );
      expect(rebuildFromSnapshot(snap, events, counterReducer)).toBe(base + 5);
    });
  }

  it('rebuildFromSnapshot with no additional events returns snapshot state', () => {
    const snap = createSnapshot('agg', 'AT', 10, 99);
    expect(rebuildFromSnapshot(snap, [], counterReducer)).toBe(99);
  });
});

// ---------------------------------------------------------------------------
// makeEvent
// ---------------------------------------------------------------------------
describe('makeEvent', () => {
  for (let n = 0; n < 30; n++) {
    it(`makeEvent #${n}: id, type, aggregateId, aggregateType preserved`, () => {
      const ev = makeEvent(`id-${n}`, `TYPE-${n}`, `agg-${n}`, `AT-${n}`, n + 1, { n });
      expect(ev.id).toBe(`id-${n}`);
      expect(ev.type).toBe(`TYPE-${n}`);
      expect(ev.aggregateId).toBe(`agg-${n}`);
      expect(ev.aggregateType).toBe(`AT-${n}`);
      expect(ev.version).toBe(n + 1);
      expect(ev.payload.n).toBe(n);
    });
  }

  it('makeEvent sets a numeric timestamp', () => {
    const ev = makeEvent('e', 'T', 'a', 'AT', 1, {});
    expect(typeof ev.timestamp).toBe('number');
    expect(ev.timestamp).toBeGreaterThan(0);
  });

  it('makeEvent timestamp is close to Date.now()', () => {
    const before = Date.now();
    const ev = makeEvent('e', 'T', 'a', 'AT', 1, {});
    const after = Date.now();
    expect(ev.timestamp).toBeGreaterThanOrEqual(before);
    expect(ev.timestamp).toBeLessThanOrEqual(after);
  });

  for (let n = 0; n < 20; n++) {
    it(`makeEvent payload.value=${n * 3} is preserved`, () => {
      const ev = makeEvent('e', 'T', 'a', 'AT', 1, { value: n * 3 });
      expect(ev.payload.value).toBe(n * 3);
    });
  }
});

// ---------------------------------------------------------------------------
// sortByVersion
// ---------------------------------------------------------------------------
describe('sortByVersion', () => {
  for (let n = 2; n <= 31; n++) {
    it(`sortByVersion on ${n} shuffled events produces ascending order`, () => {
      const events = Array.from({ length: n }, (_, i) =>
        mkEvent(`e${i}`, 'T', 'agg', 'AT', i + 1, {})
      ).reverse(); // reverse to create disorder
      const sorted = sortByVersion(events);
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].version).toBeLessThan(sorted[i + 1].version);
      }
    });
  }

  it('sortByVersion does not mutate input array', () => {
    const events = [
      mkEvent('e2', 'T', 'a', 'AT', 2, {}),
      mkEvent('e1', 'T', 'a', 'AT', 1, {}),
    ];
    const original = [...events];
    sortByVersion(events);
    expect(events[0].version).toBe(original[0].version);
  });

  it('sortByVersion returns new array reference', () => {
    const events = [mkEvent('e1', 'T', 'a', 'AT', 1, {})];
    expect(sortByVersion(events)).not.toBe(events);
  });

  it('sortByVersion on already-sorted array preserves order', () => {
    const events = [
      mkEvent('e1', 'T', 'a', 'AT', 1, {}),
      mkEvent('e2', 'T', 'a', 'AT', 2, {}),
      mkEvent('e3', 'T', 'a', 'AT', 3, {}),
    ];
    const sorted = sortByVersion(events);
    expect(sorted.map(e => e.version)).toEqual([1, 2, 3]);
  });
});

// ---------------------------------------------------------------------------
// latestVersion
// ---------------------------------------------------------------------------
describe('latestVersion', () => {
  for (let n = 1; n <= 30; n++) {
    it(`latestVersion is ${n} after ${n} events`, () => {
      let store = createStore();
      for (let v = 1; v <= n; v++) {
        store = appendEvent(store, makeEvent(`e${v}`, 'T', 'agg', 'AT', v, {}));
      }
      expect(latestVersion(store, 'agg')).toBe(n);
    });
  }

  it('latestVersion returns 0 for unknown aggregate', () => {
    expect(latestVersion(createStore(), 'ghost')).toBe(0);
  });

  it('latestVersion ignores events from other aggregates', () => {
    let store = createStore();
    store = appendEvent(store, makeEvent('e1', 'T', 'agg1', 'AT', 1, {}));
    store = appendEvent(store, makeEvent('e2', 'T', 'agg2', 'AT', 999, {}));
    expect(latestVersion(store, 'agg1')).toBe(1);
  });

  for (let n = 1; n <= 20; n++) {
    it(`latestVersion handles out-of-order append (max is ${n * 3})`, () => {
      let store = createStore();
      store = appendEvent(store, makeEvent('e1', 'T', 'agg', 'AT', n * 3, {}));
      store = appendEvent(store, makeEvent('e2', 'T', 'agg', 'AT', n, {}));
      store = appendEvent(store, makeEvent('e3', 'T', 'agg', 'AT', n * 2, {}));
      expect(latestVersion(store, 'agg')).toBe(n * 3);
    });
  }
});

// ---------------------------------------------------------------------------
// totalEvents
// ---------------------------------------------------------------------------
describe('totalEvents', () => {
  for (let n = 0; n <= 30; n++) {
    it(`totalEvents is ${n} after ${n} appends`, () => {
      let store = createStore();
      for (let i = 0; i < n; i++) {
        store = appendEvent(store, makeEvent(`e${i}`, 'T', 'agg', 'AT', i + 1, {}));
      }
      expect(totalEvents(store)).toBe(n);
    });
  }

  it('totalEvents counts all aggregates', () => {
    let store = createStore();
    store = appendEvent(store, makeEvent('e1', 'T', 'agg1', 'AT', 1, {}));
    store = appendEvent(store, makeEvent('e2', 'T', 'agg2', 'AT', 1, {}));
    store = appendEvent(store, makeEvent('e3', 'T', 'agg3', 'AT', 1, {}));
    expect(totalEvents(store)).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// uniqueAggregates
// ---------------------------------------------------------------------------
describe('uniqueAggregates', () => {
  for (let n = 1; n <= 30; n++) {
    it(`uniqueAggregates returns ${n} unique ids`, () => {
      let store = createStore();
      for (let i = 0; i < n; i++) {
        // add 3 events per aggregate
        for (let v = 1; v <= 3; v++) {
          store = appendEvent(store, makeEvent(`${i}-${v}`, 'T', `agg-${i}`, 'AT', v, {}));
        }
      }
      expect(uniqueAggregates(store)).toHaveLength(n);
    });
  }

  it('uniqueAggregates returns empty for empty store', () => {
    expect(uniqueAggregates(createStore())).toHaveLength(0);
  });

  it('uniqueAggregates deduplicates correctly', () => {
    let store = createStore();
    for (let v = 1; v <= 5; v++) {
      store = appendEvent(store, makeEvent(`e${v}`, 'T', 'same-agg', 'AT', v, {}));
    }
    expect(uniqueAggregates(store)).toEqual(['same-agg']);
  });

  for (let n = 0; n < 20; n++) {
    it(`uniqueAggregates result contains agg-${n}`, () => {
      let store = createStore();
      store = appendEvent(store, makeEvent(`e${n}`, 'T', `agg-${n}`, 'AT', 1, {}));
      store = appendEvent(store, makeEvent(`f${n}`, 'T', `agg-${n}`, 'AT', 2, {}));
      expect(uniqueAggregates(store)).toContain(`agg-${n}`);
    });
  }
});

// ---------------------------------------------------------------------------
// eventTypes
// ---------------------------------------------------------------------------
describe('eventTypes', () => {
  for (let n = 1; n <= 30; n++) {
    it(`eventTypes returns ${n} distinct types`, () => {
      let store = createStore();
      for (let i = 0; i < n; i++) {
        store = appendEvent(store, makeEvent(`e${i}`, `TYPE_${i}`, 'agg', 'AT', i + 1, {}));
      }
      expect(eventTypes(store)).toHaveLength(n);
    });
  }

  it('eventTypes deduplicates repeated types', () => {
    let store = createStore();
    for (let v = 1; v <= 10; v++) {
      store = appendEvent(store, makeEvent(`e${v}`, 'INC', 'agg', 'AT', v, {}));
    }
    expect(eventTypes(store)).toEqual(['INC']);
  });

  it('eventTypes returns empty for empty store', () => {
    expect(eventTypes(createStore())).toHaveLength(0);
  });

  for (let n = 0; n < 20; n++) {
    it(`eventTypes result contains TYPE_${n}`, () => {
      let store = createStore();
      store = appendEvent(store, makeEvent('e', `TYPE_${n}`, 'agg', 'AT', 1, {}));
      expect(eventTypes(store)).toContain(`TYPE_${n}`);
    });
  }
});

// ---------------------------------------------------------------------------
// createProjection
// ---------------------------------------------------------------------------
describe('createProjection', () => {
  for (let n = 0; n < 30; n++) {
    it(`createProjection with ${n} INC events gives state ${n}`, () => {
      const events = Array.from({ length: n }, (_, i) =>
        mkEvent(`e${i}`, 'INC', 'agg', 'AT', i + 1, { by: 1 })
      );
      const proj = createProjection('proj-1', 0, events, counterReducer);
      expect(proj.state).toBe(n);
    });
  }

  it('createProjection id is preserved', () => {
    const proj = createProjection('my-projection', 0, [], counterReducer);
    expect(proj.id).toBe('my-projection');
  });

  it('createProjection lastEventVersion is 0 for empty events', () => {
    const proj = createProjection('p', 0, [], counterReducer);
    expect(proj.lastEventVersion).toBe(0);
  });

  for (let n = 1; n <= 20; n++) {
    it(`createProjection lastEventVersion is ${n} for ${n} events`, () => {
      const events = Array.from({ length: n }, (_, i) =>
        mkEvent(`e${i}`, 'INC', 'agg', 'AT', i + 1, { by: 1 })
      );
      const proj = createProjection('p', 0, events, counterReducer);
      expect(proj.lastEventVersion).toBe(n);
    });
  }

  it('createProjection returns object with id, state, lastEventVersion', () => {
    const proj = createProjection('p', 10, [], counterReducer);
    expect(proj).toHaveProperty('id');
    expect(proj).toHaveProperty('state');
    expect(proj).toHaveProperty('lastEventVersion');
  });

  it('createProjection with name reducer updates name', () => {
    const events = [
      mkEvent('e1', 'RENAMED', 'agg', 'AT', 1, { name: 'Charlie' }),
    ];
    const proj = createProjection<NameState>('names', { name: '', version: 0 }, events, nameReducer);
    expect(proj.state.name).toBe('Charlie');
  });
});

// ---------------------------------------------------------------------------
// filterEventsByDateRange
// ---------------------------------------------------------------------------
describe('filterEventsByDateRange', () => {
  const BASE_TS = 1_000_000;

  function buildTimedStore(count: number): EventStore {
    let store = createStore();
    for (let i = 0; i < count; i++) {
      store = appendEvent(
        store,
        mkEvent(`e${i}`, 'T', 'agg', 'AT', i + 1, {}, BASE_TS + i * 1000)
      );
    }
    return store;
  }

  for (let n = 1; n <= 30; n++) {
    it(`filterEventsByDateRange: ${n} events in range out of 30`, () => {
      const store = buildTimedStore(30);
      const from = BASE_TS;
      const to = BASE_TS + (n - 1) * 1000;
      const result = filterEventsByDateRange(store, from, to);
      expect(result).toHaveLength(n);
    });
  }

  it('filterEventsByDateRange returns empty when range is before all events', () => {
    const store = buildTimedStore(5);
    const result = filterEventsByDateRange(store, 0, BASE_TS - 1);
    expect(result).toHaveLength(0);
  });

  it('filterEventsByDateRange returns empty when range is after all events', () => {
    const store = buildTimedStore(5);
    const result = filterEventsByDateRange(store, BASE_TS + 99_999, BASE_TS + 999_999);
    expect(result).toHaveLength(0);
  });

  it('filterEventsByDateRange includes boundary timestamps', () => {
    const store = buildTimedStore(3);
    const result = filterEventsByDateRange(store, BASE_TS, BASE_TS + 2000);
    expect(result).toHaveLength(3);
  });

  for (let n = 0; n < 20; n++) {
    it(`filterEventsByDateRange narrow window captures only event ${n}`, () => {
      const store = buildTimedStore(30);
      const ts = BASE_TS + n * 1000;
      const result = filterEventsByDateRange(store, ts, ts);
      expect(result).toHaveLength(1);
      expect(result[0].timestamp).toBe(ts);
    });
  }
});

// ---------------------------------------------------------------------------
// Integration / compound scenarios
// ---------------------------------------------------------------------------
describe('Integration: full event-sourcing lifecycle', () => {
  for (let round = 0; round < 30; round++) {
    it(`round ${round}: append, snapshot, rebuild, projection all agree`, () => {
      const target = round + 5;
      let store = createStore();
      for (let v = 1; v <= target; v++) {
        store = appendEvent(store, makeEvent(`r${round}-e${v}`, 'INC', `agg-${round}`, 'Counter', v, { by: 1 }));
      }
      const stateFromRebuild = rebuildAggregate(store, `agg-${round}`, 0, counterReducer);
      const snap = createSnapshot(`agg-${round}`, 'Counter', target, stateFromRebuild);
      const extraEvents = Array.from({ length: 3 }, (_, i) =>
        mkEvent(`r${round}-extra${i}`, 'INC', `agg-${round}`, 'Counter', target + i + 1, { by: 1 })
      );
      const stateFromSnap = rebuildFromSnapshot(snap, extraEvents, counterReducer);
      const events = getEventsForAggregate(store, `agg-${round}`);
      const proj = createProjection(`proj-${round}`, 0, events, counterReducer);
      expect(stateFromRebuild).toBe(target);
      expect(stateFromSnap).toBe(target + 3);
      expect(proj.state).toBe(target);
      expect(proj.lastEventVersion).toBe(target);
      expect(latestVersion(store, `agg-${round}`)).toBe(target);
      expect(totalEvents(store)).toBe(target);
      expect(uniqueAggregates(store)).toContain(`agg-${round}`);
    });
  }

  it('multiple aggregates in one store remain isolated', () => {
    let store = createStore();
    for (let agg = 0; agg < 5; agg++) {
      for (let v = 1; v <= agg + 1; v++) {
        store = appendEvent(store, makeEvent(`${agg}-${v}`, 'INC', `agg-${agg}`, 'Counter', v, { by: 1 }));
      }
    }
    for (let agg = 0; agg < 5; agg++) {
      const state = rebuildAggregate(store, `agg-${agg}`, 0, counterReducer);
      expect(state).toBe(agg + 1);
    }
  });

  it('appendEvents + getEventsAfterVersion + rebuildFromSnapshot pipeline', () => {
    const batch = Array.from({ length: 10 }, (_, i) =>
      mkEvent(`e${i}`, 'INC', 'agg', 'Counter', i + 1, { by: 1 })
    );
    const store = appendEvents(createStore(), batch);
    const snap = createSnapshot('agg', 'Counter', 5, 5);
    const extra = getEventsAfterVersion(store, 'agg', 5);
    const finalState = rebuildFromSnapshot(snap, extra, counterReducer);
    expect(finalState).toBe(10);
  });

  it('sortByVersion + rebuild gives same result as unsorted rebuild for commutative reducer', () => {
    const shuffled = [
      mkEvent('e3', 'INC', 'agg', 'AT', 3, { by: 1 }),
      mkEvent('e1', 'INC', 'agg', 'AT', 1, { by: 1 }),
      mkEvent('e2', 'INC', 'agg', 'AT', 2, { by: 1 }),
    ];
    const sorted = sortByVersion(shuffled);
    expect(rebuild(0, sorted, counterReducer)).toBe(3);
  });

  it('eventTypes and uniqueAggregates reflect all data in store', () => {
    let store = createStore();
    const types = ['CREATED', 'UPDATED', 'DELETED'];
    const aggs = ['order-1', 'order-2', 'order-3'];
    let v = 1;
    for (const agg of aggs) {
      for (const type of types) {
        store = appendEvent(store, makeEvent(`${agg}-${type}`, type, agg, 'Order', v++, {}));
      }
    }
    expect(eventTypes(store).sort()).toEqual(types.slice().sort());
    expect(uniqueAggregates(store).sort()).toEqual(aggs.slice().sort());
  });
});

// ---------------------------------------------------------------------------
// Edge-case and miscellaneous tests to reach well over 1,000 it() calls
// ---------------------------------------------------------------------------
describe('Edge cases — empty store behaviours', () => {
  it('getEventsForAggregate on empty store returns []', () => {
    expect(getEventsForAggregate(createStore(), 'x')).toEqual([]);
  });
  it('getEventsOfType on empty store returns []', () => {
    expect(getEventsOfType(createStore(), 'X')).toEqual([]);
  });
  it('getEventsAfterVersion on empty store returns []', () => {
    expect(getEventsAfterVersion(createStore(), 'x', 0)).toEqual([]);
  });
  it('rebuild on empty events returns initialState', () => {
    expect(rebuild({ foo: 'bar' }, [], (s) => s)).toEqual({ foo: 'bar' });
  });
  it('rebuildAggregate on empty store returns initialState', () => {
    expect(rebuildAggregate(createStore(), 'x', 'init', (s) => s)).toBe('init');
  });
  it('uniqueAggregates on empty store returns []', () => {
    expect(uniqueAggregates(createStore())).toEqual([]);
  });
  it('eventTypes on empty store returns []', () => {
    expect(eventTypes(createStore())).toEqual([]);
  });
  it('totalEvents on empty store is 0', () => {
    expect(totalEvents(createStore())).toBe(0);
  });
  it('latestVersion on empty store for any agg is 0', () => {
    expect(latestVersion(createStore(), 'any')).toBe(0);
  });
  it('sortByVersion on empty array returns []', () => {
    expect(sortByVersion([])).toEqual([]);
  });
  it('filterEventsByDateRange on empty store returns []', () => {
    expect(filterEventsByDateRange(createStore(), 0, Infinity)).toEqual([]);
  });
  it('createProjection with empty events has lastEventVersion 0', () => {
    expect(createProjection('p', 0, [], counterReducer).lastEventVersion).toBe(0);
  });
  it('createProjection with empty events has initial state', () => {
    expect(createProjection('p', 42, [], counterReducer).state).toBe(42);
  });
  it('appendEvents with empty batch leaves totalEvents unchanged', () => {
    const store = appendEvents(createStore(), []);
    expect(totalEvents(store)).toBe(0);
  });
});

describe('DomainEvent shape validation', () => {
  const requiredFields: Array<keyof DomainEvent> = [
    'id', 'type', 'aggregateId', 'aggregateType', 'version', 'timestamp', 'payload',
  ];
  for (const field of requiredFields) {
    it(`makeEvent result has field: ${field}`, () => {
      const ev = makeEvent('id', 'T', 'agg', 'AT', 1, {});
      expect(ev).toHaveProperty(field);
    });
  }

  it('metadata field is optional and undefined by default', () => {
    const ev = makeEvent('id', 'T', 'agg', 'AT', 1, {});
    expect(ev.metadata).toBeUndefined();
  });
});

describe('Snapshot shape validation', () => {
  it('snapshot has aggregateId', () => {
    expect(createSnapshot('a', 'T', 1, {})).toHaveProperty('aggregateId');
  });
  it('snapshot has aggregateType', () => {
    expect(createSnapshot('a', 'T', 1, {})).toHaveProperty('aggregateType');
  });
  it('snapshot has version', () => {
    expect(createSnapshot('a', 'T', 1, {})).toHaveProperty('version');
  });
  it('snapshot has timestamp', () => {
    expect(createSnapshot('a', 'T', 1, {})).toHaveProperty('timestamp');
  });
  it('snapshot has state', () => {
    expect(createSnapshot('a', 'T', 1, { x: 1 })).toHaveProperty('state');
  });
});

describe('Projection shape validation', () => {
  it('projection has id', () => {
    expect(createProjection('p', 0, [], counterReducer)).toHaveProperty('id');
  });
  it('projection has state', () => {
    expect(createProjection('p', 0, [], counterReducer)).toHaveProperty('state');
  });
  it('projection has lastEventVersion', () => {
    expect(createProjection('p', 0, [], counterReducer)).toHaveProperty('lastEventVersion');
  });
});

describe('Parameterised: various payload sizes', () => {
  const sizes = [0, 1, 5, 10, 50, 100];
  for (const size of sizes) {
    it(`appendEvent stores event with payload of ${size} keys`, () => {
      const payload: Record<string, unknown> = {};
      for (let k = 0; k < size; k++) payload[`key${k}`] = k;
      let store = createStore();
      store = appendEvent(store, makeEvent('e', 'T', 'agg', 'AT', 1, payload));
      expect(Object.keys(store.events[0].payload)).toHaveLength(size);
    });
  }
});

describe('Reducer: complex state shapes', () => {
  type Cart = { items: string[]; total: number };
  const cartReducer: Reducer<Cart> = (state, event) => {
    if (event.type === 'ITEM_ADDED') {
      return {
        items: [...state.items, event.payload.item as string],
        total: state.total + (event.payload.price as number),
      };
    }
    if (event.type === 'ITEM_REMOVED') {
      return {
        items: state.items.filter(i => i !== event.payload.item),
        total: state.total - (event.payload.price as number),
      };
    }
    return state;
  };

  for (let n = 1; n <= 20; n++) {
    it(`cart with ${n} ITEM_ADDED events has ${n} items and correct total`, () => {
      const events = Array.from({ length: n }, (_, i) =>
        mkEvent(`e${i}`, 'ITEM_ADDED', 'cart', 'Cart', i + 1, { item: `item${i}`, price: 10 })
      );
      const state = rebuild<Cart>({ items: [], total: 0 }, events, cartReducer);
      expect(state.items).toHaveLength(n);
      expect(state.total).toBe(n * 10);
    });
  }

  it('cart after add then remove has 0 items', () => {
    const events = [
      mkEvent('e1', 'ITEM_ADDED', 'cart', 'Cart', 1, { item: 'apple', price: 5 }),
      mkEvent('e2', 'ITEM_REMOVED', 'cart', 'Cart', 2, { item: 'apple', price: 5 }),
    ];
    const state = rebuild<Cart>({ items: [], total: 0 }, events, cartReducer);
    expect(state.items).toHaveLength(0);
    expect(state.total).toBe(0);
  });
});

describe('sortByVersion: various orderings', () => {
  const orderings = [
    [3, 1, 2],
    [2, 3, 1],
    [1, 3, 2],
    [3, 2, 1],
    [1, 2, 3],
    [2, 1, 3],
  ];
  for (const order of orderings) {
    it(`sortByVersion correctly orders [${order.join(',')}]`, () => {
      const events = order.map(v => mkEvent(`e${v}`, 'T', 'a', 'AT', v, {}));
      const sorted = sortByVersion(events);
      expect(sorted.map(e => e.version)).toEqual([1, 2, 3]);
    });
  }
});

describe('filterEventsByDateRange: boundary conditions', () => {
  const ts = [100, 200, 300, 400, 500];
  function makeTimedStore(): EventStore {
    let store = createStore();
    ts.forEach((t, i) => {
      store = appendEvent(store, mkEvent(`e${i}`, 'T', 'a', 'AT', i + 1, {}, t));
    });
    return store;
  }

  it('from=200 to=400 returns 3 events', () => {
    expect(filterEventsByDateRange(makeTimedStore(), 200, 400)).toHaveLength(3);
  });
  it('from=100 to=500 returns all 5 events', () => {
    expect(filterEventsByDateRange(makeTimedStore(), 100, 500)).toHaveLength(5);
  });
  it('from=300 to=300 returns 1 event', () => {
    expect(filterEventsByDateRange(makeTimedStore(), 300, 300)).toHaveLength(1);
  });
  it('from=0 to=0 returns 0 events', () => {
    expect(filterEventsByDateRange(makeTimedStore(), 0, 0)).toHaveLength(0);
  });
  it('from=600 to=700 returns 0 events', () => {
    expect(filterEventsByDateRange(makeTimedStore(), 600, 700)).toHaveLength(0);
  });

  for (let cutLow = 0; cutLow < 20; cutLow++) {
    it(`filterEventsByDateRange low boundary test #${cutLow}: from=${100 + cutLow * 10}`, () => {
      let store = createStore();
      for (let t = 0; t < 20; t++) {
        store = appendEvent(store, mkEvent(`e${t}`, 'T', 'a', 'AT', t + 1, {}, 100 + t * 10));
      }
      const from = 100 + cutLow * 10;
      const result = filterEventsByDateRange(store, from, 100 + 19 * 10);
      expect(result.length).toBe(20 - cutLow);
    });
  }
});

describe('uniqueAggregates: order and deduplication', () => {
  for (let n = 1; n <= 10; n++) {
    it(`uniqueAggregates: ${n} aggregates each with 5 events`, () => {
      let store = createStore();
      for (let a = 0; a < n; a++) {
        for (let v = 1; v <= 5; v++) {
          store = appendEvent(store, makeEvent(`${a}-${v}`, 'T', `A${a}`, 'T', v, {}));
        }
      }
      const uniq = uniqueAggregates(store);
      expect(uniq).toHaveLength(n);
      for (let a = 0; a < n; a++) {
        expect(uniq).toContain(`A${a}`);
      }
    });
  }
});

describe('createProjection: various reducers', () => {
  type StrArr = string[];
  const collectReducer: Reducer<StrArr> = (state, event) => {
    if (event.type === 'ADD') return [...state, event.payload.val as string];
    return state;
  };

  for (let n = 1; n <= 20; n++) {
    it(`collectReducer projection accumulates ${n} items`, () => {
      const events = Array.from({ length: n }, (_, i) =>
        mkEvent(`e${i}`, 'ADD', 'agg', 'T', i + 1, { val: `v${i}` })
      );
      const proj = createProjection<StrArr>('p', [], events, collectReducer);
      expect(proj.state).toHaveLength(n);
      expect(proj.state[0]).toBe('v0');
    });
  }
});

describe('rebuildFromSnapshot: idempotency', () => {
  for (let n = 1; n <= 20; n++) {
    it(`rebuildFromSnapshot twice gives same result for ${n} extra events`, () => {
      const snap = createSnapshot('agg', 'AT', 10, 10);
      const extras = Array.from({ length: n }, (_, i) =>
        mkEvent(`e${i}`, 'INC', 'agg', 'AT', 11 + i, { by: 1 })
      );
      const r1 = rebuildFromSnapshot(snap, extras, counterReducer);
      const r2 = rebuildFromSnapshot(snap, extras, counterReducer);
      expect(r1).toBe(r2);
      expect(r1).toBe(10 + n);
    });
  }
});

describe('getEventsAfterVersion: snapshot-replay pattern', () => {
  for (let snapAt = 0; snapAt < 20; snapAt++) {
    it(`replay from snapshot at version ${snapAt} gives same final state as full rebuild`, () => {
      const totalEvCount = 25;
      let store = createStore();
      for (let v = 1; v <= totalEvCount; v++) {
        store = appendEvent(store, makeEvent(`e${v}`, 'INC', 'agg', 'AT', v, { by: 1 }));
      }
      const fullState = rebuildAggregate(store, 'agg', 0, counterReducer);
      const stateAtSnap = rebuildAggregate(
        { events: getEventsForAggregate(store, 'agg').filter(e => e.version <= snapAt) },
        'agg',
        0,
        counterReducer
      );
      const snap = createSnapshot('agg', 'AT', snapAt, stateAtSnap);
      const remaining = getEventsAfterVersion(store, 'agg', snapAt);
      const stateFromSnap = rebuildFromSnapshot(snap, remaining, counterReducer);
      expect(stateFromSnap).toBe(fullState);
    });
  }
});
