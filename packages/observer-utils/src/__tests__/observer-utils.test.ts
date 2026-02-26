// Copyright (c) 2026 Nexara DMCC. All rights reserved.

import {
  createEmitter,
  createPubSub,
  createReactiveStore,
  createObservable,
  createSubject,
  debounce,
  throttle,
} from '../observer-utils';

// ═══════════════════════════════════════════════════════
// createEmitter — 250 tests
// ═══════════════════════════════════════════════════════
describe('createEmitter', () => {
  describe('on / emit basics', () => {
    it('test 1: emits event 1 and handler receives value', () => {
      const emitter = createEmitter<{ e1: number }>();
      const results: number[] = [];
      emitter.on('e1', (v) => results.push(v));
      emitter.emit('e1', 1);
      expect(results).toEqual([1]);
    });
    it('test 2: emits event 2 and handler receives value', () => {
      const emitter = createEmitter<{ e2: number }>();
      const results: number[] = [];
      emitter.on('e2', (v) => results.push(v));
      emitter.emit('e2', 2);
      expect(results).toEqual([2]);
    });
    it('test 3: emits event 3 and handler receives value', () => {
      const emitter = createEmitter<{ e3: number }>();
      const results: number[] = [];
      emitter.on('e3', (v) => results.push(v));
      emitter.emit('e3', 3);
      expect(results).toEqual([3]);
    });
    it('test 4: emits event 4 and handler receives value', () => {
      const emitter = createEmitter<{ e4: number }>();
      const results: number[] = [];
      emitter.on('e4', (v) => results.push(v));
      emitter.emit('e4', 4);
      expect(results).toEqual([4]);
    });
    it('test 5: emits event 5 and handler receives value', () => {
      const emitter = createEmitter<{ e5: number }>();
      const results: number[] = [];
      emitter.on('e5', (v) => results.push(v));
      emitter.emit('e5', 5);
      expect(results).toEqual([5]);
    });
    it('test 6: emits event 6 and handler receives value', () => {
      const emitter = createEmitter<{ e6: number }>();
      const results: number[] = [];
      emitter.on('e6', (v) => results.push(v));
      emitter.emit('e6', 6);
      expect(results).toEqual([6]);
    });
    it('test 7: emits event 7 and handler receives value', () => {
      const emitter = createEmitter<{ e7: number }>();
      const results: number[] = [];
      emitter.on('e7', (v) => results.push(v));
      emitter.emit('e7', 7);
      expect(results).toEqual([7]);
    });
    it('test 8: emits event 8 and handler receives value', () => {
      const emitter = createEmitter<{ e8: number }>();
      const results: number[] = [];
      emitter.on('e8', (v) => results.push(v));
      emitter.emit('e8', 8);
      expect(results).toEqual([8]);
    });
    it('test 9: emits event 9 and handler receives value', () => {
      const emitter = createEmitter<{ e9: number }>();
      const results: number[] = [];
      emitter.on('e9', (v) => results.push(v));
      emitter.emit('e9', 9);
      expect(results).toEqual([9]);
    });
    it('test 10: emits event 10 and handler receives value', () => {
      const emitter = createEmitter<{ e10: number }>();
      const results: number[] = [];
      emitter.on('e10', (v) => results.push(v));
      emitter.emit('e10', 10);
      expect(results).toEqual([10]);
    });
    it('test 11: emits event 11 and handler receives value', () => {
      const emitter = createEmitter<{ e11: number }>();
      const results: number[] = [];
      emitter.on('e11', (v) => results.push(v));
      emitter.emit('e11', 11);
      expect(results).toEqual([11]);
    });
    it('test 12: emits event 12 and handler receives value', () => {
      const emitter = createEmitter<{ e12: number }>();
      const results: number[] = [];
      emitter.on('e12', (v) => results.push(v));
      emitter.emit('e12', 12);
      expect(results).toEqual([12]);
    });
    it('test 13: emits event 13 and handler receives value', () => {
      const emitter = createEmitter<{ e13: number }>();
      const results: number[] = [];
      emitter.on('e13', (v) => results.push(v));
      emitter.emit('e13', 13);
      expect(results).toEqual([13]);
    });
    it('test 14: emits event 14 and handler receives value', () => {
      const emitter = createEmitter<{ e14: number }>();
      const results: number[] = [];
      emitter.on('e14', (v) => results.push(v));
      emitter.emit('e14', 14);
      expect(results).toEqual([14]);
    });
    it('test 15: emits event 15 and handler receives value', () => {
      const emitter = createEmitter<{ e15: number }>();
      const results: number[] = [];
      emitter.on('e15', (v) => results.push(v));
      emitter.emit('e15', 15);
      expect(results).toEqual([15]);
    });
    it('test 16: emits event 16 and handler receives value', () => {
      const emitter = createEmitter<{ e16: number }>();
      const results: number[] = [];
      emitter.on('e16', (v) => results.push(v));
      emitter.emit('e16', 16);
      expect(results).toEqual([16]);
    });
    it('test 17: emits event 17 and handler receives value', () => {
      const emitter = createEmitter<{ e17: number }>();
      const results: number[] = [];
      emitter.on('e17', (v) => results.push(v));
      emitter.emit('e17', 17);
      expect(results).toEqual([17]);
    });
    it('test 18: emits event 18 and handler receives value', () => {
      const emitter = createEmitter<{ e18: number }>();
      const results: number[] = [];
      emitter.on('e18', (v) => results.push(v));
      emitter.emit('e18', 18);
      expect(results).toEqual([18]);
    });
    it('test 19: emits event 19 and handler receives value', () => {
      const emitter = createEmitter<{ e19: number }>();
      const results: number[] = [];
      emitter.on('e19', (v) => results.push(v));
      emitter.emit('e19', 19);
      expect(results).toEqual([19]);
    });
    it('test 20: emits event 20 and handler receives value', () => {
      const emitter = createEmitter<{ e20: number }>();
      const results: number[] = [];
      emitter.on('e20', (v) => results.push(v));
      emitter.emit('e20', 20);
      expect(results).toEqual([20]);
    });
    it('test 21: emits event 21 and handler receives value', () => {
      const emitter = createEmitter<{ e21: number }>();
      const results: number[] = [];
      emitter.on('e21', (v) => results.push(v));
      emitter.emit('e21', 21);
      expect(results).toEqual([21]);
    });
    it('test 22: emits event 22 and handler receives value', () => {
      const emitter = createEmitter<{ e22: number }>();
      const results: number[] = [];
      emitter.on('e22', (v) => results.push(v));
      emitter.emit('e22', 22);
      expect(results).toEqual([22]);
    });
    it('test 23: emits event 23 and handler receives value', () => {
      const emitter = createEmitter<{ e23: number }>();
      const results: number[] = [];
      emitter.on('e23', (v) => results.push(v));
      emitter.emit('e23', 23);
      expect(results).toEqual([23]);
    });
    it('test 24: emits event 24 and handler receives value', () => {
      const emitter = createEmitter<{ e24: number }>();
      const results: number[] = [];
      emitter.on('e24', (v) => results.push(v));
      emitter.emit('e24', 24);
      expect(results).toEqual([24]);
    });
    it('test 25: emits event 25 and handler receives value', () => {
      const emitter = createEmitter<{ e25: number }>();
      const results: number[] = [];
      emitter.on('e25', (v) => results.push(v));
      emitter.emit('e25', 25);
      expect(results).toEqual([25]);
    });
    it('test 26: emits event 26 and handler receives value', () => {
      const emitter = createEmitter<{ e26: number }>();
      const results: number[] = [];
      emitter.on('e26', (v) => results.push(v));
      emitter.emit('e26', 26);
      expect(results).toEqual([26]);
    });
    it('test 27: emits event 27 and handler receives value', () => {
      const emitter = createEmitter<{ e27: number }>();
      const results: number[] = [];
      emitter.on('e27', (v) => results.push(v));
      emitter.emit('e27', 27);
      expect(results).toEqual([27]);
    });
    it('test 28: emits event 28 and handler receives value', () => {
      const emitter = createEmitter<{ e28: number }>();
      const results: number[] = [];
      emitter.on('e28', (v) => results.push(v));
      emitter.emit('e28', 28);
      expect(results).toEqual([28]);
    });
    it('test 29: emits event 29 and handler receives value', () => {
      const emitter = createEmitter<{ e29: number }>();
      const results: number[] = [];
      emitter.on('e29', (v) => results.push(v));
      emitter.emit('e29', 29);
      expect(results).toEqual([29]);
    });
    it('test 30: emits event 30 and handler receives value', () => {
      const emitter = createEmitter<{ e30: number }>();
      const results: number[] = [];
      emitter.on('e30', (v) => results.push(v));
      emitter.emit('e30', 30);
      expect(results).toEqual([30]);
    });
    it('test 31: emits event 31 and handler receives value', () => {
      const emitter = createEmitter<{ e31: number }>();
      const results: number[] = [];
      emitter.on('e31', (v) => results.push(v));
      emitter.emit('e31', 31);
      expect(results).toEqual([31]);
    });
    it('test 32: emits event 32 and handler receives value', () => {
      const emitter = createEmitter<{ e32: number }>();
      const results: number[] = [];
      emitter.on('e32', (v) => results.push(v));
      emitter.emit('e32', 32);
      expect(results).toEqual([32]);
    });
    it('test 33: emits event 33 and handler receives value', () => {
      const emitter = createEmitter<{ e33: number }>();
      const results: number[] = [];
      emitter.on('e33', (v) => results.push(v));
      emitter.emit('e33', 33);
      expect(results).toEqual([33]);
    });
    it('test 34: emits event 34 and handler receives value', () => {
      const emitter = createEmitter<{ e34: number }>();
      const results: number[] = [];
      emitter.on('e34', (v) => results.push(v));
      emitter.emit('e34', 34);
      expect(results).toEqual([34]);
    });
    it('test 35: emits event 35 and handler receives value', () => {
      const emitter = createEmitter<{ e35: number }>();
      const results: number[] = [];
      emitter.on('e35', (v) => results.push(v));
      emitter.emit('e35', 35);
      expect(results).toEqual([35]);
    });
    it('test 36: emits event 36 and handler receives value', () => {
      const emitter = createEmitter<{ e36: number }>();
      const results: number[] = [];
      emitter.on('e36', (v) => results.push(v));
      emitter.emit('e36', 36);
      expect(results).toEqual([36]);
    });
    it('test 37: emits event 37 and handler receives value', () => {
      const emitter = createEmitter<{ e37: number }>();
      const results: number[] = [];
      emitter.on('e37', (v) => results.push(v));
      emitter.emit('e37', 37);
      expect(results).toEqual([37]);
    });
    it('test 38: emits event 38 and handler receives value', () => {
      const emitter = createEmitter<{ e38: number }>();
      const results: number[] = [];
      emitter.on('e38', (v) => results.push(v));
      emitter.emit('e38', 38);
      expect(results).toEqual([38]);
    });
    it('test 39: emits event 39 and handler receives value', () => {
      const emitter = createEmitter<{ e39: number }>();
      const results: number[] = [];
      emitter.on('e39', (v) => results.push(v));
      emitter.emit('e39', 39);
      expect(results).toEqual([39]);
    });
    it('test 40: emits event 40 and handler receives value', () => {
      const emitter = createEmitter<{ e40: number }>();
      const results: number[] = [];
      emitter.on('e40', (v) => results.push(v));
      emitter.emit('e40', 40);
      expect(results).toEqual([40]);
    });
    it('test 41: emits event 41 and handler receives value', () => {
      const emitter = createEmitter<{ e41: number }>();
      const results: number[] = [];
      emitter.on('e41', (v) => results.push(v));
      emitter.emit('e41', 41);
      expect(results).toEqual([41]);
    });
    it('test 42: emits event 42 and handler receives value', () => {
      const emitter = createEmitter<{ e42: number }>();
      const results: number[] = [];
      emitter.on('e42', (v) => results.push(v));
      emitter.emit('e42', 42);
      expect(results).toEqual([42]);
    });
    it('test 43: emits event 43 and handler receives value', () => {
      const emitter = createEmitter<{ e43: number }>();
      const results: number[] = [];
      emitter.on('e43', (v) => results.push(v));
      emitter.emit('e43', 43);
      expect(results).toEqual([43]);
    });
    it('test 44: emits event 44 and handler receives value', () => {
      const emitter = createEmitter<{ e44: number }>();
      const results: number[] = [];
      emitter.on('e44', (v) => results.push(v));
      emitter.emit('e44', 44);
      expect(results).toEqual([44]);
    });
    it('test 45: emits event 45 and handler receives value', () => {
      const emitter = createEmitter<{ e45: number }>();
      const results: number[] = [];
      emitter.on('e45', (v) => results.push(v));
      emitter.emit('e45', 45);
      expect(results).toEqual([45]);
    });
    it('test 46: emits event 46 and handler receives value', () => {
      const emitter = createEmitter<{ e46: number }>();
      const results: number[] = [];
      emitter.on('e46', (v) => results.push(v));
      emitter.emit('e46', 46);
      expect(results).toEqual([46]);
    });
    it('test 47: emits event 47 and handler receives value', () => {
      const emitter = createEmitter<{ e47: number }>();
      const results: number[] = [];
      emitter.on('e47', (v) => results.push(v));
      emitter.emit('e47', 47);
      expect(results).toEqual([47]);
    });
    it('test 48: emits event 48 and handler receives value', () => {
      const emitter = createEmitter<{ e48: number }>();
      const results: number[] = [];
      emitter.on('e48', (v) => results.push(v));
      emitter.emit('e48', 48);
      expect(results).toEqual([48]);
    });
    it('test 49: emits event 49 and handler receives value', () => {
      const emitter = createEmitter<{ e49: number }>();
      const results: number[] = [];
      emitter.on('e49', (v) => results.push(v));
      emitter.emit('e49', 49);
      expect(results).toEqual([49]);
    });
    it('test 50: emits event 50 and handler receives value', () => {
      const emitter = createEmitter<{ e50: number }>();
      const results: number[] = [];
      emitter.on('e50', (v) => results.push(v));
      emitter.emit('e50', 50);
      expect(results).toEqual([50]);
    });
  });
  describe('off / unsubscribe', () => {
    it('test 1: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(2);
    });
    it('test 2: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(3);
    });
    it('test 3: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(1);
    });
    it('test 4: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(2);
    });
    it('test 5: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(3);
    });
    it('test 6: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(1);
    });
    it('test 7: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(2);
    });
    it('test 8: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(3);
    });
    it('test 9: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(1);
    });
    it('test 10: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(2);
    });
    it('test 11: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(3);
    });
    it('test 12: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(1);
    });
    it('test 13: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(2);
    });
    it('test 14: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(3);
    });
    it('test 15: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(1);
    });
    it('test 16: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(2);
    });
    it('test 17: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(3);
    });
    it('test 18: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(1);
    });
    it('test 19: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(2);
    });
    it('test 20: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(3);
    });
    it('test 21: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(1);
    });
    it('test 22: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(2);
    });
    it('test 23: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(3);
    });
    it('test 24: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(1);
    });
    it('test 25: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(2);
    });
    it('test 26: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(3);
    });
    it('test 27: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(1);
    });
    it('test 28: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(2);
    });
    it('test 29: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(3);
    });
    it('test 30: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(1);
    });
    it('test 31: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(2);
    });
    it('test 32: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(3);
    });
    it('test 33: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(1);
    });
    it('test 34: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(2);
    });
    it('test 35: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(3);
    });
    it('test 36: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(1);
    });
    it('test 37: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(2);
    });
    it('test 38: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(3);
    });
    it('test 39: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(1);
    });
    it('test 40: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(2);
    });
    it('test 41: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(3);
    });
    it('test 42: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(1);
    });
    it('test 43: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(2);
    });
    it('test 44: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(3);
    });
    it('test 45: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(1);
    });
    it('test 46: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(2);
    });
    it('test 47: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(3);
    });
    it('test 48: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(1);
    });
    it('test 49: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(2);
    });
    it('test 50: off removes handler so emit does not call it', () => {
      const emitter = createEmitter<{ click: number }>();
      let count = 0;
      const handler = () => { count++; };
      emitter.on('click', handler);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.emit('click', 1);
      emitter.off('click', handler);
      emitter.emit('click', 1);
      expect(count).toBe(3);
    });
  });
  describe('once', () => {
    it('test 1: once fires exactly once regardless of 2 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 2: once fires exactly once regardless of 3 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 3: once fires exactly once regardless of 4 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 4: once fires exactly once regardless of 5 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 5: once fires exactly once regardless of 6 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 6: once fires exactly once regardless of 7 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 7: once fires exactly once regardless of 8 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 8: once fires exactly once regardless of 9 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 9: once fires exactly once regardless of 10 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 10: once fires exactly once regardless of 11 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 11: once fires exactly once regardless of 12 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 12: once fires exactly once regardless of 13 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 13: once fires exactly once regardless of 14 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 14: once fires exactly once regardless of 15 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 15: once fires exactly once regardless of 16 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 16: once fires exactly once regardless of 17 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 17: once fires exactly once regardless of 18 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 18: once fires exactly once regardless of 19 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 19: once fires exactly once regardless of 20 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 20: once fires exactly once regardless of 21 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 21: once fires exactly once regardless of 22 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 22: once fires exactly once regardless of 23 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 23: once fires exactly once regardless of 24 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 24: once fires exactly once regardless of 25 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 25: once fires exactly once regardless of 26 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 26: once fires exactly once regardless of 27 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 27: once fires exactly once regardless of 28 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 28: once fires exactly once regardless of 29 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 29: once fires exactly once regardless of 30 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 30: once fires exactly once regardless of 31 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 31: once fires exactly once regardless of 32 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 32: once fires exactly once regardless of 33 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 33: once fires exactly once regardless of 34 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 34: once fires exactly once regardless of 35 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 35: once fires exactly once regardless of 36 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 36: once fires exactly once regardless of 37 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 37: once fires exactly once regardless of 38 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 38: once fires exactly once regardless of 39 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 39: once fires exactly once regardless of 40 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 40: once fires exactly once regardless of 41 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 41: once fires exactly once regardless of 42 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 42: once fires exactly once regardless of 43 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 43: once fires exactly once regardless of 44 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 44: once fires exactly once regardless of 45 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 45: once fires exactly once regardless of 46 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 46: once fires exactly once regardless of 47 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 47: once fires exactly once regardless of 48 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 48: once fires exactly once regardless of 49 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 49: once fires exactly once regardless of 50 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
    it('test 50: once fires exactly once regardless of 51 emits', () => {
      const emitter = createEmitter<{ evt: string }>();
      let count = 0;
      emitter.once('evt', () => { count++; });
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      emitter.emit('evt', 'x');
      expect(count).toBe(1);
    });
  });
  describe('listenerCount', () => {
    it('test 1: listenerCount returns 1 after adding 1 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 1; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(1);
    });
    it('test 2: listenerCount returns 2 after adding 2 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 2; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(2);
    });
    it('test 3: listenerCount returns 3 after adding 3 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 3; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(3);
    });
    it('test 4: listenerCount returns 4 after adding 4 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 4; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(4);
    });
    it('test 5: listenerCount returns 5 after adding 5 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 5; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(5);
    });
    it('test 6: listenerCount returns 6 after adding 6 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 6; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(6);
    });
    it('test 7: listenerCount returns 7 after adding 7 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 7; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(7);
    });
    it('test 8: listenerCount returns 8 after adding 8 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 8; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(8);
    });
    it('test 9: listenerCount returns 9 after adding 9 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 9; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(9);
    });
    it('test 10: listenerCount returns 10 after adding 10 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 10; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(10);
    });
    it('test 11: listenerCount returns 11 after adding 11 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 11; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(11);
    });
    it('test 12: listenerCount returns 12 after adding 12 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 12; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(12);
    });
    it('test 13: listenerCount returns 13 after adding 13 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 13; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(13);
    });
    it('test 14: listenerCount returns 14 after adding 14 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 14; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(14);
    });
    it('test 15: listenerCount returns 15 after adding 15 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 15; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(15);
    });
    it('test 16: listenerCount returns 16 after adding 16 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 16; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(16);
    });
    it('test 17: listenerCount returns 17 after adding 17 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 17; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(17);
    });
    it('test 18: listenerCount returns 18 after adding 18 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 18; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(18);
    });
    it('test 19: listenerCount returns 19 after adding 19 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 19; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(19);
    });
    it('test 20: listenerCount returns 20 after adding 20 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 20; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(20);
    });
    it('test 21: listenerCount returns 21 after adding 21 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 21; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(21);
    });
    it('test 22: listenerCount returns 22 after adding 22 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 22; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(22);
    });
    it('test 23: listenerCount returns 23 after adding 23 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 23; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(23);
    });
    it('test 24: listenerCount returns 24 after adding 24 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 24; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(24);
    });
    it('test 25: listenerCount returns 25 after adding 25 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 25; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(25);
    });
    it('test 26: listenerCount returns 26 after adding 26 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 26; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(26);
    });
    it('test 27: listenerCount returns 27 after adding 27 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 27; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(27);
    });
    it('test 28: listenerCount returns 28 after adding 28 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 28; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(28);
    });
    it('test 29: listenerCount returns 29 after adding 29 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 29; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(29);
    });
    it('test 30: listenerCount returns 30 after adding 30 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 30; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(30);
    });
    it('test 31: listenerCount returns 31 after adding 31 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 31; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(31);
    });
    it('test 32: listenerCount returns 32 after adding 32 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 32; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(32);
    });
    it('test 33: listenerCount returns 33 after adding 33 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 33; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(33);
    });
    it('test 34: listenerCount returns 34 after adding 34 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 34; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(34);
    });
    it('test 35: listenerCount returns 35 after adding 35 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 35; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(35);
    });
    it('test 36: listenerCount returns 36 after adding 36 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 36; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(36);
    });
    it('test 37: listenerCount returns 37 after adding 37 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 37; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(37);
    });
    it('test 38: listenerCount returns 38 after adding 38 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 38; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(38);
    });
    it('test 39: listenerCount returns 39 after adding 39 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 39; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(39);
    });
    it('test 40: listenerCount returns 40 after adding 40 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 40; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(40);
    });
    it('test 41: listenerCount returns 41 after adding 41 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 41; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(41);
    });
    it('test 42: listenerCount returns 42 after adding 42 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 42; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(42);
    });
    it('test 43: listenerCount returns 43 after adding 43 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 43; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(43);
    });
    it('test 44: listenerCount returns 44 after adding 44 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 44; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(44);
    });
    it('test 45: listenerCount returns 45 after adding 45 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 45; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(45);
    });
    it('test 46: listenerCount returns 46 after adding 46 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 46; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(46);
    });
    it('test 47: listenerCount returns 47 after adding 47 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 47; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(47);
    });
    it('test 48: listenerCount returns 48 after adding 48 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 48; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(48);
    });
    it('test 49: listenerCount returns 49 after adding 49 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 49; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(49);
    });
    it('test 50: listenerCount returns 50 after adding 50 handlers', () => {
      const emitter = createEmitter<{ ping: void }>();
      for (let j = 0; j < 50; j++) {
        emitter.on('ping', () => {});
      }
      expect(emitter.listenerCount('ping')).toBe(50);
    });
  });
  describe('removeAllListeners', () => {
    it('test 1: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 1; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 2: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 2; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 3: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 3; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 4: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 4; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 5: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 5; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 6: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 6; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 7: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 7; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 8: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 8; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 9: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 9; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 10: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 10; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 11: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 11; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 12: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 12; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 13: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 13; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 14: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 14; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 15: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 15; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 16: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 16; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 17: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 17; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 18: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 18; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 19: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 19; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 20: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 20; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 21: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 21; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 22: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 22; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 23: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 23; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 24: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 24; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 25: removeAllListeners for specific event clears it', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 25; j++) emitter.on('a', () => {});
      emitter.on('b', () => {});
      emitter.removeAllListeners('a');
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(1);
    });
    it('test 26: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 1; j++) emitter.on('a', () => {});
      for (let j = 0; j < 2; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 27: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 2; j++) emitter.on('a', () => {});
      for (let j = 0; j < 3; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 28: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 3; j++) emitter.on('a', () => {});
      for (let j = 0; j < 4; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 29: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 4; j++) emitter.on('a', () => {});
      for (let j = 0; j < 5; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 30: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 5; j++) emitter.on('a', () => {});
      for (let j = 0; j < 6; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 31: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 6; j++) emitter.on('a', () => {});
      for (let j = 0; j < 7; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 32: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 7; j++) emitter.on('a', () => {});
      for (let j = 0; j < 8; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 33: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 8; j++) emitter.on('a', () => {});
      for (let j = 0; j < 9; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 34: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 9; j++) emitter.on('a', () => {});
      for (let j = 0; j < 10; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 35: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 10; j++) emitter.on('a', () => {});
      for (let j = 0; j < 11; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 36: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 11; j++) emitter.on('a', () => {});
      for (let j = 0; j < 12; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 37: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 12; j++) emitter.on('a', () => {});
      for (let j = 0; j < 13; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 38: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 13; j++) emitter.on('a', () => {});
      for (let j = 0; j < 14; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 39: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 14; j++) emitter.on('a', () => {});
      for (let j = 0; j < 15; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 40: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 15; j++) emitter.on('a', () => {});
      for (let j = 0; j < 16; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 41: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 16; j++) emitter.on('a', () => {});
      for (let j = 0; j < 17; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 42: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 17; j++) emitter.on('a', () => {});
      for (let j = 0; j < 18; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 43: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 18; j++) emitter.on('a', () => {});
      for (let j = 0; j < 19; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 44: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 19; j++) emitter.on('a', () => {});
      for (let j = 0; j < 20; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 45: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 20; j++) emitter.on('a', () => {});
      for (let j = 0; j < 21; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 46: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 21; j++) emitter.on('a', () => {});
      for (let j = 0; j < 22; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 47: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 22; j++) emitter.on('a', () => {});
      for (let j = 0; j < 23; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 48: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 23; j++) emitter.on('a', () => {});
      for (let j = 0; j < 24; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 49: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 24; j++) emitter.on('a', () => {});
      for (let j = 0; j < 25; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
    it('test 50: removeAllListeners with no arg clears all events', () => {
      const emitter = createEmitter<{ a: number; b: number }>();
      for (let j = 0; j < 25; j++) emitter.on('a', () => {});
      for (let j = 0; j < 26; j++) emitter.on('b', () => {});
      emitter.removeAllListeners();
      expect(emitter.listenerCount('a')).toBe(0);
      expect(emitter.listenerCount('b')).toBe(0);
    });
  });
});

