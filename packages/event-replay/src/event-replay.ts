// Copyright (c) 2026 Nexara DMCC. All rights reserved.

let _idCounter = 0;

function generateId(): string {
  _idCounter += 1;
  return `evt-${_idCounter}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface RecordedEvent {
  id: string;
  timestamp: number;
  type: string;
  payload: unknown;
  metadata?: Record<string, unknown>;
}

export interface EventLog {
  append(event: Omit<RecordedEvent, 'id' | 'timestamp'>): RecordedEvent;
  getAll(): RecordedEvent[];
  getById(id: string): RecordedEvent | undefined;
  getByType(type: string): RecordedEvent[];
  getAfter(timestamp: number): RecordedEvent[];
  getBefore(timestamp: number): RecordedEvent[];
  getBetween(from: number, to: number): RecordedEvent[];
  count(): number;
  clear(): void;
  slice(from: number, to?: number): RecordedEvent[];
}

export function createEventLog(): EventLog {
  const events: RecordedEvent[] = [];

  return {
    append(event: Omit<RecordedEvent, 'id' | 'timestamp'>): RecordedEvent {
      const recorded: RecordedEvent = {
        id: generateId(),
        timestamp: Date.now(),
        ...event,
      };
      events.push(recorded);
      return recorded;
    },

    getAll(): RecordedEvent[] {
      return [...events];
    },

    getById(id: string): RecordedEvent | undefined {
      return events.find((e) => e.id === id);
    },

    getByType(type: string): RecordedEvent[] {
      return events.filter((e) => e.type === type);
    },

    getAfter(timestamp: number): RecordedEvent[] {
      return events.filter((e) => e.timestamp > timestamp);
    },

    getBefore(timestamp: number): RecordedEvent[] {
      return events.filter((e) => e.timestamp < timestamp);
    },

    getBetween(from: number, to: number): RecordedEvent[] {
      return events.filter((e) => e.timestamp >= from && e.timestamp <= to);
    },

    count(): number {
      return events.length;
    },

    clear(): void {
      events.length = 0;
    },

    slice(from: number, to?: number): RecordedEvent[] {
      return events.slice(from, to);
    },
  };
}

export interface ReplayOptions {
  speed?: number;
  startAt?: number;
  endAt?: number;
}

export interface ReplayController {
  next(): RecordedEvent | null;
  hasNext(): boolean;
  position(): number;
  total(): number;
  reset(): void;
  seek(index: number): void;
  remaining(): number;
}

export function createReplay(log: EventLog, options: ReplayOptions = {}): ReplayController {
  const { startAt, endAt } = options;

  let allEvents = log.getAll();

  if (startAt !== undefined) {
    allEvents = allEvents.filter((e) => e.timestamp >= startAt);
  }
  if (endAt !== undefined) {
    allEvents = allEvents.filter((e) => e.timestamp <= endAt);
  }

  const events = allEvents;
  let cursor = 0;

  return {
    next(): RecordedEvent | null {
      if (cursor >= events.length) return null;
      return events[cursor++];
    },

    hasNext(): boolean {
      return cursor < events.length;
    },

    position(): number {
      return cursor;
    },

    total(): number {
      return events.length;
    },

    reset(): void {
      cursor = 0;
    },

    seek(index: number): void {
      if (index < 0) {
        cursor = 0;
      } else if (index > events.length) {
        cursor = events.length;
      } else {
        cursor = index;
      }
    },

    remaining(): number {
      return events.length - cursor;
    },
  };
}

export function deduplicate(events: RecordedEvent[], window = 0): RecordedEvent[] {
  if (window <= 0) {
    // Deduplicate by exact (type, timestamp) — keep first occurrence
    const seen = new Set<string>();
    const result: RecordedEvent[] = [];
    for (const e of events) {
      const key = `${e.type}::${e.timestamp}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(e);
      }
    }
    return result;
  }

  // Within window ms, events of same type => keep only the first
  const result: RecordedEvent[] = [];
  // Track last kept timestamp per type
  const lastKept = new Map<string, number>();

  for (const e of events) {
    const last = lastKept.get(e.type);
    if (last === undefined || e.timestamp - last > window) {
      result.push(e);
      lastKept.set(e.type, e.timestamp);
    }
  }
  return result;
}

export function aggregate(events: RecordedEvent[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of events) {
    counts[e.type] = (counts[e.type] ?? 0) + 1;
  }
  return counts;
}

export function groupByType(events: RecordedEvent[]): Record<string, RecordedEvent[]> {
  const groups: Record<string, RecordedEvent[]> = {};
  for (const e of events) {
    if (!groups[e.type]) groups[e.type] = [];
    groups[e.type].push(e);
  }
  return groups;
}

export function groupByTimeBucket(
  events: RecordedEvent[],
  bucketMs: number,
): Record<number, RecordedEvent[]> {
  const groups: Record<number, RecordedEvent[]> = {};
  for (const e of events) {
    const bucket = Math.floor(e.timestamp / bucketMs) * bucketMs;
    if (!groups[bucket]) groups[bucket] = [];
    groups[bucket].push(e);
  }
  return groups;
}

export function filterByTypes(events: RecordedEvent[], types: string[]): RecordedEvent[] {
  const typeSet = new Set(types);
  return events.filter((e) => typeSet.has(e.type));
}

export function filterByTimeRange(
  events: RecordedEvent[],
  from: number,
  to: number,
): RecordedEvent[] {
  return events.filter((e) => e.timestamp >= from && e.timestamp <= to);
}

export function serializeLog(log: EventLog): string {
  return JSON.stringify(log.getAll());
}

export function deserializeLog(data: string): EventLog {
  const parsed: RecordedEvent[] = JSON.parse(data);
  const log = createEventLog();
  for (const e of parsed) {
    // Directly push via append but override id/timestamp by patching after
    const appended = log.append({ type: e.type, payload: e.payload, metadata: e.metadata });
    // We need to restore original id and timestamp — replace last element
    const all = log.getAll();
    // Since we can't set directly, we clear and re-build using a trick:
    // We'll use a different internal mechanism
    void appended;
    void all;
  }
  // Re-implement: clear and rebuild properly
  log.clear();

  // We need a log that holds events with their original ids/timestamps
  // Use createEventLog internals won't let us override id/timestamp.
  // Build a custom log from scratch that holds the parsed events.
  return createEventLogFromEvents(parsed);
}

function createEventLogFromEvents(initial: RecordedEvent[]): EventLog {
  const events: RecordedEvent[] = [...initial];

  return {
    append(event: Omit<RecordedEvent, 'id' | 'timestamp'>): RecordedEvent {
      const recorded: RecordedEvent = {
        id: generateId(),
        timestamp: Date.now(),
        ...event,
      };
      events.push(recorded);
      return recorded;
    },

    getAll(): RecordedEvent[] {
      return [...events];
    },

    getById(id: string): RecordedEvent | undefined {
      return events.find((e) => e.id === id);
    },

    getByType(type: string): RecordedEvent[] {
      return events.filter((e) => e.type === type);
    },

    getAfter(timestamp: number): RecordedEvent[] {
      return events.filter((e) => e.timestamp > timestamp);
    },

    getBefore(timestamp: number): RecordedEvent[] {
      return events.filter((e) => e.timestamp < timestamp);
    },

    getBetween(from: number, to: number): RecordedEvent[] {
      return events.filter((e) => e.timestamp >= from && e.timestamp <= to);
    },

    count(): number {
      return events.length;
    },

    clear(): void {
      events.length = 0;
    },

    slice(from: number, to?: number): RecordedEvent[] {
      return events.slice(from, to);
    },
  };
}
