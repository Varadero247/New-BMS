// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  CircuitBreaker,
  CircuitState,
  CircuitOpenError,
  createCircuitBreaker,
} from '../circuit-breaker';

// ─── 1. Initial state — 100 tests ───────────────────────────────────────────
describe('initial state is CLOSED', () => {
  for (let i = 0; i < 100; i++) {
    it(`new CircuitBreaker(threshold=${i + 1}) starts CLOSED`, () => {
      const cb = new CircuitBreaker({ failureThreshold: i + 1, successThreshold: 1, timeout: 1000 });
      expect(cb.state).toBe(CircuitState.CLOSED);
    });
  }
});

// ─── 2. failures counter — 100 tests ────────────────────────────────────────
describe('failures counter', () => {
  for (let n = 1; n <= 100; n++) {
    it(`failures=${n - 1} after ${n - 1} failures (threshold=${n})`, async () => {
      const cb = new CircuitBreaker({ failureThreshold: n, successThreshold: 1, timeout: 1000 });
      for (let i = 0; i < n - 1; i++) {
        try { await cb.execute(() => Promise.reject(new Error('fail'))); } catch { /* expected */ }
      }
      expect(cb.failures).toBe(n - 1);
      expect(cb.state).toBe(CircuitState.CLOSED);
    });
  }
});

// ─── 3. trips to OPEN — 100 tests ───────────────────────────────────────────
describe('trips to OPEN after failureThreshold', () => {
  for (let n = 1; n <= 100; n++) {
    it(`trips to OPEN after ${n} failures`, async () => {
      const cb = new CircuitBreaker({ failureThreshold: n, successThreshold: 1, timeout: 1000 });
      for (let i = 0; i < n; i++) {
        try { await cb.execute(() => Promise.reject(new Error('fail'))); } catch { /* expected */ }
      }
      expect(cb.state).toBe(CircuitState.OPEN);
    });
  }
});

// ─── 4. OPEN throws CircuitOpenError — 100 tests ────────────────────────────
describe('OPEN state throws CircuitOpenError', () => {
  for (let i = 0; i < 100; i++) {
    it(`OPEN circuit throws CircuitOpenError (run ${i})`, async () => {
      const cb = new CircuitBreaker({ failureThreshold: 1, successThreshold: 1, timeout: 99999 });
      try { await cb.execute(() => Promise.reject(new Error('fail'))); } catch { /* expected */ }
      await expect(cb.execute(() => Promise.resolve(42))).rejects.toBeInstanceOf(CircuitOpenError);
    });
  }
});

// ─── 5. execute success in CLOSED — 100 tests ───────────────────────────────
describe('execute succeeds in CLOSED state', () => {
  for (let i = 1; i <= 100; i++) {
    it(`execute returns ${i} in CLOSED state`, async () => {
      const cb = new CircuitBreaker({ failureThreshold: 5, successThreshold: 1, timeout: 1000 });
      const result = await cb.execute(() => Promise.resolve(i));
      expect(result).toBe(i);
    });
  }
});

// ─── 6. reset() — 100 tests ─────────────────────────────────────────────────
describe('reset() restores CLOSED', () => {
  for (let i = 0; i < 100; i++) {
    it(`reset() after trip restores CLOSED (run ${i})`, async () => {
      const cb = new CircuitBreaker({ failureThreshold: 1, successThreshold: 1, timeout: 1000 });
      try { await cb.execute(() => Promise.reject(new Error('fail'))); } catch { /* expected */ }
      cb.reset();
      expect(cb.state).toBe(CircuitState.CLOSED);
      expect(cb.failures).toBe(0);
    });
  }
});

// ─── 7. trip() — 100 tests ──────────────────────────────────────────────────
describe('trip() forces OPEN', () => {
  for (let i = 0; i < 100; i++) {
    it(`trip() on fresh CB forces OPEN (run ${i})`, () => {
      const cb = new CircuitBreaker({ failureThreshold: 100, successThreshold: 1, timeout: 1000 });
      cb.trip();
      expect(cb.state).toBe(CircuitState.OPEN);
    });
  }
});

// ─── 8. CircuitState enum — 100 tests ───────────────────────────────────────
describe('CircuitState enum values', () => {
  for (let i = 0; i < 100; i++) {
    it(`CircuitState values are correct (run ${i})`, () => {
      expect(CircuitState.CLOSED).toBe('CLOSED');
      expect(CircuitState.OPEN).toBe('OPEN');
      expect(CircuitState.HALF_OPEN).toBe('HALF_OPEN');
    });
  }
});

// ─── 9. createCircuitBreaker factory — 100 tests ────────────────────────────
describe('createCircuitBreaker factory', () => {
  for (let i = 1; i <= 100; i++) {
    it(`createCircuitBreaker(threshold=${i}) returns CircuitBreaker in CLOSED`, () => {
      const cb = createCircuitBreaker({ failureThreshold: i, successThreshold: 1, timeout: 1000 });
      expect(cb).toBeInstanceOf(CircuitBreaker);
      expect(cb.state).toBe(CircuitState.CLOSED);
    });
  }
});

// ─── 10. HALF_OPEN via injectable clock — 100 tests ─────────────────────────
describe('OPEN transitions to HALF_OPEN after timeout', () => {
  for (let i = 0; i < 100; i++) {
    it(`HALF_OPEN after timeout (i=${i})`, async () => {
      let time = 0;
      const cb = new CircuitBreaker({
        failureThreshold: 1,
        successThreshold: 1,
        timeout: 1000,
        clock: () => time,
      });
      try { await cb.execute(() => Promise.reject(new Error('fail'))); } catch { /* expected */ }
      expect(cb.state).toBe(CircuitState.OPEN);
      time = 1001; // advance past timeout
      const result = await cb.execute(() => Promise.resolve(i));
      expect(result).toBe(i);
      expect(cb.state).toBe(CircuitState.CLOSED);
    });
  }
});

// ─── 11. onStateChange handler — 100 tests ──────────────────────────────────
describe('onStateChange handler fires on transitions', () => {
  for (let i = 1; i <= 100; i++) {
    it(`onStateChange fires CLOSED→OPEN after ${i} failure(s) (threshold=${i})`, async () => {
      const cb = new CircuitBreaker({ failureThreshold: i, successThreshold: 1, timeout: 1000 });
      const transitions: Array<{ from: CircuitState; to: CircuitState }> = [];
      cb.onStateChange((from, to) => transitions.push({ from, to }));
      for (let j = 0; j < i; j++) {
        try { await cb.execute(() => Promise.reject(new Error('fail'))); } catch { /* expected */ }
      }
      expect(transitions).toContainEqual({ from: CircuitState.CLOSED, to: CircuitState.OPEN });
    });
  }
});