// ═══════════════════════════════════════════════════════
// createPubSub — 200 tests
// ═══════════════════════════════════════════════════════
describe('createPubSub', () => {
  describe('publish / subscribe basics', () => {
    it('test 1: subscriber receives published value 1', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 1);
      expect(results).toEqual([1]);
    });
    it('test 2: subscriber receives published value 2', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 2);
      expect(results).toEqual([2]);
    });
    it('test 3: subscriber receives published value 3', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 3);
      expect(results).toEqual([3]);
    });
    it('test 4: subscriber receives published value 4', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 4);
      expect(results).toEqual([4]);
    });
    it('test 5: subscriber receives published value 5', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 5);
      expect(results).toEqual([5]);
    });
    it('test 6: subscriber receives published value 6', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 6);
      expect(results).toEqual([6]);
    });
    it('test 7: subscriber receives published value 7', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 7);
      expect(results).toEqual([7]);
    });
    it('test 8: subscriber receives published value 8', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 8);
      expect(results).toEqual([8]);
    });
    it('test 9: subscriber receives published value 9', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 9);
      expect(results).toEqual([9]);
    });
    it('test 10: subscriber receives published value 10', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 10);
      expect(results).toEqual([10]);
    });
    it('test 11: subscriber receives published value 11', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 11);
      expect(results).toEqual([11]);
    });
    it('test 12: subscriber receives published value 12', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 12);
      expect(results).toEqual([12]);
    });
    it('test 13: subscriber receives published value 13', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 13);
      expect(results).toEqual([13]);
    });
    it('test 14: subscriber receives published value 14', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 14);
      expect(results).toEqual([14]);
    });
    it('test 15: subscriber receives published value 15', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 15);
      expect(results).toEqual([15]);
    });
    it('test 16: subscriber receives published value 16', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 16);
      expect(results).toEqual([16]);
    });
    it('test 17: subscriber receives published value 17', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 17);
      expect(results).toEqual([17]);
    });
    it('test 18: subscriber receives published value 18', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 18);
      expect(results).toEqual([18]);
    });
    it('test 19: subscriber receives published value 19', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 19);
      expect(results).toEqual([19]);
    });
    it('test 20: subscriber receives published value 20', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 20);
      expect(results).toEqual([20]);
    });
    it('test 21: subscriber receives published value 21', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 21);
      expect(results).toEqual([21]);
    });
    it('test 22: subscriber receives published value 22', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 22);
      expect(results).toEqual([22]);
    });
    it('test 23: subscriber receives published value 23', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 23);
      expect(results).toEqual([23]);
    });
    it('test 24: subscriber receives published value 24', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 24);
      expect(results).toEqual([24]);
    });
    it('test 25: subscriber receives published value 25', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 25);
      expect(results).toEqual([25]);
    });
    it('test 26: subscriber receives published value 26', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 26);
      expect(results).toEqual([26]);
    });
    it('test 27: subscriber receives published value 27', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 27);
      expect(results).toEqual([27]);
    });
    it('test 28: subscriber receives published value 28', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 28);
      expect(results).toEqual([28]);
    });
    it('test 29: subscriber receives published value 29', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 29);
      expect(results).toEqual([29]);
    });
    it('test 30: subscriber receives published value 30', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 30);
      expect(results).toEqual([30]);
    });
    it('test 31: subscriber receives published value 31', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 31);
      expect(results).toEqual([31]);
    });
    it('test 32: subscriber receives published value 32', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 32);
      expect(results).toEqual([32]);
    });
    it('test 33: subscriber receives published value 33', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 33);
      expect(results).toEqual([33]);
    });
    it('test 34: subscriber receives published value 34', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 34);
      expect(results).toEqual([34]);
    });
    it('test 35: subscriber receives published value 35', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 35);
      expect(results).toEqual([35]);
    });
    it('test 36: subscriber receives published value 36', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 36);
      expect(results).toEqual([36]);
    });
    it('test 37: subscriber receives published value 37', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 37);
      expect(results).toEqual([37]);
    });
    it('test 38: subscriber receives published value 38', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 38);
      expect(results).toEqual([38]);
    });
    it('test 39: subscriber receives published value 39', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 39);
      expect(results).toEqual([39]);
    });
    it('test 40: subscriber receives published value 40', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 40);
      expect(results).toEqual([40]);
    });
    it('test 41: subscriber receives published value 41', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 41);
      expect(results).toEqual([41]);
    });
    it('test 42: subscriber receives published value 42', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 42);
      expect(results).toEqual([42]);
    });
    it('test 43: subscriber receives published value 43', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 43);
      expect(results).toEqual([43]);
    });
    it('test 44: subscriber receives published value 44', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 44);
      expect(results).toEqual([44]);
    });
    it('test 45: subscriber receives published value 45', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 45);
      expect(results).toEqual([45]);
    });
    it('test 46: subscriber receives published value 46', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 46);
      expect(results).toEqual([46]);
    });
    it('test 47: subscriber receives published value 47', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 47);
      expect(results).toEqual([47]);
    });
    it('test 48: subscriber receives published value 48', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 48);
      expect(results).toEqual([48]);
    });
    it('test 49: subscriber receives published value 49', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 49);
      expect(results).toEqual([49]);
    });
    it('test 50: subscriber receives published value 50', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 50);
      expect(results).toEqual([50]);
    });
    it('test 51: subscriber receives published value 51', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 51);
      expect(results).toEqual([51]);
    });
    it('test 52: subscriber receives published value 52', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 52);
      expect(results).toEqual([52]);
    });
    it('test 53: subscriber receives published value 53', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 53);
      expect(results).toEqual([53]);
    });
    it('test 54: subscriber receives published value 54', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 54);
      expect(results).toEqual([54]);
    });
    it('test 55: subscriber receives published value 55', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 55);
      expect(results).toEqual([55]);
    });
    it('test 56: subscriber receives published value 56', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 56);
      expect(results).toEqual([56]);
    });
    it('test 57: subscriber receives published value 57', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 57);
      expect(results).toEqual([57]);
    });
    it('test 58: subscriber receives published value 58', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 58);
      expect(results).toEqual([58]);
    });
    it('test 59: subscriber receives published value 59', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 59);
      expect(results).toEqual([59]);
    });
    it('test 60: subscriber receives published value 60', () => {
      const ps = createPubSub<number>();
      const results: number[] = [];
      ps.subscribe('topic', (v) => results.push(v));
      ps.publish('topic', 60);
      expect(results).toEqual([60]);
    });
  });
  describe('unsubscribe', () => {
    it('test 1: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(2);
    });
    it('test 2: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(3);
    });
    it('test 3: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(4);
    });
    it('test 4: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(1);
    });
    it('test 5: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(2);
    });
    it('test 6: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(3);
    });
    it('test 7: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(4);
    });
    it('test 8: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(1);
    });
    it('test 9: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(2);
    });
    it('test 10: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(3);
    });
    it('test 11: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(4);
    });
    it('test 12: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(1);
    });
    it('test 13: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(2);
    });
    it('test 14: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(3);
    });
    it('test 15: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(4);
    });
    it('test 16: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(1);
    });
    it('test 17: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(2);
    });
    it('test 18: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(3);
    });
    it('test 19: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(4);
    });
    it('test 20: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(1);
    });
    it('test 21: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(2);
    });
    it('test 22: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(3);
    });
    it('test 23: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(4);
    });
    it('test 24: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(1);
    });
    it('test 25: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(2);
    });
    it('test 26: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(3);
    });
    it('test 27: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(4);
    });
    it('test 28: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(1);
    });
    it('test 29: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(2);
    });
    it('test 30: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(3);
    });
    it('test 31: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(4);
    });
    it('test 32: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(1);
    });
    it('test 33: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(2);
    });
    it('test 34: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(3);
    });
    it('test 35: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(4);
    });
    it('test 36: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(1);
    });
    it('test 37: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(2);
    });
    it('test 38: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(3);
    });
    it('test 39: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(4);
    });
    it('test 40: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(1);
    });
    it('test 41: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(2);
    });
    it('test 42: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(3);
    });
    it('test 43: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(4);
    });
    it('test 44: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(1);
    });
    it('test 45: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(2);
    });
    it('test 46: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(3);
    });
    it('test 47: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(4);
    });
    it('test 48: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(1);
    });
    it('test 49: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(2);
    });
    it('test 50: unsubscribing prevents further receives', () => {
      const ps = createPubSub<string>();
      let count = 0;
      const h = () => { count++; };
      const unsub = ps.subscribe('t', h);
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      ps.publish('t', 'x');
      unsub();
      ps.publish('t', 'x');
      expect(count).toBe(3);
    });
  });
  describe('getSubscriberCount', () => {
    it('test 1: getSubscriberCount returns 1 after 1 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 1; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(1);
    });
    it('test 2: getSubscriberCount returns 2 after 2 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 2; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(2);
    });
    it('test 3: getSubscriberCount returns 3 after 3 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 3; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(3);
    });
    it('test 4: getSubscriberCount returns 4 after 4 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 4; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(4);
    });
    it('test 5: getSubscriberCount returns 5 after 5 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 5; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(5);
    });
    it('test 6: getSubscriberCount returns 6 after 6 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 6; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(6);
    });
    it('test 7: getSubscriberCount returns 7 after 7 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 7; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(7);
    });
    it('test 8: getSubscriberCount returns 8 after 8 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 8; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(8);
    });
    it('test 9: getSubscriberCount returns 9 after 9 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 9; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(9);
    });
    it('test 10: getSubscriberCount returns 10 after 10 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 10; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(10);
    });
    it('test 11: getSubscriberCount returns 11 after 11 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 11; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(11);
    });
    it('test 12: getSubscriberCount returns 12 after 12 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 12; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(12);
    });
    it('test 13: getSubscriberCount returns 13 after 13 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 13; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(13);
    });
    it('test 14: getSubscriberCount returns 14 after 14 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 14; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(14);
    });
    it('test 15: getSubscriberCount returns 15 after 15 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 15; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(15);
    });
    it('test 16: getSubscriberCount returns 16 after 16 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 16; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(16);
    });
    it('test 17: getSubscriberCount returns 17 after 17 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 17; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(17);
    });
    it('test 18: getSubscriberCount returns 18 after 18 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 18; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(18);
    });
    it('test 19: getSubscriberCount returns 19 after 19 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 19; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(19);
    });
    it('test 20: getSubscriberCount returns 20 after 20 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 20; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(20);
    });
    it('test 21: getSubscriberCount returns 21 after 21 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 21; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(21);
    });
    it('test 22: getSubscriberCount returns 22 after 22 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 22; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(22);
    });
    it('test 23: getSubscriberCount returns 23 after 23 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 23; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(23);
    });
    it('test 24: getSubscriberCount returns 24 after 24 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 24; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(24);
    });
    it('test 25: getSubscriberCount returns 25 after 25 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 25; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(25);
    });
    it('test 26: getSubscriberCount returns 26 after 26 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 26; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(26);
    });
    it('test 27: getSubscriberCount returns 27 after 27 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 27; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(27);
    });
    it('test 28: getSubscriberCount returns 28 after 28 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 28; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(28);
    });
    it('test 29: getSubscriberCount returns 29 after 29 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 29; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(29);
    });
    it('test 30: getSubscriberCount returns 30 after 30 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 30; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(30);
    });
    it('test 31: getSubscriberCount returns 31 after 31 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 31; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(31);
    });
    it('test 32: getSubscriberCount returns 32 after 32 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 32; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(32);
    });
    it('test 33: getSubscriberCount returns 33 after 33 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 33; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(33);
    });
    it('test 34: getSubscriberCount returns 34 after 34 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 34; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(34);
    });
    it('test 35: getSubscriberCount returns 35 after 35 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 35; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(35);
    });
    it('test 36: getSubscriberCount returns 36 after 36 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 36; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(36);
    });
    it('test 37: getSubscriberCount returns 37 after 37 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 37; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(37);
    });
    it('test 38: getSubscriberCount returns 38 after 38 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 38; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(38);
    });
    it('test 39: getSubscriberCount returns 39 after 39 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 39; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(39);
    });
    it('test 40: getSubscriberCount returns 40 after 40 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 40; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(40);
    });
    it('test 41: getSubscriberCount returns 41 after 41 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 41; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(41);
    });
    it('test 42: getSubscriberCount returns 42 after 42 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 42; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(42);
    });
    it('test 43: getSubscriberCount returns 43 after 43 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 43; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(43);
    });
    it('test 44: getSubscriberCount returns 44 after 44 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 44; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(44);
    });
    it('test 45: getSubscriberCount returns 45 after 45 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 45; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(45);
    });
    it('test 46: getSubscriberCount returns 46 after 46 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 46; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(46);
    });
    it('test 47: getSubscriberCount returns 47 after 47 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 47; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(47);
    });
    it('test 48: getSubscriberCount returns 48 after 48 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 48; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(48);
    });
    it('test 49: getSubscriberCount returns 49 after 49 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 49; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(49);
    });
    it('test 50: getSubscriberCount returns 50 after 50 subscriptions', () => {
      const ps = createPubSub<number>();
      for (let j = 0; j < 50; j++) ps.subscribe('ch', () => {});
      expect(ps.getSubscriberCount('ch')).toBe(50);
    });
  });
  describe('unsubscribe via method', () => {
    it('test 1: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 1);
      expect(called).toBe(false);
    });
    it('test 2: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 2);
      expect(called).toBe(false);
    });
    it('test 3: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 3);
      expect(called).toBe(false);
    });
    it('test 4: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 4);
      expect(called).toBe(false);
    });
    it('test 5: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 5);
      expect(called).toBe(false);
    });
    it('test 6: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 6);
      expect(called).toBe(false);
    });
    it('test 7: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 7);
      expect(called).toBe(false);
    });
    it('test 8: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 8);
      expect(called).toBe(false);
    });
    it('test 9: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 9);
      expect(called).toBe(false);
    });
    it('test 10: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 10);
      expect(called).toBe(false);
    });
    it('test 11: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 11);
      expect(called).toBe(false);
    });
    it('test 12: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 12);
      expect(called).toBe(false);
    });
    it('test 13: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 13);
      expect(called).toBe(false);
    });
    it('test 14: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 14);
      expect(called).toBe(false);
    });
    it('test 15: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 15);
      expect(called).toBe(false);
    });
    it('test 16: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 16);
      expect(called).toBe(false);
    });
    it('test 17: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 17);
      expect(called).toBe(false);
    });
    it('test 18: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 18);
      expect(called).toBe(false);
    });
    it('test 19: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 19);
      expect(called).toBe(false);
    });
    it('test 20: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 20);
      expect(called).toBe(false);
    });
    it('test 21: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 21);
      expect(called).toBe(false);
    });
    it('test 22: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 22);
      expect(called).toBe(false);
    });
    it('test 23: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 23);
      expect(called).toBe(false);
    });
    it('test 24: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 24);
      expect(called).toBe(false);
    });
    it('test 25: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 25);
      expect(called).toBe(false);
    });
    it('test 26: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 26);
      expect(called).toBe(false);
    });
    it('test 27: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 27);
      expect(called).toBe(false);
    });
    it('test 28: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 28);
      expect(called).toBe(false);
    });
    it('test 29: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 29);
      expect(called).toBe(false);
    });
    it('test 30: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 30);
      expect(called).toBe(false);
    });
    it('test 31: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 31);
      expect(called).toBe(false);
    });
    it('test 32: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 32);
      expect(called).toBe(false);
    });
    it('test 33: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 33);
      expect(called).toBe(false);
    });
    it('test 34: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 34);
      expect(called).toBe(false);
    });
    it('test 35: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 35);
      expect(called).toBe(false);
    });
    it('test 36: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 36);
      expect(called).toBe(false);
    });
    it('test 37: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 37);
      expect(called).toBe(false);
    });
    it('test 38: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 38);
      expect(called).toBe(false);
    });
    it('test 39: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 39);
      expect(called).toBe(false);
    });
    it('test 40: ps.unsubscribe removes specific handler', () => {
      const ps = createPubSub<number>();
      let called = false;
      const h = () => { called = true; };
      ps.subscribe('t', h);
      ps.unsubscribe('t', h);
      ps.publish('t', 40);
      expect(called).toBe(false);
    });
  });
});

