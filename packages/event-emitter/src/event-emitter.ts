// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type Listener<T = unknown> = (data: T) => void;
export type WildcardListener = (event: string, data: unknown) => void;

export interface EmitterOptions {
  maxListeners?: number;
  captureRejections?: boolean;
}

export interface ListenerInfo {
  event: string;
  count: number;
}

interface ListenerEntry<T = unknown> {
  fn: Listener<T>;
  once: boolean;
}

interface WildcardEntry {
  fn: WildcardListener;
  once: boolean;
}

export class EventEmitter<Events extends Record<string, unknown> = Record<string, unknown>> {
  protected _listeners: Map<string, Array<ListenerEntry<any>>>;
  protected _wildcards: Array<WildcardEntry>;
  protected _maxListeners: number;

  constructor(opts?: EmitterOptions) {
    this._listeners = new Map();
    this._wildcards = [];
    this._maxListeners = opts?.maxListeners ?? 100;
  }

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): this {
    const key = event as string;
    if (!this._listeners.has(key)) {
      this._listeners.set(key, []);
    }
    const arr = this._listeners.get(key)!;
    if (arr.length >= this._maxListeners) {
      console.warn(
        `[EventEmitter] MaxListeners (${this._maxListeners}) exceeded for event "${key}". ` +
        `This may indicate a memory leak.`
      );
    }
    arr.push({ fn: listener, once: false });
    return this;
  }

  once<K extends keyof Events>(event: K, listener: Listener<Events[K]>): this {
    const key = event as string;
    if (!this._listeners.has(key)) {
      this._listeners.set(key, []);
    }
    const arr = this._listeners.get(key)!;
    if (arr.length >= this._maxListeners) {
      console.warn(
        `[EventEmitter] MaxListeners (${this._maxListeners}) exceeded for event "${key}". ` +
        `This may indicate a memory leak.`
      );
    }
    arr.push({ fn: listener, once: true });
    return this;
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): this {
    const key = event as string;
    const arr = this._listeners.get(key);
    if (!arr) return this;
    const idx = arr.findIndex((e) => e.fn === listener);
    if (idx !== -1) arr.splice(idx, 1);
    if (arr.length === 0) this._listeners.delete(key);
    return this;
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): boolean {
    const key = event as string;
    const arr = this._listeners.get(key);
    let called = false;

    if (arr && arr.length > 0) {
      // Snapshot to handle removals during iteration
      const snapshot = arr.slice();
      const toRemove: number[] = [];
      for (let i = 0; i < snapshot.length; i++) {
        const entry = snapshot[i];
        entry.fn(data);
        called = true;
        if (entry.once) toRemove.push(i);
      }
      // Remove once listeners (in reverse to preserve indices)
      if (toRemove.length > 0) {
        const remaining = arr.filter((e) => !(e.once && snapshot.includes(e)));
        if (remaining.length === 0) {
          this._listeners.delete(key);
        } else {
          this._listeners.set(key, remaining);
        }
      }
    }

    // Wildcard listeners
    if (this._wildcards.length > 0) {
      const wcSnapshot = this._wildcards.slice();
      const wcToRemove: WildcardEntry[] = [];
      for (const entry of wcSnapshot) {
        entry.fn(key, data);
        called = true;
        if (entry.once) wcToRemove.push(entry);
      }
      if (wcToRemove.length > 0) {
        this._wildcards = this._wildcards.filter((e) => !wcToRemove.includes(e));
      }
    }

    return called;
  }

  onAny(listener: WildcardListener): this {
    this._wildcards.push({ fn: listener, once: false });
    return this;
  }

  offAny(listener: WildcardListener): this {
    const idx = this._wildcards.findIndex((e) => e.fn === listener);
    if (idx !== -1) this._wildcards.splice(idx, 1);
    return this;
  }

  removeAllListeners(event?: string): this {
    if (event !== undefined) {
      this._listeners.delete(event);
    } else {
      this._listeners.clear();
      this._wildcards = [];
    }
    return this;
  }

  listenerCount(event: string): number {
    return this._listeners.get(event)?.length ?? 0;
  }

  listeners(event: string): Listener<any>[] {
    return (this._listeners.get(event) ?? []).map((e) => e.fn);
  }

  eventNames(): string[] {
    return Array.from(this._listeners.keys());
  }

  getMaxListeners(): number {
    return this._maxListeners;
  }

  setMaxListeners(n: number): this {
    this._maxListeners = n;
    return this;
  }

  waitFor<K extends keyof Events>(event: K, timeoutMs?: number): Promise<Events[K]> {
    return new Promise<Events[K]>((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const listener: Listener<Events[K]> = (data) => {
        if (timer !== undefined) clearTimeout(timer);
        resolve(data);
      };
      this.once(event, listener);
      if (timeoutMs !== undefined && timeoutMs > 0) {
        timer = setTimeout(() => {
          this.off(event, listener);
          reject(new Error(`waitFor("${String(event)}") timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }
    });
  }

  pipe(source: EventEmitter<any>, events?: string[]): this {
    const names = events ?? source.eventNames();
    for (const name of names) {
      source.on(name as any, (data: unknown) => {
        this.emit(name as any, data as any);
      });
    }
    return this;
  }

  clone(): EventEmitter<Events> {
    const copy = new EventEmitter<Events>({ maxListeners: this._maxListeners });
    for (const [key, arr] of this._listeners.entries()) {
      copy._listeners.set(key, arr.map((e) => ({ fn: e.fn, once: e.once })));
    }
    copy._wildcards = this._wildcards.map((e) => ({ fn: e.fn, once: e.once }));
    return copy;
  }

  listenerInfo(): ListenerInfo[] {
    const result: ListenerInfo[] = [];
    for (const [event, arr] of this._listeners.entries()) {
      result.push({ event, count: arr.length });
    }
    return result;
  }
}

// ─── Functional helpers ───────────────────────────────────────────────────────

export function createEmitter<Events extends Record<string, unknown> = Record<string, unknown>>(
  opts?: EmitterOptions
): EventEmitter<Events> {
  return new EventEmitter<Events>(opts);
}

export function mixin<T extends object>(
  target: T
): T & Pick<EventEmitter, 'on' | 'off' | 'once' | 'emit'> {
  const emitter = new EventEmitter();
  const mixed = target as T & Pick<EventEmitter, 'on' | 'off' | 'once' | 'emit'>;
  mixed.on = emitter.on.bind(emitter);
  mixed.off = emitter.off.bind(emitter);
  mixed.once = emitter.once.bind(emitter);
  mixed.emit = emitter.emit.bind(emitter);
  return mixed;
}

export function throttledEmit<T>(
  emitter: EventEmitter<any>,
  event: string,
  data: T,
  intervalMs: number,
  lastCallTime: { t: number }
): boolean {
  const now = Date.now();
  if (now - lastCallTime.t >= intervalMs) {
    lastCallTime.t = now;
    return emitter.emit(event as any, data as any);
  }
  return false;
}

export function debounceListener<T>(listener: Listener<T>, waitMs: number): Listener<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return function debounced(data: T): void {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      listener(data);
    }, waitMs);
  };
}

export function batchEmissions<T>(
  emitter: EventEmitter<any>,
  sourceEvent: string,
  targetEvent: string,
  delayMs: number
): () => void {
  const buffer: T[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;

  const handler = (data: T) => {
    buffer.push(data);
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      const batch = buffer.splice(0);
      emitter.emit(targetEvent as any, batch as any);
      timer = undefined;
    }, delayMs);
  };

  emitter.on(sourceEvent as any, handler as any);

  return () => {
    emitter.off(sourceEvent as any, handler as any);
    if (timer !== undefined) clearTimeout(timer);
  };
}

export function toAsyncIterable<T>(emitter: EventEmitter<any>, event: string): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator](): AsyncIterator<T> {
      const queue: T[] = [];
      const resolvers: Array<(result: IteratorResult<T>) => void> = [];
      let done = false;

      const handler = (data: T) => {
        if (resolvers.length > 0) {
          const resolve = resolvers.shift()!;
          resolve({ value: data, done: false });
        } else {
          queue.push(data);
        }
      };

      emitter.on(event as any, handler as any);

      return {
        next(): Promise<IteratorResult<T>> {
          if (done) return Promise.resolve({ value: undefined as any, done: true });
          if (queue.length > 0) {
            return Promise.resolve({ value: queue.shift()!, done: false });
          }
          return new Promise<IteratorResult<T>>((resolve) => {
            resolvers.push(resolve);
          });
        },
        return(): Promise<IteratorResult<T>> {
          done = true;
          emitter.off(event as any, handler as any);
          return Promise.resolve({ value: undefined as any, done: true });
        },
      };
    },
  };
}

// ─── PriorityEmitter ─────────────────────────────────────────────────────────

interface PriorityEntry {
  fn: Listener<any>;
  once: boolean;
  priority: number;
}

export class PriorityEmitter extends EventEmitter {
  private _priority: Map<string, PriorityEntry[]> = new Map();

  onPriority(event: string, listener: Listener<any>, priority: number): this {
    if (!this._priority.has(event)) {
      this._priority.set(event, []);
    }
    const arr = this._priority.get(event)!;
    arr.push({ fn: listener, once: false, priority });
    // Sort descending by priority (highest first)
    arr.sort((a, b) => b.priority - a.priority);
    return this;
  }

  override emit<K extends keyof Record<string, unknown>>(event: K, data: Record<string, unknown>[K]): boolean {
    const key = event as string;
    const priorityArr = this._priority.get(key);
    let called = false;

    if (priorityArr && priorityArr.length > 0) {
      const snapshot = priorityArr.slice();
      for (const entry of snapshot) {
        entry.fn(data);
        called = true;
      }
      // Remove once entries
      this._priority.set(key, priorityArr.filter((e) => !e.once));
    }

    // Also call normal listeners
    const normalCalled = super.emit(event, data);
    return called || normalCalled;
  }
}

// ─── NamespacedEmitter ───────────────────────────────────────────────────────

export class NamespacedEmitter extends EventEmitter {
  public namespace: string;
  private _parent?: EventEmitter<any>;

  constructor(namespace: string, parent?: EventEmitter<any>) {
    super();
    this.namespace = namespace;
    this._parent = parent;
  }

  private _prefix(event: string): string {
    return `${this.namespace}:${event}`;
  }

  override on<K extends keyof Record<string, unknown>>(
    event: K,
    listener: Listener<Record<string, unknown>[K]>
  ): this {
    const prefixed = this._prefix(event as string) as K;
    super.on(prefixed, listener);
    if (this._parent) {
      this._parent.on(prefixed as any, listener as any);
    }
    return this;
  }

  override emit<K extends keyof Record<string, unknown>>(
    event: K,
    data: Record<string, unknown>[K]
  ): boolean {
    const prefixed = this._prefix(event as string) as K;
    const result = super.emit(prefixed, data);
    if (this._parent) {
      this._parent.emit(prefixed as any, data as any);
    }
    return result;
  }

  override once<K extends keyof Record<string, unknown>>(
    event: K,
    listener: Listener<Record<string, unknown>[K]>
  ): this {
    const prefixed = this._prefix(event as string) as K;
    super.once(prefixed, listener);
    return this;
  }

  override off<K extends keyof Record<string, unknown>>(
    event: K,
    listener: Listener<Record<string, unknown>[K]>
  ): this {
    const prefixed = this._prefix(event as string) as K;
    super.off(prefixed, listener);
    if (this._parent) {
      this._parent.off(prefixed as any, listener as any);
    }
    return this;
  }
}
