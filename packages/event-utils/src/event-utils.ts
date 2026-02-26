// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { randomUUID } from 'crypto';
import type {
  EventHandler,
  UnsubscribeFn,
  EventEmitterOptions,
  EmitterStats,
  DebouncedFn,
  ThrottledFn,
  Subscription,
} from './types';

// ---------------------------------------------------------------------------
// EventEmitter
// ---------------------------------------------------------------------------

export class EventEmitter<Events extends Record<string, unknown> = Record<string, unknown>> {
  private _listeners: Map<keyof Events, Set<EventHandler<unknown>>> = new Map();
  private _onceListeners: Map<keyof Events, Set<EventHandler<unknown>>> = new Map();
  private _maxListeners: number;
  private _onError: ((err: Error) => void) | undefined;
  private _eventCounts: Record<string, number> = {};
  private _totalEmitted = 0;

  constructor(options: EventEmitterOptions = {}) {
    this._maxListeners = options.maxListeners ?? 10;
    this._onError = options.onError;
  }

  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): UnsubscribeFn {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    const set = this._listeners.get(event)!;
    set.add(handler as EventHandler<unknown>);
    return () => this.off(event, handler);
  }

  once<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): UnsubscribeFn {
    if (!this._onceListeners.has(event)) {
      this._onceListeners.set(event, new Set());
    }
    const set = this._onceListeners.get(event)!;
    set.add(handler as EventHandler<unknown>);
    return () => {
      set.delete(handler as EventHandler<unknown>);
    };
  }

  off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
    this._listeners.get(event)?.delete(handler as EventHandler<unknown>);
    this._onceListeners.get(event)?.delete(handler as EventHandler<unknown>);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const key = event as string;
    this._eventCounts[key] = (this._eventCounts[key] ?? 0) + 1;
    this._totalEmitted++;

    const persistent = this._listeners.get(event);
    if (persistent) {
      for (const handler of persistent) {
        try {
          const result = handler(payload);
          if (result instanceof Promise) {
            result.catch((err: unknown) => {
              const e = err instanceof Error ? err : new Error(String(err));
              if (this._onError) this._onError(e);
            });
          }
        } catch (err) {
          const e = err instanceof Error ? err : new Error(String(err));
          if (this._onError) this._onError(e);
        }
      }
    }

    const onceSet = this._onceListeners.get(event);
    if (onceSet) {
      const snapshot = [...onceSet];
      onceSet.clear();
      for (const handler of snapshot) {
        try {
          const result = handler(payload);
          if (result instanceof Promise) {
            result.catch((err: unknown) => {
              const e = err instanceof Error ? err : new Error(String(err));
              if (this._onError) this._onError(e);
            });
          }
        } catch (err) {
          const e = err instanceof Error ? err : new Error(String(err));
          if (this._onError) this._onError(e);
        }
      }
    }
  }

  removeAllListeners(event?: keyof Events): void {
    if (event !== undefined) {
      this._listeners.delete(event);
      this._onceListeners.delete(event);
    } else {
      this._listeners.clear();
      this._onceListeners.clear();
    }
  }

  listenerCount(event: keyof Events): number {
    return (
      (this._listeners.get(event)?.size ?? 0) +
      (this._onceListeners.get(event)?.size ?? 0)
    );
  }

  eventNames(): Array<keyof Events> {
    const names = new Set<keyof Events>();
    for (const k of this._listeners.keys()) names.add(k);
    for (const k of this._onceListeners.keys()) names.add(k);
    return [...names];
  }

  getMaxListeners(): number {
    return this._maxListeners;
  }

  setMaxListeners(n: number): void {
    this._maxListeners = n;
  }

  getStats(): EmitterStats {
    const listenerCounts: Record<string, number> = {};
    for (const [k, v] of this._listeners) {
      listenerCounts[k as string] = (listenerCounts[k as string] ?? 0) + v.size;
    }
    for (const [k, v] of this._onceListeners) {
      listenerCounts[k as string] = (listenerCounts[k as string] ?? 0) + v.size;
    }
    return {
      eventCounts: { ...this._eventCounts },
      listenerCounts,
      totalEmitted: this._totalEmitted,
    };
  }
}

// ---------------------------------------------------------------------------
// debounce
// ---------------------------------------------------------------------------