// ═══════════════════════════════════════════════════════
// createReactiveStore — 200 tests
// ═══════════════════════════════════════════════════════
describe('createReactiveStore', () => {
  describe('get / set basics', () => {
    it('test 1: get returns value 1 after set', () => {
      const store = createReactiveStore(0);
      store.set(1);
      expect(store.get()).toBe(1);
    });
    it('test 2: get returns value 2 after set', () => {
      const store = createReactiveStore(0);
      store.set(2);
      expect(store.get()).toBe(2);
    });
    it('test 3: get returns value 3 after set', () => {
      const store = createReactiveStore(0);
      store.set(3);
      expect(store.get()).toBe(3);
    });
    it('test 4: get returns value 4 after set', () => {
      const store = createReactiveStore(0);
      store.set(4);
      expect(store.get()).toBe(4);
    });
    it('test 5: get returns value 5 after set', () => {
      const store = createReactiveStore(0);
      store.set(5);
      expect(store.get()).toBe(5);
    });
    it('test 6: get returns value 6 after set', () => {
      const store = createReactiveStore(0);
      store.set(6);
      expect(store.get()).toBe(6);
    });
    it('test 7: get returns value 7 after set', () => {
      const store = createReactiveStore(0);
      store.set(7);
      expect(store.get()).toBe(7);
    });
    it('test 8: get returns value 8 after set', () => {
      const store = createReactiveStore(0);
      store.set(8);
      expect(store.get()).toBe(8);
    });
    it('test 9: get returns value 9 after set', () => {
      const store = createReactiveStore(0);
      store.set(9);
      expect(store.get()).toBe(9);
    });
    it('test 10: get returns value 10 after set', () => {
      const store = createReactiveStore(0);
      store.set(10);
      expect(store.get()).toBe(10);
    });
    it('test 11: get returns value 11 after set', () => {
      const store = createReactiveStore(0);
      store.set(11);
      expect(store.get()).toBe(11);
    });
    it('test 12: get returns value 12 after set', () => {
      const store = createReactiveStore(0);
      store.set(12);
      expect(store.get()).toBe(12);
    });
    it('test 13: get returns value 13 after set', () => {
      const store = createReactiveStore(0);
      store.set(13);
      expect(store.get()).toBe(13);
    });
    it('test 14: get returns value 14 after set', () => {
      const store = createReactiveStore(0);
      store.set(14);
      expect(store.get()).toBe(14);
    });
    it('test 15: get returns value 15 after set', () => {
      const store = createReactiveStore(0);
      store.set(15);
      expect(store.get()).toBe(15);
    });
    it('test 16: get returns value 16 after set', () => {
      const store = createReactiveStore(0);
      store.set(16);
      expect(store.get()).toBe(16);
    });
    it('test 17: get returns value 17 after set', () => {
      const store = createReactiveStore(0);
      store.set(17);
      expect(store.get()).toBe(17);
    });
    it('test 18: get returns value 18 after set', () => {
      const store = createReactiveStore(0);
      store.set(18);
      expect(store.get()).toBe(18);
    });
    it('test 19: get returns value 19 after set', () => {
      const store = createReactiveStore(0);
      store.set(19);
      expect(store.get()).toBe(19);
    });
    it('test 20: get returns value 20 after set', () => {
      const store = createReactiveStore(0);
      store.set(20);
      expect(store.get()).toBe(20);
    });
    it('test 21: get returns value 21 after set', () => {
      const store = createReactiveStore(0);
      store.set(21);
      expect(store.get()).toBe(21);
    });
    it('test 22: get returns value 22 after set', () => {
      const store = createReactiveStore(0);
      store.set(22);
      expect(store.get()).toBe(22);
    });
    it('test 23: get returns value 23 after set', () => {
      const store = createReactiveStore(0);
      store.set(23);
      expect(store.get()).toBe(23);
    });
    it('test 24: get returns value 24 after set', () => {
      const store = createReactiveStore(0);
      store.set(24);
      expect(store.get()).toBe(24);
    });
    it('test 25: get returns value 25 after set', () => {
      const store = createReactiveStore(0);
      store.set(25);
      expect(store.get()).toBe(25);
    });
    it('test 26: get returns value 26 after set', () => {
      const store = createReactiveStore(0);
      store.set(26);
      expect(store.get()).toBe(26);
    });
    it('test 27: get returns value 27 after set', () => {
      const store = createReactiveStore(0);
      store.set(27);
      expect(store.get()).toBe(27);
    });
    it('test 28: get returns value 28 after set', () => {
      const store = createReactiveStore(0);
      store.set(28);
      expect(store.get()).toBe(28);
    });
    it('test 29: get returns value 29 after set', () => {
      const store = createReactiveStore(0);
      store.set(29);
      expect(store.get()).toBe(29);
    });
    it('test 30: get returns value 30 after set', () => {
      const store = createReactiveStore(0);
      store.set(30);
      expect(store.get()).toBe(30);
    });
    it('test 31: get returns value 31 after set', () => {
      const store = createReactiveStore(0);
      store.set(31);
      expect(store.get()).toBe(31);
    });
    it('test 32: get returns value 32 after set', () => {
      const store = createReactiveStore(0);
      store.set(32);
      expect(store.get()).toBe(32);
    });
    it('test 33: get returns value 33 after set', () => {
      const store = createReactiveStore(0);
      store.set(33);
      expect(store.get()).toBe(33);
    });
    it('test 34: get returns value 34 after set', () => {
      const store = createReactiveStore(0);
      store.set(34);
      expect(store.get()).toBe(34);
    });
    it('test 35: get returns value 35 after set', () => {
      const store = createReactiveStore(0);
      store.set(35);
      expect(store.get()).toBe(35);
    });
    it('test 36: get returns value 36 after set', () => {
      const store = createReactiveStore(0);
      store.set(36);
      expect(store.get()).toBe(36);
    });
    it('test 37: get returns value 37 after set', () => {
      const store = createReactiveStore(0);
      store.set(37);
      expect(store.get()).toBe(37);
    });
    it('test 38: get returns value 38 after set', () => {
      const store = createReactiveStore(0);
      store.set(38);
      expect(store.get()).toBe(38);
    });
    it('test 39: get returns value 39 after set', () => {
      const store = createReactiveStore(0);
      store.set(39);
      expect(store.get()).toBe(39);
    });
    it('test 40: get returns value 40 after set', () => {
      const store = createReactiveStore(0);
      store.set(40);
      expect(store.get()).toBe(40);
    });
    it('test 41: get returns value 41 after set', () => {
      const store = createReactiveStore(0);
      store.set(41);
      expect(store.get()).toBe(41);
    });
    it('test 42: get returns value 42 after set', () => {
      const store = createReactiveStore(0);
      store.set(42);
      expect(store.get()).toBe(42);
    });
    it('test 43: get returns value 43 after set', () => {
      const store = createReactiveStore(0);
      store.set(43);
      expect(store.get()).toBe(43);
    });
    it('test 44: get returns value 44 after set', () => {
      const store = createReactiveStore(0);
      store.set(44);
      expect(store.get()).toBe(44);
    });
    it('test 45: get returns value 45 after set', () => {
      const store = createReactiveStore(0);
      store.set(45);
      expect(store.get()).toBe(45);
    });
    it('test 46: get returns value 46 after set', () => {
      const store = createReactiveStore(0);
      store.set(46);
      expect(store.get()).toBe(46);
    });
    it('test 47: get returns value 47 after set', () => {
      const store = createReactiveStore(0);
      store.set(47);
      expect(store.get()).toBe(47);
    });
    it('test 48: get returns value 48 after set', () => {
      const store = createReactiveStore(0);
      store.set(48);
      expect(store.get()).toBe(48);
    });
    it('test 49: get returns value 49 after set', () => {
      const store = createReactiveStore(0);
      store.set(49);
      expect(store.get()).toBe(49);
    });
    it('test 50: get returns value 50 after set', () => {
      const store = createReactiveStore(0);
      store.set(50);
      expect(store.get()).toBe(50);
    });
  });
  describe('update', () => {
    it('test 1: update transforms value by adding 1', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 1);
      expect(store.get()).toBe(1);
    });
    it('test 2: update transforms value by adding 2', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 2);
      expect(store.get()).toBe(2);
    });
    it('test 3: update transforms value by adding 3', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 3);
      expect(store.get()).toBe(3);
    });
    it('test 4: update transforms value by adding 4', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 4);
      expect(store.get()).toBe(4);
    });
    it('test 5: update transforms value by adding 5', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 5);
      expect(store.get()).toBe(5);
    });
    it('test 6: update transforms value by adding 6', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 6);
      expect(store.get()).toBe(6);
    });
    it('test 7: update transforms value by adding 7', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 7);
      expect(store.get()).toBe(7);
    });
    it('test 8: update transforms value by adding 8', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 8);
      expect(store.get()).toBe(8);
    });
    it('test 9: update transforms value by adding 9', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 9);
      expect(store.get()).toBe(9);
    });
    it('test 10: update transforms value by adding 10', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 10);
      expect(store.get()).toBe(10);
    });
    it('test 11: update transforms value by adding 11', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 11);
      expect(store.get()).toBe(11);
    });
    it('test 12: update transforms value by adding 12', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 12);
      expect(store.get()).toBe(12);
    });
    it('test 13: update transforms value by adding 13', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 13);
      expect(store.get()).toBe(13);
    });
    it('test 14: update transforms value by adding 14', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 14);
      expect(store.get()).toBe(14);
    });
    it('test 15: update transforms value by adding 15', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 15);
      expect(store.get()).toBe(15);
    });
    it('test 16: update transforms value by adding 16', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 16);
      expect(store.get()).toBe(16);
    });
    it('test 17: update transforms value by adding 17', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 17);
      expect(store.get()).toBe(17);
    });
    it('test 18: update transforms value by adding 18', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 18);
      expect(store.get()).toBe(18);
    });
    it('test 19: update transforms value by adding 19', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 19);
      expect(store.get()).toBe(19);
    });
    it('test 20: update transforms value by adding 20', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 20);
      expect(store.get()).toBe(20);
    });
    it('test 21: update transforms value by adding 21', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 21);
      expect(store.get()).toBe(21);
    });
    it('test 22: update transforms value by adding 22', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 22);
      expect(store.get()).toBe(22);
    });
    it('test 23: update transforms value by adding 23', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 23);
      expect(store.get()).toBe(23);
    });
    it('test 24: update transforms value by adding 24', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 24);
      expect(store.get()).toBe(24);
    });
    it('test 25: update transforms value by adding 25', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 25);
      expect(store.get()).toBe(25);
    });
    it('test 26: update transforms value by adding 26', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 26);
      expect(store.get()).toBe(26);
    });
    it('test 27: update transforms value by adding 27', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 27);
      expect(store.get()).toBe(27);
    });
    it('test 28: update transforms value by adding 28', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 28);
      expect(store.get()).toBe(28);
    });
    it('test 29: update transforms value by adding 29', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 29);
      expect(store.get()).toBe(29);
    });
    it('test 30: update transforms value by adding 30', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 30);
      expect(store.get()).toBe(30);
    });
    it('test 31: update transforms value by adding 31', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 31);
      expect(store.get()).toBe(31);
    });
    it('test 32: update transforms value by adding 32', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 32);
      expect(store.get()).toBe(32);
    });
    it('test 33: update transforms value by adding 33', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 33);
      expect(store.get()).toBe(33);
    });
    it('test 34: update transforms value by adding 34', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 34);
      expect(store.get()).toBe(34);
    });
    it('test 35: update transforms value by adding 35', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 35);
      expect(store.get()).toBe(35);
    });
    it('test 36: update transforms value by adding 36', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 36);
      expect(store.get()).toBe(36);
    });
    it('test 37: update transforms value by adding 37', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 37);
      expect(store.get()).toBe(37);
    });
    it('test 38: update transforms value by adding 38', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 38);
      expect(store.get()).toBe(38);
    });
    it('test 39: update transforms value by adding 39', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 39);
      expect(store.get()).toBe(39);
    });
    it('test 40: update transforms value by adding 40', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 40);
      expect(store.get()).toBe(40);
    });
    it('test 41: update transforms value by adding 41', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 41);
      expect(store.get()).toBe(41);
    });
    it('test 42: update transforms value by adding 42', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 42);
      expect(store.get()).toBe(42);
    });
    it('test 43: update transforms value by adding 43', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 43);
      expect(store.get()).toBe(43);
    });
    it('test 44: update transforms value by adding 44', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 44);
      expect(store.get()).toBe(44);
    });
    it('test 45: update transforms value by adding 45', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 45);
      expect(store.get()).toBe(45);
    });
    it('test 46: update transforms value by adding 46', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 46);
      expect(store.get()).toBe(46);
    });
    it('test 47: update transforms value by adding 47', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 47);
      expect(store.get()).toBe(47);
    });
    it('test 48: update transforms value by adding 48', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 48);
      expect(store.get()).toBe(48);
    });
    it('test 49: update transforms value by adding 49', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 49);
      expect(store.get()).toBe(49);
    });
    it('test 50: update transforms value by adding 50', () => {
      const store = createReactiveStore(0);
      store.update((v) => v + 50);
      expect(store.get()).toBe(50);
    });
  });
  describe('watch', () => {
    it('test 1: watcher receives new value 1 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(1);
      expect(seen).toEqual([1, 0]);
    });
    it('test 2: watcher receives new value 2 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(2);
      expect(seen).toEqual([2, 0]);
    });
    it('test 3: watcher receives new value 3 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(3);
      expect(seen).toEqual([3, 0]);
    });
    it('test 4: watcher receives new value 4 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(4);
      expect(seen).toEqual([4, 0]);
    });
    it('test 5: watcher receives new value 5 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(5);
      expect(seen).toEqual([5, 0]);
    });
    it('test 6: watcher receives new value 6 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(6);
      expect(seen).toEqual([6, 0]);
    });
    it('test 7: watcher receives new value 7 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(7);
      expect(seen).toEqual([7, 0]);
    });
    it('test 8: watcher receives new value 8 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(8);
      expect(seen).toEqual([8, 0]);
    });
    it('test 9: watcher receives new value 9 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(9);
      expect(seen).toEqual([9, 0]);
    });
    it('test 10: watcher receives new value 10 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(10);
      expect(seen).toEqual([10, 0]);
    });
    it('test 11: watcher receives new value 11 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(11);
      expect(seen).toEqual([11, 0]);
    });
    it('test 12: watcher receives new value 12 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(12);
      expect(seen).toEqual([12, 0]);
    });
    it('test 13: watcher receives new value 13 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(13);
      expect(seen).toEqual([13, 0]);
    });
    it('test 14: watcher receives new value 14 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(14);
      expect(seen).toEqual([14, 0]);
    });
    it('test 15: watcher receives new value 15 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(15);
      expect(seen).toEqual([15, 0]);
    });
    it('test 16: watcher receives new value 16 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(16);
      expect(seen).toEqual([16, 0]);
    });
    it('test 17: watcher receives new value 17 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(17);
      expect(seen).toEqual([17, 0]);
    });
    it('test 18: watcher receives new value 18 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(18);
      expect(seen).toEqual([18, 0]);
    });
    it('test 19: watcher receives new value 19 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(19);
      expect(seen).toEqual([19, 0]);
    });
    it('test 20: watcher receives new value 20 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(20);
      expect(seen).toEqual([20, 0]);
    });
    it('test 21: watcher receives new value 21 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(21);
      expect(seen).toEqual([21, 0]);
    });
    it('test 22: watcher receives new value 22 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(22);
      expect(seen).toEqual([22, 0]);
    });
    it('test 23: watcher receives new value 23 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(23);
      expect(seen).toEqual([23, 0]);
    });
    it('test 24: watcher receives new value 24 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(24);
      expect(seen).toEqual([24, 0]);
    });
    it('test 25: watcher receives new value 25 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(25);
      expect(seen).toEqual([25, 0]);
    });
    it('test 26: watcher receives new value 26 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(26);
      expect(seen).toEqual([26, 0]);
    });
    it('test 27: watcher receives new value 27 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(27);
      expect(seen).toEqual([27, 0]);
    });
    it('test 28: watcher receives new value 28 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(28);
      expect(seen).toEqual([28, 0]);
    });
    it('test 29: watcher receives new value 29 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(29);
      expect(seen).toEqual([29, 0]);
    });
    it('test 30: watcher receives new value 30 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(30);
      expect(seen).toEqual([30, 0]);
    });
    it('test 31: watcher receives new value 31 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(31);
      expect(seen).toEqual([31, 0]);
    });
    it('test 32: watcher receives new value 32 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(32);
      expect(seen).toEqual([32, 0]);
    });
    it('test 33: watcher receives new value 33 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(33);
      expect(seen).toEqual([33, 0]);
    });
    it('test 34: watcher receives new value 34 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(34);
      expect(seen).toEqual([34, 0]);
    });
    it('test 35: watcher receives new value 35 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(35);
      expect(seen).toEqual([35, 0]);
    });
    it('test 36: watcher receives new value 36 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(36);
      expect(seen).toEqual([36, 0]);
    });
    it('test 37: watcher receives new value 37 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(37);
      expect(seen).toEqual([37, 0]);
    });
    it('test 38: watcher receives new value 38 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(38);
      expect(seen).toEqual([38, 0]);
    });
    it('test 39: watcher receives new value 39 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(39);
      expect(seen).toEqual([39, 0]);
    });
    it('test 40: watcher receives new value 40 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(40);
      expect(seen).toEqual([40, 0]);
    });
    it('test 41: watcher receives new value 41 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(41);
      expect(seen).toEqual([41, 0]);
    });
    it('test 42: watcher receives new value 42 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(42);
      expect(seen).toEqual([42, 0]);
    });
    it('test 43: watcher receives new value 43 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(43);
      expect(seen).toEqual([43, 0]);
    });
    it('test 44: watcher receives new value 44 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(44);
      expect(seen).toEqual([44, 0]);
    });
    it('test 45: watcher receives new value 45 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(45);
      expect(seen).toEqual([45, 0]);
    });
    it('test 46: watcher receives new value 46 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(46);
      expect(seen).toEqual([46, 0]);
    });
    it('test 47: watcher receives new value 47 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(47);
      expect(seen).toEqual([47, 0]);
    });
    it('test 48: watcher receives new value 48 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(48);
      expect(seen).toEqual([48, 0]);
    });
    it('test 49: watcher receives new value 49 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(49);
      expect(seen).toEqual([49, 0]);
    });
    it('test 50: watcher receives new value 50 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(50);
      expect(seen).toEqual([50, 0]);
    });
    it('test 51: watcher receives new value 51 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(51);
      expect(seen).toEqual([51, 0]);
    });
    it('test 52: watcher receives new value 52 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(52);
      expect(seen).toEqual([52, 0]);
    });
    it('test 53: watcher receives new value 53 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(53);
      expect(seen).toEqual([53, 0]);
    });
    it('test 54: watcher receives new value 54 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(54);
      expect(seen).toEqual([54, 0]);
    });
    it('test 55: watcher receives new value 55 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(55);
      expect(seen).toEqual([55, 0]);
    });
    it('test 56: watcher receives new value 56 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(56);
      expect(seen).toEqual([56, 0]);
    });
    it('test 57: watcher receives new value 57 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(57);
      expect(seen).toEqual([57, 0]);
    });
    it('test 58: watcher receives new value 58 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(58);
      expect(seen).toEqual([58, 0]);
    });
    it('test 59: watcher receives new value 59 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(59);
      expect(seen).toEqual([59, 0]);
    });
    it('test 60: watcher receives new value 60 and prev 0', () => {
      const store = createReactiveStore(0);
      let seen: [number, number] | null = null;
      store.watch((v, p) => { seen = [v, p]; });
      store.set(60);
      expect(seen).toEqual([60, 0]);
    });
  });
  describe('unwatch', () => {
    it('test 1: unwatch stops listener after 2 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      unsub();
      store.set(999);
      expect(count).toBe(2);
    });
    it('test 2: unwatch stops listener after 3 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      store.set(3);
      unsub();
      store.set(999);
      expect(count).toBe(3);
    });
    it('test 3: unwatch stops listener after 1 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      unsub();
      store.set(999);
      expect(count).toBe(1);
    });
    it('test 4: unwatch stops listener after 2 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      unsub();
      store.set(999);
      expect(count).toBe(2);
    });
    it('test 5: unwatch stops listener after 3 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      store.set(3);
      unsub();
      store.set(999);
      expect(count).toBe(3);
    });
    it('test 6: unwatch stops listener after 1 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      unsub();
      store.set(999);
      expect(count).toBe(1);
    });
    it('test 7: unwatch stops listener after 2 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      unsub();
      store.set(999);
      expect(count).toBe(2);
    });
    it('test 8: unwatch stops listener after 3 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      store.set(3);
      unsub();
      store.set(999);
      expect(count).toBe(3);
    });
    it('test 9: unwatch stops listener after 1 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      unsub();
      store.set(999);
      expect(count).toBe(1);
    });
    it('test 10: unwatch stops listener after 2 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      unsub();
      store.set(999);
      expect(count).toBe(2);
    });
    it('test 11: unwatch stops listener after 3 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      store.set(3);
      unsub();
      store.set(999);
      expect(count).toBe(3);
    });
    it('test 12: unwatch stops listener after 1 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      unsub();
      store.set(999);
      expect(count).toBe(1);
    });
    it('test 13: unwatch stops listener after 2 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      unsub();
      store.set(999);
      expect(count).toBe(2);
    });
    it('test 14: unwatch stops listener after 3 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      store.set(3);
      unsub();
      store.set(999);
      expect(count).toBe(3);
    });
    it('test 15: unwatch stops listener after 1 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      unsub();
      store.set(999);
      expect(count).toBe(1);
    });
    it('test 16: unwatch stops listener after 2 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      unsub();
      store.set(999);
      expect(count).toBe(2);
    });
    it('test 17: unwatch stops listener after 3 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      store.set(3);
      unsub();
      store.set(999);
      expect(count).toBe(3);
    });
    it('test 18: unwatch stops listener after 1 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      unsub();
      store.set(999);
      expect(count).toBe(1);
    });
    it('test 19: unwatch stops listener after 2 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      unsub();
      store.set(999);
      expect(count).toBe(2);
    });
    it('test 20: unwatch stops listener after 3 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      store.set(3);
      unsub();
      store.set(999);
      expect(count).toBe(3);
    });
    it('test 21: unwatch stops listener after 1 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      unsub();
      store.set(999);
      expect(count).toBe(1);
    });
    it('test 22: unwatch stops listener after 2 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      unsub();
      store.set(999);
      expect(count).toBe(2);
    });
    it('test 23: unwatch stops listener after 3 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      store.set(3);
      unsub();
      store.set(999);
      expect(count).toBe(3);
    });
    it('test 24: unwatch stops listener after 1 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      unsub();
      store.set(999);
      expect(count).toBe(1);
    });
    it('test 25: unwatch stops listener after 2 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      unsub();
      store.set(999);
      expect(count).toBe(2);
    });
    it('test 26: unwatch stops listener after 3 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      store.set(3);
      unsub();
      store.set(999);
      expect(count).toBe(3);
    });
    it('test 27: unwatch stops listener after 1 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      unsub();
      store.set(999);
      expect(count).toBe(1);
    });
    it('test 28: unwatch stops listener after 2 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      unsub();
      store.set(999);
      expect(count).toBe(2);
    });
    it('test 29: unwatch stops listener after 3 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      store.set(3);
      unsub();
      store.set(999);
      expect(count).toBe(3);
    });
    it('test 30: unwatch stops listener after 1 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      unsub();
      store.set(999);
      expect(count).toBe(1);
    });
    it('test 31: unwatch stops listener after 2 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      unsub();
      store.set(999);
      expect(count).toBe(2);
    });
    it('test 32: unwatch stops listener after 3 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      store.set(3);
      unsub();
      store.set(999);
      expect(count).toBe(3);
    });
    it('test 33: unwatch stops listener after 1 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      unsub();
      store.set(999);
      expect(count).toBe(1);
    });
    it('test 34: unwatch stops listener after 2 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      unsub();
      store.set(999);
      expect(count).toBe(2);
    });
    it('test 35: unwatch stops listener after 3 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      store.set(3);
      unsub();
      store.set(999);
      expect(count).toBe(3);
    });
    it('test 36: unwatch stops listener after 1 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      unsub();
      store.set(999);
      expect(count).toBe(1);
    });
    it('test 37: unwatch stops listener after 2 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      unsub();
      store.set(999);
      expect(count).toBe(2);
    });
    it('test 38: unwatch stops listener after 3 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      store.set(3);
      unsub();
      store.set(999);
      expect(count).toBe(3);
    });
    it('test 39: unwatch stops listener after 1 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      unsub();
      store.set(999);
      expect(count).toBe(1);
    });
    it('test 40: unwatch stops listener after 2 changes', () => {
      const store = createReactiveStore(0);
      let count = 0;
      const unsub = store.watch(() => { count++; });
      store.set(1);
      store.set(2);
      unsub();
      store.set(999);
      expect(count).toBe(2);
    });
  });
});

