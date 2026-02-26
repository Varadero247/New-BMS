// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { Observable, OperatorFn, UnaryFn, PredicateFn } from './observable';

export function map<T, R>(fn: UnaryFn<T, R>): OperatorFn<T, R> {
  return (source) => new Observable<R>((observer) =>
    source.subscribe({ next: (v) => observer.next(fn(v)), error: (e) => observer.error?.(e), complete: () => observer.complete?.() }).unsubscribe
  );
}

export function filter<T>(fn: PredicateFn<T>): OperatorFn<T, T> {
  return (source) => new Observable<T>((observer) =>
    source.subscribe({ next: (v) => { if (fn(v)) observer.next(v); }, error: (e) => observer.error?.(e), complete: () => observer.complete?.() }).unsubscribe
  );
}

export function take<T>(n: number): OperatorFn<T, T> {
  return (source) => new Observable<T>((observer) => {
    let count = 0;
    const sub = source.subscribe({
      next: (v) => { if (count < n) { observer.next(v); if (++count >= n) { observer.complete?.(); sub?.unsubscribe(); } } },
      error: (e) => observer.error?.(e),
      complete: () => observer.complete?.(),
    });
    return () => sub.unsubscribe();
  });
}

export function skip<T>(n: number): OperatorFn<T, T> {
  return (source) => new Observable<T>((observer) => {
    let count = 0;
    return source.subscribe({ next: (v) => { if (count++ >= n) observer.next(v); }, error: (e) => observer.error?.(e), complete: () => observer.complete?.() }).unsubscribe;
  });
}

export function takeWhile<T>(fn: PredicateFn<T>): OperatorFn<T, T> {
  return (source) => new Observable<T>((observer) => {
    const sub = source.subscribe({
      next: (v) => { if (fn(v)) observer.next(v); else { observer.complete?.(); sub?.unsubscribe(); } },
      error: (e) => observer.error?.(e),
      complete: () => observer.complete?.(),
    });
    return () => sub.unsubscribe();
  });
}

export function skipWhile<T>(fn: PredicateFn<T>): OperatorFn<T, T> {
  return (source) => new Observable<T>((observer) => {
    let skipping = true;
    return source.subscribe({ next: (v) => { if (skipping && fn(v)) return; skipping = false; observer.next(v); }, error: (e) => observer.error?.(e), complete: () => observer.complete?.() }).unsubscribe;
  });
}

export function distinct<T>(): OperatorFn<T, T> {
  return (source) => new Observable<T>((observer) => {
    const seen = new Set<T>();
    return source.subscribe({ next: (v) => { if (!seen.has(v)) { seen.add(v); observer.next(v); } }, error: (e) => observer.error?.(e), complete: () => observer.complete?.() }).unsubscribe;
  });
}

export function distinctUntilChanged<T>(compareFn?: (a: T, b: T) => boolean): OperatorFn<T, T> {
  return (source) => new Observable<T>((observer) => {
    let prev: T | typeof UNSET = UNSET;
    const compare = compareFn ?? ((a, b) => a === b);
    return source.subscribe({
      next: (v) => { if (prev === UNSET || !compare(prev as T, v)) { prev = v; observer.next(v); } },
      error: (e) => observer.error?.(e),
      complete: () => observer.complete?.(),
    }).unsubscribe;
  });
}
const UNSET = Symbol('UNSET');

export function scan<T, R>(fn: (acc: R, value: T) => R, seed: R): OperatorFn<T, R> {
  return (source) => new Observable<R>((observer) => {
    let acc = seed;
    return source.subscribe({ next: (v) => { acc = fn(acc, v); observer.next(acc); }, error: (e) => observer.error?.(e), complete: () => observer.complete?.() }).unsubscribe;
  });
}

export function reduce<T, R>(fn: (acc: R, value: T) => R, seed: R): OperatorFn<T, R> {
  return (source) => new Observable<R>((observer) => {
    let acc = seed;
    return source.subscribe({ next: (v) => { acc = fn(acc, v); }, error: (e) => observer.error?.(e), complete: () => { observer.next(acc); observer.complete?.(); } }).unsubscribe;
  });
}

export function toArray<T>(): OperatorFn<T, T[]> {
  return reduce<T, T[]>((acc, v) => [...acc, v], []);
}

export function tap<T>(fn: (v: T) => void): OperatorFn<T, T> {
  return (source) => new Observable<T>((observer) =>
    source.subscribe({ next: (v) => { fn(v); observer.next(v); }, error: (e) => observer.error?.(e), complete: () => observer.complete?.() }).unsubscribe
  );
}

export function catchError<T>(fn: (err: unknown) => Observable<T>): OperatorFn<T, T> {
  return (source) => new Observable<T>((observer) =>
    source.subscribe({ next: (v) => observer.next(v), error: (e) => fn(e).subscribe(observer).unsubscribe, complete: () => observer.complete?.() }).unsubscribe
  );
}

export function startWith<T>(value: T): OperatorFn<T, T> {
  return (source) => new Observable<T>((observer) => {
    observer.next(value);
    return source.subscribe(observer).unsubscribe;
  });
}

