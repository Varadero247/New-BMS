import { Request, Response, NextFunction, RequestHandler } from 'express';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('circuit-breaker');

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  /** Service name for logging */
  name: string;
  /** Number of consecutive failures before opening the circuit */
  failureThreshold?: number;
  /** Milliseconds to wait in OPEN state before moving to HALF_OPEN */
  resetTimeoutMs?: number;
  /** Successful requests in HALF_OPEN required before closing the circuit */
  halfOpenSuccesses?: number;
}

/**
 * Per-service circuit breaker state.
 * Tracks failures within a rolling window and gates requests when the
 * circuit is open, allowing downstream services to recover.
 */
interface CircuitState_ {
  state: CircuitState;
  failures: number;
  lastFailureTime: number;
  halfOpenSuccesses: number;
}

export interface ProxyCircuitBreaker {
  /** Express middleware — blocks requests when circuit is OPEN */
  middleware: RequestHandler;
  /** Call this when the proxied request fails (network error or 5xx) */
  onFailure: () => void;
  /** Call this when the proxied request succeeds (non-5xx response) */
  onSuccess: () => void;
  /** Return current circuit state (for health/metrics endpoints) */
  getState: () => CircuitState;
}

/**
 * Create a circuit breaker for an HTTP proxy service.
 *
 * State machine:
 *   CLOSED → OPEN  after `failureThreshold` failures
 *   OPEN   → HALF_OPEN after `resetTimeoutMs` ms
 *   HALF_OPEN → CLOSED  after `halfOpenSuccesses` consecutive successes
 *   HALF_OPEN → OPEN    on any failure
 *
 * Usage: wire `onFailure` into proxy's `onError` callback and 5xx responses,
 * and `onSuccess` into successful `onProxyRes`. Mount `middleware` before the proxy.
 */
export function createProxyCircuitBreaker(config: CircuitBreakerConfig): ProxyCircuitBreaker {
  const {
    name,
    failureThreshold = 5,
    resetTimeoutMs = 30000,
    halfOpenSuccesses: halfOpenSuccessThreshold = 2,
  } = config;

  const state: CircuitState_ = {
    state: 'CLOSED',
    failures: 0,
    lastFailureTime: 0,
    halfOpenSuccesses: 0,
  };

  function onFailure(): void {
    state.failures++;
    state.lastFailureTime = Date.now();
    state.halfOpenSuccesses = 0;

    if (state.state === 'HALF_OPEN' || state.failures >= failureThreshold) {
      state.state = 'OPEN';
      logger.warn(`[CircuitBreaker] ${name} OPENED after ${state.failures} failure(s)`);
    }
  }

  function onSuccess(): void {
    if (state.state === 'HALF_OPEN') {
      state.halfOpenSuccesses++;
      if (state.halfOpenSuccesses >= halfOpenSuccessThreshold) {
        state.state = 'CLOSED';
        state.failures = 0;
        state.halfOpenSuccesses = 0;
        logger.info(`[CircuitBreaker] ${name} CLOSED — service recovered`);
      }
    } else if (state.state === 'CLOSED') {
      // Reset failure counter on successful request (sliding window reset)
      state.failures = 0;
    }
  }

  function getState(): CircuitState {
    return state.state;
  }

  const middleware: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
    if (state.state === 'OPEN') {
      const elapsed = Date.now() - state.lastFailureTime;
      if (elapsed >= resetTimeoutMs) {
        // Transition to HALF_OPEN and allow one probe request through
        state.state = 'HALF_OPEN';
        logger.info(`[CircuitBreaker] ${name} HALF_OPEN — testing recovery`);
      } else {
        const retryAfterSec = Math.ceil((resetTimeoutMs - elapsed) / 1000);
        res.set('Retry-After', String(retryAfterSec));
        res.status(503).json({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: `${name} service is temporarily unavailable. Please retry in ${retryAfterSec}s.`,
          },
        });
        return;
      }
    }

    next();
  };

  return { middleware, onFailure, onSuccess, getState };
}