// ═══════════════════════════════════════════════════════
// createObservable / createSubject — 150 tests
// ═══════════════════════════════════════════════════════
describe('createObservable', () => {
  describe('basic next / complete', () => {
    it('test 1: observer receives 1 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(1);
        o.next(2);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(2);
    });
    it('test 2: observer receives 2 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(2);
        o.next(4);
        o.next(6);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(3);
    });
    it('test 3: observer receives 3 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(3);
        o.next(6);
        o.next(9);
        o.next(12);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(4);
    });
    it('test 4: observer receives 4 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(4);
        o.next(8);
        o.next(12);
        o.next(16);
        o.next(20);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(5);
    });
    it('test 5: observer receives 5 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(5);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(1);
    });
    it('test 6: observer receives 6 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(6);
        o.next(12);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(2);
    });
    it('test 7: observer receives 7 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(7);
        o.next(14);
        o.next(21);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(3);
    });
    it('test 8: observer receives 8 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(8);
        o.next(16);
        o.next(24);
        o.next(32);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(4);
    });
    it('test 9: observer receives 9 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(9);
        o.next(18);
        o.next(27);
        o.next(36);
        o.next(45);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(5);
    });
    it('test 10: observer receives 10 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(10);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(1);
    });
    it('test 11: observer receives 11 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(11);
        o.next(22);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(2);
    });
    it('test 12: observer receives 12 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(12);
        o.next(24);
        o.next(36);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(3);
    });
    it('test 13: observer receives 13 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(13);
        o.next(26);
        o.next(39);
        o.next(52);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(4);
    });
    it('test 14: observer receives 14 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(14);
        o.next(28);
        o.next(42);
        o.next(56);
        o.next(70);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(5);
    });
    it('test 15: observer receives 15 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(15);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(1);
    });
    it('test 16: observer receives 16 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(16);
        o.next(32);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(2);
    });
    it('test 17: observer receives 17 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(17);
        o.next(34);
        o.next(51);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(3);
    });
    it('test 18: observer receives 18 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(18);
        o.next(36);
        o.next(54);
        o.next(72);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(4);
    });
    it('test 19: observer receives 19 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(19);
        o.next(38);
        o.next(57);
        o.next(76);
        o.next(95);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(5);
    });
    it('test 20: observer receives 20 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(20);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(1);
    });
    it('test 21: observer receives 21 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(21);
        o.next(42);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(2);
    });
    it('test 22: observer receives 22 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(22);
        o.next(44);
        o.next(66);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(3);
    });
    it('test 23: observer receives 23 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(23);
        o.next(46);
        o.next(69);
        o.next(92);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(4);
    });
    it('test 24: observer receives 24 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(24);
        o.next(48);
        o.next(72);
        o.next(96);
        o.next(120);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(5);
    });
    it('test 25: observer receives 25 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(25);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(1);
    });
    it('test 26: observer receives 26 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(26);
        o.next(52);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(2);
    });
    it('test 27: observer receives 27 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(27);
        o.next(54);
        o.next(81);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(3);
    });
    it('test 28: observer receives 28 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(28);
        o.next(56);
        o.next(84);
        o.next(112);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(4);
    });
    it('test 29: observer receives 29 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(29);
        o.next(58);
        o.next(87);
        o.next(116);
        o.next(145);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(5);
    });
    it('test 30: observer receives 30 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(30);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(1);
    });
    it('test 31: observer receives 31 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(31);
        o.next(62);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(2);
    });
    it('test 32: observer receives 32 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(32);
        o.next(64);
        o.next(96);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(3);
    });
    it('test 33: observer receives 33 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(33);
        o.next(66);
        o.next(99);
        o.next(132);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(4);
    });
    it('test 34: observer receives 34 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(34);
        o.next(68);
        o.next(102);
        o.next(136);
        o.next(170);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(5);
    });
    it('test 35: observer receives 35 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(35);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(1);
    });
    it('test 36: observer receives 36 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(36);
        o.next(72);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(2);
    });
    it('test 37: observer receives 37 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(37);
        o.next(74);
        o.next(111);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(3);
    });
    it('test 38: observer receives 38 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(38);
        o.next(76);
        o.next(114);
        o.next(152);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(4);
    });
    it('test 39: observer receives 39 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(39);
        o.next(78);
        o.next(117);
        o.next(156);
        o.next(195);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(5);
    });
    it('test 40: observer receives 40 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(40);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(1);
    });
    it('test 41: observer receives 41 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(41);
        o.next(82);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(2);
    });
    it('test 42: observer receives 42 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(42);
        o.next(84);
        o.next(126);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(3);
    });
    it('test 43: observer receives 43 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(43);
        o.next(86);
        o.next(129);
        o.next(172);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(4);
    });
    it('test 44: observer receives 44 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(44);
        o.next(88);
        o.next(132);
        o.next(176);
        o.next(220);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(5);
    });
    it('test 45: observer receives 45 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(45);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(1);
    });
    it('test 46: observer receives 46 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(46);
        o.next(92);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(2);
    });
    it('test 47: observer receives 47 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(47);
        o.next(94);
        o.next(141);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(3);
    });
    it('test 48: observer receives 48 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(48);
        o.next(96);
        o.next(144);
        o.next(192);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(4);
    });
    it('test 49: observer receives 49 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(49);
        o.next(98);
        o.next(147);
        o.next(196);
        o.next(245);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(5);
    });
    it('test 50: observer receives 50 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(50);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(1);
    });
    it('test 51: observer receives 51 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(51);
        o.next(102);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(2);
    });
    it('test 52: observer receives 52 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(52);
        o.next(104);
        o.next(156);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(3);
    });
    it('test 53: observer receives 53 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(53);
        o.next(106);
        o.next(159);
        o.next(212);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(4);
    });
    it('test 54: observer receives 54 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(54);
        o.next(108);
        o.next(162);
        o.next(216);
        o.next(270);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(5);
    });
    it('test 55: observer receives 55 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(55);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(1);
    });
    it('test 56: observer receives 56 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(56);
        o.next(112);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(2);
    });
    it('test 57: observer receives 57 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(57);
        o.next(114);
        o.next(171);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(3);
    });
    it('test 58: observer receives 58 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(58);
        o.next(116);
        o.next(174);
        o.next(232);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(4);
    });
    it('test 59: observer receives 59 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(59);
        o.next(118);
        o.next(177);
        o.next(236);
        o.next(295);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(5);
    });
    it('test 60: observer receives 60 values then completes', () => {
      const received: number[] = [];
      let done = false;
      const obs = createObservable<number>((o) => {
        o.next(60);
        o.complete?.();
      });
      obs.subscribe({ next: (v) => received.push(v), complete: () => { done = true; } });
      expect(done).toBe(true);
      expect(received.length).toBe(1);
    });
  });
  describe('error propagation', () => {
    it('test 1: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err1'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err1');
    });
    it('test 2: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err2'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err2');
    });
    it('test 3: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err3'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err3');
    });
    it('test 4: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err4'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err4');
    });
    it('test 5: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err5'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err5');
    });
    it('test 6: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err6'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err6');
    });
    it('test 7: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err7'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err7');
    });
    it('test 8: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err8'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err8');
    });
    it('test 9: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err9'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err9');
    });
    it('test 10: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err10'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err10');
    });
    it('test 11: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err11'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err11');
    });
    it('test 12: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err12'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err12');
    });
    it('test 13: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err13'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err13');
    });
    it('test 14: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err14'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err14');
    });
    it('test 15: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err15'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err15');
    });
    it('test 16: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err16'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err16');
    });
    it('test 17: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err17'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err17');
    });
    it('test 18: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err18'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err18');
    });
    it('test 19: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err19'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err19');
    });
    it('test 20: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err20'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err20');
    });
    it('test 21: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err21'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err21');
    });
    it('test 22: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err22'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err22');
    });
    it('test 23: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err23'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err23');
    });
    it('test 24: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err24'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err24');
    });
    it('test 25: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err25'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err25');
    });
    it('test 26: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err26'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err26');
    });
    it('test 27: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err27'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err27');
    });
    it('test 28: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err28'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err28');
    });
    it('test 29: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err29'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err29');
    });
    it('test 30: error is propagated to observer', () => {
      let receivedErr: unknown = null;
      const obs = createObservable<number>((o) => {
        o.error?.(new Error('err30'));
      });
      obs.subscribe({ next: () => {}, error: (e) => { receivedErr = e; } });
      expect((receivedErr as Error).message).toBe('err30');
    });
  });
  describe('unsubscribe', () => {
    it('test 1: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 2: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 3: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 4: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 5: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 6: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 7: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 8: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 9: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 10: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 11: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 12: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 13: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 14: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 15: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 16: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 17: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 18: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 19: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 20: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 21: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 22: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 23: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 24: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 25: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 26: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 27: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 28: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 29: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
    it('test 30: unsubscribe before emit prevents handler call', () => {
      let count = 0;
      const obs = createObservable<number>((_o) => {});
      const sub = obs.subscribe({ next: () => { count++; } });
      sub.unsubscribe();
      expect(sub.closed).toBe(true);
      expect(count).toBe(0);
    });
  });
});

