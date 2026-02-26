// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  clock?: () => number;
}

export class CircuitOpenError extends Error {
  constructor(message = 'Circuit breaker is OPEN') {
    super(message);
    this.name = 'CircuitOpenError';
    Object.setPrototypeOf(this, CircuitOpenError.prototype);
  }
}

type StateChangeHandler = (from: CircuitState, to: CircuitState) => void;

export class CircuitBreaker {
  private _state: CircuitState = CircuitState.CLOSED;
  private _failures: number = 0;
  private _successes: number = 0;
  private _openedAt: number = 0;
  private _handlers: StateChangeHandler[] = [];

  private readonly _failureThreshold: number;
  private readonly _successThreshold: number;
  private readonly _timeout: number;
  private readonly _clock: () => number;

  constructor(options: CircuitBreakerOptions) {
    this._failureThreshold = options.failureThreshold;
    this._successThreshold = options.successThreshold;
    this._timeout = options.timeout;
    this._clock = options.clock ?? (() => Date.now());
  }

  get state(): CircuitState {
    return this._state;
  }

  get failures(): number {
    return this._failures;
  }

  get successes(): number {
    return this._successes;
  }

  onStateChange(handler: StateChangeHandler): void {
    this._handlers.push(handler);
  }

  private _transition(to: CircuitState): void {
    const from = this._state;
    this._state = to;
    for (const handler of this._handlers) {
      handler(from, to);
    }
  }

  reset(): void {
    this._failures = 0;
    this._successes = 0;
    this._openedAt = 0;
    this._transition(CircuitState.CLOSED);
  }

  trip(): void {
    this._failures = this._failureThreshold;
    this._successes = 0;
    this._openedAt = this._clock();
    this._transition(CircuitState.OPEN);
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if OPEN → possibly transition to HALF_OPEN
    if (this._state === CircuitState.OPEN) {
      const now = this._clock();
      if (now - this._openedAt >= this._timeout) {
        this._transition(CircuitState.HALF_OPEN);
        this._successes = 0;
      } else {
        throw new CircuitOpenError();
      }
    }

    // CLOSED or HALF_OPEN: attempt the call
    try {
      const result = await fn();

      if (this._state === CircuitState.HALF_OPEN) {
        this._successes++;
        if (this._successes >= this._successThreshold) {
          this._failures = 0;
          this._successes = 0;
          this._transition(CircuitState.CLOSED);
        }
      } else {
        // CLOSED: successful call, keep failures but don't reset them
        // (successes don't affect CLOSED state logic — failures reset on success)
        this._failures = 0;
      }

      return result;
    } catch (err) {
      if (this._state === CircuitState.HALF_OPEN) {
        // Failure in HALF_OPEN → back to OPEN
        this._successes = 0;
        this._openedAt = this._clock();
        this._transition(CircuitState.OPEN);
      } else {
        // CLOSED: increment failures
        this._failures++;
        this._successes = 0;
        if (this._failures >= this._failureThreshold) {
          this._openedAt = this._clock();
          this._transition(CircuitState.OPEN);
        }
      }
      throw err;
    }
  }
}

export function createCircuitBreaker(options: CircuitBreakerOptions): CircuitBreaker {
  return new CircuitBreaker(options);
}
