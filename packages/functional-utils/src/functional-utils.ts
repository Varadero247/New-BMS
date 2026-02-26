// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export const identity = <T>(x: T): T => x;
export const constant = <T>(x: T) => (_: unknown): T => x;
export const noop = (): void => {};
export const always = <T>(x: T) => (): T => x;

export function curry2<A, B, R>(fn: (a: A, b: B) => R): (a: A) => (b: B) => R {
  return (a: A) => (b: B) => fn(a, b);
}

export function curry3<A, B, C, R>(fn: (a: A, b: B, c: C) => R): (a: A) => (b: B) => (c: C) => R {
  return (a: A) => (b: B) => (c: C) => fn(a, b, c);
}

export function partial<A, B, R>(fn: (a: A, b: B) => R, a: A): (b: B) => R {
  return (b: B) => fn(a, b);
}

export function pipe<A, B>(a: A, fn: (a: A) => B): B;
export function pipe<A, B, C>(a: A, fn1: (a: A) => B, fn2: (b: B) => C): C;
export function pipe<A, B, C, D>(a: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): D;
export function pipe(a: unknown, ...fns: Array<(x: unknown) => unknown>): unknown {
  return fns.reduce((v, fn) => fn(v), a);
}

export function compose<A, B, C>(f: (b: B) => C, g: (a: A) => B): (a: A) => C {
  return (a: A) => f(g(a));
}

export function flip<A, B, R>(fn: (a: A, b: B) => R): (b: B, a: A) => R {
  return (b, a) => fn(a, b);
}

export function memoize<A, R>(fn: (a: A) => R): (a: A) => R {
  const cache = new Map<A, R>();
  return (a: A) => {
    if (cache.has(a)) return cache.get(a) as R;
    const result = fn(a);
    cache.set(a, result);
    return result;
  };
}

export function once<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  let called = false;
  let result: R;
  return (...args: A) => {
    if (!called) { called = true; result = fn(...args); }
    return result;
  };
}

export function tryCatch<T>(fn: () => T): { success: true; value: T } | { success: false; error: unknown } {
  try { return { success: true, value: fn() }; }
  catch (e) { return { success: false, error: e }; }
}

export function tryCatchAsync<T>(fn: () => Promise<T>): Promise<{ success: true; value: T } | { success: false; error: unknown }> {
  return fn().then(value => ({ success: true as const, value })).catch(error => ({ success: false as const, error }));
}

/** Maybe monad */
export type Maybe<T> = { _tag: 'Some'; value: T } | { _tag: 'None' };

export const some = <T>(value: T): Maybe<T> => ({ _tag: 'Some', value });
export const none = (): Maybe<never> => ({ _tag: 'None' });
export const fromNullable = <T>(value: T | null | undefined): Maybe<T> =>
  value == null ? none() : some(value);

export function mapMaybe<T, R>(m: Maybe<T>, fn: (v: T) => R): Maybe<R> {
  return m._tag === 'Some' ? some(fn(m.value)) : none();
}

export function flatMapMaybe<T, R>(m: Maybe<T>, fn: (v: T) => Maybe<R>): Maybe<R> {
  return m._tag === 'Some' ? fn(m.value) : none();
}

export function getOrElse<T>(m: Maybe<T>, fallback: T): T {
  return m._tag === 'Some' ? m.value : fallback;
}

export function isSome<T>(m: Maybe<T>): m is { _tag: 'Some'; value: T } { return m._tag === 'Some'; }
export function isNone<T>(m: Maybe<T>): boolean { return m._tag === 'None'; }

/** Either monad */
export type Either<L, R> = { _tag: 'Left'; left: L } | { _tag: 'Right'; right: R };

export const left = <L>(l: L): Either<L, never> => ({ _tag: 'Left', left: l });
export const right = <R>(r: R): Either<never, R> => ({ _tag: 'Right', right: r });

export function mapRight<L, R, R2>(e: Either<L, R>, fn: (r: R) => R2): Either<L, R2> {
  return e._tag === 'Right' ? right(fn(e.right)) : e;
}

export function mapLeft<L, R, L2>(e: Either<L, R>, fn: (l: L) => L2): Either<L2, R> {
  return e._tag === 'Left' ? left(fn(e.left)) : e;
}

export function fold<L, R, T>(e: Either<L, R>, onLeft: (l: L) => T, onRight: (r: R) => T): T {
  return e._tag === 'Left' ? onLeft(e.left) : onRight(e.right);
}

export function isRight<L, R>(e: Either<L, R>): e is { _tag: 'Right'; right: R } { return e._tag === 'Right'; }
export function isLeft<L, R>(e: Either<L, R>): e is { _tag: 'Left'; left: L } { return e._tag === 'Left'; }

/** Iteration helpers */
export function iterate<T>(seed: T, fn: (x: T) => T, count: number): T[] {
  const result: T[] = [seed];
  let current = seed;
  for (let i = 1; i < count; i++) {
    current = fn(current);
    result.push(current);
  }
  return result;
}

export function unfold<T, S>(seed: S, fn: (s: S) => { value: T; next: S } | null, maxIterations = 1000): T[] {
  const result: T[] = [];
  let state = seed;
  for (let i = 0; i < maxIterations; i++) {
    const step = fn(state);
    if (!step) break;
    result.push(step.value);
    state = step.next;
  }
  return result;
}

export function applyN<T>(fn: (x: T) => T, n: number, x: T): T {
  let result = x;
  for (let i = 0; i < n; i++) result = fn(result);
  return result;
}

export function complement<A extends unknown[]>(fn: (...args: A) => boolean): (...args: A) => boolean {
  return (...args: A) => !fn(...args);
}

export function juxt<A, R>(fns: Array<(a: A) => R>): (a: A) => R[] {
  return (a: A) => fns.map(fn => fn(a));
}