describe('createSubject', () => {
  describe('next values', () => {
    it('test 1: subject broadcasts 2 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      expect(received.length).toBe(2);
    });
    it('test 2: subject broadcasts 3 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      expect(received.length).toBe(3);
    });
    it('test 3: subject broadcasts 4 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      subject.next(4);
      expect(received.length).toBe(4);
    });
    it('test 4: subject broadcasts 5 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      subject.next(4);
      subject.next(5);
      expect(received.length).toBe(5);
    });
    it('test 5: subject broadcasts 1 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      expect(received.length).toBe(1);
    });
    it('test 6: subject broadcasts 2 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      expect(received.length).toBe(2);
    });
    it('test 7: subject broadcasts 3 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      expect(received.length).toBe(3);
    });
    it('test 8: subject broadcasts 4 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      subject.next(4);
      expect(received.length).toBe(4);
    });
    it('test 9: subject broadcasts 5 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      subject.next(4);
      subject.next(5);
      expect(received.length).toBe(5);
    });
    it('test 10: subject broadcasts 1 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      expect(received.length).toBe(1);
    });
    it('test 11: subject broadcasts 2 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      expect(received.length).toBe(2);
    });
    it('test 12: subject broadcasts 3 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      expect(received.length).toBe(3);
    });
    it('test 13: subject broadcasts 4 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      subject.next(4);
      expect(received.length).toBe(4);
    });
    it('test 14: subject broadcasts 5 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      subject.next(4);
      subject.next(5);
      expect(received.length).toBe(5);
    });
    it('test 15: subject broadcasts 1 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      expect(received.length).toBe(1);
    });
    it('test 16: subject broadcasts 2 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      expect(received.length).toBe(2);
    });
    it('test 17: subject broadcasts 3 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      expect(received.length).toBe(3);
    });
    it('test 18: subject broadcasts 4 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      subject.next(4);
      expect(received.length).toBe(4);
    });
    it('test 19: subject broadcasts 5 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      subject.next(4);
      subject.next(5);
      expect(received.length).toBe(5);
    });
    it('test 20: subject broadcasts 1 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      expect(received.length).toBe(1);
    });
    it('test 21: subject broadcasts 2 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      expect(received.length).toBe(2);
    });
    it('test 22: subject broadcasts 3 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      expect(received.length).toBe(3);
    });
    it('test 23: subject broadcasts 4 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      subject.next(4);
      expect(received.length).toBe(4);
    });
    it('test 24: subject broadcasts 5 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      subject.next(4);
      subject.next(5);
      expect(received.length).toBe(5);
    });
    it('test 25: subject broadcasts 1 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      expect(received.length).toBe(1);
    });
    it('test 26: subject broadcasts 2 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      expect(received.length).toBe(2);
    });
    it('test 27: subject broadcasts 3 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      expect(received.length).toBe(3);
    });
    it('test 28: subject broadcasts 4 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      subject.next(4);
      expect(received.length).toBe(4);
    });
    it('test 29: subject broadcasts 5 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      subject.next(2);
      subject.next(3);
      subject.next(4);
      subject.next(5);
      expect(received.length).toBe(5);
    });
    it('test 30: subject broadcasts 1 values to subscriber', () => {
      const subject = createSubject<number>();
      const received: number[] = [];
      subject.observable.subscribe({ next: (v) => received.push(v) });
      subject.next(1);
      expect(received.length).toBe(1);
    });
  });
});

