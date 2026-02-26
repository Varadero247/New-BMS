// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { HealthRegistry, HealthStatus, healthy, degraded, unhealthy, createRegistry } from '../health-check';

// register/has — 200 tests
describe('register/has', () => {
  for (let i = 0; i < 200; i++) {
    it(`has("check${i}") returns true after register`, () => {
      const reg = new HealthRegistry();
      reg.register(`check${i}`, () => healthy());
      expect(reg.has(`check${i}`)).toBe(true);
    });
  }
});

// size — 100 tests
describe('size', () => {
  for (let n = 0; n < 100; n++) {
    it(`size=${n} after ${n} registers`, () => {
      const reg = new HealthRegistry();
      for (let i = 0; i < n; i++) reg.register(`c${i}`, () => healthy());
      expect(reg.size).toBe(n);
    });
  }
});

// runCheck healthy — 100 tests
describe('runCheck() healthy', () => {
  for (let i = 0; i < 100; i++) {
    it(`runCheck returns HEALTHY (i=${i})`, async () => {
      const reg = new HealthRegistry();
      reg.register('c', () => healthy(`msg${i}`));
      const result = await reg.runCheck('c');
      expect(result.status).toBe(HealthStatus.HEALTHY);
    });
  }
});

// runCheck degraded — 100 tests
describe('runCheck() degraded', () => {
  for (let i = 0; i < 100; i++) {
    it(`runCheck returns DEGRADED (i=${i})`, async () => {
      const reg = new HealthRegistry();
      reg.register('c', () => degraded(`msg${i}`));
      const result = await reg.runCheck('c');
      expect(result.status).toBe(HealthStatus.DEGRADED);
    });
  }
});

// runCheck unhealthy — 100 tests
describe('runCheck() unhealthy', () => {
  for (let i = 0; i < 100; i++) {
    it(`runCheck returns UNHEALTHY (i=${i})`, async () => {
      const reg = new HealthRegistry();
      reg.register('c', () => unhealthy(`msg${i}`));
      const result = await reg.runCheck('c');
      expect(result.status).toBe(HealthStatus.UNHEALTHY);
    });
  }
});

// aggregate all healthy — 100 tests
describe('aggregate() all healthy', () => {
  for (let n = 1; n <= 100; n++) {
    it(`aggregate ${n} healthy checks = HEALTHY`, async () => {
      const reg = new HealthRegistry();
      for (let i = 0; i < n; i++) reg.register(`c${i}`, () => healthy());
      const result = await reg.aggregate();
      expect(result.status).toBe(HealthStatus.HEALTHY);
    });
  }
});

// aggregate with one unhealthy — 100 tests
describe('aggregate() one unhealthy = UNHEALTHY', () => {
  for (let n = 1; n <= 100; n++) {
    it(`aggregate: 1 unhealthy among ${n} = UNHEALTHY`, async () => {
      const reg = new HealthRegistry();
      for (let i = 0; i < n - 1; i++) reg.register(`c${i}`, () => healthy());
      reg.register('bad', () => unhealthy('oops'));
      const result = await reg.aggregate();
      expect(result.status).toBe(HealthStatus.UNHEALTHY);
    });
  }
});

// unregister — 100 tests
describe('unregister()', () => {
  for (let i = 0; i < 100; i++) {
    it(`unregister("c${i}") returns true and removes it`, () => {
      const reg = new HealthRegistry();
      reg.register(`c${i}`, () => healthy());
      expect(reg.unregister(`c${i}`)).toBe(true);
      expect(reg.has(`c${i}`)).toBe(false);
    });
  }
});

// clear — 100 tests
describe('clear()', () => {
  for (let n = 1; n <= 100; n++) {
    it(`clear() resets size to 0 (n=${n})`, () => {
      const reg = new HealthRegistry();
      for (let i = 0; i < n; i++) reg.register(`c${i}`, () => healthy());
      reg.clear();
      expect(reg.size).toBe(0);
    });
  }
});

// healthy/degraded/unhealthy helpers — 100 tests
describe('status helpers', () => {
  for (let i = 0; i < 100; i++) {
    it(`healthy/degraded/unhealthy return correct status (run ${i})`, () => {
      expect(healthy().status).toBe(HealthStatus.HEALTHY);
      expect(degraded().status).toBe(HealthStatus.DEGRADED);
      expect(unhealthy().status).toBe(HealthStatus.UNHEALTHY);
    });
  }
});