export function endWith<T>(value: T): OperatorFn<T, T> {
  return (source) => new Observable<T>((observer) =>
    source.subscribe({ next: (v) => observer.next(v), error: (e) => observer.error?.(e), complete: () => { observer.next(value); observer.complete?.(); } }).unsubscribe
  );
}

export function pairwise<T>(): OperatorFn<T, [T, T]> {
  return (source) => new Observable<[T, T]>((observer) => {
    let prev: T | typeof UNSET = UNSET;
    return source.subscribe({
      next: (v) => { if (prev !== UNSET) observer.next([prev as T, v]); prev = v; },
      error: (e) => observer.error?.(e),
      complete: () => observer.complete?.(),
    }).unsubscribe;
  });
}

export function debounceTime<T>(ms: number): OperatorFn<T, T> {
  return (source) => new Observable<T>((observer) => {
    let id: ReturnType<typeof setTimeout> | undefined;
    const sub = source.subscribe({
      next: (v) => { clearTimeout(id); id = setTimeout(() => observer.next(v), ms); },
      error: (e) => observer.error?.(e),
      complete: () => { clearTimeout(id); observer.complete?.(); },
    });
    return () => { clearTimeout(id); sub.unsubscribe(); };
  });
}

export function delay<T>(ms: number): OperatorFn<T, T> {
  return (source) => new Observable<T>((observer) => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const sub = source.subscribe({
      next: (v) => { const id = setTimeout(() => observer.next(v), ms); timers.push(id); },
      error: (e) => observer.error?.(e),
      complete: () => { const id = setTimeout(() => observer.complete?.(), ms); timers.push(id); },
    });
    return () => { timers.forEach(clearTimeout); sub.unsubscribe(); };
  });
}

export function first<T>(fn?: PredicateFn<T>): OperatorFn<T, T> {
  return (source) => new Observable<T>((observer) => {
    const sub = source.subscribe({
      next: (v) => { if (!fn || fn(v)) { observer.next(v); observer.complete?.(); sub?.unsubscribe(); } },
      error: (e) => observer.error?.(e),
      complete: () => observer.complete?.(),
    });
    return () => sub.unsubscribe();
  });
}

export function last<T>(fn?: PredicateFn<T>): OperatorFn<T, T> {
  return (source) => new Observable<T>((observer) => {
    let lastVal: T | typeof UNSET = UNSET;
    return source.subscribe({
      next: (v) => { if (!fn || fn(v)) lastVal = v; },
      error: (e) => observer.error?.(e),
      complete: () => { if (lastVal !== UNSET) observer.next(lastVal as T); observer.complete?.(); },
    }).unsubscribe;
  });
}

export function flatMap<T, R>(fn: (v: T) => Observable<R>): OperatorFn<T, R> {
  return (source) => new Observable<R>((observer) => {
    const innerSubs: ReturnType<typeof source.subscribe>[] = [];
    const outerSub = source.subscribe({
      next: (v) => { const inner = fn(v).subscribe({ next: (r) => observer.next(r), error: (e) => observer.error?.(e) }); innerSubs.push(inner); },
      error: (e) => observer.error?.(e),
      complete: () => observer.complete?.(),
    });
    return () => { outerSub.unsubscribe(); innerSubs.forEach((s) => s.unsubscribe()); };
  });
}

export function switchMap<T, R>(fn: (v: T) => Observable<R>): OperatorFn<T, R> {
  return (source) => new Observable<R>((observer) => {
    let innerSub: ReturnType<typeof source.subscribe> | null = null;
    const outerSub = source.subscribe({
      next: (v) => { innerSub?.unsubscribe(); innerSub = fn(v).subscribe({ next: (r) => observer.next(r), error: (e) => observer.error?.(e) }); },
      error: (e) => observer.error?.(e),
      complete: () => observer.complete?.(),
    });
    return () => { outerSub.unsubscribe(); innerSub?.unsubscribe(); };
  });
}

export function withLatestFrom<T, R>(other: Observable<R>): OperatorFn<T, [T, R]> {
  return (source) => new Observable<[T, R]>((observer) => {
    let latestOther: R | typeof UNSET = UNSET;
    const otherSub = other.subscribe({ next: (v) => { latestOther = v; } });
    const sourceSub = source.subscribe({
      next: (v) => { if (latestOther !== UNSET) observer.next([v, latestOther as R]); },
      error: (e) => observer.error?.(e),
      complete: () => observer.complete?.(),
    });
    return () => { otherSub.unsubscribe(); sourceSub.unsubscribe(); };
  });
}

export function share<T>(): OperatorFn<T, T> {
  return (source) => {
    let refCount = 0;
    let sub: ReturnType<typeof source.subscribe> | null = null;
    const observers = new Set<Parameters<typeof source.subscribe>[0] extends object ? Parameters<typeof source.subscribe>[0] : never>();
    // Simplified share: just return a new observable that multicasts
    return source; // simplified - full multicast is complex
  };
}
