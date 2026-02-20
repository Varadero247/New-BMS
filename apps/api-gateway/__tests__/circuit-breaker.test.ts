import { createProxyCircuitBreaker } from '../src/middleware/circuit-breaker';
import { Request, Response } from 'express';

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

function makeReqRes() {
  const req = {} as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  } as unknown as Response;
  const next = jest.fn();
  return { req, res, next };
}

describe('createProxyCircuitBreaker', () => {
  it('starts CLOSED and passes requests through', () => {
    const cb = createProxyCircuitBreaker({ name: 'TestService' });
    const { req, res, next } = makeReqRes();

    cb.middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(cb.getState()).toBe('CLOSED');
  });

  it('opens circuit after reaching failure threshold', () => {
    const cb = createProxyCircuitBreaker({ name: 'TestService', failureThreshold: 3 });
    const { req, res, next } = makeReqRes();

    // 3 failures should open the circuit
    cb.onFailure();
    cb.onFailure();
    cb.onFailure();

    expect(cb.getState()).toBe('OPEN');

    cb.middleware(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it('sets Retry-After header when circuit is OPEN', () => {
    const cb = createProxyCircuitBreaker({ name: 'TestService', failureThreshold: 1 });
    cb.onFailure();

    const { req, res, next } = makeReqRes();
    cb.middleware(req, res, next);

    expect(res.set).toHaveBeenCalledWith('Retry-After', expect.any(String));
  });

  it('transitions OPEN → HALF_OPEN after resetTimeout', () => {
    jest.useFakeTimers();
    const cb = createProxyCircuitBreaker({
      name: 'TestService',
      failureThreshold: 1,
      resetTimeoutMs: 5000,
    });

    cb.onFailure();
    expect(cb.getState()).toBe('OPEN');

    // Advance time past resetTimeout
    jest.advanceTimersByTime(6000);

    const { req, res, next } = makeReqRes();
    cb.middleware(req, res, next);

    expect(cb.getState()).toBe('HALF_OPEN');
    expect(next).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('transitions HALF_OPEN → CLOSED after enough successes', () => {
    jest.useFakeTimers();
    const cb = createProxyCircuitBreaker({
      name: 'TestService',
      failureThreshold: 1,
      resetTimeoutMs: 1000,
      halfOpenSuccesses: 2,
    });

    cb.onFailure();
    jest.advanceTimersByTime(2000);

    // Trigger HALF_OPEN transition
    const { req, res, next } = makeReqRes();
    cb.middleware(req, res, next);
    expect(cb.getState()).toBe('HALF_OPEN');

    // Two successes close the circuit
    cb.onSuccess();
    cb.onSuccess();
    expect(cb.getState()).toBe('CLOSED');

    jest.useRealTimers();
  });

  it('transitions HALF_OPEN → OPEN on failure', () => {
    jest.useFakeTimers();
    const cb = createProxyCircuitBreaker({
      name: 'TestService',
      failureThreshold: 1,
      resetTimeoutMs: 1000,
    });

    cb.onFailure();
    jest.advanceTimersByTime(2000);

    const { req, res, next } = makeReqRes();
    cb.middleware(req, res, next);
    expect(cb.getState()).toBe('HALF_OPEN');

    cb.onFailure();
    expect(cb.getState()).toBe('OPEN');

    jest.useRealTimers();
  });

  it('resets failure count on success in CLOSED state', () => {
    const cb = createProxyCircuitBreaker({ name: 'TestService', failureThreshold: 5 });

    cb.onFailure();
    cb.onFailure();
    // Two failures but below threshold — success should reset counter
    cb.onSuccess();
    // Now need 5 failures to open circuit again
    cb.onFailure();
    cb.onFailure();
    cb.onFailure();
    cb.onFailure();
    expect(cb.getState()).toBe('CLOSED'); // only 4 failures since last reset
    cb.onFailure();
    expect(cb.getState()).toBe('OPEN');
  });
});
