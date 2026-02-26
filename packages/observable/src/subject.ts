// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { Observable, Observer, Subscription } from './observable';

export class Subject<T> extends Observable<T> {
  protected observers: Set<Observer<T>> = new Set();
  protected _completed = false;
  protected _error: unknown = undefined;
  protected _hasError = false;

  constructor() {
    super((observer) => {
      if (this._hasError) { observer.error?.(this._error); return; }
      if (this._completed) { observer.complete?.(); return; }
      this.observers.add(observer);
      return () => this.observers.delete(observer);
    });
  }

  next(value: T): void {
    if (this._completed || this._hasError) return;
    for (const obs of [...this.observers]) obs.next(value);
  }

  error(err: unknown): void {
    if (this._completed || this._hasError) return;
    this._hasError = true;
    this._error = err;
    for (const obs of [...this.observers]) obs.error?.(err);
    this.observers.clear();
  }

  complete(): void {
    if (this._completed || this._hasError) return;
    this._completed = true;
    for (const obs of [...this.observers]) obs.complete?.();
    this.observers.clear();
  }

  get closed(): boolean { return this._completed || this._hasError; }

  asObservable(): Observable<T> {
    return new Observable<T>((observer) => {
      return this.subscribe(observer).unsubscribe;
    });
  }
}

export class BehaviorSubject<T> extends Subject<T> {
  private _value: T;

  constructor(initialValue: T) {
    super();
    this._value = initialValue;
  }

  get value(): T { return this._value; }
  getValue(): T { return this._value; }

  next(value: T): void {
    this._value = value;
    super.next(value);
  }

  subscribe(observerOrNext: Observer<T> | ((v: T) => void), onError?: (err: unknown) => void, onComplete?: () => void): Subscription {
    const sub = super.subscribe(observerOrNext, onError, onComplete);
    // Emit current value immediately (observer was just added)
    const observer: Observer<T> = typeof observerOrNext === 'function'
      ? { next: observerOrNext }
      : observerOrNext;
    if (!sub.closed) observer.next(this._value);
    return sub;
  }
}

export class ReplaySubject<T> extends Subject<T> {
  private _buffer: T[] = [];

  constructor(private _bufferSize: number = Infinity) {
    super();
  }

  next(value: T): void {
    this._buffer.push(value);
    if (this._buffer.length > this._bufferSize) this._buffer.shift();
    super.next(value);
  }

  subscribe(observerOrNext: Observer<T> | ((v: T) => void), onError?: (err: unknown) => void, onComplete?: () => void): Subscription {
    const sub = super.subscribe(observerOrNext, onError, onComplete);
    const observer: Observer<T> = typeof observerOrNext === 'function'
      ? { next: observerOrNext }
      : observerOrNext;
    // Replay buffered values
    for (const v of this._buffer) {
      if (sub.closed) break;
      observer.next(v);
    }
    return sub;
  }
}

export class AsyncSubject<T> extends Subject<T> {
  private _lastValue: T | undefined;
  private _hasValue = false;

  next(value: T): void { this._lastValue = value; this._hasValue = true; }

  complete(): void {
    if (this._hasValue && this._lastValue !== undefined) {
      super.next(this._lastValue);
    }
    super.complete();
  }
}