export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export function debounce<T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number,
  options: DebounceOptions = {},
): DebouncedFn<T> {
  const { leading = false, trailing = true, maxWait } = options;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let maxTimer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: T | null = null;
  let leadingCalled = false;
  let _pending = false;

  const clearTimers = () => {
    if (timer !== null) { clearTimeout(timer); timer = null; }
    if (maxTimer !== null) { clearTimeout(maxTimer); maxTimer = null; }
  };

  const invokeTrailing = () => {
    if (trailing && lastArgs !== null) {
      fn(...lastArgs);
    }
    lastArgs = null;
    leadingCalled = false;
    _pending = false;
    clearTimers();
  };

  const debouncedFn = (...args: T): void => {
    lastArgs = args;
    _pending = true;

    if (leading && !leadingCalled) {
      leadingCalled = true;
      fn(...args);
      if (!trailing) {
        lastArgs = null;
      }
    }

    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      invokeTrailing();
    }, delay);

    if (maxWait !== undefined && maxTimer === null) {
      maxTimer = setTimeout(() => {
        invokeTrailing();
      }, maxWait);
    }
  };

  debouncedFn.cancel = () => {
    clearTimers();
    lastArgs = null;
    leadingCalled = false;
    _pending = false;
  };

  debouncedFn.flush = () => {
    if (timer !== null) {
      clearTimers();
      invokeTrailing();
    }
  };

  debouncedFn.pending = () => _pending;

  return debouncedFn as DebouncedFn<T>;
}

// ---------------------------------------------------------------------------
// throttle
// ---------------------------------------------------------------------------

export function throttle<T extends unknown[]>(
  fn: (...args: T) => void,
  interval: number,
): ThrottledFn<T> {
  let lastCall = -Infinity;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const throttledFn = (...args: T): void => {
    const now = Date.now();
    const remaining = interval - (now - lastCall);
    if (remaining <= 0) {
      if (timer !== null) { clearTimeout(timer); timer = null; }
      lastCall = now;
      fn(...args);
    } else if (timer === null) {
      timer = setTimeout(() => {
        lastCall = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  };

  throttledFn.cancel = () => {
    if (timer !== null) { clearTimeout(timer); timer = null; }
    lastCall = -Infinity;
  };

  return throttledFn as ThrottledFn<T>;
}

// ---------------------------------------------------------------------------
// memoize
// ---------------------------------------------------------------------------

export function memoize<T extends unknown[], R>(
  fn: (...args: T) => R,
  keyFn?: (...args: T) => string,
): (...args: T) => R {
  const cache = new Map<string, R>();
  return (...args: T): R => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    if (cache.has(key)) return cache.get(key) as R;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// ---------------------------------------------------------------------------
// once
// ---------------------------------------------------------------------------

export function once<T extends unknown[], R>(fn: (...args: T) => R): (...args: T) => R | undefined {
  let called = false;
  let result: R;
  return (...args: T): R | undefined => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}

// ---------------------------------------------------------------------------
// retry
// ---------------------------------------------------------------------------

export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number,
  delay?: number,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts && delay !== undefined && delay > 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// ---------------------------------------------------------------------------
// timeout
// ---------------------------------------------------------------------------

export function timeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error(`Operation timed out after ${ms}ms`));
      }
    }, ms);

    fn().then(
      (value) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(value);
        }
      },
      (err) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(err);
        }
      },
    );
  });
}

// ---------------------------------------------------------------------------
// createPubSub
// ---------------------------------------------------------------------------

export interface PubSubStats {
  topicCounts: Record<string, number>;
  totalPublished: number;
}

export interface PubSubInstance {
  publish<T>(topic: string, payload: T): void;
  subscribe<T>(topic: string, handler: EventHandler<T>): Subscription;
  unsubscribe(id: string): void;
  topics(): string[];
  getStats(): PubSubStats;
}

