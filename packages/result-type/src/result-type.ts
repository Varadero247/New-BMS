// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ── Option forward declarations ──────────────────────────────────────────────
// (Option types are defined later; we reference them in Result so we need to
// use lazy helpers to avoid circular-declaration issues at the class level.)

// ── Result<T, E> ─────────────────────────────────────────────────────────────

export type Result<T, E = Error> = Ok<T, E> | Err<T, E>;

export class Ok<T, E = Error> {
  readonly ok = true as const;
  readonly err = false as const;

  constructor(readonly value: T) {}

  isOk(): this is Ok<T, E> {
    return true;
  }

  isErr(): this is Err<T, E> {
    return false;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Ok<U, E>(fn(this.value));
  }

  mapErr<F>(_fn: (e: E) => F): Result<T, F> {
    return new Ok<T, F>(this.value);
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  getOrElse(_defaultValue: T): T {
    return this.value;
  }

  getOrThrow(): T {
    return this.value;
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(_def: T): T {
    return this.value;
  }

  match<U>(handlers: { ok: (v: T) => U; err: (e: E) => U }): U {
    return handlers.ok(this.value);
  }

  tap(fn: (value: T) => void): Result<T, E> {
    fn(this.value);
    return this;
  }

  toOption(): Option<T> {
    return new Some<T>(this.value);
  }

  toString(): string {
    return `Ok(${String(this.value)})`;
  }
}

export class Err<T, E = Error> {
  readonly ok = false as const;
  readonly err = true as const;

  constructor(readonly error: E) {}

  isOk(): this is Ok<T, E> {
    return false;
  }

  isErr(): this is Err<T, E> {
    return true;
  }

  map<U>(_fn: (value: T) => U): Result<U, E> {
    return new Err<U, E>(this.error);
  }

  mapErr<F>(fn: (e: E) => F): Result<T, F> {
    return new Err<T, F>(fn(this.error));
  }

  flatMap<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
    return new Err<U, E>(this.error);
  }

  getOrElse(defaultValue: T): T {
    return defaultValue;
  }

  getOrThrow(): never {
    if (this.error instanceof Error) {
      throw this.error;
    }
    throw new Error(String(this.error));
  }

  unwrap(): never {
    return this.getOrThrow();
  }

  unwrapOr(def: T): T {
    return def;
  }

  match<U>(handlers: { ok: (v: T) => U; err: (e: E) => U }): U {
    return handlers.err(this.error);
  }

  tap(_fn: (value: T) => void): Result<T, E> {
    return this;
  }

  toOption(): Option<T> {
    return NONE as None<T>;
  }

  toString(): string {
    return `Err(${String(this.error)})`;
  }
}

// ── Result factory functions ──────────────────────────────────────────────────

export function ok<T, E = Error>(value: T): Ok<T, E> {
  return new Ok<T, E>(value);
}

export function err<T, E = Error>(error: E): Err<T, E> {
  return new Err<T, E>(error);
}

export function tryResult<T>(fn: () => T): Result<T, Error> {
  try {
    return new Ok<T, Error>(fn());
  } catch (e) {
    return new Err<T, Error>(e instanceof Error ? e : new Error(String(e)));
  }
}

export async function tryResultAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
  try {
    return new Ok<T, Error>(await fn());
  } catch (e) {
    return new Err<T, Error>(e instanceof Error ? e : new Error(String(e)));
  }
}

export function all<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  for (const r of results) {
    if (r.isErr()) return new Err<T[], E>(r.error);
    values.push(r.value);
  }
  return new Ok<T[], E>(values);
}

export function any<T, E>(results: Result<T, E>[]): Result<T, E[]> {
  const errors: E[] = [];
  for (const r of results) {
    if (r.isOk()) return new Ok<T, E[]>(r.value);
    errors.push(r.error);
  }
  return new Err<T, E[]>(errors);
}

export function partition<T, E>(results: Result<T, E>[]): { oks: T[]; errs: E[] } {
  const oks: T[] = [];
  const errs: E[] = [];
  for (const r of results) {
    if (r.isOk()) {
      oks.push(r.value);
    } else {
      errs.push(r.error);
    }
  }
  return { oks, errs };
}

// ── Option<T> ────────────────────────────────────────────────────────────────

export type Option<T> = Some<T> | None<T>;

export class Some<T> {
  readonly some = true as const;
  readonly none = false as const;

  constructor(readonly value: T) {}

  isSome(): this is Some<T> {
    return true;
  }

  isNone(): this is None<T> {
    return false;
  }

  map<U>(fn: (value: T) => U): Option<U> {
    return new Some<U>(fn(this.value));
  }

  flatMap<U>(fn: (value: T) => Option<U>): Option<U> {
    return fn(this.value);
  }

  filter(pred: (value: T) => boolean): Option<T> {
    return pred(this.value) ? this : (NONE as None<T>);
  }

