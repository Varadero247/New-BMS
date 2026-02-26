// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export type Transform<A, B> = (input: A) => B;
export type AsyncTransform<A, B> = (input: A) => Promise<B>;
export type Predicate<T> = (input: T) => boolean;
export type Middleware<T> = (input: T, next: (input: T) => T) => T;

export function pipe<A, B>(a: A, fn: Transform<A, B>): B;
export function pipe<A, B, C>(a: A, fn1: Transform<A, B>, fn2: Transform<B, C>): C;
export function pipe<A, B, C, D>(a: A, fn1: Transform<A, B>, fn2: Transform<B, C>, fn3: Transform<C, D>): D;
export function pipe(input: unknown, ...fns: Array<Transform<unknown, unknown>>): unknown {
  return fns.reduce((acc, fn) => fn(acc), input);
}

export function compose<A, B>(fn: Transform<A, B>): Transform<A, B>;
export function compose<A, B, C>(fn2: Transform<B, C>, fn1: Transform<A, B>): Transform<A, C>;
export function compose(...fns: Array<Transform<unknown, unknown>>): Transform<unknown, unknown> {
  return (input: unknown) => [...fns].reverse().reduce((acc, fn) => fn(acc), input);
}

export function createPipeline<T>(...steps: Array<Transform<T, T>>): Transform<T, T> {
  return (input: T) => steps.reduce((acc, step) => step(acc), input);
}

export async function asyncPipe<A>(
  input: A,
  ...fns: Array<AsyncTransform<unknown, unknown>>
): Promise<unknown> {
  let result: unknown = input;
  for (const fn of fns) result = await fn(result);
  return result;
}

export function createMiddlewareChain<T>(...middlewares: Array<Middleware<T>>): Transform<T, T> {
  return (input: T) => {
    const execute = (index: number, value: T): T => {
      if (index >= middlewares.length) return value;
      return middlewares[index](value, (v) => execute(index + 1, v));
    };
    return execute(0, input);
  };
}

export function filterPipeline<T>(predicate: Predicate<T>): Transform<T[], T[]> {
  return (items) => items.filter(predicate);
}

export function mapPipeline<T, R>(transform: Transform<T, R>): Transform<T[], R[]> {
  return (items) => items.map(transform);
}

export function reducePipeline<T, R>(reducer: (acc: R, item: T) => R, initial: R): Transform<T[], R> {
  return (items) => items.reduce(reducer, initial);
}

export function tapPipeline<T>(fn: (item: T) => void): Transform<T, T> {
  return (item) => { fn(item); return item; };
}

export function branchPipeline<T>(
  condition: Predicate<T>,
  ifTrue: Transform<T, T>,
  ifFalse: Transform<T, T>
): Transform<T, T> {
  return (input) => condition(input) ? ifTrue(input) : ifFalse(input);
}

export function retry<T>(
  fn: Transform<T, T>,
  attempts: number
): Transform<T, T> {
  return (input) => {
    for (let i = 0; i < attempts; i++) {
      try { return fn(input); } catch { if (i === attempts - 1) throw new Error('All retries failed'); }
    }
    throw new Error('Unexpected');
  };
}

export function cache<T, R>(fn: Transform<T, R>): Transform<T, R> {
  const memo = new Map<string, R>();
  return (input) => {
    const key = JSON.stringify(input);
    if (memo.has(key)) return memo.get(key)!;
    const result = fn(input);
    memo.set(key, result);
    return result;
  };
}

export function batch<T, R>(fn: Transform<T[], R[]>, size: number): Transform<T[], R[]> {
  return (items) => {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += size) {
      results.push(...fn(items.slice(i, i + size)));
    }
    return results;
  };
}

export function validate<T>(
  predicate: Predicate<T>,
  errorMessage: string
): Transform<T, T> {
  return (input) => {
    if (!predicate(input)) throw new Error(errorMessage);
    return input;
  };
}

export function defaultValue<T>(value: T): Transform<T | null | undefined, T> {
  return (input) => input ?? value;
}

export function limit<T>(count: number): Transform<T[], T[]> {
  return (items) => items.slice(0, count);
}

export function skip<T>(count: number): Transform<T[], T[]> {
  return (items) => items.slice(count);
}

export function flatten<T>(): Transform<T[][], T[]> {
  return (items) => items.flat();
}

export function chunk<T>(size: number): Transform<T[], T[][]> {
  return (items) => {
    const result: T[][] = [];
    for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
    return result;
  };
}