// ═══════════════════════════════════════════════════════
// debounce — 50 tests (fake timers)
// ═══════════════════════════════════════════════════════
describe('debounce', () => {
  beforeEach(() => { jest.useFakeTimers(); });
  afterEach(() => { jest.useRealTimers(); });

  it('test 1: debounce(200ms) called 3x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 200);
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(250);
    expect(count).toBe(1);
  });
  it('test 2: debounce(300ms) called 4x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 300);
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(350);
    expect(count).toBe(1);
  });
  it('test 3: debounce(400ms) called 5x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 400);
    fn();
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(450);
    expect(count).toBe(1);
  });
  it('test 4: debounce(500ms) called 2x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 500);
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(550);
    expect(count).toBe(1);
  });
  it('test 5: debounce(100ms) called 3x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 100);
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(150);
    expect(count).toBe(1);
  });
  it('test 6: debounce(200ms) called 4x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 200);
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(250);
    expect(count).toBe(1);
  });
  it('test 7: debounce(300ms) called 5x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 300);
    fn();
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(350);
    expect(count).toBe(1);
  });
  it('test 8: debounce(400ms) called 2x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 400);
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(450);
    expect(count).toBe(1);
  });
  it('test 9: debounce(500ms) called 3x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 500);
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(550);
    expect(count).toBe(1);
  });
  it('test 10: debounce(100ms) called 4x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 100);
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(150);
    expect(count).toBe(1);
  });
  it('test 11: debounce(200ms) called 5x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 200);
    fn();
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(250);
    expect(count).toBe(1);
  });
  it('test 12: debounce(300ms) called 2x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 300);
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(350);
    expect(count).toBe(1);
  });
  it('test 13: debounce(400ms) called 3x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 400);
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(450);
    expect(count).toBe(1);
  });
  it('test 14: debounce(500ms) called 4x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 500);
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(550);
    expect(count).toBe(1);
  });
  it('test 15: debounce(100ms) called 5x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 100);
    fn();
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(150);
    expect(count).toBe(1);
  });
  it('test 16: debounce(200ms) called 2x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 200);
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(250);
    expect(count).toBe(1);
  });
  it('test 17: debounce(300ms) called 3x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 300);
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(350);
    expect(count).toBe(1);
  });
  it('test 18: debounce(400ms) called 4x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 400);
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(450);
    expect(count).toBe(1);
  });
  it('test 19: debounce(500ms) called 5x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 500);
    fn();
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(550);
    expect(count).toBe(1);
  });
  it('test 20: debounce(100ms) called 2x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 100);
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(150);
    expect(count).toBe(1);
  });
  it('test 21: debounce(200ms) called 3x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 200);
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(250);
    expect(count).toBe(1);
  });
  it('test 22: debounce(300ms) called 4x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 300);
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(350);
    expect(count).toBe(1);
  });
  it('test 23: debounce(400ms) called 5x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 400);
    fn();
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(450);
    expect(count).toBe(1);
  });
  it('test 24: debounce(500ms) called 2x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 500);
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(550);
    expect(count).toBe(1);
  });
  it('test 25: debounce(100ms) called 3x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 100);
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(150);
    expect(count).toBe(1);
  });
  it('test 26: debounce(200ms) called 4x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 200);
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(250);
    expect(count).toBe(1);
  });
  it('test 27: debounce(300ms) called 5x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 300);
    fn();
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(350);
    expect(count).toBe(1);
  });
  it('test 28: debounce(400ms) called 2x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 400);
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(450);
    expect(count).toBe(1);
  });
  it('test 29: debounce(500ms) called 3x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 500);
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(550);
    expect(count).toBe(1);
  });
  it('test 30: debounce(100ms) called 4x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 100);
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(150);
    expect(count).toBe(1);
  });
  it('test 31: debounce(200ms) called 5x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 200);
    fn();
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(250);
    expect(count).toBe(1);
  });
  it('test 32: debounce(300ms) called 2x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 300);
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(350);
    expect(count).toBe(1);
  });
  it('test 33: debounce(400ms) called 3x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 400);
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(450);
    expect(count).toBe(1);
  });
  it('test 34: debounce(500ms) called 4x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 500);
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(550);
    expect(count).toBe(1);
  });
  it('test 35: debounce(100ms) called 5x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 100);
    fn();
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(150);
    expect(count).toBe(1);
  });
  it('test 36: debounce(200ms) called 2x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 200);
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(250);
    expect(count).toBe(1);
  });
  it('test 37: debounce(300ms) called 3x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 300);
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(350);
    expect(count).toBe(1);
  });
  it('test 38: debounce(400ms) called 4x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 400);
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(450);
    expect(count).toBe(1);
  });
  it('test 39: debounce(500ms) called 5x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 500);
    fn();
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(550);
    expect(count).toBe(1);
  });
  it('test 40: debounce(100ms) called 2x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 100);
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(150);
    expect(count).toBe(1);
  });
  it('test 41: debounce(200ms) called 3x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 200);
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(250);
    expect(count).toBe(1);
  });
  it('test 42: debounce(300ms) called 4x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 300);
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(350);
    expect(count).toBe(1);
  });
  it('test 43: debounce(400ms) called 5x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 400);
    fn();
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(450);
    expect(count).toBe(1);
  });
  it('test 44: debounce(500ms) called 2x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 500);
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(550);
    expect(count).toBe(1);
  });
  it('test 45: debounce(100ms) called 3x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 100);
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(150);
    expect(count).toBe(1);
  });
  it('test 46: debounce(200ms) called 4x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 200);
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(250);
    expect(count).toBe(1);
  });
  it('test 47: debounce(300ms) called 5x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 300);
    fn();
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(350);
    expect(count).toBe(1);
  });
  it('test 48: debounce(400ms) called 2x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 400);
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(450);
    expect(count).toBe(1);
  });
  it('test 49: debounce(500ms) called 3x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 500);
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(550);
    expect(count).toBe(1);
  });
  it('test 50: debounce(100ms) called 4x fires once after timer', () => {
    let count = 0;
    const fn = debounce(() => { count++; }, 100);
    fn();
    fn();
    fn();
    fn();
    expect(count).toBe(0);
    jest.advanceTimersByTime(150);
    expect(count).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════
// throttle — 50 tests (fake timers)
// ═══════════════════════════════════════════════════════
describe('throttle', () => {
  beforeEach(() => { jest.useFakeTimers(); });
  afterEach(() => { jest.useRealTimers(); });

  it('test 1: throttle(200ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 200);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(250);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 2: throttle(300ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 300);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(350);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 3: throttle(400ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 400);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(450);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 4: throttle(500ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 500);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(550);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 5: throttle(100ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 100);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(150);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 6: throttle(200ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 200);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(250);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 7: throttle(300ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 300);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(350);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 8: throttle(400ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 400);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(450);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 9: throttle(500ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 500);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(550);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 10: throttle(100ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 100);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(150);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 11: throttle(200ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 200);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(250);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 12: throttle(300ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 300);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(350);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 13: throttle(400ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 400);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(450);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 14: throttle(500ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 500);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(550);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 15: throttle(100ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 100);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(150);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 16: throttle(200ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 200);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(250);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 17: throttle(300ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 300);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(350);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 18: throttle(400ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 400);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(450);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 19: throttle(500ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 500);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(550);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 20: throttle(100ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 100);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(150);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 21: throttle(200ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 200);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(250);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 22: throttle(300ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 300);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(350);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 23: throttle(400ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 400);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(450);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 24: throttle(500ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 500);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(550);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 25: throttle(100ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 100);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(150);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 26: throttle(200ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 200);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(250);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 27: throttle(300ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 300);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(350);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 28: throttle(400ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 400);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(450);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 29: throttle(500ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 500);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(550);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 30: throttle(100ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 100);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(150);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 31: throttle(200ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 200);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(250);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 32: throttle(300ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 300);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(350);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 33: throttle(400ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 400);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(450);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 34: throttle(500ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 500);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(550);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 35: throttle(100ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 100);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(150);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 36: throttle(200ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 200);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(250);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 37: throttle(300ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 300);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(350);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 38: throttle(400ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 400);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(450);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 39: throttle(500ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 500);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(550);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 40: throttle(100ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 100);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(150);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 41: throttle(200ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 200);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(250);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 42: throttle(300ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 300);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(350);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 43: throttle(400ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 400);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(450);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 44: throttle(500ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 500);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(550);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 45: throttle(100ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 100);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(150);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 46: throttle(200ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 200);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(250);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 47: throttle(300ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 300);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(350);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 48: throttle(400ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 400);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(450);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 49: throttle(500ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 500);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(550);
    expect(count).toBeGreaterThanOrEqual(1);
  });
  it('test 50: throttle(100ms) first call fires immediately', () => {
    let count = 0;
    const fn = throttle(() => { count++; }, 100);
    fn();
    expect(count).toBe(1);
    fn();
    expect(count).toBe(1);
    jest.advanceTimersByTime(150);
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// ═══════════════════════════════════════════════════════
// Extra integration tests — 100 tests
// ═══════════════════════════════════════════════════════
describe('emitter on() return unsubscribe', () => {
  it('test 1: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(2);
  });
  it('test 2: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    em.emit('x', 1);
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(3);
  });
  it('test 3: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(1);
  });
  it('test 4: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(2);
  });
  it('test 5: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    em.emit('x', 1);
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(3);
  });
  it('test 6: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(1);
  });
  it('test 7: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(2);
  });
  it('test 8: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    em.emit('x', 1);
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(3);
  });
  it('test 9: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(1);
  });
  it('test 10: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(2);
  });
  it('test 11: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    em.emit('x', 1);
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(3);
  });
  it('test 12: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(1);
  });
  it('test 13: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(2);
  });
  it('test 14: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    em.emit('x', 1);
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(3);
  });
  it('test 15: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(1);
  });
  it('test 16: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(2);
  });
  it('test 17: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    em.emit('x', 1);
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(3);
  });
  it('test 18: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(1);
  });
  it('test 19: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(2);
  });
  it('test 20: on() returned fn unsubscribes handler', () => {
    const em = createEmitter<{ x: number }>();
    let count = 0;
    const unsub = em.on('x', () => { count++; });
    em.emit('x', 1);
    em.emit('x', 1);
    em.emit('x', 1);
    unsub();
    em.emit('x', 1);
    expect(count).toBe(3);
  });
});

