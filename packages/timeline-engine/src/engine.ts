import { EventCategory, EventSeverity, Timeline, TimelineEvent, TimelineFilter, TimelineStats } from './types';

export function createEvent(
  id: string, entityId: string, entityType: string,
  category: EventCategory, severity: EventSeverity,
  actor: string, description: string,
  timestamp = Date.now(),
  metadata?: Record<string, unknown>
): TimelineEvent {
  return { id, entityId, entityType, category, severity, actor, description, timestamp, ...(metadata ? { metadata } : {}) };
}

export function createTimeline(entityId: string, entityType: string, events: TimelineEvent[] = []): Timeline {
  return { entityId, entityType, events };
}

export function addEvent(timeline: Timeline, event: TimelineEvent): Timeline {
  return { ...timeline, events: [...timeline.events, event] };
}

export function removeEvent(timeline: Timeline, eventId: string): Timeline {
  return { ...timeline, events: timeline.events.filter(e => e.id !== eventId) };
}

export function sortByTimestamp(events: TimelineEvent[], direction: 'asc' | 'desc' = 'asc'): TimelineEvent[] {
  return [...events].sort((a, b) => direction === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp);
}

export function filterEvents(events: TimelineEvent[], filter: TimelineFilter): TimelineEvent[] {
  return events.filter(event => {
    if (filter.fromTimestamp !== undefined && event.timestamp < filter.fromTimestamp) return false;
    if (filter.toTimestamp !== undefined && event.timestamp > filter.toTimestamp) return false;
    if (filter.categories && !filter.categories.includes(event.category)) return false;
    if (filter.severities && !filter.severities.includes(event.severity)) return false;
    if (filter.actors && !filter.actors.includes(event.actor)) return false;
    if (filter.tags && event.tags && !filter.tags.some(t => event.tags!.includes(t))) return false;
    if (filter.tags && !event.tags) return false;
    return true;
  });
}

export function getEventById(timeline: Timeline, id: string): TimelineEvent | undefined {
  return timeline.events.find(e => e.id === id);
}

export function getEventsByActor(timeline: Timeline, actor: string): TimelineEvent[] {
  return timeline.events.filter(e => e.actor === actor);
}

export function getEventsByCategory(timeline: Timeline, category: EventCategory): TimelineEvent[] {
  return timeline.events.filter(e => e.category === category);
}

export function getEventsBySeverity(timeline: Timeline, severity: EventSeverity): TimelineEvent[] {
  return timeline.events.filter(e => e.severity === severity);
}

export function getStats(timeline: Timeline): TimelineStats {
  const allCategories: EventCategory[] = ['create','update','delete','view','export','import','approve','reject','escalate','comment','assign','complete','cancel','system'];
  const allSeverities: EventSeverity[] = ['info','warning','error','critical'];

  const eventsByCategory = {} as Record<EventCategory, number>;
  const eventsBySeverity = {} as Record<EventSeverity, number>;
  for (const c of allCategories) eventsByCategory[c] = 0;
  for (const s of allSeverities) eventsBySeverity[s] = 0;

  const actors = new Set<string>();
  let firstEventAt: number | undefined;
  let lastEventAt: number | undefined;

  for (const e of timeline.events) {
    eventsByCategory[e.category]++;
    eventsBySeverity[e.severity]++;
    actors.add(e.actor);
    if (firstEventAt === undefined || e.timestamp < firstEventAt) firstEventAt = e.timestamp;
    if (lastEventAt === undefined || e.timestamp > lastEventAt) lastEventAt = e.timestamp;
  }

  return {
    totalEvents: timeline.events.length,
    eventsByCategory,
    eventsBySeverity,
    uniqueActors: actors.size,
    ...(firstEventAt !== undefined ? { firstEventAt } : {}),
    ...(lastEventAt !== undefined ? { lastEventAt } : {}),
  };
}

export function mergeTimelines(a: Timeline, b: Timeline): Timeline {
  const allEvents = [...a.events, ...b.events];
  const deduped = allEvents.filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i);
  return { entityId: a.entityId, entityType: a.entityType, events: sortByTimestamp(deduped) };
}

export function paginateEvents(events: TimelineEvent[], page: number, pageSize: number): TimelineEvent[] {
  const start = page * pageSize;
  return events.slice(start, start + pageSize);
}

export function isValidCategory(c: string): c is EventCategory {
  return ['create','update','delete','view','export','import','approve','reject','escalate','comment','assign','complete','cancel','system'].includes(c);
}

export function isValidSeverity(s: string): s is EventSeverity {
  return ['info','warning','error','critical'].includes(s);
}

export function getLatestEvent(timeline: Timeline): TimelineEvent | undefined {
  if (timeline.events.length === 0) return undefined;
  return timeline.events.reduce((latest, e) => e.timestamp > latest.timestamp ? e : latest, timeline.events[0]);
}

export function getEarliestEvent(timeline: Timeline): TimelineEvent | undefined {
  if (timeline.events.length === 0) return undefined;
  return timeline.events.reduce((earliest, e) => e.timestamp < earliest.timestamp ? e : earliest, timeline.events[0]);
}

export function countEventsByActor(timeline: Timeline): Record<string, number> {
  const result: Record<string, number> = {};
  for (const e of timeline.events) result[e.actor] = (result[e.actor] ?? 0) + 1;
  return result;
}