  getOrElse(_def: T): T {
    return this.value;
  }

  getOrThrow(_msg?: string): T {
    return this.value;
  }

  match<U>(handlers: { some: (v: T) => U; none: () => U }): U {
    return handlers.some(this.value);
  }

  tap(fn: (value: T) => void): Option<T> {
    fn(this.value);
    return this;
  }

  toResult<E>(_error: E): Result<T, E> {
    return new Ok<T, E>(this.value);
  }

  toArray(): [T] {
    return [this.value];
  }

  toString(): string {
    return `Some(${String(this.value)})`;
  }
}

export class None<T> {
  readonly some = false as const;
  readonly none = true as const;

  isSome(): this is Some<T> {
    return false;
  }

  isNone(): this is None<T> {
    return true;
  }

  map<U>(_fn: (value: T) => U): Option<U> {
    return NONE as None<U>;
  }

  flatMap<U>(_fn: (value: T) => Option<U>): Option<U> {
    return NONE as None<U>;
  }

  filter(_pred: (value: T) => boolean): Option<T> {
    return this;
  }

  getOrElse(def: T): T {
    return def;
  }

  getOrThrow(msg?: string): never {
    throw new Error(msg ?? 'Option.getOrThrow called on None');
  }

  match<U>(handlers: { some: (v: T) => U; none: () => U }): U {
    return handlers.none();
  }

  tap(_fn: (value: T) => void): Option<T> {
    return this;
  }

  toResult<E>(error: E): Result<T, E> {
    return new Err<T, E>(error);
  }

  toArray(): [] {
    return [];
  }

  toString(): string {
    return 'None';
  }
}

// ── Option factory functions ──────────────────────────────────────────────────

export function some<T>(value: T): Some<T> {
  return new Some<T>(value);
}

// Singleton None — cast as needed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NONE: None<any> = new None<any>();
export { NONE as none };

export function fromNullable<T>(value: T | null | undefined): Option<T> {
  return value == null ? (NONE as None<T>) : new Some<T>(value);
}

export function fromPredicate<T>(value: T, pred: (v: T) => boolean): Option<T> {
  return pred(value) ? new Some<T>(value) : (NONE as None<T>);
}

// ── Either<L, R> ─────────────────────────────────────────────────────────────

export type Either<L, R> = Left<L, R> | Right<L, R>;

export class Left<L, R> {
  readonly _tag = 'Left' as const;

  constructor(readonly left: L) {}

  isLeft(): this is Left<L, R> {
    return true;
  }

  isRight(): this is Right<L, R> {
    return false;
  }

  map<B>(_fn: (r: R) => B): Either<L, B> {
    return new Left<L, B>(this.left);
  }

  mapLeft<A>(fn: (l: L) => A): Either<A, R> {
    return new Left<A, R>(fn(this.left));
  }

  flatMap<B>(_fn: (r: R) => Either<L, B>): Either<L, B> {
    return new Left<L, B>(this.left);
  }

  getOrElse(def: R): R {
    return def;
  }

  match<U>(handlers: { left: (l: L) => U; right: (r: R) => U }): U {
    return handlers.left(this.left);
  }

  swap(): Either<R, L> {
    return new Right<L, R>(this.left) as unknown as Either<R, L>;
  }

  toOption(): Option<R> {
    return NONE as None<R>;
  }

  toResult(): Result<R, L> {
    return new Err<R, L>(this.left);
  }
}

export class Right<L, R> {
  readonly _tag = 'Right' as const;

  constructor(readonly right: R) {}

  isLeft(): this is Left<L, R> {
    return false;
  }

  isRight(): this is Right<L, R> {
    return true;
  }

  map<B>(fn: (r: R) => B): Either<L, B> {
    return new Right<L, B>(fn(this.right));
  }

  mapLeft<A>(_fn: (l: L) => A): Either<A, R> {
    return new Right<A, R>(this.right);
  }

  flatMap<B>(fn: (r: R) => Either<L, B>): Either<L, B> {
    return fn(this.right);
  }

  getOrElse(_def: R): R {
    return this.right;
  }

  match<U>(handlers: { left: (l: L) => U; right: (r: R) => U }): U {
    return handlers.right(this.right);
  }

  swap(): Either<R, L> {
    return new Left<R, L>(this.right) as unknown as Either<R, L>;
  }

  toOption(): Option<R> {
    return new Some<R>(this.right);
  }

  toResult(): Result<R, L> {
    return new Ok<R, L>(this.right);
  }
}

// ── Either factory functions ──────────────────────────────────────────────────

export function left<L, R = never>(value: L): Left<L, R> {
  return new Left<L, R>(value);
}

export function right<R, L = never>(value: R): Right<L, R> {
  return new Right<L, R>(value);
}
