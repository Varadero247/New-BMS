// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface Observer<T> {
  next: (value: T) => void;
  error?: (err: unknown) => void;
  complete?: () => void;
}

export interface Subscription {
  unsubscribe(): void;
  readonly closed: boolean;
}

export type OperatorFn<T, R> = (source: Observable<T>) => Observable<R>;
export type UnaryFn<T, R> = (value: T) => R;
export type PredicateFn<T> = (value: T) => boolean;

export class Observable<T> {
  constructor(protected _subscribe: (observer: Observer<T>) => (() => void) | void) {}

  subscribe(observerOrNext: Observer<T> | ((value: T) => void), onError?: (err: unknown) => void, onComplete?: () => void): Subscription {
    const observer: Observer<T> =
      typeof observerOrNext === 'function'
        ? { next: observerOrNext, error: onError, complete: onComplete }
        : observerOrNext;

    let closed = false;
    let cleanup: (() => void) | void;

    const safeObserver: Observer<T> = {
      next: (value) => { if (!closed) observer.next(value); },
      error: (err) => { if (!closed) { closed = true; observer.error?.(err); } },
      complete: () => { if (!closed) { closed = true; observer.complete?.(); } },
    };

    try {
      cleanup = this._subscribe(safeObserver);
    } catch (e) {
      safeObserver.error?.(e);
    }

    return {
      unsubscribe: () => { closed = true; cleanup?.(); },
      get closed() { return closed; },
    };
  }

  pipe<R>(op: OperatorFn<T, R>): Observable<R> {
    return op(this);
  }
}

// Creation operators
export function of<T>(...values: T[]): Observable<T> {
  return new Observable<T>((observer) => {
    for (const value of values) observer.next(value);
    observer.complete?.();
  });
}

export function from<T>(input: T[] | Iterable<T> | Promise<T>): Observable<T> {
  if (input instanceof Promise) {
    return new Observable<T>((observer) => {
      input.then(
        (v) => { observer.next(v); observer.complete?.(); },
        (e) => { observer.error?.(e); }
      );
    });
  }
  return new Observable<T>((observer) => {
    for (const value of input as Iterable<T>) observer.next(value);
    observer.complete?.();
  });
}

export function range(start: number, count: number): Observable<number> {
  return new Observable<number>((observer) => {
    for (let i = 0; i < count; i++) observer.next(start + i);
    observer.complete?.();
  });
}

export function EMPTY(): Observable<never> {
  return new Observable<never>((observer) => { observer.complete?.(); });
}

export function NEVER(): Observable<never> {
  return new Observable<never>(() => { /* never emits */ });
}

export function throwError(error: unknown): Observable<never> {
  return new Observable<never>((observer) => { observer.error?.(error); });
}

export function interval(ms: number): Observable<number> {
  return new Observable<number>((observer) => {
    let count = 0;
    const id = setInterval(() => observer.next(count++), ms);
    return () => clearInterval(id);
  });
}

export function timer(delayMs: number, intervalMs?: number): Observable<number> {
  return new Observable<number>((observer) => {
    let count = 0;
    const id = setTimeout(() => {
      observer.next(count++);
      if (intervalMs !== undefined) {
        const id2 = setInterval(() => observer.next(count++), intervalMs);
        // can't easily cancel this without storing; return a cleanup
      } else {
        observer.complete?.();
      }
    }, delayMs);
    return () => clearTimeout(id);
  });
}

export function defer<T>(factory: () => Observable<T>): Observable<T> {
  return new Observable<T>((observer) => {
    const obs = factory();
    return obs.subscribe(observer).unsubscribe;
  });
}

export function merge<T>(...sources: Observable<T>[]): Observable<T> {
  return new Observable<T>((observer) => {
    let completed = 0;
    const subs = sources.map((src) =>
      src.subscribe({
        next: (v) => observer.next(v),
        error: (e) => observer.error?.(e),
        complete: () => { if (++completed === sources.length) observer.complete?.(); },
      })
    );
    return () => subs.forEach((s) => s.unsubscribe());
  });
}

export function concat<T>(...sources: Observable<T>[]): Observable<T> {
  return new Observable<T>((observer) => {
    let index = 0;
    let sub: Subscription | null = null;
    const subscribeNext = () => {
      if (index >= sources.length) { observer.complete?.(); return; }
      sub = sources[index++].subscribe({
        next: (v) => observer.next(v),
        error: (e) => observer.error?.(e),
        complete: subscribeNext,
      });
    };
    subscribeNext();
    return () => sub?.unsubscribe();
  });
}

export function combineLatest<T extends unknown[]>(sources: { [K in keyof T]: Observable<T[K]> }): Observable<T> {
  return new Observable<T>((observer) => {
    const latest: unknown[] = new Array(sources.length).fill(undefined);
    const hasValue: boolean[] = new Array(sources.length).fill(false);
    let completed = 0;
    const subs = (sources as Observable<unknown>[]).map((src, i) =>
      src.subscribe({
        next: (v) => {
          latest[i] = v;
          hasValue[i] = true;
          if (hasValue.every(Boolean)) observer.next([...latest] as T);
        },
        error: (e) => observer.error?.(e),
        complete: () => { if (++completed === sources.length) observer.complete?.(); },
      })
    );
    return () => subs.forEach((s) => s.unsubscribe());
  });
}

export function zip<T extends unknown[]>(sources: { [K in keyof T]: Observable<T[K]> }): Observable<T> {
  return new Observable<T>((observer) => {
    const buffers: unknown[][] = sources.map(() => []);
    let completed = 0;
    const subs = (sources as Observable<unknown>[]).map((src, i) =>
      src.subscribe({
        next: (v) => {
          buffers[i].push(v);
          if (buffers.every((b) => b.length > 0)) {
            observer.next(buffers.map((b) => b.shift()) as T);
          }
        },
        error: (e) => observer.error?.(e),
        complete: () => { if (++completed === sources.length) observer.complete?.(); },
      })
    );
    return () => subs.forEach((s) => s.unsubscribe());
  });
}
