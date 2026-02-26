// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ─── Observer / Observable ───────────────────────────────────────────────────

export interface Observer<T> {
  next(value: T): void;
  error?(err: unknown): void;
  complete?(): void;
}

export interface Subscription {
  unsubscribe(): void;
  closed: boolean;
}

export interface Observable<T> {
  subscribe(observer: Observer<T>): Subscription;
}

export function createObservable<T>(
  setup: (observer: Observer<T>) => void | (() => void)
): Observable<T> {
  return {
    subscribe(observer: Observer<T>): Subscription {
      let closed = false;
      const sub: Subscription = {
        get closed() {
          return closed;
        },
        unsubscribe() {
          closed = true;
          if (typeof teardown === "function") {
            teardown();
          }
        },
      };

      const safeObserver: Observer<T> = {
        next(value: T) {
          if (!closed) observer.next(value);
        },
        error(err: unknown) {
          if (!closed) {
            closed = true;
            if (observer.error) observer.error(err);
          }
        },
        complete() {
          if (!closed) {
            closed = true;
            if (observer.complete) observer.complete();
          }
        },
      };

      const teardown = setup(safeObserver);
      return sub;
    },
  };
}

export function createSubject<T>(): {
  observable: Observable<T>;
  next(v: T): void;
  complete(): void;
  error(e: unknown): void;
} {
  const observers: Observer<T>[] = [];
  let completed = false;
  let hasError = false;
  let errorValue: unknown;

  const observable = createObservable<T>((obs) => {
    if (completed) {
      obs.complete?.();
      return;
    }
    if (hasError) {
      obs.error?.(errorValue);
      return;
    }
    observers.push(obs);
    return () => {
      const idx = observers.indexOf(obs);
      if (idx !== -1) observers.splice(idx, 1);
    };
  });

  return {
    observable,
    next(v: T) {
      if (!completed && !hasError) {
        observers.slice().forEach((o) => o.next(v));
      }
    },
    complete() {
      if (!completed && !hasError) {
        completed = true;
        observers.slice().forEach((o) => o.complete?.());
        observers.length = 0;
      }
    },
    error(e: unknown) {
      if (!completed && !hasError) {
        hasError = true;
        errorValue = e;
        observers.slice().forEach((o) => o.error?.(e));
        observers.length = 0;
      }
    },
  };
}

// ─── Event Emitter ────────────────────────────────────────────────────────────

export interface EventEmitter<Events extends Record<string, unknown>> {
  on<K extends keyof Events>(
    event: K,
    handler: (data: Events[K]) => void
  ): () => void;
  off<K extends keyof Events>(
    event: K,
    handler: (data: Events[K]) => void
  ): void;
  emit<K extends keyof Events>(event: K, data: Events[K]): void;
  once<K extends keyof Events>(
    event: K,
    handler: (data: Events[K]) => void
  ): () => void;
  listenerCount<K extends keyof Events>(event: K): number;
  removeAllListeners<K extends keyof Events>(event?: K): void;
}

export function createEmitter<
  Events extends Record<string, unknown>
>(): EventEmitter<Events> {
  const listeners = new Map<keyof Events, Set<(data: unknown) => void>>();

  function getSet(event: keyof Events): Set<(data: unknown) => void> {
    if (!listeners.has(event)) listeners.set(event, new Set());
    return listeners.get(event)!;
  }

  return {
    on<K extends keyof Events>(event: K, handler: (data: Events[K]) => void) {
      getSet(event).add(handler as (data: unknown) => void);
      return () => this.off(event, handler);
    },
    off<K extends keyof Events>(event: K, handler: (data: Events[K]) => void) {
      getSet(event).delete(handler as (data: unknown) => void);
    },
    emit<K extends keyof Events>(event: K, data: Events[K]) {
      getSet(event).forEach((h) => h(data));
    },
    once<K extends keyof Events>(
      event: K,
      handler: (data: Events[K]) => void
    ) {
      const wrapper = (data: unknown) => {
        handler(data as Events[K]);
        getSet(event).delete(wrapper);
      };
      getSet(event).add(wrapper);
      return () => getSet(event).delete(wrapper);
    },
    listenerCount<K extends keyof Events>(event: K) {
      return listeners.has(event) ? listeners.get(event)!.size : 0;
    },
    removeAllListeners<K extends keyof Events>(event?: K) {
      if (event !== undefined) {
        listeners.delete(event);
      } else {
        listeners.clear();
      }
    },
  };
}

// ─── Pub/Sub ──────────────────────────────────────────────────────────────────

export function createPubSub<T>(): {
  publish(topic: string, data: T): void;
  subscribe(topic: string, handler: (data: T) => void): () => void;
  unsubscribe(topic: string, handler: (data: T) => void): void;
  getSubscriberCount(topic: string): number;
} {
  const topics = new Map<string, Set<(data: T) => void>>();

  function getSet(topic: string): Set<(data: T) => void> {
    if (!topics.has(topic)) topics.set(topic, new Set());
    return topics.get(topic)!;
  }

  return {
    publish(topic: string, data: T) {
      getSet(topic).forEach((h) => h(data));
    },
    subscribe(topic: string, handler: (data: T) => void) {
      getSet(topic).add(handler);
      return () => this.unsubscribe(topic, handler);
    },
    unsubscribe(topic: string, handler: (data: T) => void) {
      getSet(topic).delete(handler);
    },
    getSubscriberCount(topic: string) {
      return topics.has(topic) ? topics.get(topic)!.size : 0;
    },
  };
}

// ─── Reactive Store ───────────────────────────────────────────────────────────

export function createReactiveStore<T>(initial: T): {
  get(): T;
  set(value: T): void;
  update(fn: (prev: T) => T): void;
  watch(listener: (value: T, prev: T) => void): () => void;
} {
  let current = initial;
  const watchers = new Set<(value: T, prev: T) => void>();

  return {
    get() {
      return current;
    },
    set(value: T) {
      const prev = current;
      current = value;
      watchers.forEach((w) => w(current, prev));
    },
    update(fn: (prev: T) => T) {
      const prev = current;
      current = fn(current);
      watchers.forEach((w) => w(current, prev));
    },
    watch(listener: (value: T, prev: T) => void) {
      watchers.add(listener);
      return () => watchers.delete(listener);
    },
  };
}

// ─── Debounce ─────────────────────────────────────────────────────────────────

export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (...args: A) {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delay);
  };
}

// ─── Throttle ─────────────────────────────────────────────────────────────────

export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  interval: number
): (...args: A) => void {
  let lastCall = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (...args: A) {
    const now = Date.now();
    const remaining = interval - (now - lastCall);
    if (remaining <= 0) {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      lastCall = now;
      fn(...args);
    } else {
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(() => {
        lastCall = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  };
}
