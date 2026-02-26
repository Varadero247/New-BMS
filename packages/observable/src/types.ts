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

// Forward declaration for circular reference
import type { Observable } from './observable';