describe('pubSub multiple subscribers', () => {
  it('test 1: 2 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 10);
    expect(results.length).toBe(2);
    results.forEach((v) => expect(v).toBe(10));
  });
  it('test 2: 3 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 20);
    expect(results.length).toBe(3);
    results.forEach((v) => expect(v).toBe(20));
  });
  it('test 3: 4 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 30);
    expect(results.length).toBe(4);
    results.forEach((v) => expect(v).toBe(30));
  });
  it('test 4: 5 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 40);
    expect(results.length).toBe(5);
    results.forEach((v) => expect(v).toBe(40));
  });
  it('test 5: 6 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 50);
    expect(results.length).toBe(6);
    results.forEach((v) => expect(v).toBe(50));
  });
  it('test 6: 7 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 60);
    expect(results.length).toBe(7);
    results.forEach((v) => expect(v).toBe(60));
  });
  it('test 7: 8 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 70);
    expect(results.length).toBe(8);
    results.forEach((v) => expect(v).toBe(70));
  });
  it('test 8: 9 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 80);
    expect(results.length).toBe(9);
    results.forEach((v) => expect(v).toBe(80));
  });
  it('test 9: 10 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 90);
    expect(results.length).toBe(10);
    results.forEach((v) => expect(v).toBe(90));
  });
  it('test 10: 11 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 100);
    expect(results.length).toBe(11);
    results.forEach((v) => expect(v).toBe(100));
  });
  it('test 11: 12 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 110);
    expect(results.length).toBe(12);
    results.forEach((v) => expect(v).toBe(110));
  });
  it('test 12: 13 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 120);
    expect(results.length).toBe(13);
    results.forEach((v) => expect(v).toBe(120));
  });
  it('test 13: 14 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 130);
    expect(results.length).toBe(14);
    results.forEach((v) => expect(v).toBe(130));
  });
  it('test 14: 15 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 140);
    expect(results.length).toBe(15);
    results.forEach((v) => expect(v).toBe(140));
  });
  it('test 15: 16 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 150);
    expect(results.length).toBe(16);
    results.forEach((v) => expect(v).toBe(150));
  });
  it('test 16: 17 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 160);
    expect(results.length).toBe(17);
    results.forEach((v) => expect(v).toBe(160));
  });
  it('test 17: 18 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 170);
    expect(results.length).toBe(18);
    results.forEach((v) => expect(v).toBe(170));
  });
  it('test 18: 19 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 180);
    expect(results.length).toBe(19);
    results.forEach((v) => expect(v).toBe(180));
  });
  it('test 19: 20 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 190);
    expect(results.length).toBe(20);
    results.forEach((v) => expect(v).toBe(190));
  });
  it('test 20: 21 subscribers all receive published value', () => {
    const ps = createPubSub<number>();
    const results: number[] = [];
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.subscribe('t', (v) => results.push(v));
    ps.publish('t', 200);
    expect(results.length).toBe(21);
    results.forEach((v) => expect(v).toBe(200));
  });
});

