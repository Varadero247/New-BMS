// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * A predicate function that may be synchronous or asynchronous.
 */
export type AsyncPredicate<T> = (item: T) => boolean | Promise<boolean>;

/**
 * A mapping function that may be synchronous or asynchronous.
 */
export type AsyncMapper<T, R> = (item: T, index: number) => R | Promise<R>;

/**
 * A reducer function that may be synchronous or asynchronous.
 */
export type AsyncReducer<T, R> = (acc: R, item: T) => R | Promise<R>;

/**
 * Statistical summary of a numeric stream.
 */
export interface StreamStats {
  count: number;
  sum: number;
  min: number;
  max: number;
  mean: number;
}

/**
 * Options for the chunk utility.
 */
export interface ChunkOptions {
  size: number;
  partial?: boolean;
}

/**
 * Fluent pipeline builder interface for chaining async iterable transforms.
 */
export interface Pipeline<T> {
  map<R>(fn: (item: T, index: number) => R | Promise<R>): Pipeline<R>;
  filter(fn: (item: T) => boolean | Promise<boolean>): Pipeline<T>;
  take(n: number): Pipeline<T>;
  skip(n: number): Pipeline<T>;
  chunk(size: number): Pipeline<T[]>;
  distinct(keyFn?: (item: T) => unknown): Pipeline<T>;
  tap(fn: (item: T) => void | Promise<void>): Pipeline<T>;
  toArray(): Promise<T[]>;
  forEach(fn: (item: T, index: number) => void | Promise<void>): Promise<void>;
  reduce<R>(fn: (acc: R, item: T) => R | Promise<R>, initial: R): Promise<R>;
  count(): Promise<number>;
  first(): Promise<T | undefined>;
}
