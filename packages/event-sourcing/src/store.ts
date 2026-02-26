import { DomainEvent, EventHandler, EventStore, Projection, Reducer, Snapshot } from './types';

export function createStore(): EventStore {
  return { events: [] };
}

export function appendEvent(store: EventStore, event: DomainEvent): EventStore {
  return { events: [...store.events, event] };
}

export function appendEvents(store: EventStore, events: DomainEvent[]): EventStore {
  return { events: [...store.events, ...events] };
}

export function getEventsForAggregate(store: EventStore, aggregateId: string): DomainEvent[] {
  return store.events.filter(e => e.aggregateId === aggregateId);
}

export function getEventsOfType(store: EventStore, type: string): DomainEvent[] {
  return store.events.filter(e => e.type === type);
}

export function getEventsAfterVersion(store: EventStore, aggregateId: string, version: number): DomainEvent[] {
  return getEventsForAggregate(store, aggregateId).filter(e => e.version > version);
}

export function rebuild<T>(initialState: T, events: DomainEvent[], reducer: Reducer<T>): T {
  return events.reduce(reducer, initialState);
}

export function rebuildAggregate<T>(store: EventStore, aggregateId: string, initialState: T, reducer: Reducer<T>): T {
  const events = getEventsForAggregate(store, aggregateId);
  return rebuild(initialState, events, reducer);
}

export function createSnapshot<T>(aggregateId: string, aggregateType: string, version: number, state: T): Snapshot<T> {
  return { aggregateId, aggregateType, version, timestamp: Date.now(), state };
}

export function rebuildFromSnapshot<T>(snapshot: Snapshot<T>, events: DomainEvent[], reducer: Reducer<T>): T {
  return rebuild(snapshot.state, events, reducer);
}

export function makeEvent(
  id: string, type: string, aggregateId: string, aggregateType: string,
  version: number, payload: Record<string, unknown>
): DomainEvent {
  return { id, type, aggregateId, aggregateType, version, timestamp: Date.now(), payload };
}

export function sortByVersion(events: DomainEvent[]): DomainEvent[] {
  return [...events].sort((a, b) => a.version - b.version);
}

export function latestVersion(store: EventStore, aggregateId: string): number {
  const events = getEventsForAggregate(store, aggregateId);
  if (events.length === 0) return 0;
  return Math.max(...events.map(e => e.version));
}

export function totalEvents(store: EventStore): number {
  return store.events.length;
}

export function uniqueAggregates(store: EventStore): string[] {
  return [...new Set(store.events.map(e => e.aggregateId))];
}

export function eventTypes(store: EventStore): string[] {
  return [...new Set(store.events.map(e => e.type))];
}

export function createProjection<T>(id: string, initialState: T, events: DomainEvent[], reducer: Reducer<T>): Projection<T> {
  const state = rebuild(initialState, events, reducer);
  const lastEventVersion = events.length > 0 ? Math.max(...events.map(e => e.version)) : 0;
  return { id, state, lastEventVersion };
}

export function filterEventsByDateRange(store: EventStore, from: number, to: number): DomainEvent[] {
  return store.events.filter(e => e.timestamp >= from && e.timestamp <= to);
}