export function createPubSub(): PubSubInstance {
  const subscriptions = new Map<string, Map<string, EventHandler<unknown>>>();
  const topicCounts: Record<string, number> = {};
  let totalPublished = 0;

  return {
    publish<T>(topic: string, payload: T): void {
      topicCounts[topic] = (topicCounts[topic] ?? 0) + 1;
      totalPublished++;
      const handlers = subscriptions.get(topic);
      if (!handlers) return;
      for (const handler of handlers.values()) {
        handler(payload as unknown);
      }
    },

    subscribe<T>(topic: string, handler: EventHandler<T>): Subscription {
      if (!subscriptions.has(topic)) {
        subscriptions.set(topic, new Map());
      }
      const id = randomUUID();
      subscriptions.get(topic)!.set(id, handler as EventHandler<unknown>);
      return {
        id,
        topic,
        unsubscribe: () => {
          subscriptions.get(topic)?.delete(id);
        },
      };
    },

    unsubscribe(id: string): void {
      for (const handlers of subscriptions.values()) {
        if (handlers.delete(id)) return;
      }
    },

    topics(): string[] {
      return [...subscriptions.keys()].filter((t) => (subscriptions.get(t)?.size ?? 0) > 0);
    },

    getStats(): PubSubStats {
      return { topicCounts: { ...topicCounts }, totalPublished };
    },
  };
}

// ---------------------------------------------------------------------------
// createEventQueue
// ---------------------------------------------------------------------------

export interface EventQueueItem {
  event: unknown;
  handler: EventHandler<unknown>;
}

export interface EventQueue {
  enqueue<T>(event: T, handler: EventHandler<T>): void;
  drain(): Promise<void>;
  size(): number;
  clear(): void;
}

export function createEventQueue(): EventQueue {
  const queue: EventQueueItem[] = [];
  let draining = false;

  return {
    enqueue<T>(event: T, handler: EventHandler<T>): void {
      queue.push({ event, handler: handler as EventHandler<unknown> });
    },

    async drain(): Promise<void> {
      if (draining) return;
      draining = true;
      while (queue.length > 0) {
        const item = queue.shift()!;
        await Promise.resolve(item.handler(item.event));
      }
      draining = false;
    },

    size(): number {
      return queue.length;
    },

    clear(): void {
      queue.length = 0;
    },
  };
}

// ---------------------------------------------------------------------------
// createEventBuffer
// ---------------------------------------------------------------------------

export interface BufferedEvent {
  event: string;
  payload: unknown;
  timestamp: number;
  id: string;
}

export interface EventBufferSubscriberFn {
  (event: BufferedEvent): void;
}

export interface EventBuffer {
  emit(event: string, payload: unknown): void;
  subscribe(handler: EventBufferSubscriberFn): UnsubscribeFn;
  replay(handler: EventBufferSubscriberFn): void;
  clear(): void;
  size(): number;
}

export function createEventBuffer(maxSize = 100): EventBuffer {
  const buffer: BufferedEvent[] = [];
  const subscribers = new Set<EventBufferSubscriberFn>();

  return {
    emit(event: string, payload: unknown): void {
      const record: BufferedEvent = {
        event,
        payload,
        timestamp: Date.now(),
        id: randomUUID(),
      };
      if (buffer.length >= maxSize) buffer.shift();
      buffer.push(record);
      for (const sub of subscribers) {
        sub(record);
      }
    },

    subscribe(handler: EventBufferSubscriberFn): UnsubscribeFn {
      subscribers.add(handler);
      return () => subscribers.delete(handler);
    },

    replay(handler: EventBufferSubscriberFn): void {
      for (const record of buffer) {
        handler(record);
      }
    },

    clear(): void {
      buffer.length = 0;
    },

    size(): number {
      return buffer.length;
    },
  };
}

// ---------------------------------------------------------------------------
// fromCallback
// ---------------------------------------------------------------------------

export function fromCallback<T>(
  fn: (callback: (err: Error | null, result?: T) => void) => void,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    fn((err, result) => {
      if (err) reject(err);
      else resolve(result as T);
    });
  });
}

// ---------------------------------------------------------------------------
// race (with index)
// ---------------------------------------------------------------------------

export interface RaceResult<T> {
  value: T;
  index: number;
}

export function race<T>(promises: Promise<T>[]): Promise<RaceResult<T>> {
  return new Promise<RaceResult<T>>((resolve, reject) => {
    if (promises.length === 0) {
      reject(new Error('race() requires at least one promise'));
      return;
    }
    promises.forEach((p, index) => {
      Promise.resolve(p).then(
        (value) => resolve({ value, index }),
        (err) => reject(err),
      );
    });
  });
}

