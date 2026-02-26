// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type EventHandler<T = unknown> = (event: T) => void | Promise<void>;
export type UnsubscribeFn = () => void;

export interface EventEmitterOptions {
  maxListeners?: number;
  onError?: (err: Error) => void;
}

export interface EventRecord {
  event: string;
  payload: unknown;
  timestamp: number;
  id: string;
}

export interface EmitterStats {
  eventCounts: Record<string, number>;
  listenerCounts: Record<string, number>;
  totalEmitted: number;
}

export interface DebouncedFn<T extends unknown[]> {
  (...args: T): void;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
}

export interface ThrottledFn<T extends unknown[]> {
  (...args: T): void;
  cancel: () => void;
}

export interface PubSubMessage<T = unknown> {
  topic: string;
  payload: T;
  timestamp: number;
  id: string;
}

export interface Subscription {
  id: string;
  topic: string;
  unsubscribe: () => void;
}