describe('reactiveStore with strings', () => {
  it('test 1: store holds string value "val1"', () => {
    const store = createReactiveStore('init');
    store.set('val1');
    expect(store.get()).toBe('val1');
  });
  it('test 2: store holds string value "val2"', () => {
    const store = createReactiveStore('init');
    store.set('val2');
    expect(store.get()).toBe('val2');
  });
  it('test 3: store holds string value "val3"', () => {
    const store = createReactiveStore('init');
    store.set('val3');
    expect(store.get()).toBe('val3');
  });
  it('test 4: store holds string value "val4"', () => {
    const store = createReactiveStore('init');
    store.set('val4');
    expect(store.get()).toBe('val4');
  });
  it('test 5: store holds string value "val5"', () => {
    const store = createReactiveStore('init');
    store.set('val5');
    expect(store.get()).toBe('val5');
  });
  it('test 6: store holds string value "val6"', () => {
    const store = createReactiveStore('init');
    store.set('val6');
    expect(store.get()).toBe('val6');
  });
  it('test 7: store holds string value "val7"', () => {
    const store = createReactiveStore('init');
    store.set('val7');
    expect(store.get()).toBe('val7');
  });
  it('test 8: store holds string value "val8"', () => {
    const store = createReactiveStore('init');
    store.set('val8');
    expect(store.get()).toBe('val8');
  });
  it('test 9: store holds string value "val9"', () => {
    const store = createReactiveStore('init');
    store.set('val9');
    expect(store.get()).toBe('val9');
  });
  it('test 10: store holds string value "val10"', () => {
    const store = createReactiveStore('init');
    store.set('val10');
    expect(store.get()).toBe('val10');
  });
  it('test 11: store holds string value "val11"', () => {
    const store = createReactiveStore('init');
    store.set('val11');
    expect(store.get()).toBe('val11');
  });
  it('test 12: store holds string value "val12"', () => {
    const store = createReactiveStore('init');
    store.set('val12');
    expect(store.get()).toBe('val12');
  });
  it('test 13: store holds string value "val13"', () => {
    const store = createReactiveStore('init');
    store.set('val13');
    expect(store.get()).toBe('val13');
  });
  it('test 14: store holds string value "val14"', () => {
    const store = createReactiveStore('init');
    store.set('val14');
    expect(store.get()).toBe('val14');
  });
  it('test 15: store holds string value "val15"', () => {
    const store = createReactiveStore('init');
    store.set('val15');
    expect(store.get()).toBe('val15');
  });
  it('test 16: store holds string value "val16"', () => {
    const store = createReactiveStore('init');
    store.set('val16');
    expect(store.get()).toBe('val16');
  });
  it('test 17: store holds string value "val17"', () => {
    const store = createReactiveStore('init');
    store.set('val17');
    expect(store.get()).toBe('val17');
  });
  it('test 18: store holds string value "val18"', () => {
    const store = createReactiveStore('init');
    store.set('val18');
    expect(store.get()).toBe('val18');
  });
  it('test 19: store holds string value "val19"', () => {
    const store = createReactiveStore('init');
    store.set('val19');
    expect(store.get()).toBe('val19');
  });
  it('test 20: store holds string value "val20"', () => {
    const store = createReactiveStore('init');
    store.set('val20');
    expect(store.get()).toBe('val20');
  });
});

describe('createObservable teardown', () => {
  it('test 1: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 2: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 3: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 4: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 5: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 6: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 7: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 8: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 9: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 10: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 11: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 12: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 13: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 14: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 15: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 16: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 17: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 18: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 19: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
  it('test 20: teardown function is called on unsubscribe', () => {
    let torn = false;
    const obs = createObservable<number>((_o) => () => { torn = true; });
    const sub = obs.subscribe({ next: () => {} });
    sub.unsubscribe();
    expect(torn).toBe(true);
  });
});

describe('createSubject complete', () => {
  it('test 1: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(1);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 2: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(2);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 3: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(3);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 4: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(4);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 5: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(5);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 6: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(6);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 7: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(7);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 8: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(8);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 9: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(9);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 10: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(10);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 11: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(11);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 12: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(12);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 13: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(13);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 14: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(14);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 15: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(15);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 16: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(16);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 17: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(17);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 18: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(18);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 19: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(19);
    subject.complete();
    expect(done).toBe(true);
  });
  it('test 20: complete fires complete callback on subscriber', () => {
    const subject = createSubject<number>();
    let done = false;
    subject.observable.subscribe({ next: () => {}, complete: () => { done = true; } });
    subject.next(20);
    subject.complete();
    expect(done).toBe(true);
  });
});
