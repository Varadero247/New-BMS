export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  timestamp: number;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface EventStore {
  events: DomainEvent[];
}

export interface Snapshot<T> {
  aggregateId: string;
  aggregateType: string;
  version: number;
  timestamp: number;
  state: T;
}

export interface Projection<T> {
  id: string;
  state: T;
  lastEventVersion: number;
}

export type EventHandler<T> = (state: T, event: DomainEvent) => T;
export type Reducer<T> = (state: T, event: DomainEvent) => T;
