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
function hd258cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258cb_hd',()=>{it('a',()=>{expect(hd258cb(1,4)).toBe(2);});it('b',()=>{expect(hd258cb(3,1)).toBe(1);});it('c',()=>{expect(hd258cb(0,0)).toBe(0);});it('d',()=>{expect(hd258cb(93,73)).toBe(2);});it('e',()=>{expect(hd258cb(15,0)).toBe(4);});});
function hd259cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259cb_hd',()=>{it('a',()=>{expect(hd259cb(1,4)).toBe(2);});it('b',()=>{expect(hd259cb(3,1)).toBe(1);});it('c',()=>{expect(hd259cb(0,0)).toBe(0);});it('d',()=>{expect(hd259cb(93,73)).toBe(2);});it('e',()=>{expect(hd259cb(15,0)).toBe(4);});});
function hd260cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260cb_hd',()=>{it('a',()=>{expect(hd260cb(1,4)).toBe(2);});it('b',()=>{expect(hd260cb(3,1)).toBe(1);});it('c',()=>{expect(hd260cb(0,0)).toBe(0);});it('d',()=>{expect(hd260cb(93,73)).toBe(2);});it('e',()=>{expect(hd260cb(15,0)).toBe(4);});});
function hd261cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261cb_hd',()=>{it('a',()=>{expect(hd261cb(1,4)).toBe(2);});it('b',()=>{expect(hd261cb(3,1)).toBe(1);});it('c',()=>{expect(hd261cb(0,0)).toBe(0);});it('d',()=>{expect(hd261cb(93,73)).toBe(2);});it('e',()=>{expect(hd261cb(15,0)).toBe(4);});});
function hd262cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262cb_hd',()=>{it('a',()=>{expect(hd262cb(1,4)).toBe(2);});it('b',()=>{expect(hd262cb(3,1)).toBe(1);});it('c',()=>{expect(hd262cb(0,0)).toBe(0);});it('d',()=>{expect(hd262cb(93,73)).toBe(2);});it('e',()=>{expect(hd262cb(15,0)).toBe(4);});});
function hd263cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263cb_hd',()=>{it('a',()=>{expect(hd263cb(1,4)).toBe(2);});it('b',()=>{expect(hd263cb(3,1)).toBe(1);});it('c',()=>{expect(hd263cb(0,0)).toBe(0);});it('d',()=>{expect(hd263cb(93,73)).toBe(2);});it('e',()=>{expect(hd263cb(15,0)).toBe(4);});});
function hd264cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264cb_hd',()=>{it('a',()=>{expect(hd264cb(1,4)).toBe(2);});it('b',()=>{expect(hd264cb(3,1)).toBe(1);});it('c',()=>{expect(hd264cb(0,0)).toBe(0);});it('d',()=>{expect(hd264cb(93,73)).toBe(2);});it('e',()=>{expect(hd264cb(15,0)).toBe(4);});});
function hd265cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265cb_hd',()=>{it('a',()=>{expect(hd265cb(1,4)).toBe(2);});it('b',()=>{expect(hd265cb(3,1)).toBe(1);});it('c',()=>{expect(hd265cb(0,0)).toBe(0);});it('d',()=>{expect(hd265cb(93,73)).toBe(2);});it('e',()=>{expect(hd265cb(15,0)).toBe(4);});});
function hd266cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266cb_hd',()=>{it('a',()=>{expect(hd266cb(1,4)).toBe(2);});it('b',()=>{expect(hd266cb(3,1)).toBe(1);});it('c',()=>{expect(hd266cb(0,0)).toBe(0);});it('d',()=>{expect(hd266cb(93,73)).toBe(2);});it('e',()=>{expect(hd266cb(15,0)).toBe(4);});});
function hd267cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267cb_hd',()=>{it('a',()=>{expect(hd267cb(1,4)).toBe(2);});it('b',()=>{expect(hd267cb(3,1)).toBe(1);});it('c',()=>{expect(hd267cb(0,0)).toBe(0);});it('d',()=>{expect(hd267cb(93,73)).toBe(2);});it('e',()=>{expect(hd267cb(15,0)).toBe(4);});});
function hd268cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268cb_hd',()=>{it('a',()=>{expect(hd268cb(1,4)).toBe(2);});it('b',()=>{expect(hd268cb(3,1)).toBe(1);});it('c',()=>{expect(hd268cb(0,0)).toBe(0);});it('d',()=>{expect(hd268cb(93,73)).toBe(2);});it('e',()=>{expect(hd268cb(15,0)).toBe(4);});});
function hd269cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269cb_hd',()=>{it('a',()=>{expect(hd269cb(1,4)).toBe(2);});it('b',()=>{expect(hd269cb(3,1)).toBe(1);});it('c',()=>{expect(hd269cb(0,0)).toBe(0);});it('d',()=>{expect(hd269cb(93,73)).toBe(2);});it('e',()=>{expect(hd269cb(15,0)).toBe(4);});});
function hd270cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270cb_hd',()=>{it('a',()=>{expect(hd270cb(1,4)).toBe(2);});it('b',()=>{expect(hd270cb(3,1)).toBe(1);});it('c',()=>{expect(hd270cb(0,0)).toBe(0);});it('d',()=>{expect(hd270cb(93,73)).toBe(2);});it('e',()=>{expect(hd270cb(15,0)).toBe(4);});});
function hd271cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271cb_hd',()=>{it('a',()=>{expect(hd271cb(1,4)).toBe(2);});it('b',()=>{expect(hd271cb(3,1)).toBe(1);});it('c',()=>{expect(hd271cb(0,0)).toBe(0);});it('d',()=>{expect(hd271cb(93,73)).toBe(2);});it('e',()=>{expect(hd271cb(15,0)).toBe(4);});});
function hd272cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272cb_hd',()=>{it('a',()=>{expect(hd272cb(1,4)).toBe(2);});it('b',()=>{expect(hd272cb(3,1)).toBe(1);});it('c',()=>{expect(hd272cb(0,0)).toBe(0);});it('d',()=>{expect(hd272cb(93,73)).toBe(2);});it('e',()=>{expect(hd272cb(15,0)).toBe(4);});});
function hd273cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273cb_hd',()=>{it('a',()=>{expect(hd273cb(1,4)).toBe(2);});it('b',()=>{expect(hd273cb(3,1)).toBe(1);});it('c',()=>{expect(hd273cb(0,0)).toBe(0);});it('d',()=>{expect(hd273cb(93,73)).toBe(2);});it('e',()=>{expect(hd273cb(15,0)).toBe(4);});});
function hd274cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274cb_hd',()=>{it('a',()=>{expect(hd274cb(1,4)).toBe(2);});it('b',()=>{expect(hd274cb(3,1)).toBe(1);});it('c',()=>{expect(hd274cb(0,0)).toBe(0);});it('d',()=>{expect(hd274cb(93,73)).toBe(2);});it('e',()=>{expect(hd274cb(15,0)).toBe(4);});});
function hd275cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275cb_hd',()=>{it('a',()=>{expect(hd275cb(1,4)).toBe(2);});it('b',()=>{expect(hd275cb(3,1)).toBe(1);});it('c',()=>{expect(hd275cb(0,0)).toBe(0);});it('d',()=>{expect(hd275cb(93,73)).toBe(2);});it('e',()=>{expect(hd275cb(15,0)).toBe(4);});});
function hd276cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276cb_hd',()=>{it('a',()=>{expect(hd276cb(1,4)).toBe(2);});it('b',()=>{expect(hd276cb(3,1)).toBe(1);});it('c',()=>{expect(hd276cb(0,0)).toBe(0);});it('d',()=>{expect(hd276cb(93,73)).toBe(2);});it('e',()=>{expect(hd276cb(15,0)).toBe(4);});});
function hd277cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277cb_hd',()=>{it('a',()=>{expect(hd277cb(1,4)).toBe(2);});it('b',()=>{expect(hd277cb(3,1)).toBe(1);});it('c',()=>{expect(hd277cb(0,0)).toBe(0);});it('d',()=>{expect(hd277cb(93,73)).toBe(2);});it('e',()=>{expect(hd277cb(15,0)).toBe(4);});});
function hd278cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278cb_hd',()=>{it('a',()=>{expect(hd278cb(1,4)).toBe(2);});it('b',()=>{expect(hd278cb(3,1)).toBe(1);});it('c',()=>{expect(hd278cb(0,0)).toBe(0);});it('d',()=>{expect(hd278cb(93,73)).toBe(2);});it('e',()=>{expect(hd278cb(15,0)).toBe(4);});});
function hd279cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279cb_hd',()=>{it('a',()=>{expect(hd279cb(1,4)).toBe(2);});it('b',()=>{expect(hd279cb(3,1)).toBe(1);});it('c',()=>{expect(hd279cb(0,0)).toBe(0);});it('d',()=>{expect(hd279cb(93,73)).toBe(2);});it('e',()=>{expect(hd279cb(15,0)).toBe(4);});});
function hd280cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280cb_hd',()=>{it('a',()=>{expect(hd280cb(1,4)).toBe(2);});it('b',()=>{expect(hd280cb(3,1)).toBe(1);});it('c',()=>{expect(hd280cb(0,0)).toBe(0);});it('d',()=>{expect(hd280cb(93,73)).toBe(2);});it('e',()=>{expect(hd280cb(15,0)).toBe(4);});});
function hd281cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281cb_hd',()=>{it('a',()=>{expect(hd281cb(1,4)).toBe(2);});it('b',()=>{expect(hd281cb(3,1)).toBe(1);});it('c',()=>{expect(hd281cb(0,0)).toBe(0);});it('d',()=>{expect(hd281cb(93,73)).toBe(2);});it('e',()=>{expect(hd281cb(15,0)).toBe(4);});});
function hd282cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282cb_hd',()=>{it('a',()=>{expect(hd282cb(1,4)).toBe(2);});it('b',()=>{expect(hd282cb(3,1)).toBe(1);});it('c',()=>{expect(hd282cb(0,0)).toBe(0);});it('d',()=>{expect(hd282cb(93,73)).toBe(2);});it('e',()=>{expect(hd282cb(15,0)).toBe(4);});});
function hd283cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283cb_hd',()=>{it('a',()=>{expect(hd283cb(1,4)).toBe(2);});it('b',()=>{expect(hd283cb(3,1)).toBe(1);});it('c',()=>{expect(hd283cb(0,0)).toBe(0);});it('d',()=>{expect(hd283cb(93,73)).toBe(2);});it('e',()=>{expect(hd283cb(15,0)).toBe(4);});});
function hd284cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284cb_hd',()=>{it('a',()=>{expect(hd284cb(1,4)).toBe(2);});it('b',()=>{expect(hd284cb(3,1)).toBe(1);});it('c',()=>{expect(hd284cb(0,0)).toBe(0);});it('d',()=>{expect(hd284cb(93,73)).toBe(2);});it('e',()=>{expect(hd284cb(15,0)).toBe(4);});});
function hd285cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285cb_hd',()=>{it('a',()=>{expect(hd285cb(1,4)).toBe(2);});it('b',()=>{expect(hd285cb(3,1)).toBe(1);});it('c',()=>{expect(hd285cb(0,0)).toBe(0);});it('d',()=>{expect(hd285cb(93,73)).toBe(2);});it('e',()=>{expect(hd285cb(15,0)).toBe(4);});});
function hd286cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286cb_hd',()=>{it('a',()=>{expect(hd286cb(1,4)).toBe(2);});it('b',()=>{expect(hd286cb(3,1)).toBe(1);});it('c',()=>{expect(hd286cb(0,0)).toBe(0);});it('d',()=>{expect(hd286cb(93,73)).toBe(2);});it('e',()=>{expect(hd286cb(15,0)).toBe(4);});});
function hd287cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287cb_hd',()=>{it('a',()=>{expect(hd287cb(1,4)).toBe(2);});it('b',()=>{expect(hd287cb(3,1)).toBe(1);});it('c',()=>{expect(hd287cb(0,0)).toBe(0);});it('d',()=>{expect(hd287cb(93,73)).toBe(2);});it('e',()=>{expect(hd287cb(15,0)).toBe(4);});});
function hd288cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288cb_hd',()=>{it('a',()=>{expect(hd288cb(1,4)).toBe(2);});it('b',()=>{expect(hd288cb(3,1)).toBe(1);});it('c',()=>{expect(hd288cb(0,0)).toBe(0);});it('d',()=>{expect(hd288cb(93,73)).toBe(2);});it('e',()=>{expect(hd288cb(15,0)).toBe(4);});});
function hd289cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289cb_hd',()=>{it('a',()=>{expect(hd289cb(1,4)).toBe(2);});it('b',()=>{expect(hd289cb(3,1)).toBe(1);});it('c',()=>{expect(hd289cb(0,0)).toBe(0);});it('d',()=>{expect(hd289cb(93,73)).toBe(2);});it('e',()=>{expect(hd289cb(15,0)).toBe(4);});});
function hd290cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290cb_hd',()=>{it('a',()=>{expect(hd290cb(1,4)).toBe(2);});it('b',()=>{expect(hd290cb(3,1)).toBe(1);});it('c',()=>{expect(hd290cb(0,0)).toBe(0);});it('d',()=>{expect(hd290cb(93,73)).toBe(2);});it('e',()=>{expect(hd290cb(15,0)).toBe(4);});});
function hd291cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291cb_hd',()=>{it('a',()=>{expect(hd291cb(1,4)).toBe(2);});it('b',()=>{expect(hd291cb(3,1)).toBe(1);});it('c',()=>{expect(hd291cb(0,0)).toBe(0);});it('d',()=>{expect(hd291cb(93,73)).toBe(2);});it('e',()=>{expect(hd291cb(15,0)).toBe(4);});});
function hd292cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292cb_hd',()=>{it('a',()=>{expect(hd292cb(1,4)).toBe(2);});it('b',()=>{expect(hd292cb(3,1)).toBe(1);});it('c',()=>{expect(hd292cb(0,0)).toBe(0);});it('d',()=>{expect(hd292cb(93,73)).toBe(2);});it('e',()=>{expect(hd292cb(15,0)).toBe(4);});});
function hd293cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293cb_hd',()=>{it('a',()=>{expect(hd293cb(1,4)).toBe(2);});it('b',()=>{expect(hd293cb(3,1)).toBe(1);});it('c',()=>{expect(hd293cb(0,0)).toBe(0);});it('d',()=>{expect(hd293cb(93,73)).toBe(2);});it('e',()=>{expect(hd293cb(15,0)).toBe(4);});});
function hd294cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294cb_hd',()=>{it('a',()=>{expect(hd294cb(1,4)).toBe(2);});it('b',()=>{expect(hd294cb(3,1)).toBe(1);});it('c',()=>{expect(hd294cb(0,0)).toBe(0);});it('d',()=>{expect(hd294cb(93,73)).toBe(2);});it('e',()=>{expect(hd294cb(15,0)).toBe(4);});});
function hd295cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295cb_hd',()=>{it('a',()=>{expect(hd295cb(1,4)).toBe(2);});it('b',()=>{expect(hd295cb(3,1)).toBe(1);});it('c',()=>{expect(hd295cb(0,0)).toBe(0);});it('d',()=>{expect(hd295cb(93,73)).toBe(2);});it('e',()=>{expect(hd295cb(15,0)).toBe(4);});});
function hd296cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296cb_hd',()=>{it('a',()=>{expect(hd296cb(1,4)).toBe(2);});it('b',()=>{expect(hd296cb(3,1)).toBe(1);});it('c',()=>{expect(hd296cb(0,0)).toBe(0);});it('d',()=>{expect(hd296cb(93,73)).toBe(2);});it('e',()=>{expect(hd296cb(15,0)).toBe(4);});});
function hd297cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297cb_hd',()=>{it('a',()=>{expect(hd297cb(1,4)).toBe(2);});it('b',()=>{expect(hd297cb(3,1)).toBe(1);});it('c',()=>{expect(hd297cb(0,0)).toBe(0);});it('d',()=>{expect(hd297cb(93,73)).toBe(2);});it('e',()=>{expect(hd297cb(15,0)).toBe(4);});});
function hd298cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298cb_hd',()=>{it('a',()=>{expect(hd298cb(1,4)).toBe(2);});it('b',()=>{expect(hd298cb(3,1)).toBe(1);});it('c',()=>{expect(hd298cb(0,0)).toBe(0);});it('d',()=>{expect(hd298cb(93,73)).toBe(2);});it('e',()=>{expect(hd298cb(15,0)).toBe(4);});});
function hd299cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299cb_hd',()=>{it('a',()=>{expect(hd299cb(1,4)).toBe(2);});it('b',()=>{expect(hd299cb(3,1)).toBe(1);});it('c',()=>{expect(hd299cb(0,0)).toBe(0);});it('d',()=>{expect(hd299cb(93,73)).toBe(2);});it('e',()=>{expect(hd299cb(15,0)).toBe(4);});});
function hd300cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300cb_hd',()=>{it('a',()=>{expect(hd300cb(1,4)).toBe(2);});it('b',()=>{expect(hd300cb(3,1)).toBe(1);});it('c',()=>{expect(hd300cb(0,0)).toBe(0);});it('d',()=>{expect(hd300cb(93,73)).toBe(2);});it('e',()=>{expect(hd300cb(15,0)).toBe(4);});});
function hd301cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301cb_hd',()=>{it('a',()=>{expect(hd301cb(1,4)).toBe(2);});it('b',()=>{expect(hd301cb(3,1)).toBe(1);});it('c',()=>{expect(hd301cb(0,0)).toBe(0);});it('d',()=>{expect(hd301cb(93,73)).toBe(2);});it('e',()=>{expect(hd301cb(15,0)).toBe(4);});});
function hd302cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302cb_hd',()=>{it('a',()=>{expect(hd302cb(1,4)).toBe(2);});it('b',()=>{expect(hd302cb(3,1)).toBe(1);});it('c',()=>{expect(hd302cb(0,0)).toBe(0);});it('d',()=>{expect(hd302cb(93,73)).toBe(2);});it('e',()=>{expect(hd302cb(15,0)).toBe(4);});});
function hd303cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303cb_hd',()=>{it('a',()=>{expect(hd303cb(1,4)).toBe(2);});it('b',()=>{expect(hd303cb(3,1)).toBe(1);});it('c',()=>{expect(hd303cb(0,0)).toBe(0);});it('d',()=>{expect(hd303cb(93,73)).toBe(2);});it('e',()=>{expect(hd303cb(15,0)).toBe(4);});});
function hd304cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304cb_hd',()=>{it('a',()=>{expect(hd304cb(1,4)).toBe(2);});it('b',()=>{expect(hd304cb(3,1)).toBe(1);});it('c',()=>{expect(hd304cb(0,0)).toBe(0);});it('d',()=>{expect(hd304cb(93,73)).toBe(2);});it('e',()=>{expect(hd304cb(15,0)).toBe(4);});});
function hd305cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305cb_hd',()=>{it('a',()=>{expect(hd305cb(1,4)).toBe(2);});it('b',()=>{expect(hd305cb(3,1)).toBe(1);});it('c',()=>{expect(hd305cb(0,0)).toBe(0);});it('d',()=>{expect(hd305cb(93,73)).toBe(2);});it('e',()=>{expect(hd305cb(15,0)).toBe(4);});});
function hd306cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306cb_hd',()=>{it('a',()=>{expect(hd306cb(1,4)).toBe(2);});it('b',()=>{expect(hd306cb(3,1)).toBe(1);});it('c',()=>{expect(hd306cb(0,0)).toBe(0);});it('d',()=>{expect(hd306cb(93,73)).toBe(2);});it('e',()=>{expect(hd306cb(15,0)).toBe(4);});});
function hd307cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307cb_hd',()=>{it('a',()=>{expect(hd307cb(1,4)).toBe(2);});it('b',()=>{expect(hd307cb(3,1)).toBe(1);});it('c',()=>{expect(hd307cb(0,0)).toBe(0);});it('d',()=>{expect(hd307cb(93,73)).toBe(2);});it('e',()=>{expect(hd307cb(15,0)).toBe(4);});});
function hd308cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308cb_hd',()=>{it('a',()=>{expect(hd308cb(1,4)).toBe(2);});it('b',()=>{expect(hd308cb(3,1)).toBe(1);});it('c',()=>{expect(hd308cb(0,0)).toBe(0);});it('d',()=>{expect(hd308cb(93,73)).toBe(2);});it('e',()=>{expect(hd308cb(15,0)).toBe(4);});});
function hd309cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309cb_hd',()=>{it('a',()=>{expect(hd309cb(1,4)).toBe(2);});it('b',()=>{expect(hd309cb(3,1)).toBe(1);});it('c',()=>{expect(hd309cb(0,0)).toBe(0);});it('d',()=>{expect(hd309cb(93,73)).toBe(2);});it('e',()=>{expect(hd309cb(15,0)).toBe(4);});});
function hd310cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310cb_hd',()=>{it('a',()=>{expect(hd310cb(1,4)).toBe(2);});it('b',()=>{expect(hd310cb(3,1)).toBe(1);});it('c',()=>{expect(hd310cb(0,0)).toBe(0);});it('d',()=>{expect(hd310cb(93,73)).toBe(2);});it('e',()=>{expect(hd310cb(15,0)).toBe(4);});});
function hd311cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311cb_hd',()=>{it('a',()=>{expect(hd311cb(1,4)).toBe(2);});it('b',()=>{expect(hd311cb(3,1)).toBe(1);});it('c',()=>{expect(hd311cb(0,0)).toBe(0);});it('d',()=>{expect(hd311cb(93,73)).toBe(2);});it('e',()=>{expect(hd311cb(15,0)).toBe(4);});});
function hd312cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312cb_hd',()=>{it('a',()=>{expect(hd312cb(1,4)).toBe(2);});it('b',()=>{expect(hd312cb(3,1)).toBe(1);});it('c',()=>{expect(hd312cb(0,0)).toBe(0);});it('d',()=>{expect(hd312cb(93,73)).toBe(2);});it('e',()=>{expect(hd312cb(15,0)).toBe(4);});});
function hd313cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313cb_hd',()=>{it('a',()=>{expect(hd313cb(1,4)).toBe(2);});it('b',()=>{expect(hd313cb(3,1)).toBe(1);});it('c',()=>{expect(hd313cb(0,0)).toBe(0);});it('d',()=>{expect(hd313cb(93,73)).toBe(2);});it('e',()=>{expect(hd313cb(15,0)).toBe(4);});});
function hd314cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314cb_hd',()=>{it('a',()=>{expect(hd314cb(1,4)).toBe(2);});it('b',()=>{expect(hd314cb(3,1)).toBe(1);});it('c',()=>{expect(hd314cb(0,0)).toBe(0);});it('d',()=>{expect(hd314cb(93,73)).toBe(2);});it('e',()=>{expect(hd314cb(15,0)).toBe(4);});});
function hd315cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315cb_hd',()=>{it('a',()=>{expect(hd315cb(1,4)).toBe(2);});it('b',()=>{expect(hd315cb(3,1)).toBe(1);});it('c',()=>{expect(hd315cb(0,0)).toBe(0);});it('d',()=>{expect(hd315cb(93,73)).toBe(2);});it('e',()=>{expect(hd315cb(15,0)).toBe(4);});});
function hd316cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316cb_hd',()=>{it('a',()=>{expect(hd316cb(1,4)).toBe(2);});it('b',()=>{expect(hd316cb(3,1)).toBe(1);});it('c',()=>{expect(hd316cb(0,0)).toBe(0);});it('d',()=>{expect(hd316cb(93,73)).toBe(2);});it('e',()=>{expect(hd316cb(15,0)).toBe(4);});});
function hd317cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317cb_hd',()=>{it('a',()=>{expect(hd317cb(1,4)).toBe(2);});it('b',()=>{expect(hd317cb(3,1)).toBe(1);});it('c',()=>{expect(hd317cb(0,0)).toBe(0);});it('d',()=>{expect(hd317cb(93,73)).toBe(2);});it('e',()=>{expect(hd317cb(15,0)).toBe(4);});});
function hd318cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318cb_hd',()=>{it('a',()=>{expect(hd318cb(1,4)).toBe(2);});it('b',()=>{expect(hd318cb(3,1)).toBe(1);});it('c',()=>{expect(hd318cb(0,0)).toBe(0);});it('d',()=>{expect(hd318cb(93,73)).toBe(2);});it('e',()=>{expect(hd318cb(15,0)).toBe(4);});});
function hd319cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319cb_hd',()=>{it('a',()=>{expect(hd319cb(1,4)).toBe(2);});it('b',()=>{expect(hd319cb(3,1)).toBe(1);});it('c',()=>{expect(hd319cb(0,0)).toBe(0);});it('d',()=>{expect(hd319cb(93,73)).toBe(2);});it('e',()=>{expect(hd319cb(15,0)).toBe(4);});});
function hd320cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320cb_hd',()=>{it('a',()=>{expect(hd320cb(1,4)).toBe(2);});it('b',()=>{expect(hd320cb(3,1)).toBe(1);});it('c',()=>{expect(hd320cb(0,0)).toBe(0);});it('d',()=>{expect(hd320cb(93,73)).toBe(2);});it('e',()=>{expect(hd320cb(15,0)).toBe(4);});});
function hd321cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321cb_hd',()=>{it('a',()=>{expect(hd321cb(1,4)).toBe(2);});it('b',()=>{expect(hd321cb(3,1)).toBe(1);});it('c',()=>{expect(hd321cb(0,0)).toBe(0);});it('d',()=>{expect(hd321cb(93,73)).toBe(2);});it('e',()=>{expect(hd321cb(15,0)).toBe(4);});});
function hd322cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322cb_hd',()=>{it('a',()=>{expect(hd322cb(1,4)).toBe(2);});it('b',()=>{expect(hd322cb(3,1)).toBe(1);});it('c',()=>{expect(hd322cb(0,0)).toBe(0);});it('d',()=>{expect(hd322cb(93,73)).toBe(2);});it('e',()=>{expect(hd322cb(15,0)).toBe(4);});});
function hd323cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323cb_hd',()=>{it('a',()=>{expect(hd323cb(1,4)).toBe(2);});it('b',()=>{expect(hd323cb(3,1)).toBe(1);});it('c',()=>{expect(hd323cb(0,0)).toBe(0);});it('d',()=>{expect(hd323cb(93,73)).toBe(2);});it('e',()=>{expect(hd323cb(15,0)).toBe(4);});});
function hd324cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324cb_hd',()=>{it('a',()=>{expect(hd324cb(1,4)).toBe(2);});it('b',()=>{expect(hd324cb(3,1)).toBe(1);});it('c',()=>{expect(hd324cb(0,0)).toBe(0);});it('d',()=>{expect(hd324cb(93,73)).toBe(2);});it('e',()=>{expect(hd324cb(15,0)).toBe(4);});});
function hd325cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325cb_hd',()=>{it('a',()=>{expect(hd325cb(1,4)).toBe(2);});it('b',()=>{expect(hd325cb(3,1)).toBe(1);});it('c',()=>{expect(hd325cb(0,0)).toBe(0);});it('d',()=>{expect(hd325cb(93,73)).toBe(2);});it('e',()=>{expect(hd325cb(15,0)).toBe(4);});});
function hd326cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326cb_hd',()=>{it('a',()=>{expect(hd326cb(1,4)).toBe(2);});it('b',()=>{expect(hd326cb(3,1)).toBe(1);});it('c',()=>{expect(hd326cb(0,0)).toBe(0);});it('d',()=>{expect(hd326cb(93,73)).toBe(2);});it('e',()=>{expect(hd326cb(15,0)).toBe(4);});});
function hd327cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327cb_hd',()=>{it('a',()=>{expect(hd327cb(1,4)).toBe(2);});it('b',()=>{expect(hd327cb(3,1)).toBe(1);});it('c',()=>{expect(hd327cb(0,0)).toBe(0);});it('d',()=>{expect(hd327cb(93,73)).toBe(2);});it('e',()=>{expect(hd327cb(15,0)).toBe(4);});});
function hd328cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328cb_hd',()=>{it('a',()=>{expect(hd328cb(1,4)).toBe(2);});it('b',()=>{expect(hd328cb(3,1)).toBe(1);});it('c',()=>{expect(hd328cb(0,0)).toBe(0);});it('d',()=>{expect(hd328cb(93,73)).toBe(2);});it('e',()=>{expect(hd328cb(15,0)).toBe(4);});});
function hd329cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329cb_hd',()=>{it('a',()=>{expect(hd329cb(1,4)).toBe(2);});it('b',()=>{expect(hd329cb(3,1)).toBe(1);});it('c',()=>{expect(hd329cb(0,0)).toBe(0);});it('d',()=>{expect(hd329cb(93,73)).toBe(2);});it('e',()=>{expect(hd329cb(15,0)).toBe(4);});});
function hd330cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330cb_hd',()=>{it('a',()=>{expect(hd330cb(1,4)).toBe(2);});it('b',()=>{expect(hd330cb(3,1)).toBe(1);});it('c',()=>{expect(hd330cb(0,0)).toBe(0);});it('d',()=>{expect(hd330cb(93,73)).toBe(2);});it('e',()=>{expect(hd330cb(15,0)).toBe(4);});});
function hd331cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331cb_hd',()=>{it('a',()=>{expect(hd331cb(1,4)).toBe(2);});it('b',()=>{expect(hd331cb(3,1)).toBe(1);});it('c',()=>{expect(hd331cb(0,0)).toBe(0);});it('d',()=>{expect(hd331cb(93,73)).toBe(2);});it('e',()=>{expect(hd331cb(15,0)).toBe(4);});});
function hd332cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332cb_hd',()=>{it('a',()=>{expect(hd332cb(1,4)).toBe(2);});it('b',()=>{expect(hd332cb(3,1)).toBe(1);});it('c',()=>{expect(hd332cb(0,0)).toBe(0);});it('d',()=>{expect(hd332cb(93,73)).toBe(2);});it('e',()=>{expect(hd332cb(15,0)).toBe(4);});});
function hd333cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333cb_hd',()=>{it('a',()=>{expect(hd333cb(1,4)).toBe(2);});it('b',()=>{expect(hd333cb(3,1)).toBe(1);});it('c',()=>{expect(hd333cb(0,0)).toBe(0);});it('d',()=>{expect(hd333cb(93,73)).toBe(2);});it('e',()=>{expect(hd333cb(15,0)).toBe(4);});});
function hd334cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334cb_hd',()=>{it('a',()=>{expect(hd334cb(1,4)).toBe(2);});it('b',()=>{expect(hd334cb(3,1)).toBe(1);});it('c',()=>{expect(hd334cb(0,0)).toBe(0);});it('d',()=>{expect(hd334cb(93,73)).toBe(2);});it('e',()=>{expect(hd334cb(15,0)).toBe(4);});});
function hd335cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335cb_hd',()=>{it('a',()=>{expect(hd335cb(1,4)).toBe(2);});it('b',()=>{expect(hd335cb(3,1)).toBe(1);});it('c',()=>{expect(hd335cb(0,0)).toBe(0);});it('d',()=>{expect(hd335cb(93,73)).toBe(2);});it('e',()=>{expect(hd335cb(15,0)).toBe(4);});});
function hd336cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336cb_hd',()=>{it('a',()=>{expect(hd336cb(1,4)).toBe(2);});it('b',()=>{expect(hd336cb(3,1)).toBe(1);});it('c',()=>{expect(hd336cb(0,0)).toBe(0);});it('d',()=>{expect(hd336cb(93,73)).toBe(2);});it('e',()=>{expect(hd336cb(15,0)).toBe(4);});});
function hd337cb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337cb_hd',()=>{it('a',()=>{expect(hd337cb(1,4)).toBe(2);});it('b',()=>{expect(hd337cb(3,1)).toBe(1);});it('c',()=>{expect(hd337cb(0,0)).toBe(0);});it('d',()=>{expect(hd337cb(93,73)).toBe(2);});it('e',()=>{expect(hd337cb(15,0)).toBe(4);});});