// ---------------------------------------------------------------------------
// batch
// ---------------------------------------------------------------------------

export interface BatchFn<T> {
  (payload: T): void;
  flush(): void;
  cancel(): void;
}

export function batch<T>(fn: (payloads: T[]) => void, delay = 0): BatchFn<T> {
  let buffer: T[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (timer !== null) { clearTimeout(timer); timer = null; }
    if (buffer.length > 0) {
      const toSend = buffer.slice();
      buffer = [];
      fn(toSend);
    }
  };

  const batchFn = (payload: T): void => {
    buffer.push(payload);
    if (timer === null) {
      timer = setTimeout(() => {
        timer = null;
        flush();
      }, delay);
    }
  };

  batchFn.flush = flush;

  batchFn.cancel = () => {
    if (timer !== null) { clearTimeout(timer); timer = null; }
    buffer = [];
  };

  return batchFn;
}

// ---------------------------------------------------------------------------
// pipe
// ---------------------------------------------------------------------------

export function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
}

// ---------------------------------------------------------------------------
// compose
// ---------------------------------------------------------------------------

export function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

// ---------------------------------------------------------------------------
// createObservable
// ---------------------------------------------------------------------------

export interface ObservableSubscriber<T> {
  next: (value: T) => void;
  error?: (err: unknown) => void;
  complete?: () => void;
}

export interface Observable<T> {
  subscribe(
    next: (value: T) => void,
    error?: (err: unknown) => void,
    complete?: () => void,
  ): UnsubscribeFn;
}

export function createObservable<T>(
  producer: (subscriber: ObservableSubscriber<T>) => UnsubscribeFn | void,
): Observable<T> {
  return {
    subscribe(next, error?, complete?): UnsubscribeFn {
      let active = true;
      const subscriber: ObservableSubscriber<T> = {
        next: (value) => { if (active) next(value); },
        error: (err) => { if (active) { active = false; error?.(err); } },
        complete: () => { if (active) { active = false; complete?.(); } },
      };
      const cleanup = producer(subscriber);
      return () => {
        active = false;
        if (typeof cleanup === 'function') cleanup();
      };
    },
  };
}

// ---------------------------------------------------------------------------
// fromArray
// ---------------------------------------------------------------------------

export function fromArray<T>(arr: T[], delay = 0): Observable<T> {
  return createObservable<T>((subscriber) => {
    let cancelled = false;
    let index = 0;

    const next = () => {
      if (cancelled) return;
      if (index >= arr.length) {
        subscriber.complete?.();
        return;
      }
      subscriber.next(arr[index++]);
      if (delay > 0) {
        setTimeout(next, delay);
      } else {
        next();
      }
    };

    if (delay > 0) {
      setTimeout(next, delay);
    } else {
      // Use Promise.resolve to allow synchronous but non-blocking emission
      Promise.resolve().then(next);
    }

    return () => { cancelled = true; };
  });
}

// ---------------------------------------------------------------------------
// interval
// ---------------------------------------------------------------------------

export function interval(ms: number): Observable<number> {
  return createObservable<number>((subscriber) => {
    let count = 0;
    const id = setInterval(() => {
      subscriber.next(count++);
    }, ms);
    return () => clearInterval(id);
  });
}

// ---------------------------------------------------------------------------
// take
// ---------------------------------------------------------------------------

export function take<T>(observable: Observable<T>, n: number): Observable<T> {
  return createObservable<T>((subscriber) => {
    let count = 0;
    let unsub: UnsubscribeFn | null = null;

    unsub = observable.subscribe(
      (value) => {
        if (count < n) {
          count++;
          subscriber.next(value);
          if (count >= n) {
            subscriber.complete?.();
            unsub?.();
          }
        }
      },
      (err) => subscriber.error?.(err),
      () => subscriber.complete?.(),
    );

    return () => unsub?.();
  });
}

// ---------------------------------------------------------------------------
// filter
// ---------------------------------------------------------------------------

export function filter<T>(observable: Observable<T>, predicate: (value: T) => boolean): Observable<T> {
  return createObservable<T>((subscriber) => {
    const unsub = observable.subscribe(
      (value) => { if (predicate(value)) subscriber.next(value); },
      (err) => subscriber.error?.(err),
      () => subscriber.complete?.(),
    );
    return unsub;
  });
}
