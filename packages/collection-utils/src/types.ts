// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/** A map where values are grouped into arrays keyed by K. */
export type GroupedMap<K, V> = Map<K, V[]>;

/** A bidirectional map interface (see BiMap class). */
export interface BiMapInterface<K, V> {
  set(key: K, value: V): this;
  get(key: K): V | undefined;
  getKey(value: V): K | undefined;
  has(key: K): boolean;
  hasValue(value: V): boolean;
  delete(key: K): boolean;
  readonly size: number;
  entries(): IterableIterator<[K, V]>;
  keys(): IterableIterator<K>;
  values(): IterableIterator<V>;
}

/** A multiset (bag) interface (see MultiSet class). */
export interface MultiSetInterface<T> {
  add(item: T, count?: number): this;
  remove(item: T, count?: number): boolean;
  count(item: T): number;
  has(item: T): boolean;
  size(): number;
  uniqueSize(): number;
  toArray(): T[];
  entries(): [T, number][];
  mostCommon(n?: number): [T, number][];
}

/** Statistics for a collection. */
export interface CollectionStats {
  count: number;
  uniqueCount: number;
  min: number | undefined;
  max: number | undefined;
  sum: number;
  mean: number | undefined;
}

/** A sorted set with ordering comparator. */
export interface SortedSet<T> {
  add(item: T): this;
  has(item: T): boolean;
  delete(item: T): boolean;
  toArray(): T[];
  readonly size: number;
  min(): T | undefined;
  max(): T | undefined;
}

/** An indexed collection allowing fast lookup by one or more keys. */
export interface IndexedCollection<T> {
  insert(item: T): void;
  findBy(field: keyof T, value: unknown): T[];
  remove(item: T): boolean;
  readonly size: number;
  toArray(): T[];
}
