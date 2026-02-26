// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  freeze, deepFreeze, isFrozen,
  set, unset, update, setIn, getIn, deleteIn,
  merge, mergeDeep, pick, omit,
  push, pop, shift, unshift, splice,
  insertAt, removeAt, updateAt, setAt,
  reverse, sort, move, swap,
  setKey, deleteKey, mergeMap,
} from '../immutable-utils';

describe('freeze / deepFreeze / isFrozen', () => {
  it('freeze test 001: freeze returns frozen object for obj 1', () => {
    const o = { a: 1, b: 'x' };
    const r = freeze(o);
    expect(Object.isFrozen(r)).toBe(true);
  });
  it('freeze test 002: freeze returns frozen object for obj 2', () => {
    const o = { a: 2, b: 'x' };
    const r = freeze(o);
    expect(Object.isFrozen(r)).toBe(true);
  });
  it('freeze test 003: freeze returns frozen object for obj 3', () => {
    const o = { a: 3, b: 'x' };
    const r = freeze(o);
    expect(Object.isFrozen(r)).toBe(true);
  });
  it('freeze test 004: freeze returns frozen object for obj 4', () => {
    const o = { a: 4, b: 'x' };
    const r = freeze(o);
    expect(Object.isFrozen(r)).toBe(true);
  });
  it('freeze test 005: freeze returns frozen object for obj 5', () => {
    const o = { a: 5, b: 'x' };
    const r = freeze(o);
    expect(Object.isFrozen(r)).toBe(true);
  });
  it('freeze test 006: freeze returns frozen object for obj 6', () => {
    const o = { a: 6, b: 'x' };
    const r = freeze(o);
    expect(Object.isFrozen(r)).toBe(true);
  });
  it('freeze test 007: freeze returns frozen object for obj 7', () => {
    const o = { a: 7, b: 'x' };
    const r = freeze(o);
    expect(Object.isFrozen(r)).toBe(true);
  });
  it('freeze test 008: freeze returns frozen object for obj 8', () => {
    const o = { a: 8, b: 'x' };
    const r = freeze(o);
    expect(Object.isFrozen(r)).toBe(true);
  });
  it('freeze test 009: freeze returns frozen object for obj 9', () => {
    const o = { a: 9, b: 'x' };
    const r = freeze(o);
    expect(Object.isFrozen(r)).toBe(true);
  });
  it('freeze test 010: freeze returns frozen object for obj 10', () => {
    const o = { a: 10, b: 'x' };
    const r = freeze(o);
    expect(Object.isFrozen(r)).toBe(true);
  });
  it('freeze test 011: freeze returns same reference', () => {
    const o = { n: 11 };
    const r = freeze(o);
    expect(r).toBe(o);
  });
  it('freeze test 012: freeze returns same reference', () => {
    const o = { n: 12 };
    const r = freeze(o);
    expect(r).toBe(o);
  });
  it('freeze test 013: freeze returns same reference', () => {
    const o = { n: 13 };
    const r = freeze(o);
    expect(r).toBe(o);
  });
  it('freeze test 014: freeze returns same reference', () => {
    const o = { n: 14 };
    const r = freeze(o);
    expect(r).toBe(o);
  });
  it('freeze test 015: freeze returns same reference', () => {
    const o = { n: 15 };
    const r = freeze(o);
    expect(r).toBe(o);
  });
  it('freeze test 016: freeze returns same reference', () => {
    const o = { n: 16 };
    const r = freeze(o);
    expect(r).toBe(o);
  });
  it('freeze test 017: freeze returns same reference', () => {
    const o = { n: 17 };
    const r = freeze(o);
    expect(r).toBe(o);
  });
  it('freeze test 018: freeze returns same reference', () => {
    const o = { n: 18 };
    const r = freeze(o);
    expect(r).toBe(o);
  });
  it('freeze test 019: freeze returns same reference', () => {
    const o = { n: 19 };
    const r = freeze(o);
    expect(r).toBe(o);
  });
  it('freeze test 020: freeze returns same reference', () => {
    const o = { n: 20 };
    const r = freeze(o);
    expect(r).toBe(o);
  });
  it('freeze test 021: frozen object preserves value n=21', () => {
    const o = { n: 21 };
    const r = freeze(o);
    expect(r.n).toBe(21);
  });
  it('freeze test 022: frozen object preserves value n=22', () => {
    const o = { n: 22 };
    const r = freeze(o);
    expect(r.n).toBe(22);
  });
  it('freeze test 023: frozen object preserves value n=23', () => {
    const o = { n: 23 };
    const r = freeze(o);
    expect(r.n).toBe(23);
  });
  it('freeze test 024: frozen object preserves value n=24', () => {
    const o = { n: 24 };
    const r = freeze(o);
    expect(r.n).toBe(24);
  });
  it('freeze test 025: frozen object preserves value n=25', () => {
    const o = { n: 25 };
    const r = freeze(o);
    expect(r.n).toBe(25);
  });
  it('freeze test 026: frozen object preserves value n=26', () => {
    const o = { n: 26 };
    const r = freeze(o);
    expect(r.n).toBe(26);
  });
  it('freeze test 027: frozen object preserves value n=27', () => {
    const o = { n: 27 };
    const r = freeze(o);
    expect(r.n).toBe(27);
  });
  it('freeze test 028: frozen object preserves value n=28', () => {
    const o = { n: 28 };
    const r = freeze(o);
    expect(r.n).toBe(28);
  });
  it('freeze test 029: frozen object preserves value n=29', () => {
    const o = { n: 29 };
    const r = freeze(o);
    expect(r.n).toBe(29);
  });
  it('freeze test 030: frozen object preserves value n=30', () => {
    const o = { n: 30 };
    const r = freeze(o);
    expect(r.n).toBe(30);
  });
  it('deepFreeze test 001: top-level is frozen', () => {
    const o = { a: 1, inner: { b: 2 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 002: top-level is frozen', () => {
    const o = { a: 2, inner: { b: 4 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 003: top-level is frozen', () => {
    const o = { a: 3, inner: { b: 6 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 004: top-level is frozen', () => {
    const o = { a: 4, inner: { b: 8 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 005: top-level is frozen', () => {
    const o = { a: 5, inner: { b: 10 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 006: top-level is frozen', () => {
    const o = { a: 6, inner: { b: 12 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 007: top-level is frozen', () => {
    const o = { a: 7, inner: { b: 14 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 008: top-level is frozen', () => {
    const o = { a: 8, inner: { b: 16 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 009: top-level is frozen', () => {
    const o = { a: 9, inner: { b: 18 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 010: top-level is frozen', () => {
    const o = { a: 10, inner: { b: 20 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 011: top-level is frozen', () => {
    const o = { a: 11, inner: { b: 22 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 012: top-level is frozen', () => {
    const o = { a: 12, inner: { b: 24 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 013: top-level is frozen', () => {
    const o = { a: 13, inner: { b: 26 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 014: top-level is frozen', () => {
    const o = { a: 14, inner: { b: 28 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 015: top-level is frozen', () => {
    const o = { a: 15, inner: { b: 30 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 016: top-level is frozen', () => {
    const o = { a: 16, inner: { b: 32 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 017: top-level is frozen', () => {
    const o = { a: 17, inner: { b: 34 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 018: top-level is frozen', () => {
    const o = { a: 18, inner: { b: 36 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 019: top-level is frozen', () => {
    const o = { a: 19, inner: { b: 38 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 020: top-level is frozen', () => {
    const o = { a: 20, inner: { b: 40 } };
    deepFreeze(o);
    expect(Object.isFrozen(o)).toBe(true);
  });
  it('deepFreeze test 021: nested object is frozen i=21', () => {
    const inner = { x: 21 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 022: nested object is frozen i=22', () => {
    const inner = { x: 22 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 023: nested object is frozen i=23', () => {
    const inner = { x: 23 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 024: nested object is frozen i=24', () => {
    const inner = { x: 24 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 025: nested object is frozen i=25', () => {
    const inner = { x: 25 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 026: nested object is frozen i=26', () => {
    const inner = { x: 26 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 027: nested object is frozen i=27', () => {
    const inner = { x: 27 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 028: nested object is frozen i=28', () => {
    const inner = { x: 28 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 029: nested object is frozen i=29', () => {
    const inner = { x: 29 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 030: nested object is frozen i=30', () => {
    const inner = { x: 30 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 031: nested object is frozen i=31', () => {
    const inner = { x: 31 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 032: nested object is frozen i=32', () => {
    const inner = { x: 32 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 033: nested object is frozen i=33', () => {
    const inner = { x: 33 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 034: nested object is frozen i=34', () => {
    const inner = { x: 34 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 035: nested object is frozen i=35', () => {
    const inner = { x: 35 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 036: nested object is frozen i=36', () => {
    const inner = { x: 36 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 037: nested object is frozen i=37', () => {
    const inner = { x: 37 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 038: nested object is frozen i=38', () => {
    const inner = { x: 38 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 039: nested object is frozen i=39', () => {
    const inner = { x: 39 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('deepFreeze test 040: nested object is frozen i=40', () => {
    const inner = { x: 40 };
    const o = { inner };
    deepFreeze(o);
    expect(Object.isFrozen(inner)).toBe(true);
  });
  it('isFrozen test 001: returns true for frozen object', () => {
    const o = Object.freeze({ v: 1 });
    expect(isFrozen(o)).toBe(true);
  });
  it('isFrozen test 002: returns true for frozen object', () => {
    const o = Object.freeze({ v: 2 });
    expect(isFrozen(o)).toBe(true);
  });
  it('isFrozen test 003: returns true for frozen object', () => {
    const o = Object.freeze({ v: 3 });
    expect(isFrozen(o)).toBe(true);
  });
  it('isFrozen test 004: returns true for frozen object', () => {
    const o = Object.freeze({ v: 4 });
    expect(isFrozen(o)).toBe(true);
  });
  it('isFrozen test 005: returns true for frozen object', () => {
    const o = Object.freeze({ v: 5 });
    expect(isFrozen(o)).toBe(true);
  });
  it('isFrozen test 006: returns true for frozen object', () => {
    const o = Object.freeze({ v: 6 });
    expect(isFrozen(o)).toBe(true);
  });
  it('isFrozen test 007: returns true for frozen object', () => {
    const o = Object.freeze({ v: 7 });
    expect(isFrozen(o)).toBe(true);
  });
  it('isFrozen test 008: returns true for frozen object', () => {
    const o = Object.freeze({ v: 8 });
    expect(isFrozen(o)).toBe(true);
  });
  it('isFrozen test 009: returns true for frozen object', () => {
    const o = Object.freeze({ v: 9 });
    expect(isFrozen(o)).toBe(true);
  });
  it('isFrozen test 010: returns true for frozen object', () => {
    const o = Object.freeze({ v: 10 });
    expect(isFrozen(o)).toBe(true);
  });
  it('isFrozen test 011: returns false for plain object n=11', () => {
    expect(isFrozen({ n: 11 })).toBe(false);
  });
  it('isFrozen test 012: returns false for plain object n=12', () => {
    expect(isFrozen({ n: 12 })).toBe(false);
  });
  it('isFrozen test 013: returns false for plain object n=13', () => {
    expect(isFrozen({ n: 13 })).toBe(false);
  });
  it('isFrozen test 014: returns false for plain object n=14', () => {
    expect(isFrozen({ n: 14 })).toBe(false);
  });
  it('isFrozen test 015: returns false for plain object n=15', () => {
    expect(isFrozen({ n: 15 })).toBe(false);
  });
  it('isFrozen test 016: returns false for plain object n=16', () => {
    expect(isFrozen({ n: 16 })).toBe(false);
  });
  it('isFrozen test 017: returns false for plain object n=17', () => {
    expect(isFrozen({ n: 17 })).toBe(false);
  });
  it('isFrozen test 018: returns false for plain object n=18', () => {
    expect(isFrozen({ n: 18 })).toBe(false);
  });
  it('isFrozen test 019: returns false for plain object n=19', () => {
    expect(isFrozen({ n: 19 })).toBe(false);
  });
  it('isFrozen test 020: returns false for plain object n=20', () => {
    expect(isFrozen({ n: 20 })).toBe(false);
  });
  it('isFrozen test 021: primitives always frozen i=21', () => {
    expect(isFrozen(21)).toBe(true);
  });
  it('isFrozen test 022: primitives always frozen i=22', () => {
    expect(isFrozen(22)).toBe(true);
  });
  it('isFrozen test 023: primitives always frozen i=23', () => {
    expect(isFrozen(23)).toBe(true);
  });
  it('isFrozen test 024: primitives always frozen i=24', () => {
    expect(isFrozen(24)).toBe(true);
  });
  it('isFrozen test 025: primitives always frozen i=25', () => {
    expect(isFrozen(25)).toBe(true);
  });
  it('isFrozen test 026: primitives always frozen i=26', () => {
    expect(isFrozen(26)).toBe(true);
  });
  it('isFrozen test 027: primitives always frozen i=27', () => {
    expect(isFrozen(27)).toBe(true);
  });
  it('isFrozen test 028: primitives always frozen i=28', () => {
    expect(isFrozen(28)).toBe(true);
  });
  it('isFrozen test 029: primitives always frozen i=29', () => {
    expect(isFrozen(29)).toBe(true);
  });
  it('isFrozen test 030: primitives always frozen i=30', () => {
    expect(isFrozen(30)).toBe(true);
  });
});

describe('set / update / unset', () => {
  it('set test 001: original unchanged after set', () => {
    const o = { a: 1, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 002: original unchanged after set', () => {
    const o = { a: 2, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 003: original unchanged after set', () => {
    const o = { a: 3, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 004: original unchanged after set', () => {
    const o = { a: 4, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 005: original unchanged after set', () => {
    const o = { a: 5, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 006: original unchanged after set', () => {
    const o = { a: 6, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 007: original unchanged after set', () => {
    const o = { a: 7, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 008: original unchanged after set', () => {
    const o = { a: 8, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 009: original unchanged after set', () => {
    const o = { a: 9, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 010: original unchanged after set', () => {
    const o = { a: 10, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 011: original unchanged after set', () => {
    const o = { a: 11, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 012: original unchanged after set', () => {
    const o = { a: 12, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 013: original unchanged after set', () => {
    const o = { a: 13, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 014: original unchanged after set', () => {
    const o = { a: 14, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 015: original unchanged after set', () => {
    const o = { a: 15, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 016: original unchanged after set', () => {
    const o = { a: 16, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 017: original unchanged after set', () => {
    const o = { a: 17, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 018: original unchanged after set', () => {
    const o = { a: 18, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 019: original unchanged after set', () => {
    const o = { a: 19, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 020: original unchanged after set', () => {
    const o = { a: 20, b: 'original' };
    set(o, 'b', 'changed');
    expect(o.b).toBe('original');
  });
  it('set test 021: new object has updated value i=21', () => {
    const o = { a: 21 };
    const r = set(o, 'a', 210);
    expect(r.a).toBe(210);
  });
  it('set test 022: new object has updated value i=22', () => {
    const o = { a: 22 };
    const r = set(o, 'a', 220);
    expect(r.a).toBe(220);
  });
  it('set test 023: new object has updated value i=23', () => {
    const o = { a: 23 };
    const r = set(o, 'a', 230);
    expect(r.a).toBe(230);
  });
  it('set test 024: new object has updated value i=24', () => {
    const o = { a: 24 };
    const r = set(o, 'a', 240);
    expect(r.a).toBe(240);
  });
  it('set test 025: new object has updated value i=25', () => {
    const o = { a: 25 };
    const r = set(o, 'a', 250);
    expect(r.a).toBe(250);
  });
  it('set test 026: new object has updated value i=26', () => {
    const o = { a: 26 };
    const r = set(o, 'a', 260);
    expect(r.a).toBe(260);
  });
  it('set test 027: new object has updated value i=27', () => {
    const o = { a: 27 };
    const r = set(o, 'a', 270);
    expect(r.a).toBe(270);
  });
  it('set test 028: new object has updated value i=28', () => {
    const o = { a: 28 };
    const r = set(o, 'a', 280);
    expect(r.a).toBe(280);
  });
  it('set test 029: new object has updated value i=29', () => {
    const o = { a: 29 };
    const r = set(o, 'a', 290);
    expect(r.a).toBe(290);
  });
  it('set test 030: new object has updated value i=30', () => {
    const o = { a: 30 };
    const r = set(o, 'a', 300);
    expect(r.a).toBe(300);
  });
  it('set test 031: new object has updated value i=31', () => {
    const o = { a: 31 };
    const r = set(o, 'a', 310);
    expect(r.a).toBe(310);
  });
  it('set test 032: new object has updated value i=32', () => {
    const o = { a: 32 };
    const r = set(o, 'a', 320);
    expect(r.a).toBe(320);
  });
  it('set test 033: new object has updated value i=33', () => {
    const o = { a: 33 };
    const r = set(o, 'a', 330);
    expect(r.a).toBe(330);
  });
  it('set test 034: new object has updated value i=34', () => {
    const o = { a: 34 };
    const r = set(o, 'a', 340);
    expect(r.a).toBe(340);
  });
  it('set test 035: new object has updated value i=35', () => {
    const o = { a: 35 };
    const r = set(o, 'a', 350);
    expect(r.a).toBe(350);
  });
  it('set test 036: new object has updated value i=36', () => {
    const o = { a: 36 };
    const r = set(o, 'a', 360);
    expect(r.a).toBe(360);
  });
  it('set test 037: new object has updated value i=37', () => {
    const o = { a: 37 };
    const r = set(o, 'a', 370);
    expect(r.a).toBe(370);
  });
  it('set test 038: new object has updated value i=38', () => {
    const o = { a: 38 };
    const r = set(o, 'a', 380);
    expect(r.a).toBe(380);
  });
  it('set test 039: new object has updated value i=39', () => {
    const o = { a: 39 };
    const r = set(o, 'a', 390);
    expect(r.a).toBe(390);
  });
  it('set test 040: new object has updated value i=40', () => {
    const o = { a: 40 };
    const r = set(o, 'a', 400);
    expect(r.a).toBe(400);
  });
  it('update test 001: original unchanged after update', () => {
    const o = { n: 1 };
    update(o, 'n', v => v + 100);
    expect(o.n).toBe(1);
  });
  it('update test 002: original unchanged after update', () => {
    const o = { n: 2 };
    update(o, 'n', v => v + 100);
    expect(o.n).toBe(2);
  });
  it('update test 003: original unchanged after update', () => {
    const o = { n: 3 };
    update(o, 'n', v => v + 100);
    expect(o.n).toBe(3);
  });
  it('update test 004: original unchanged after update', () => {
    const o = { n: 4 };
    update(o, 'n', v => v + 100);
    expect(o.n).toBe(4);
  });
  it('update test 005: original unchanged after update', () => {
    const o = { n: 5 };
    update(o, 'n', v => v + 100);
    expect(o.n).toBe(5);
  });
  it('update test 006: original unchanged after update', () => {
    const o = { n: 6 };
    update(o, 'n', v => v + 100);
    expect(o.n).toBe(6);
  });
  it('update test 007: original unchanged after update', () => {
    const o = { n: 7 };
    update(o, 'n', v => v + 100);
    expect(o.n).toBe(7);
  });
  it('update test 008: original unchanged after update', () => {
    const o = { n: 8 };
    update(o, 'n', v => v + 100);
    expect(o.n).toBe(8);
  });
  it('update test 009: original unchanged after update', () => {
    const o = { n: 9 };
    update(o, 'n', v => v + 100);
    expect(o.n).toBe(9);
  });
  it('update test 010: original unchanged after update', () => {
    const o = { n: 10 };
    update(o, 'n', v => v + 100);
    expect(o.n).toBe(10);
  });
  it('update test 011: original unchanged after update', () => {
    const o = { n: 11 };
    update(o, 'n', v => v + 100);
    expect(o.n).toBe(11);
  });
  it('update test 012: original unchanged after update', () => {
    const o = { n: 12 };
    update(o, 'n', v => v + 100);
    expect(o.n).toBe(12);
  });
  it('update test 013: original unchanged after update', () => {
    const o = { n: 13 };
    update(o, 'n', v => v + 100);
    expect(o.n).toBe(13);
  });
  it('update test 014: original unchanged after update', () => {
    const o = { n: 14 };
    update(o, 'n', v => v + 100);
    expect(o.n).toBe(14);
  });
  it('update test 015: original unchanged after update', () => {
    const o = { n: 15 };
    update(o, 'n', v => v + 100);
    expect(o.n).toBe(15);
  });
  it('update test 016: fn applied correctly i=16', () => {
    const o = { n: 16 };
    const r = update(o, 'n', v => v * 2);
    expect(r.n).toBe(32);
  });
  it('update test 017: fn applied correctly i=17', () => {
    const o = { n: 17 };
    const r = update(o, 'n', v => v * 2);
    expect(r.n).toBe(34);
  });
  it('update test 018: fn applied correctly i=18', () => {
    const o = { n: 18 };
    const r = update(o, 'n', v => v * 2);
    expect(r.n).toBe(36);
  });
  it('update test 019: fn applied correctly i=19', () => {
    const o = { n: 19 };
    const r = update(o, 'n', v => v * 2);
    expect(r.n).toBe(38);
  });
  it('update test 020: fn applied correctly i=20', () => {
    const o = { n: 20 };
    const r = update(o, 'n', v => v * 2);
    expect(r.n).toBe(40);
  });
  it('update test 021: fn applied correctly i=21', () => {
    const o = { n: 21 };
    const r = update(o, 'n', v => v * 2);
    expect(r.n).toBe(42);
  });
  it('update test 022: fn applied correctly i=22', () => {
    const o = { n: 22 };
    const r = update(o, 'n', v => v * 2);
    expect(r.n).toBe(44);
  });
  it('update test 023: fn applied correctly i=23', () => {
    const o = { n: 23 };
    const r = update(o, 'n', v => v * 2);
    expect(r.n).toBe(46);
  });
  it('update test 024: fn applied correctly i=24', () => {
    const o = { n: 24 };
    const r = update(o, 'n', v => v * 2);
    expect(r.n).toBe(48);
  });
  it('update test 025: fn applied correctly i=25', () => {
    const o = { n: 25 };
    const r = update(o, 'n', v => v * 2);
    expect(r.n).toBe(50);
  });
  it('update test 026: fn applied correctly i=26', () => {
    const o = { n: 26 };
    const r = update(o, 'n', v => v * 2);
    expect(r.n).toBe(52);
  });
  it('update test 027: fn applied correctly i=27', () => {
    const o = { n: 27 };
    const r = update(o, 'n', v => v * 2);
    expect(r.n).toBe(54);
  });
  it('update test 028: fn applied correctly i=28', () => {
    const o = { n: 28 };
    const r = update(o, 'n', v => v * 2);
    expect(r.n).toBe(56);
  });
  it('update test 029: fn applied correctly i=29', () => {
    const o = { n: 29 };
    const r = update(o, 'n', v => v * 2);
    expect(r.n).toBe(58);
  });
  it('update test 030: fn applied correctly i=30', () => {
    const o = { n: 30 };
    const r = update(o, 'n', v => v * 2);
    expect(r.n).toBe(60);
  });
  it('unset test 001: original still has key after unset', () => {
    const o = { a: 1, b: 'keep' };
    unset(o, 'a');
    expect(o.a).toBe(1);
  });
  it('unset test 002: original still has key after unset', () => {
    const o = { a: 2, b: 'keep' };
    unset(o, 'a');
    expect(o.a).toBe(2);
  });
  it('unset test 003: original still has key after unset', () => {
    const o = { a: 3, b: 'keep' };
    unset(o, 'a');
    expect(o.a).toBe(3);
  });
  it('unset test 004: original still has key after unset', () => {
    const o = { a: 4, b: 'keep' };
    unset(o, 'a');
    expect(o.a).toBe(4);
  });
  it('unset test 005: original still has key after unset', () => {
    const o = { a: 5, b: 'keep' };
    unset(o, 'a');
    expect(o.a).toBe(5);
  });
  it('unset test 006: original still has key after unset', () => {
    const o = { a: 6, b: 'keep' };
    unset(o, 'a');
    expect(o.a).toBe(6);
  });
  it('unset test 007: original still has key after unset', () => {
    const o = { a: 7, b: 'keep' };
    unset(o, 'a');
    expect(o.a).toBe(7);
  });
  it('unset test 008: original still has key after unset', () => {
    const o = { a: 8, b: 'keep' };
    unset(o, 'a');
    expect(o.a).toBe(8);
  });
  it('unset test 009: original still has key after unset', () => {
    const o = { a: 9, b: 'keep' };
    unset(o, 'a');
    expect(o.a).toBe(9);
  });
  it('unset test 010: original still has key after unset', () => {
    const o = { a: 10, b: 'keep' };
    unset(o, 'a');
    expect(o.a).toBe(10);
  });
  it('unset test 011: original still has key after unset', () => {
    const o = { a: 11, b: 'keep' };
    unset(o, 'a');
    expect(o.a).toBe(11);
  });
  it('unset test 012: original still has key after unset', () => {
    const o = { a: 12, b: 'keep' };
    unset(o, 'a');
    expect(o.a).toBe(12);
  });
  it('unset test 013: original still has key after unset', () => {
    const o = { a: 13, b: 'keep' };
    unset(o, 'a');
    expect(o.a).toBe(13);
  });
  it('unset test 014: original still has key after unset', () => {
    const o = { a: 14, b: 'keep' };
    unset(o, 'a');
    expect(o.a).toBe(14);
  });
  it('unset test 015: original still has key after unset', () => {
    const o = { a: 15, b: 'keep' };
    unset(o, 'a');
    expect(o.a).toBe(15);
  });
  it('unset test 016: result does not contain key i=16', () => {
    const o = { a: 16, b: 'keep' };
    const r = unset(o, 'a');
    expect('a' in r).toBe(false);
  });
  it('unset test 017: result does not contain key i=17', () => {
    const o = { a: 17, b: 'keep' };
    const r = unset(o, 'a');
    expect('a' in r).toBe(false);
  });
  it('unset test 018: result does not contain key i=18', () => {
    const o = { a: 18, b: 'keep' };
    const r = unset(o, 'a');
    expect('a' in r).toBe(false);
  });
  it('unset test 019: result does not contain key i=19', () => {
    const o = { a: 19, b: 'keep' };
    const r = unset(o, 'a');
    expect('a' in r).toBe(false);
  });
  it('unset test 020: result does not contain key i=20', () => {
    const o = { a: 20, b: 'keep' };
    const r = unset(o, 'a');
    expect('a' in r).toBe(false);
  });
  it('unset test 021: result does not contain key i=21', () => {
    const o = { a: 21, b: 'keep' };
    const r = unset(o, 'a');
    expect('a' in r).toBe(false);
  });
  it('unset test 022: result does not contain key i=22', () => {
    const o = { a: 22, b: 'keep' };
    const r = unset(o, 'a');
    expect('a' in r).toBe(false);
  });
  it('unset test 023: result does not contain key i=23', () => {
    const o = { a: 23, b: 'keep' };
    const r = unset(o, 'a');
    expect('a' in r).toBe(false);
  });
  it('unset test 024: result does not contain key i=24', () => {
    const o = { a: 24, b: 'keep' };
    const r = unset(o, 'a');
    expect('a' in r).toBe(false);
  });
  it('unset test 025: result does not contain key i=25', () => {
    const o = { a: 25, b: 'keep' };
    const r = unset(o, 'a');
    expect('a' in r).toBe(false);
  });
  it('unset test 026: result does not contain key i=26', () => {
    const o = { a: 26, b: 'keep' };
    const r = unset(o, 'a');
    expect('a' in r).toBe(false);
  });
  it('unset test 027: result does not contain key i=27', () => {
    const o = { a: 27, b: 'keep' };
    const r = unset(o, 'a');
    expect('a' in r).toBe(false);
  });
  it('unset test 028: result does not contain key i=28', () => {
    const o = { a: 28, b: 'keep' };
    const r = unset(o, 'a');
    expect('a' in r).toBe(false);
  });
  it('unset test 029: result does not contain key i=29', () => {
    const o = { a: 29, b: 'keep' };
    const r = unset(o, 'a');
    expect('a' in r).toBe(false);
  });
  it('unset test 030: result does not contain key i=30', () => {
    const o = { a: 30, b: 'keep' };
    const r = unset(o, 'a');
    expect('a' in r).toBe(false);
  });
});

describe('setIn / getIn / deleteIn', () => {
  it('setIn test 001: shallow path sets value', () => {
    const o = { a: 1 };
    const r = setIn(o, ['a'], 5);
    expect((r as any).a).toBe(5);
  });
  it('setIn test 002: shallow path sets value', () => {
    const o = { a: 2 };
    const r = setIn(o, ['a'], 10);
    expect((r as any).a).toBe(10);
  });
  it('setIn test 003: shallow path sets value', () => {
    const o = { a: 3 };
    const r = setIn(o, ['a'], 15);
    expect((r as any).a).toBe(15);
  });
  it('setIn test 004: shallow path sets value', () => {
    const o = { a: 4 };
    const r = setIn(o, ['a'], 20);
    expect((r as any).a).toBe(20);
  });
  it('setIn test 005: shallow path sets value', () => {
    const o = { a: 5 };
    const r = setIn(o, ['a'], 25);
    expect((r as any).a).toBe(25);
  });
  it('setIn test 006: shallow path sets value', () => {
    const o = { a: 6 };
    const r = setIn(o, ['a'], 30);
    expect((r as any).a).toBe(30);
  });
  it('setIn test 007: shallow path sets value', () => {
    const o = { a: 7 };
    const r = setIn(o, ['a'], 35);
    expect((r as any).a).toBe(35);
  });
  it('setIn test 008: shallow path sets value', () => {
    const o = { a: 8 };
    const r = setIn(o, ['a'], 40);
    expect((r as any).a).toBe(40);
  });
  it('setIn test 009: shallow path sets value', () => {
    const o = { a: 9 };
    const r = setIn(o, ['a'], 45);
    expect((r as any).a).toBe(45);
  });
  it('setIn test 010: shallow path sets value', () => {
    const o = { a: 10 };
    const r = setIn(o, ['a'], 50);
    expect((r as any).a).toBe(50);
  });
  it('setIn test 011: shallow path sets value', () => {
    const o = { a: 11 };
    const r = setIn(o, ['a'], 55);
    expect((r as any).a).toBe(55);
  });
  it('setIn test 012: shallow path sets value', () => {
    const o = { a: 12 };
    const r = setIn(o, ['a'], 60);
    expect((r as any).a).toBe(60);
  });
  it('setIn test 013: shallow path sets value', () => {
    const o = { a: 13 };
    const r = setIn(o, ['a'], 65);
    expect((r as any).a).toBe(65);
  });
  it('setIn test 014: shallow path sets value', () => {
    const o = { a: 14 };
    const r = setIn(o, ['a'], 70);
    expect((r as any).a).toBe(70);
  });
  it('setIn test 015: shallow path sets value', () => {
    const o = { a: 15 };
    const r = setIn(o, ['a'], 75);
    expect((r as any).a).toBe(75);
  });
  it('setIn test 016: shallow path sets value', () => {
    const o = { a: 16 };
    const r = setIn(o, ['a'], 80);
    expect((r as any).a).toBe(80);
  });
  it('setIn test 017: shallow path sets value', () => {
    const o = { a: 17 };
    const r = setIn(o, ['a'], 85);
    expect((r as any).a).toBe(85);
  });
  it('setIn test 018: shallow path sets value', () => {
    const o = { a: 18 };
    const r = setIn(o, ['a'], 90);
    expect((r as any).a).toBe(90);
  });
  it('setIn test 019: shallow path sets value', () => {
    const o = { a: 19 };
    const r = setIn(o, ['a'], 95);
    expect((r as any).a).toBe(95);
  });
  it('setIn test 020: shallow path sets value', () => {
    const o = { a: 20 };
    const r = setIn(o, ['a'], 100);
    expect((r as any).a).toBe(100);
  });
  it('setIn test 021: nested path sets value i=21', () => {
    const o = { x: { y: 21 } };
    const r = setIn(o, ['x', 'y'], 121);
    expect((r as any).x.y).toBe(121);
  });
  it('setIn test 022: nested path sets value i=22', () => {
    const o = { x: { y: 22 } };
    const r = setIn(o, ['x', 'y'], 122);
    expect((r as any).x.y).toBe(122);
  });
  it('setIn test 023: nested path sets value i=23', () => {
    const o = { x: { y: 23 } };
    const r = setIn(o, ['x', 'y'], 123);
    expect((r as any).x.y).toBe(123);
  });
  it('setIn test 024: nested path sets value i=24', () => {
    const o = { x: { y: 24 } };
    const r = setIn(o, ['x', 'y'], 124);
    expect((r as any).x.y).toBe(124);
  });
  it('setIn test 025: nested path sets value i=25', () => {
    const o = { x: { y: 25 } };
    const r = setIn(o, ['x', 'y'], 125);
    expect((r as any).x.y).toBe(125);
  });
  it('setIn test 026: nested path sets value i=26', () => {
    const o = { x: { y: 26 } };
    const r = setIn(o, ['x', 'y'], 126);
    expect((r as any).x.y).toBe(126);
  });
  it('setIn test 027: nested path sets value i=27', () => {
    const o = { x: { y: 27 } };
    const r = setIn(o, ['x', 'y'], 127);
    expect((r as any).x.y).toBe(127);
  });
  it('setIn test 028: nested path sets value i=28', () => {
    const o = { x: { y: 28 } };
    const r = setIn(o, ['x', 'y'], 128);
    expect((r as any).x.y).toBe(128);
  });
  it('setIn test 029: nested path sets value i=29', () => {
    const o = { x: { y: 29 } };
    const r = setIn(o, ['x', 'y'], 129);
    expect((r as any).x.y).toBe(129);
  });
  it('setIn test 030: nested path sets value i=30', () => {
    const o = { x: { y: 30 } };
    const r = setIn(o, ['x', 'y'], 130);
    expect((r as any).x.y).toBe(130);
  });
  it('setIn test 031: nested path sets value i=31', () => {
    const o = { x: { y: 31 } };
    const r = setIn(o, ['x', 'y'], 131);
    expect((r as any).x.y).toBe(131);
  });
  it('setIn test 032: nested path sets value i=32', () => {
    const o = { x: { y: 32 } };
    const r = setIn(o, ['x', 'y'], 132);
    expect((r as any).x.y).toBe(132);
  });
  it('setIn test 033: nested path sets value i=33', () => {
    const o = { x: { y: 33 } };
    const r = setIn(o, ['x', 'y'], 133);
    expect((r as any).x.y).toBe(133);
  });
  it('setIn test 034: nested path sets value i=34', () => {
    const o = { x: { y: 34 } };
    const r = setIn(o, ['x', 'y'], 134);
    expect((r as any).x.y).toBe(134);
  });
  it('setIn test 035: nested path sets value i=35', () => {
    const o = { x: { y: 35 } };
    const r = setIn(o, ['x', 'y'], 135);
    expect((r as any).x.y).toBe(135);
  });
  it('setIn test 036: nested path sets value i=36', () => {
    const o = { x: { y: 36 } };
    const r = setIn(o, ['x', 'y'], 136);
    expect((r as any).x.y).toBe(136);
  });
  it('setIn test 037: nested path sets value i=37', () => {
    const o = { x: { y: 37 } };
    const r = setIn(o, ['x', 'y'], 137);
    expect((r as any).x.y).toBe(137);
  });
  it('setIn test 038: nested path sets value i=38', () => {
    const o = { x: { y: 38 } };
    const r = setIn(o, ['x', 'y'], 138);
    expect((r as any).x.y).toBe(138);
  });
  it('setIn test 039: nested path sets value i=39', () => {
    const o = { x: { y: 39 } };
    const r = setIn(o, ['x', 'y'], 139);
    expect((r as any).x.y).toBe(139);
  });
  it('setIn test 040: nested path sets value i=40', () => {
    const o = { x: { y: 40 } };
    const r = setIn(o, ['x', 'y'], 140);
    expect((r as any).x.y).toBe(140);
  });
  it('getIn test 001: shallow path retrieves value', () => {
    const o = { k: 1 };
    expect(getIn(o, ['k'])).toBe(1);
  });
  it('getIn test 002: shallow path retrieves value', () => {
    const o = { k: 2 };
    expect(getIn(o, ['k'])).toBe(2);
  });
  it('getIn test 003: shallow path retrieves value', () => {
    const o = { k: 3 };
    expect(getIn(o, ['k'])).toBe(3);
  });
  it('getIn test 004: shallow path retrieves value', () => {
    const o = { k: 4 };
    expect(getIn(o, ['k'])).toBe(4);
  });
  it('getIn test 005: shallow path retrieves value', () => {
    const o = { k: 5 };
    expect(getIn(o, ['k'])).toBe(5);
  });
  it('getIn test 006: shallow path retrieves value', () => {
    const o = { k: 6 };
    expect(getIn(o, ['k'])).toBe(6);
  });
  it('getIn test 007: shallow path retrieves value', () => {
    const o = { k: 7 };
    expect(getIn(o, ['k'])).toBe(7);
  });
  it('getIn test 008: shallow path retrieves value', () => {
    const o = { k: 8 };
    expect(getIn(o, ['k'])).toBe(8);
  });
  it('getIn test 009: shallow path retrieves value', () => {
    const o = { k: 9 };
    expect(getIn(o, ['k'])).toBe(9);
  });
  it('getIn test 010: shallow path retrieves value', () => {
    const o = { k: 10 };
    expect(getIn(o, ['k'])).toBe(10);
  });
  it('getIn test 011: shallow path retrieves value', () => {
    const o = { k: 11 };
    expect(getIn(o, ['k'])).toBe(11);
  });
  it('getIn test 012: shallow path retrieves value', () => {
    const o = { k: 12 };
    expect(getIn(o, ['k'])).toBe(12);
  });
  it('getIn test 013: shallow path retrieves value', () => {
    const o = { k: 13 };
    expect(getIn(o, ['k'])).toBe(13);
  });
  it('getIn test 014: shallow path retrieves value', () => {
    const o = { k: 14 };
    expect(getIn(o, ['k'])).toBe(14);
  });
  it('getIn test 015: shallow path retrieves value', () => {
    const o = { k: 15 };
    expect(getIn(o, ['k'])).toBe(15);
  });
  it('getIn test 016: nested path retrieves value i=16', () => {
    const o = { a: { b: 16 } };
    expect(getIn(o, ['a', 'b'])).toBe(16);
  });
  it('getIn test 017: nested path retrieves value i=17', () => {
    const o = { a: { b: 17 } };
    expect(getIn(o, ['a', 'b'])).toBe(17);
  });
  it('getIn test 018: nested path retrieves value i=18', () => {
    const o = { a: { b: 18 } };
    expect(getIn(o, ['a', 'b'])).toBe(18);
  });
  it('getIn test 019: nested path retrieves value i=19', () => {
    const o = { a: { b: 19 } };
    expect(getIn(o, ['a', 'b'])).toBe(19);
  });
  it('getIn test 020: nested path retrieves value i=20', () => {
    const o = { a: { b: 20 } };
    expect(getIn(o, ['a', 'b'])).toBe(20);
  });
  it('getIn test 021: nested path retrieves value i=21', () => {
    const o = { a: { b: 21 } };
    expect(getIn(o, ['a', 'b'])).toBe(21);
  });
  it('getIn test 022: nested path retrieves value i=22', () => {
    const o = { a: { b: 22 } };
    expect(getIn(o, ['a', 'b'])).toBe(22);
  });
  it('getIn test 023: nested path retrieves value i=23', () => {
    const o = { a: { b: 23 } };
    expect(getIn(o, ['a', 'b'])).toBe(23);
  });
  it('getIn test 024: nested path retrieves value i=24', () => {
    const o = { a: { b: 24 } };
    expect(getIn(o, ['a', 'b'])).toBe(24);
  });
  it('getIn test 025: nested path retrieves value i=25', () => {
    const o = { a: { b: 25 } };
    expect(getIn(o, ['a', 'b'])).toBe(25);
  });
  it('getIn test 026: nested path retrieves value i=26', () => {
    const o = { a: { b: 26 } };
    expect(getIn(o, ['a', 'b'])).toBe(26);
  });
  it('getIn test 027: nested path retrieves value i=27', () => {
    const o = { a: { b: 27 } };
    expect(getIn(o, ['a', 'b'])).toBe(27);
  });
  it('getIn test 028: nested path retrieves value i=28', () => {
    const o = { a: { b: 28 } };
    expect(getIn(o, ['a', 'b'])).toBe(28);
  });
  it('getIn test 029: nested path retrieves value i=29', () => {
    const o = { a: { b: 29 } };
    expect(getIn(o, ['a', 'b'])).toBe(29);
  });
  it('getIn test 030: nested path retrieves value i=30', () => {
    const o = { a: { b: 30 } };
    expect(getIn(o, ['a', 'b'])).toBe(30);
  });
  it('deleteIn test 001: shallow deleteIn removes key', () => {
    const o = { a: 1, b: 'stay' };
    const r = deleteIn(o, ['a']);
    expect('a' in r).toBe(false);
  });
  it('deleteIn test 002: shallow deleteIn removes key', () => {
    const o = { a: 2, b: 'stay' };
    const r = deleteIn(o, ['a']);
    expect('a' in r).toBe(false);
  });
  it('deleteIn test 003: shallow deleteIn removes key', () => {
    const o = { a: 3, b: 'stay' };
    const r = deleteIn(o, ['a']);
    expect('a' in r).toBe(false);
  });
  it('deleteIn test 004: shallow deleteIn removes key', () => {
    const o = { a: 4, b: 'stay' };
    const r = deleteIn(o, ['a']);
    expect('a' in r).toBe(false);
  });
  it('deleteIn test 005: shallow deleteIn removes key', () => {
    const o = { a: 5, b: 'stay' };
    const r = deleteIn(o, ['a']);
    expect('a' in r).toBe(false);
  });
  it('deleteIn test 006: shallow deleteIn removes key', () => {
    const o = { a: 6, b: 'stay' };
    const r = deleteIn(o, ['a']);
    expect('a' in r).toBe(false);
  });
  it('deleteIn test 007: shallow deleteIn removes key', () => {
    const o = { a: 7, b: 'stay' };
    const r = deleteIn(o, ['a']);
    expect('a' in r).toBe(false);
  });
  it('deleteIn test 008: shallow deleteIn removes key', () => {
    const o = { a: 8, b: 'stay' };
    const r = deleteIn(o, ['a']);
    expect('a' in r).toBe(false);
  });
  it('deleteIn test 009: shallow deleteIn removes key', () => {
    const o = { a: 9, b: 'stay' };
    const r = deleteIn(o, ['a']);
    expect('a' in r).toBe(false);
  });
  it('deleteIn test 010: shallow deleteIn removes key', () => {
    const o = { a: 10, b: 'stay' };
    const r = deleteIn(o, ['a']);
    expect('a' in r).toBe(false);
  });
  it('deleteIn test 011: shallow deleteIn removes key', () => {
    const o = { a: 11, b: 'stay' };
    const r = deleteIn(o, ['a']);
    expect('a' in r).toBe(false);
  });
  it('deleteIn test 012: shallow deleteIn removes key', () => {
    const o = { a: 12, b: 'stay' };
    const r = deleteIn(o, ['a']);
    expect('a' in r).toBe(false);
  });
  it('deleteIn test 013: shallow deleteIn removes key', () => {
    const o = { a: 13, b: 'stay' };
    const r = deleteIn(o, ['a']);
    expect('a' in r).toBe(false);
  });
  it('deleteIn test 014: shallow deleteIn removes key', () => {
    const o = { a: 14, b: 'stay' };
    const r = deleteIn(o, ['a']);
    expect('a' in r).toBe(false);
  });
  it('deleteIn test 015: shallow deleteIn removes key', () => {
    const o = { a: 15, b: 'stay' };
    const r = deleteIn(o, ['a']);
    expect('a' in r).toBe(false);
  });
  it('deleteIn test 016: nested deleteIn removes key i=16', () => {
    const o = { a: { b: 16, c: 'stay' } };
    const r = deleteIn(o, ['a', 'b']);
    expect('b' in (r as any).a).toBe(false);
  });
  it('deleteIn test 017: nested deleteIn removes key i=17', () => {
    const o = { a: { b: 17, c: 'stay' } };
    const r = deleteIn(o, ['a', 'b']);
    expect('b' in (r as any).a).toBe(false);
  });
  it('deleteIn test 018: nested deleteIn removes key i=18', () => {
    const o = { a: { b: 18, c: 'stay' } };
    const r = deleteIn(o, ['a', 'b']);
    expect('b' in (r as any).a).toBe(false);
  });
  it('deleteIn test 019: nested deleteIn removes key i=19', () => {
    const o = { a: { b: 19, c: 'stay' } };
    const r = deleteIn(o, ['a', 'b']);
    expect('b' in (r as any).a).toBe(false);
  });
  it('deleteIn test 020: nested deleteIn removes key i=20', () => {
    const o = { a: { b: 20, c: 'stay' } };
    const r = deleteIn(o, ['a', 'b']);
    expect('b' in (r as any).a).toBe(false);
  });
  it('deleteIn test 021: nested deleteIn removes key i=21', () => {
    const o = { a: { b: 21, c: 'stay' } };
    const r = deleteIn(o, ['a', 'b']);
    expect('b' in (r as any).a).toBe(false);
  });
  it('deleteIn test 022: nested deleteIn removes key i=22', () => {
    const o = { a: { b: 22, c: 'stay' } };
    const r = deleteIn(o, ['a', 'b']);
    expect('b' in (r as any).a).toBe(false);
  });
  it('deleteIn test 023: nested deleteIn removes key i=23', () => {
    const o = { a: { b: 23, c: 'stay' } };
    const r = deleteIn(o, ['a', 'b']);
    expect('b' in (r as any).a).toBe(false);
  });
  it('deleteIn test 024: nested deleteIn removes key i=24', () => {
    const o = { a: { b: 24, c: 'stay' } };
    const r = deleteIn(o, ['a', 'b']);
    expect('b' in (r as any).a).toBe(false);
  });
  it('deleteIn test 025: nested deleteIn removes key i=25', () => {
    const o = { a: { b: 25, c: 'stay' } };
    const r = deleteIn(o, ['a', 'b']);
    expect('b' in (r as any).a).toBe(false);
  });
  it('deleteIn test 026: nested deleteIn removes key i=26', () => {
    const o = { a: { b: 26, c: 'stay' } };
    const r = deleteIn(o, ['a', 'b']);
    expect('b' in (r as any).a).toBe(false);
  });
  it('deleteIn test 027: nested deleteIn removes key i=27', () => {
    const o = { a: { b: 27, c: 'stay' } };
    const r = deleteIn(o, ['a', 'b']);
    expect('b' in (r as any).a).toBe(false);
  });
  it('deleteIn test 028: nested deleteIn removes key i=28', () => {
    const o = { a: { b: 28, c: 'stay' } };
    const r = deleteIn(o, ['a', 'b']);
    expect('b' in (r as any).a).toBe(false);
  });
  it('deleteIn test 029: nested deleteIn removes key i=29', () => {
    const o = { a: { b: 29, c: 'stay' } };
    const r = deleteIn(o, ['a', 'b']);
    expect('b' in (r as any).a).toBe(false);
  });
  it('deleteIn test 030: nested deleteIn removes key i=30', () => {
    const o = { a: { b: 30, c: 'stay' } };
    const r = deleteIn(o, ['a', 'b']);
    expect('b' in (r as any).a).toBe(false);
  });
});

describe('merge / mergeDeep', () => {
  it('merge test 001: original a unchanged', () => {
    const a = { x: 1 };
    merge(a, { x: 10 });
    expect(a.x).toBe(1);
  });
  it('merge test 002: original a unchanged', () => {
    const a = { x: 2 };
    merge(a, { x: 20 });
    expect(a.x).toBe(2);
  });
  it('merge test 003: original a unchanged', () => {
    const a = { x: 3 };
    merge(a, { x: 30 });
    expect(a.x).toBe(3);
  });
  it('merge test 004: original a unchanged', () => {
    const a = { x: 4 };
    merge(a, { x: 40 });
    expect(a.x).toBe(4);
  });
  it('merge test 005: original a unchanged', () => {
    const a = { x: 5 };
    merge(a, { x: 50 });
    expect(a.x).toBe(5);
  });
  it('merge test 006: original a unchanged', () => {
    const a = { x: 6 };
    merge(a, { x: 60 });
    expect(a.x).toBe(6);
  });
  it('merge test 007: original a unchanged', () => {
    const a = { x: 7 };
    merge(a, { x: 70 });
    expect(a.x).toBe(7);
  });
  it('merge test 008: original a unchanged', () => {
    const a = { x: 8 };
    merge(a, { x: 80 });
    expect(a.x).toBe(8);
  });
  it('merge test 009: original a unchanged', () => {
    const a = { x: 9 };
    merge(a, { x: 90 });
    expect(a.x).toBe(9);
  });
  it('merge test 010: original a unchanged', () => {
    const a = { x: 10 };
    merge(a, { x: 100 });
    expect(a.x).toBe(10);
  });
  it('merge test 011: original a unchanged', () => {
    const a = { x: 11 };
    merge(a, { x: 110 });
    expect(a.x).toBe(11);
  });
  it('merge test 012: original a unchanged', () => {
    const a = { x: 12 };
    merge(a, { x: 120 });
    expect(a.x).toBe(12);
  });
  it('merge test 013: original a unchanged', () => {
    const a = { x: 13 };
    merge(a, { x: 130 });
    expect(a.x).toBe(13);
  });
  it('merge test 014: original a unchanged', () => {
    const a = { x: 14 };
    merge(a, { x: 140 });
    expect(a.x).toBe(14);
  });
  it('merge test 015: original a unchanged', () => {
    const a = { x: 15 };
    merge(a, { x: 150 });
    expect(a.x).toBe(15);
  });
  it('merge test 016: original a unchanged', () => {
    const a = { x: 16 };
    merge(a, { x: 160 });
    expect(a.x).toBe(16);
  });
  it('merge test 017: original a unchanged', () => {
    const a = { x: 17 };
    merge(a, { x: 170 });
    expect(a.x).toBe(17);
  });
  it('merge test 018: original a unchanged', () => {
    const a = { x: 18 };
    merge(a, { x: 180 });
    expect(a.x).toBe(18);
  });
  it('merge test 019: original a unchanged', () => {
    const a = { x: 19 };
    merge(a, { x: 190 });
    expect(a.x).toBe(19);
  });
  it('merge test 020: original a unchanged', () => {
    const a = { x: 20 };
    merge(a, { x: 200 });
    expect(a.x).toBe(20);
  });
  it('merge test 021: original a unchanged', () => {
    const a = { x: 21 };
    merge(a, { x: 210 });
    expect(a.x).toBe(21);
  });
  it('merge test 022: original a unchanged', () => {
    const a = { x: 22 };
    merge(a, { x: 220 });
    expect(a.x).toBe(22);
  });
  it('merge test 023: original a unchanged', () => {
    const a = { x: 23 };
    merge(a, { x: 230 });
    expect(a.x).toBe(23);
  });
  it('merge test 024: original a unchanged', () => {
    const a = { x: 24 };
    merge(a, { x: 240 });
    expect(a.x).toBe(24);
  });
  it('merge test 025: original a unchanged', () => {
    const a = { x: 25 };
    merge(a, { x: 250 });
    expect(a.x).toBe(25);
  });
  it('merge test 026: source overwrites key i=26', () => {
    const r = merge({ a: 1, b: 26 }, { b: 52 });
    expect(r.b).toBe(52);
  });
  it('merge test 027: source overwrites key i=27', () => {
    const r = merge({ a: 1, b: 27 }, { b: 54 });
    expect(r.b).toBe(54);
  });
  it('merge test 028: source overwrites key i=28', () => {
    const r = merge({ a: 1, b: 28 }, { b: 56 });
    expect(r.b).toBe(56);
  });
  it('merge test 029: source overwrites key i=29', () => {
    const r = merge({ a: 1, b: 29 }, { b: 58 });
    expect(r.b).toBe(58);
  });
  it('merge test 030: source overwrites key i=30', () => {
    const r = merge({ a: 1, b: 30 }, { b: 60 });
    expect(r.b).toBe(60);
  });
  it('merge test 031: source overwrites key i=31', () => {
    const r = merge({ a: 1, b: 31 }, { b: 62 });
    expect(r.b).toBe(62);
  });
  it('merge test 032: source overwrites key i=32', () => {
    const r = merge({ a: 1, b: 32 }, { b: 64 });
    expect(r.b).toBe(64);
  });
  it('merge test 033: source overwrites key i=33', () => {
    const r = merge({ a: 1, b: 33 }, { b: 66 });
    expect(r.b).toBe(66);
  });
  it('merge test 034: source overwrites key i=34', () => {
    const r = merge({ a: 1, b: 34 }, { b: 68 });
    expect(r.b).toBe(68);
  });
  it('merge test 035: source overwrites key i=35', () => {
    const r = merge({ a: 1, b: 35 }, { b: 70 });
    expect(r.b).toBe(70);
  });
  it('merge test 036: source overwrites key i=36', () => {
    const r = merge({ a: 1, b: 36 }, { b: 72 });
    expect(r.b).toBe(72);
  });
  it('merge test 037: source overwrites key i=37', () => {
    const r = merge({ a: 1, b: 37 }, { b: 74 });
    expect(r.b).toBe(74);
  });
  it('merge test 038: source overwrites key i=38', () => {
    const r = merge({ a: 1, b: 38 }, { b: 76 });
    expect(r.b).toBe(76);
  });
  it('merge test 039: source overwrites key i=39', () => {
    const r = merge({ a: 1, b: 39 }, { b: 78 });
    expect(r.b).toBe(78);
  });
  it('merge test 040: source overwrites key i=40', () => {
    const r = merge({ a: 1, b: 40 }, { b: 80 });
    expect(r.b).toBe(80);
  });
  it('merge test 041: source overwrites key i=41', () => {
    const r = merge({ a: 1, b: 41 }, { b: 82 });
    expect(r.b).toBe(82);
  });
  it('merge test 042: source overwrites key i=42', () => {
    const r = merge({ a: 1, b: 42 }, { b: 84 });
    expect(r.b).toBe(84);
  });
  it('merge test 043: source overwrites key i=43', () => {
    const r = merge({ a: 1, b: 43 }, { b: 86 });
    expect(r.b).toBe(86);
  });
  it('merge test 044: source overwrites key i=44', () => {
    const r = merge({ a: 1, b: 44 }, { b: 88 });
    expect(r.b).toBe(88);
  });
  it('merge test 045: source overwrites key i=45', () => {
    const r = merge({ a: 1, b: 45 }, { b: 90 });
    expect(r.b).toBe(90);
  });
  it('merge test 046: source overwrites key i=46', () => {
    const r = merge({ a: 1, b: 46 }, { b: 92 });
    expect(r.b).toBe(92);
  });
  it('merge test 047: source overwrites key i=47', () => {
    const r = merge({ a: 1, b: 47 }, { b: 94 });
    expect(r.b).toBe(94);
  });
  it('merge test 048: source overwrites key i=48', () => {
    const r = merge({ a: 1, b: 48 }, { b: 96 });
    expect(r.b).toBe(96);
  });
  it('merge test 049: source overwrites key i=49', () => {
    const r = merge({ a: 1, b: 49 }, { b: 98 });
    expect(r.b).toBe(98);
  });
  it('merge test 050: source overwrites key i=50', () => {
    const r = merge({ a: 1, b: 50 }, { b: 100 });
    expect(r.b).toBe(100);
  });
  it('mergeDeep test 001: original unchanged', () => {
    const a = { nested: { v: 1 } };
    mergeDeep(a, { nested: { v: 3 } });
    expect(a.nested.v).toBe(1);
  });
  it('mergeDeep test 002: original unchanged', () => {
    const a = { nested: { v: 2 } };
    mergeDeep(a, { nested: { v: 6 } });
    expect(a.nested.v).toBe(2);
  });
  it('mergeDeep test 003: original unchanged', () => {
    const a = { nested: { v: 3 } };
    mergeDeep(a, { nested: { v: 9 } });
    expect(a.nested.v).toBe(3);
  });
  it('mergeDeep test 004: original unchanged', () => {
    const a = { nested: { v: 4 } };
    mergeDeep(a, { nested: { v: 12 } });
    expect(a.nested.v).toBe(4);
  });
  it('mergeDeep test 005: original unchanged', () => {
    const a = { nested: { v: 5 } };
    mergeDeep(a, { nested: { v: 15 } });
    expect(a.nested.v).toBe(5);
  });
  it('mergeDeep test 006: original unchanged', () => {
    const a = { nested: { v: 6 } };
    mergeDeep(a, { nested: { v: 18 } });
    expect(a.nested.v).toBe(6);
  });
  it('mergeDeep test 007: original unchanged', () => {
    const a = { nested: { v: 7 } };
    mergeDeep(a, { nested: { v: 21 } });
    expect(a.nested.v).toBe(7);
  });
  it('mergeDeep test 008: original unchanged', () => {
    const a = { nested: { v: 8 } };
    mergeDeep(a, { nested: { v: 24 } });
    expect(a.nested.v).toBe(8);
  });
  it('mergeDeep test 009: original unchanged', () => {
    const a = { nested: { v: 9 } };
    mergeDeep(a, { nested: { v: 27 } });
    expect(a.nested.v).toBe(9);
  });
  it('mergeDeep test 010: original unchanged', () => {
    const a = { nested: { v: 10 } };
    mergeDeep(a, { nested: { v: 30 } });
    expect(a.nested.v).toBe(10);
  });
  it('mergeDeep test 011: original unchanged', () => {
    const a = { nested: { v: 11 } };
    mergeDeep(a, { nested: { v: 33 } });
    expect(a.nested.v).toBe(11);
  });
  it('mergeDeep test 012: original unchanged', () => {
    const a = { nested: { v: 12 } };
    mergeDeep(a, { nested: { v: 36 } });
    expect(a.nested.v).toBe(12);
  });
  it('mergeDeep test 013: original unchanged', () => {
    const a = { nested: { v: 13 } };
    mergeDeep(a, { nested: { v: 39 } });
    expect(a.nested.v).toBe(13);
  });
  it('mergeDeep test 014: original unchanged', () => {
    const a = { nested: { v: 14 } };
    mergeDeep(a, { nested: { v: 42 } });
    expect(a.nested.v).toBe(14);
  });
  it('mergeDeep test 015: original unchanged', () => {
    const a = { nested: { v: 15 } };
    mergeDeep(a, { nested: { v: 45 } });
    expect(a.nested.v).toBe(15);
  });
  it('mergeDeep test 016: original unchanged', () => {
    const a = { nested: { v: 16 } };
    mergeDeep(a, { nested: { v: 48 } });
    expect(a.nested.v).toBe(16);
  });
  it('mergeDeep test 017: original unchanged', () => {
    const a = { nested: { v: 17 } };
    mergeDeep(a, { nested: { v: 51 } });
    expect(a.nested.v).toBe(17);
  });
  it('mergeDeep test 018: original unchanged', () => {
    const a = { nested: { v: 18 } };
    mergeDeep(a, { nested: { v: 54 } });
    expect(a.nested.v).toBe(18);
  });
  it('mergeDeep test 019: original unchanged', () => {
    const a = { nested: { v: 19 } };
    mergeDeep(a, { nested: { v: 57 } });
    expect(a.nested.v).toBe(19);
  });
  it('mergeDeep test 020: original unchanged', () => {
    const a = { nested: { v: 20 } };
    mergeDeep(a, { nested: { v: 60 } });
    expect(a.nested.v).toBe(20);
  });
  it('mergeDeep test 021: original unchanged', () => {
    const a = { nested: { v: 21 } };
    mergeDeep(a, { nested: { v: 63 } });
    expect(a.nested.v).toBe(21);
  });
  it('mergeDeep test 022: original unchanged', () => {
    const a = { nested: { v: 22 } };
    mergeDeep(a, { nested: { v: 66 } });
    expect(a.nested.v).toBe(22);
  });
  it('mergeDeep test 023: original unchanged', () => {
    const a = { nested: { v: 23 } };
    mergeDeep(a, { nested: { v: 69 } });
    expect(a.nested.v).toBe(23);
  });
  it('mergeDeep test 024: original unchanged', () => {
    const a = { nested: { v: 24 } };
    mergeDeep(a, { nested: { v: 72 } });
    expect(a.nested.v).toBe(24);
  });
  it('mergeDeep test 025: original unchanged', () => {
    const a = { nested: { v: 25 } };
    mergeDeep(a, { nested: { v: 75 } });
    expect(a.nested.v).toBe(25);
  });
  it('mergeDeep test 026: deep key overwritten i=26', () => {
    const r = mergeDeep({ nested: { v: 26 } }, { nested: { v: 126 } });
    expect((r as any).nested.v).toBe(126);
  });
  it('mergeDeep test 027: deep key overwritten i=27', () => {
    const r = mergeDeep({ nested: { v: 27 } }, { nested: { v: 127 } });
    expect((r as any).nested.v).toBe(127);
  });
  it('mergeDeep test 028: deep key overwritten i=28', () => {
    const r = mergeDeep({ nested: { v: 28 } }, { nested: { v: 128 } });
    expect((r as any).nested.v).toBe(128);
  });
  it('mergeDeep test 029: deep key overwritten i=29', () => {
    const r = mergeDeep({ nested: { v: 29 } }, { nested: { v: 129 } });
    expect((r as any).nested.v).toBe(129);
  });
  it('mergeDeep test 030: deep key overwritten i=30', () => {
    const r = mergeDeep({ nested: { v: 30 } }, { nested: { v: 130 } });
    expect((r as any).nested.v).toBe(130);
  });
  it('mergeDeep test 031: deep key overwritten i=31', () => {
    const r = mergeDeep({ nested: { v: 31 } }, { nested: { v: 131 } });
    expect((r as any).nested.v).toBe(131);
  });
  it('mergeDeep test 032: deep key overwritten i=32', () => {
    const r = mergeDeep({ nested: { v: 32 } }, { nested: { v: 132 } });
    expect((r as any).nested.v).toBe(132);
  });
  it('mergeDeep test 033: deep key overwritten i=33', () => {
    const r = mergeDeep({ nested: { v: 33 } }, { nested: { v: 133 } });
    expect((r as any).nested.v).toBe(133);
  });
  it('mergeDeep test 034: deep key overwritten i=34', () => {
    const r = mergeDeep({ nested: { v: 34 } }, { nested: { v: 134 } });
    expect((r as any).nested.v).toBe(134);
  });
  it('mergeDeep test 035: deep key overwritten i=35', () => {
    const r = mergeDeep({ nested: { v: 35 } }, { nested: { v: 135 } });
    expect((r as any).nested.v).toBe(135);
  });
  it('mergeDeep test 036: deep key overwritten i=36', () => {
    const r = mergeDeep({ nested: { v: 36 } }, { nested: { v: 136 } });
    expect((r as any).nested.v).toBe(136);
  });
  it('mergeDeep test 037: deep key overwritten i=37', () => {
    const r = mergeDeep({ nested: { v: 37 } }, { nested: { v: 137 } });
    expect((r as any).nested.v).toBe(137);
  });
  it('mergeDeep test 038: deep key overwritten i=38', () => {
    const r = mergeDeep({ nested: { v: 38 } }, { nested: { v: 138 } });
    expect((r as any).nested.v).toBe(138);
  });
  it('mergeDeep test 039: deep key overwritten i=39', () => {
    const r = mergeDeep({ nested: { v: 39 } }, { nested: { v: 139 } });
    expect((r as any).nested.v).toBe(139);
  });
  it('mergeDeep test 040: deep key overwritten i=40', () => {
    const r = mergeDeep({ nested: { v: 40 } }, { nested: { v: 140 } });
    expect((r as any).nested.v).toBe(140);
  });
  it('mergeDeep test 041: deep key overwritten i=41', () => {
    const r = mergeDeep({ nested: { v: 41 } }, { nested: { v: 141 } });
    expect((r as any).nested.v).toBe(141);
  });
  it('mergeDeep test 042: deep key overwritten i=42', () => {
    const r = mergeDeep({ nested: { v: 42 } }, { nested: { v: 142 } });
    expect((r as any).nested.v).toBe(142);
  });
  it('mergeDeep test 043: deep key overwritten i=43', () => {
    const r = mergeDeep({ nested: { v: 43 } }, { nested: { v: 143 } });
    expect((r as any).nested.v).toBe(143);
  });
  it('mergeDeep test 044: deep key overwritten i=44', () => {
    const r = mergeDeep({ nested: { v: 44 } }, { nested: { v: 144 } });
    expect((r as any).nested.v).toBe(144);
  });
  it('mergeDeep test 045: deep key overwritten i=45', () => {
    const r = mergeDeep({ nested: { v: 45 } }, { nested: { v: 145 } });
    expect((r as any).nested.v).toBe(145);
  });
  it('mergeDeep test 046: deep key overwritten i=46', () => {
    const r = mergeDeep({ nested: { v: 46 } }, { nested: { v: 146 } });
    expect((r as any).nested.v).toBe(146);
  });
  it('mergeDeep test 047: deep key overwritten i=47', () => {
    const r = mergeDeep({ nested: { v: 47 } }, { nested: { v: 147 } });
    expect((r as any).nested.v).toBe(147);
  });
  it('mergeDeep test 048: deep key overwritten i=48', () => {
    const r = mergeDeep({ nested: { v: 48 } }, { nested: { v: 148 } });
    expect((r as any).nested.v).toBe(148);
  });
  it('mergeDeep test 049: deep key overwritten i=49', () => {
    const r = mergeDeep({ nested: { v: 49 } }, { nested: { v: 149 } });
    expect((r as any).nested.v).toBe(149);
  });
  it('mergeDeep test 050: deep key overwritten i=50', () => {
    const r = mergeDeep({ nested: { v: 50 } }, { nested: { v: 150 } });
    expect((r as any).nested.v).toBe(150);
  });
});

describe('pick / omit', () => {
  it('pick test 001: included key present in result', () => {
    const o = { a: 1, b: 2, c: 3 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(1);
  });
  it('pick test 002: included key present in result', () => {
    const o = { a: 2, b: 3, c: 4 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(2);
  });
  it('pick test 003: included key present in result', () => {
    const o = { a: 3, b: 4, c: 5 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(3);
  });
  it('pick test 004: included key present in result', () => {
    const o = { a: 4, b: 5, c: 6 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(4);
  });
  it('pick test 005: included key present in result', () => {
    const o = { a: 5, b: 6, c: 7 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(5);
  });
  it('pick test 006: included key present in result', () => {
    const o = { a: 6, b: 7, c: 8 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(6);
  });
  it('pick test 007: included key present in result', () => {
    const o = { a: 7, b: 8, c: 9 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(7);
  });
  it('pick test 008: included key present in result', () => {
    const o = { a: 8, b: 9, c: 10 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(8);
  });
  it('pick test 009: included key present in result', () => {
    const o = { a: 9, b: 10, c: 11 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(9);
  });
  it('pick test 010: included key present in result', () => {
    const o = { a: 10, b: 11, c: 12 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(10);
  });
  it('pick test 011: included key present in result', () => {
    const o = { a: 11, b: 12, c: 13 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(11);
  });
  it('pick test 012: included key present in result', () => {
    const o = { a: 12, b: 13, c: 14 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(12);
  });
  it('pick test 013: included key present in result', () => {
    const o = { a: 13, b: 14, c: 15 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(13);
  });
  it('pick test 014: included key present in result', () => {
    const o = { a: 14, b: 15, c: 16 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(14);
  });
  it('pick test 015: included key present in result', () => {
    const o = { a: 15, b: 16, c: 17 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(15);
  });
  it('pick test 016: included key present in result', () => {
    const o = { a: 16, b: 17, c: 18 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(16);
  });
  it('pick test 017: included key present in result', () => {
    const o = { a: 17, b: 18, c: 19 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(17);
  });
  it('pick test 018: included key present in result', () => {
    const o = { a: 18, b: 19, c: 20 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(18);
  });
  it('pick test 019: included key present in result', () => {
    const o = { a: 19, b: 20, c: 21 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(19);
  });
  it('pick test 020: included key present in result', () => {
    const o = { a: 20, b: 21, c: 22 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(20);
  });
  it('pick test 021: included key present in result', () => {
    const o = { a: 21, b: 22, c: 23 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(21);
  });
  it('pick test 022: included key present in result', () => {
    const o = { a: 22, b: 23, c: 24 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(22);
  });
  it('pick test 023: included key present in result', () => {
    const o = { a: 23, b: 24, c: 25 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(23);
  });
  it('pick test 024: included key present in result', () => {
    const o = { a: 24, b: 25, c: 26 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(24);
  });
  it('pick test 025: included key present in result', () => {
    const o = { a: 25, b: 26, c: 27 };
    const r = pick(o, ['a', 'b']);
    expect(r.a).toBe(25);
  });
  it('pick test 026: excluded key absent from result i=26', () => {
    const o = { a: 26, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 027: excluded key absent from result i=27', () => {
    const o = { a: 27, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 028: excluded key absent from result i=28', () => {
    const o = { a: 28, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 029: excluded key absent from result i=29', () => {
    const o = { a: 29, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 030: excluded key absent from result i=30', () => {
    const o = { a: 30, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 031: excluded key absent from result i=31', () => {
    const o = { a: 31, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 032: excluded key absent from result i=32', () => {
    const o = { a: 32, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 033: excluded key absent from result i=33', () => {
    const o = { a: 33, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 034: excluded key absent from result i=34', () => {
    const o = { a: 34, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 035: excluded key absent from result i=35', () => {
    const o = { a: 35, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 036: excluded key absent from result i=36', () => {
    const o = { a: 36, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 037: excluded key absent from result i=37', () => {
    const o = { a: 37, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 038: excluded key absent from result i=38', () => {
    const o = { a: 38, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 039: excluded key absent from result i=39', () => {
    const o = { a: 39, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 040: excluded key absent from result i=40', () => {
    const o = { a: 40, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 041: excluded key absent from result i=41', () => {
    const o = { a: 41, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 042: excluded key absent from result i=42', () => {
    const o = { a: 42, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 043: excluded key absent from result i=43', () => {
    const o = { a: 43, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 044: excluded key absent from result i=44', () => {
    const o = { a: 44, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 045: excluded key absent from result i=45', () => {
    const o = { a: 45, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 046: excluded key absent from result i=46', () => {
    const o = { a: 46, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 047: excluded key absent from result i=47', () => {
    const o = { a: 47, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 048: excluded key absent from result i=48', () => {
    const o = { a: 48, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 049: excluded key absent from result i=49', () => {
    const o = { a: 49, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('pick test 050: excluded key absent from result i=50', () => {
    const o = { a: 50, b: 'drop', c: 'keep' };
    const r = pick(o, ['a', 'c']);
    expect('b' in r).toBe(false);
  });
  it('omit test 001: omitted key absent from result', () => {
    const o = { a: 1, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 002: omitted key absent from result', () => {
    const o = { a: 2, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 003: omitted key absent from result', () => {
    const o = { a: 3, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 004: omitted key absent from result', () => {
    const o = { a: 4, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 005: omitted key absent from result', () => {
    const o = { a: 5, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 006: omitted key absent from result', () => {
    const o = { a: 6, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 007: omitted key absent from result', () => {
    const o = { a: 7, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 008: omitted key absent from result', () => {
    const o = { a: 8, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 009: omitted key absent from result', () => {
    const o = { a: 9, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 010: omitted key absent from result', () => {
    const o = { a: 10, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 011: omitted key absent from result', () => {
    const o = { a: 11, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 012: omitted key absent from result', () => {
    const o = { a: 12, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 013: omitted key absent from result', () => {
    const o = { a: 13, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 014: omitted key absent from result', () => {
    const o = { a: 14, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 015: omitted key absent from result', () => {
    const o = { a: 15, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 016: omitted key absent from result', () => {
    const o = { a: 16, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 017: omitted key absent from result', () => {
    const o = { a: 17, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 018: omitted key absent from result', () => {
    const o = { a: 18, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 019: omitted key absent from result', () => {
    const o = { a: 19, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 020: omitted key absent from result', () => {
    const o = { a: 20, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 021: omitted key absent from result', () => {
    const o = { a: 21, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 022: omitted key absent from result', () => {
    const o = { a: 22, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 023: omitted key absent from result', () => {
    const o = { a: 23, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 024: omitted key absent from result', () => {
    const o = { a: 24, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 025: omitted key absent from result', () => {
    const o = { a: 25, b: 'drop' };
    const r = omit(o, ['b']);
    expect('b' in r).toBe(false);
  });
  it('omit test 026: kept key present in result i=26', () => {
    const o = { a: 26, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(26);
  });
  it('omit test 027: kept key present in result i=27', () => {
    const o = { a: 27, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(27);
  });
  it('omit test 028: kept key present in result i=28', () => {
    const o = { a: 28, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(28);
  });
  it('omit test 029: kept key present in result i=29', () => {
    const o = { a: 29, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(29);
  });
  it('omit test 030: kept key present in result i=30', () => {
    const o = { a: 30, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(30);
  });
  it('omit test 031: kept key present in result i=31', () => {
    const o = { a: 31, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(31);
  });
  it('omit test 032: kept key present in result i=32', () => {
    const o = { a: 32, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(32);
  });
  it('omit test 033: kept key present in result i=33', () => {
    const o = { a: 33, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(33);
  });
  it('omit test 034: kept key present in result i=34', () => {
    const o = { a: 34, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(34);
  });
  it('omit test 035: kept key present in result i=35', () => {
    const o = { a: 35, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(35);
  });
  it('omit test 036: kept key present in result i=36', () => {
    const o = { a: 36, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(36);
  });
  it('omit test 037: kept key present in result i=37', () => {
    const o = { a: 37, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(37);
  });
  it('omit test 038: kept key present in result i=38', () => {
    const o = { a: 38, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(38);
  });
  it('omit test 039: kept key present in result i=39', () => {
    const o = { a: 39, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(39);
  });
  it('omit test 040: kept key present in result i=40', () => {
    const o = { a: 40, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(40);
  });
  it('omit test 041: kept key present in result i=41', () => {
    const o = { a: 41, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(41);
  });
  it('omit test 042: kept key present in result i=42', () => {
    const o = { a: 42, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(42);
  });
  it('omit test 043: kept key present in result i=43', () => {
    const o = { a: 43, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(43);
  });
  it('omit test 044: kept key present in result i=44', () => {
    const o = { a: 44, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(44);
  });
  it('omit test 045: kept key present in result i=45', () => {
    const o = { a: 45, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(45);
  });
  it('omit test 046: kept key present in result i=46', () => {
    const o = { a: 46, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(46);
  });
  it('omit test 047: kept key present in result i=47', () => {
    const o = { a: 47, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(47);
  });
  it('omit test 048: kept key present in result i=48', () => {
    const o = { a: 48, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(48);
  });
  it('omit test 049: kept key present in result i=49', () => {
    const o = { a: 49, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(49);
  });
  it('omit test 050: kept key present in result i=50', () => {
    const o = { a: 50, b: 'drop' };
    const r = omit(o, ['b']);
    expect(r.a).toBe(50);
  });
});

describe('push / pop / shift / unshift', () => {
  it('push test 001: original unchanged', () => {
    const a = [1, 2, 1];
    push(a, 99);
    expect(a.length).toBe(3);
  });
  it('push test 002: original unchanged', () => {
    const a = [1, 2, 2];
    push(a, 99);
    expect(a.length).toBe(3);
  });
  it('push test 003: original unchanged', () => {
    const a = [1, 2, 3];
    push(a, 99);
    expect(a.length).toBe(3);
  });
  it('push test 004: original unchanged', () => {
    const a = [1, 2, 4];
    push(a, 99);
    expect(a.length).toBe(3);
  });
  it('push test 005: original unchanged', () => {
    const a = [1, 2, 5];
    push(a, 99);
    expect(a.length).toBe(3);
  });
  it('push test 006: original unchanged', () => {
    const a = [1, 2, 6];
    push(a, 99);
    expect(a.length).toBe(3);
  });
  it('push test 007: original unchanged', () => {
    const a = [1, 2, 7];
    push(a, 99);
    expect(a.length).toBe(3);
  });
  it('push test 008: original unchanged', () => {
    const a = [1, 2, 8];
    push(a, 99);
    expect(a.length).toBe(3);
  });
  it('push test 009: original unchanged', () => {
    const a = [1, 2, 9];
    push(a, 99);
    expect(a.length).toBe(3);
  });
  it('push test 010: original unchanged', () => {
    const a = [1, 2, 10];
    push(a, 99);
    expect(a.length).toBe(3);
  });
  it('push test 011: original unchanged', () => {
    const a = [1, 2, 11];
    push(a, 99);
    expect(a.length).toBe(3);
  });
  it('push test 012: original unchanged', () => {
    const a = [1, 2, 12];
    push(a, 99);
    expect(a.length).toBe(3);
  });
  it('push test 013: original unchanged', () => {
    const a = [1, 2, 13];
    push(a, 99);
    expect(a.length).toBe(3);
  });
  it('push test 014: original unchanged', () => {
    const a = [1, 2, 14];
    push(a, 99);
    expect(a.length).toBe(3);
  });
  it('push test 015: original unchanged', () => {
    const a = [1, 2, 15];
    push(a, 99);
    expect(a.length).toBe(3);
  });
  it('push test 016: new array has appended item i=16', () => {
    const r = push([16], 17);
    expect(r[r.length-1]).toBe(17);
  });
  it('push test 017: new array has appended item i=17', () => {
    const r = push([17], 18);
    expect(r[r.length-1]).toBe(18);
  });
  it('push test 018: new array has appended item i=18', () => {
    const r = push([18], 19);
    expect(r[r.length-1]).toBe(19);
  });
  it('push test 019: new array has appended item i=19', () => {
    const r = push([19], 20);
    expect(r[r.length-1]).toBe(20);
  });
  it('push test 020: new array has appended item i=20', () => {
    const r = push([20], 21);
    expect(r[r.length-1]).toBe(21);
  });
  it('push test 021: new array has appended item i=21', () => {
    const r = push([21], 22);
    expect(r[r.length-1]).toBe(22);
  });
  it('push test 022: new array has appended item i=22', () => {
    const r = push([22], 23);
    expect(r[r.length-1]).toBe(23);
  });
  it('push test 023: new array has appended item i=23', () => {
    const r = push([23], 24);
    expect(r[r.length-1]).toBe(24);
  });
  it('push test 024: new array has appended item i=24', () => {
    const r = push([24], 25);
    expect(r[r.length-1]).toBe(25);
  });
  it('push test 025: new array has appended item i=25', () => {
    const r = push([25], 26);
    expect(r[r.length-1]).toBe(26);
  });
  it('push test 026: new array has appended item i=26', () => {
    const r = push([26], 27);
    expect(r[r.length-1]).toBe(27);
  });
  it('push test 027: new array has appended item i=27', () => {
    const r = push([27], 28);
    expect(r[r.length-1]).toBe(28);
  });
  it('push test 028: new array has appended item i=28', () => {
    const r = push([28], 29);
    expect(r[r.length-1]).toBe(29);
  });
  it('push test 029: new array has appended item i=29', () => {
    const r = push([29], 30);
    expect(r[r.length-1]).toBe(30);
  });
  it('push test 030: new array has appended item i=30', () => {
    const r = push([30], 31);
    expect(r[r.length-1]).toBe(31);
  });
  it('pop test 001: original unchanged', () => {
    const a = [1, 2, 1];
    pop(a);
    expect(a.length).toBe(3);
  });
  it('pop test 002: original unchanged', () => {
    const a = [1, 2, 2];
    pop(a);
    expect(a.length).toBe(3);
  });
  it('pop test 003: original unchanged', () => {
    const a = [1, 2, 3];
    pop(a);
    expect(a.length).toBe(3);
  });
  it('pop test 004: original unchanged', () => {
    const a = [1, 2, 4];
    pop(a);
    expect(a.length).toBe(3);
  });
  it('pop test 005: original unchanged', () => {
    const a = [1, 2, 5];
    pop(a);
    expect(a.length).toBe(3);
  });
  it('pop test 006: original unchanged', () => {
    const a = [1, 2, 6];
    pop(a);
    expect(a.length).toBe(3);
  });
  it('pop test 007: original unchanged', () => {
    const a = [1, 2, 7];
    pop(a);
    expect(a.length).toBe(3);
  });
  it('pop test 008: original unchanged', () => {
    const a = [1, 2, 8];
    pop(a);
    expect(a.length).toBe(3);
  });
  it('pop test 009: original unchanged', () => {
    const a = [1, 2, 9];
    pop(a);
    expect(a.length).toBe(3);
  });
  it('pop test 010: original unchanged', () => {
    const a = [1, 2, 10];
    pop(a);
    expect(a.length).toBe(3);
  });
  it('pop test 011: result is shorter by 1 i=11', () => {
    const a = Array.from({length: 12}, (_, k) => k);
    expect(pop(a).length).toBe(11);
  });
  it('pop test 012: result is shorter by 1 i=12', () => {
    const a = Array.from({length: 13}, (_, k) => k);
    expect(pop(a).length).toBe(12);
  });
  it('pop test 013: result is shorter by 1 i=13', () => {
    const a = Array.from({length: 14}, (_, k) => k);
    expect(pop(a).length).toBe(13);
  });
  it('pop test 014: result is shorter by 1 i=14', () => {
    const a = Array.from({length: 15}, (_, k) => k);
    expect(pop(a).length).toBe(14);
  });
  it('pop test 015: result is shorter by 1 i=15', () => {
    const a = Array.from({length: 16}, (_, k) => k);
    expect(pop(a).length).toBe(15);
  });
  it('pop test 016: result is shorter by 1 i=16', () => {
    const a = Array.from({length: 17}, (_, k) => k);
    expect(pop(a).length).toBe(16);
  });
  it('pop test 017: result is shorter by 1 i=17', () => {
    const a = Array.from({length: 18}, (_, k) => k);
    expect(pop(a).length).toBe(17);
  });
  it('pop test 018: result is shorter by 1 i=18', () => {
    const a = Array.from({length: 19}, (_, k) => k);
    expect(pop(a).length).toBe(18);
  });
  it('pop test 019: result is shorter by 1 i=19', () => {
    const a = Array.from({length: 20}, (_, k) => k);
    expect(pop(a).length).toBe(19);
  });
  it('pop test 020: result is shorter by 1 i=20', () => {
    const a = Array.from({length: 21}, (_, k) => k);
    expect(pop(a).length).toBe(20);
  });
  it('shift test 001: original unchanged', () => {
    const a = [10, 20, 1];
    shift(a);
    expect(a[0]).toBe(10);
  });
  it('shift test 002: original unchanged', () => {
    const a = [10, 20, 2];
    shift(a);
    expect(a[0]).toBe(10);
  });
  it('shift test 003: original unchanged', () => {
    const a = [10, 20, 3];
    shift(a);
    expect(a[0]).toBe(10);
  });
  it('shift test 004: original unchanged', () => {
    const a = [10, 20, 4];
    shift(a);
    expect(a[0]).toBe(10);
  });
  it('shift test 005: original unchanged', () => {
    const a = [10, 20, 5];
    shift(a);
    expect(a[0]).toBe(10);
  });
  it('shift test 006: original unchanged', () => {
    const a = [10, 20, 6];
    shift(a);
    expect(a[0]).toBe(10);
  });
  it('shift test 007: original unchanged', () => {
    const a = [10, 20, 7];
    shift(a);
    expect(a[0]).toBe(10);
  });
  it('shift test 008: original unchanged', () => {
    const a = [10, 20, 8];
    shift(a);
    expect(a[0]).toBe(10);
  });
  it('shift test 009: original unchanged', () => {
    const a = [10, 20, 9];
    shift(a);
    expect(a[0]).toBe(10);
  });
  it('shift test 010: original unchanged', () => {
    const a = [10, 20, 10];
    shift(a);
    expect(a[0]).toBe(10);
  });
  it('shift test 011: original unchanged', () => {
    const a = [10, 20, 11];
    shift(a);
    expect(a[0]).toBe(10);
  });
  it('shift test 012: original unchanged', () => {
    const a = [10, 20, 12];
    shift(a);
    expect(a[0]).toBe(10);
  });
  it('shift test 013: first element removed i=13', () => {
    const a = [13, 14, 15];
    expect(shift(a)[0]).toBe(14);
  });
  it('shift test 014: first element removed i=14', () => {
    const a = [14, 15, 16];
    expect(shift(a)[0]).toBe(15);
  });
  it('shift test 015: first element removed i=15', () => {
    const a = [15, 16, 17];
    expect(shift(a)[0]).toBe(16);
  });
  it('shift test 016: first element removed i=16', () => {
    const a = [16, 17, 18];
    expect(shift(a)[0]).toBe(17);
  });
  it('shift test 017: first element removed i=17', () => {
    const a = [17, 18, 19];
    expect(shift(a)[0]).toBe(18);
  });
  it('shift test 018: first element removed i=18', () => {
    const a = [18, 19, 20];
    expect(shift(a)[0]).toBe(19);
  });
  it('shift test 019: first element removed i=19', () => {
    const a = [19, 20, 21];
    expect(shift(a)[0]).toBe(20);
  });
  it('shift test 020: first element removed i=20', () => {
    const a = [20, 21, 22];
    expect(shift(a)[0]).toBe(21);
  });
  it('shift test 021: first element removed i=21', () => {
    const a = [21, 22, 23];
    expect(shift(a)[0]).toBe(22);
  });
  it('shift test 022: first element removed i=22', () => {
    const a = [22, 23, 24];
    expect(shift(a)[0]).toBe(23);
  });
  it('shift test 023: first element removed i=23', () => {
    const a = [23, 24, 25];
    expect(shift(a)[0]).toBe(24);
  });
  it('shift test 024: first element removed i=24', () => {
    const a = [24, 25, 26];
    expect(shift(a)[0]).toBe(25);
  });
  it('shift test 025: first element removed i=25', () => {
    const a = [25, 26, 27];
    expect(shift(a)[0]).toBe(26);
  });
  it('unshift test 001: original unchanged', () => {
    const a = [1, 2, 1];
    unshift(a, 0);
    expect(a[0]).toBe(1);
  });
  it('unshift test 002: original unchanged', () => {
    const a = [1, 2, 2];
    unshift(a, 0);
    expect(a[0]).toBe(1);
  });
  it('unshift test 003: original unchanged', () => {
    const a = [1, 2, 3];
    unshift(a, 0);
    expect(a[0]).toBe(1);
  });
  it('unshift test 004: original unchanged', () => {
    const a = [1, 2, 4];
    unshift(a, 0);
    expect(a[0]).toBe(1);
  });
  it('unshift test 005: original unchanged', () => {
    const a = [1, 2, 5];
    unshift(a, 0);
    expect(a[0]).toBe(1);
  });
  it('unshift test 006: original unchanged', () => {
    const a = [1, 2, 6];
    unshift(a, 0);
    expect(a[0]).toBe(1);
  });
  it('unshift test 007: original unchanged', () => {
    const a = [1, 2, 7];
    unshift(a, 0);
    expect(a[0]).toBe(1);
  });
  it('unshift test 008: original unchanged', () => {
    const a = [1, 2, 8];
    unshift(a, 0);
    expect(a[0]).toBe(1);
  });
  it('unshift test 009: original unchanged', () => {
    const a = [1, 2, 9];
    unshift(a, 0);
    expect(a[0]).toBe(1);
  });
  it('unshift test 010: original unchanged', () => {
    const a = [1, 2, 10];
    unshift(a, 0);
    expect(a[0]).toBe(1);
  });
  it('unshift test 011: original unchanged', () => {
    const a = [1, 2, 11];
    unshift(a, 0);
    expect(a[0]).toBe(1);
  });
  it('unshift test 012: original unchanged', () => {
    const a = [1, 2, 12];
    unshift(a, 0);
    expect(a[0]).toBe(1);
  });
  it('unshift test 013: item prepended i=13', () => {
    const r = unshift([13], 12);
    expect(r[0]).toBe(12);
  });
  it('unshift test 014: item prepended i=14', () => {
    const r = unshift([14], 13);
    expect(r[0]).toBe(13);
  });
  it('unshift test 015: item prepended i=15', () => {
    const r = unshift([15], 14);
    expect(r[0]).toBe(14);
  });
  it('unshift test 016: item prepended i=16', () => {
    const r = unshift([16], 15);
    expect(r[0]).toBe(15);
  });
  it('unshift test 017: item prepended i=17', () => {
    const r = unshift([17], 16);
    expect(r[0]).toBe(16);
  });
  it('unshift test 018: item prepended i=18', () => {
    const r = unshift([18], 17);
    expect(r[0]).toBe(17);
  });
  it('unshift test 019: item prepended i=19', () => {
    const r = unshift([19], 18);
    expect(r[0]).toBe(18);
  });
  it('unshift test 020: item prepended i=20', () => {
    const r = unshift([20], 19);
    expect(r[0]).toBe(19);
  });
  it('unshift test 021: item prepended i=21', () => {
    const r = unshift([21], 20);
    expect(r[0]).toBe(20);
  });
  it('unshift test 022: item prepended i=22', () => {
    const r = unshift([22], 21);
    expect(r[0]).toBe(21);
  });
  it('unshift test 023: item prepended i=23', () => {
    const r = unshift([23], 22);
    expect(r[0]).toBe(22);
  });
  it('unshift test 024: item prepended i=24', () => {
    const r = unshift([24], 23);
    expect(r[0]).toBe(23);
  });
  it('unshift test 025: item prepended i=25', () => {
    const r = unshift([25], 24);
    expect(r[0]).toBe(24);
  });
});

describe('splice / insertAt / removeAt / updateAt / setAt', () => {
  it('splice test 001: original unchanged', () => {
    const a = [1, 2, 3, 1];
    splice(a, 1, 1);
    expect(a.length).toBe(4);
  });
  it('splice test 002: original unchanged', () => {
    const a = [1, 2, 3, 2];
    splice(a, 1, 1);
    expect(a.length).toBe(4);
  });
  it('splice test 003: original unchanged', () => {
    const a = [1, 2, 3, 3];
    splice(a, 1, 1);
    expect(a.length).toBe(4);
  });
  it('splice test 004: original unchanged', () => {
    const a = [1, 2, 3, 4];
    splice(a, 1, 1);
    expect(a.length).toBe(4);
  });
  it('splice test 005: original unchanged', () => {
    const a = [1, 2, 3, 5];
    splice(a, 1, 1);
    expect(a.length).toBe(4);
  });
  it('splice test 006: original unchanged', () => {
    const a = [1, 2, 3, 6];
    splice(a, 1, 1);
    expect(a.length).toBe(4);
  });
  it('splice test 007: original unchanged', () => {
    const a = [1, 2, 3, 7];
    splice(a, 1, 1);
    expect(a.length).toBe(4);
  });
  it('splice test 008: original unchanged', () => {
    const a = [1, 2, 3, 8];
    splice(a, 1, 1);
    expect(a.length).toBe(4);
  });
  it('splice test 009: original unchanged', () => {
    const a = [1, 2, 3, 9];
    splice(a, 1, 1);
    expect(a.length).toBe(4);
  });
  it('splice test 010: original unchanged', () => {
    const a = [1, 2, 3, 10];
    splice(a, 1, 1);
    expect(a.length).toBe(4);
  });
  it('splice test 011: original unchanged', () => {
    const a = [1, 2, 3, 11];
    splice(a, 1, 1);
    expect(a.length).toBe(4);
  });
  it('splice test 012: original unchanged', () => {
    const a = [1, 2, 3, 12];
    splice(a, 1, 1);
    expect(a.length).toBe(4);
  });
  it('splice test 013: original unchanged', () => {
    const a = [1, 2, 3, 13];
    splice(a, 1, 1);
    expect(a.length).toBe(4);
  });
  it('splice test 014: original unchanged', () => {
    const a = [1, 2, 3, 14];
    splice(a, 1, 1);
    expect(a.length).toBe(4);
  });
  it('splice test 015: original unchanged', () => {
    const a = [1, 2, 3, 15];
    splice(a, 1, 1);
    expect(a.length).toBe(4);
  });
  it('splice test 016: element removed correctly i=16', () => {
    const a = [10, 16, 30];
    const r = splice(a, 1, 1);
    expect(r).toEqual([10, 30]);
  });
  it('splice test 017: element removed correctly i=17', () => {
    const a = [10, 17, 30];
    const r = splice(a, 1, 1);
    expect(r).toEqual([10, 30]);
  });
  it('splice test 018: element removed correctly i=18', () => {
    const a = [10, 18, 30];
    const r = splice(a, 1, 1);
    expect(r).toEqual([10, 30]);
  });
  it('splice test 019: element removed correctly i=19', () => {
    const a = [10, 19, 30];
    const r = splice(a, 1, 1);
    expect(r).toEqual([10, 30]);
  });
  it('splice test 020: element removed correctly i=20', () => {
    const a = [10, 20, 30];
    const r = splice(a, 1, 1);
    expect(r).toEqual([10, 30]);
  });
  it('splice test 021: element removed correctly i=21', () => {
    const a = [10, 21, 30];
    const r = splice(a, 1, 1);
    expect(r).toEqual([10, 30]);
  });
  it('splice test 022: element removed correctly i=22', () => {
    const a = [10, 22, 30];
    const r = splice(a, 1, 1);
    expect(r).toEqual([10, 30]);
  });
  it('splice test 023: element removed correctly i=23', () => {
    const a = [10, 23, 30];
    const r = splice(a, 1, 1);
    expect(r).toEqual([10, 30]);
  });
  it('splice test 024: element removed correctly i=24', () => {
    const a = [10, 24, 30];
    const r = splice(a, 1, 1);
    expect(r).toEqual([10, 30]);
  });
  it('splice test 025: element removed correctly i=25', () => {
    const a = [10, 25, 30];
    const r = splice(a, 1, 1);
    expect(r).toEqual([10, 30]);
  });
  it('splice test 026: element removed correctly i=26', () => {
    const a = [10, 26, 30];
    const r = splice(a, 1, 1);
    expect(r).toEqual([10, 30]);
  });
  it('splice test 027: element removed correctly i=27', () => {
    const a = [10, 27, 30];
    const r = splice(a, 1, 1);
    expect(r).toEqual([10, 30]);
  });
  it('splice test 028: element removed correctly i=28', () => {
    const a = [10, 28, 30];
    const r = splice(a, 1, 1);
    expect(r).toEqual([10, 30]);
  });
  it('splice test 029: element removed correctly i=29', () => {
    const a = [10, 29, 30];
    const r = splice(a, 1, 1);
    expect(r).toEqual([10, 30]);
  });
  it('splice test 030: element removed correctly i=30', () => {
    const a = [10, 30, 30];
    const r = splice(a, 1, 1);
    expect(r).toEqual([10, 30]);
  });
  it('insertAt test 001: original unchanged', () => {
    const a = [1, 2, 3];
    insertAt(a, 1, 1);
    expect(a.length).toBe(3);
  });
  it('insertAt test 002: original unchanged', () => {
    const a = [1, 2, 3];
    insertAt(a, 1, 2);
    expect(a.length).toBe(3);
  });
  it('insertAt test 003: original unchanged', () => {
    const a = [1, 2, 3];
    insertAt(a, 1, 3);
    expect(a.length).toBe(3);
  });
  it('insertAt test 004: original unchanged', () => {
    const a = [1, 2, 3];
    insertAt(a, 1, 4);
    expect(a.length).toBe(3);
  });
  it('insertAt test 005: original unchanged', () => {
    const a = [1, 2, 3];
    insertAt(a, 1, 5);
    expect(a.length).toBe(3);
  });
  it('insertAt test 006: original unchanged', () => {
    const a = [1, 2, 3];
    insertAt(a, 1, 6);
    expect(a.length).toBe(3);
  });
  it('insertAt test 007: original unchanged', () => {
    const a = [1, 2, 3];
    insertAt(a, 1, 7);
    expect(a.length).toBe(3);
  });
  it('insertAt test 008: original unchanged', () => {
    const a = [1, 2, 3];
    insertAt(a, 1, 8);
    expect(a.length).toBe(3);
  });
  it('insertAt test 009: original unchanged', () => {
    const a = [1, 2, 3];
    insertAt(a, 1, 9);
    expect(a.length).toBe(3);
  });
  it('insertAt test 010: original unchanged', () => {
    const a = [1, 2, 3];
    insertAt(a, 1, 10);
    expect(a.length).toBe(3);
  });
  it('insertAt test 011: original unchanged', () => {
    const a = [1, 2, 3];
    insertAt(a, 1, 11);
    expect(a.length).toBe(3);
  });
  it('insertAt test 012: original unchanged', () => {
    const a = [1, 2, 3];
    insertAt(a, 1, 12);
    expect(a.length).toBe(3);
  });
  it('insertAt test 013: original unchanged', () => {
    const a = [1, 2, 3];
    insertAt(a, 1, 13);
    expect(a.length).toBe(3);
  });
  it('insertAt test 014: original unchanged', () => {
    const a = [1, 2, 3];
    insertAt(a, 1, 14);
    expect(a.length).toBe(3);
  });
  it('insertAt test 015: original unchanged', () => {
    const a = [1, 2, 3];
    insertAt(a, 1, 15);
    expect(a.length).toBe(3);
  });
  it('insertAt test 016: item inserted at correct position i=16', () => {
    const a = ['a', 'b', 'c'];
    const r = insertAt(a, 1, 'X');
    expect(r[1]).toBe('X');
  });
  it('insertAt test 017: item inserted at correct position i=17', () => {
    const a = ['a', 'b', 'c'];
    const r = insertAt(a, 2, 'X');
    expect(r[2]).toBe('X');
  });
  it('insertAt test 018: item inserted at correct position i=18', () => {
    const a = ['a', 'b', 'c'];
    const r = insertAt(a, 0, 'X');
    expect(r[0]).toBe('X');
  });
  it('insertAt test 019: item inserted at correct position i=19', () => {
    const a = ['a', 'b', 'c'];
    const r = insertAt(a, 1, 'X');
    expect(r[1]).toBe('X');
  });
  it('insertAt test 020: item inserted at correct position i=20', () => {
    const a = ['a', 'b', 'c'];
    const r = insertAt(a, 2, 'X');
    expect(r[2]).toBe('X');
  });
  it('insertAt test 021: item inserted at correct position i=21', () => {
    const a = ['a', 'b', 'c'];
    const r = insertAt(a, 0, 'X');
    expect(r[0]).toBe('X');
  });
  it('insertAt test 022: item inserted at correct position i=22', () => {
    const a = ['a', 'b', 'c'];
    const r = insertAt(a, 1, 'X');
    expect(r[1]).toBe('X');
  });
  it('insertAt test 023: item inserted at correct position i=23', () => {
    const a = ['a', 'b', 'c'];
    const r = insertAt(a, 2, 'X');
    expect(r[2]).toBe('X');
  });
  it('insertAt test 024: item inserted at correct position i=24', () => {
    const a = ['a', 'b', 'c'];
    const r = insertAt(a, 0, 'X');
    expect(r[0]).toBe('X');
  });
  it('insertAt test 025: item inserted at correct position i=25', () => {
    const a = ['a', 'b', 'c'];
    const r = insertAt(a, 1, 'X');
    expect(r[1]).toBe('X');
  });
  it('insertAt test 026: item inserted at correct position i=26', () => {
    const a = ['a', 'b', 'c'];
    const r = insertAt(a, 2, 'X');
    expect(r[2]).toBe('X');
  });
  it('insertAt test 027: item inserted at correct position i=27', () => {
    const a = ['a', 'b', 'c'];
    const r = insertAt(a, 0, 'X');
    expect(r[0]).toBe('X');
  });
  it('insertAt test 028: item inserted at correct position i=28', () => {
    const a = ['a', 'b', 'c'];
    const r = insertAt(a, 1, 'X');
    expect(r[1]).toBe('X');
  });
  it('insertAt test 029: item inserted at correct position i=29', () => {
    const a = ['a', 'b', 'c'];
    const r = insertAt(a, 2, 'X');
    expect(r[2]).toBe('X');
  });
  it('insertAt test 030: item inserted at correct position i=30', () => {
    const a = ['a', 'b', 'c'];
    const r = insertAt(a, 0, 'X');
    expect(r[0]).toBe('X');
  });
  it('removeAt test 001: original unchanged', () => {
    const a = [1, 2, 3, 4];
    removeAt(a, 2);
    expect(a.length).toBe(4);
  });
  it('removeAt test 002: original unchanged', () => {
    const a = [1, 2, 3, 4];
    removeAt(a, 2);
    expect(a.length).toBe(4);
  });
  it('removeAt test 003: original unchanged', () => {
    const a = [1, 2, 3, 4];
    removeAt(a, 2);
    expect(a.length).toBe(4);
  });
  it('removeAt test 004: original unchanged', () => {
    const a = [1, 2, 3, 4];
    removeAt(a, 2);
    expect(a.length).toBe(4);
  });
  it('removeAt test 005: original unchanged', () => {
    const a = [1, 2, 3, 4];
    removeAt(a, 2);
    expect(a.length).toBe(4);
  });
  it('removeAt test 006: original unchanged', () => {
    const a = [1, 2, 3, 4];
    removeAt(a, 2);
    expect(a.length).toBe(4);
  });
  it('removeAt test 007: original unchanged', () => {
    const a = [1, 2, 3, 4];
    removeAt(a, 2);
    expect(a.length).toBe(4);
  });
  it('removeAt test 008: original unchanged', () => {
    const a = [1, 2, 3, 4];
    removeAt(a, 2);
    expect(a.length).toBe(4);
  });
  it('removeAt test 009: original unchanged', () => {
    const a = [1, 2, 3, 4];
    removeAt(a, 2);
    expect(a.length).toBe(4);
  });
  it('removeAt test 010: original unchanged', () => {
    const a = [1, 2, 3, 4];
    removeAt(a, 2);
    expect(a.length).toBe(4);
  });
  it('removeAt test 011: original unchanged', () => {
    const a = [1, 2, 3, 4];
    removeAt(a, 2);
    expect(a.length).toBe(4);
  });
  it('removeAt test 012: original unchanged', () => {
    const a = [1, 2, 3, 4];
    removeAt(a, 2);
    expect(a.length).toBe(4);
  });
  it('removeAt test 013: original unchanged', () => {
    const a = [1, 2, 3, 4];
    removeAt(a, 2);
    expect(a.length).toBe(4);
  });
  it('removeAt test 014: original unchanged', () => {
    const a = [1, 2, 3, 4];
    removeAt(a, 2);
    expect(a.length).toBe(4);
  });
  it('removeAt test 015: original unchanged', () => {
    const a = [1, 2, 3, 4];
    removeAt(a, 2);
    expect(a.length).toBe(4);
  });
  it('removeAt test 016: element at index removed i=16', () => {
    const idx = 1;
    const a = [10, 20, 30];
    const r = removeAt(a, idx);
    expect(r.length).toBe(2);
  });
  it('removeAt test 017: element at index removed i=17', () => {
    const idx = 2;
    const a = [10, 20, 30];
    const r = removeAt(a, idx);
    expect(r.length).toBe(2);
  });
  it('removeAt test 018: element at index removed i=18', () => {
    const idx = 0;
    const a = [10, 20, 30];
    const r = removeAt(a, idx);
    expect(r.length).toBe(2);
  });
  it('removeAt test 019: element at index removed i=19', () => {
    const idx = 1;
    const a = [10, 20, 30];
    const r = removeAt(a, idx);
    expect(r.length).toBe(2);
  });
  it('removeAt test 020: element at index removed i=20', () => {
    const idx = 2;
    const a = [10, 20, 30];
    const r = removeAt(a, idx);
    expect(r.length).toBe(2);
  });
  it('removeAt test 021: element at index removed i=21', () => {
    const idx = 0;
    const a = [10, 20, 30];
    const r = removeAt(a, idx);
    expect(r.length).toBe(2);
  });
  it('removeAt test 022: element at index removed i=22', () => {
    const idx = 1;
    const a = [10, 20, 30];
    const r = removeAt(a, idx);
    expect(r.length).toBe(2);
  });
  it('removeAt test 023: element at index removed i=23', () => {
    const idx = 2;
    const a = [10, 20, 30];
    const r = removeAt(a, idx);
    expect(r.length).toBe(2);
  });
  it('removeAt test 024: element at index removed i=24', () => {
    const idx = 0;
    const a = [10, 20, 30];
    const r = removeAt(a, idx);
    expect(r.length).toBe(2);
  });
  it('removeAt test 025: element at index removed i=25', () => {
    const idx = 1;
    const a = [10, 20, 30];
    const r = removeAt(a, idx);
    expect(r.length).toBe(2);
  });
  it('removeAt test 026: element at index removed i=26', () => {
    const idx = 2;
    const a = [10, 20, 30];
    const r = removeAt(a, idx);
    expect(r.length).toBe(2);
  });
  it('removeAt test 027: element at index removed i=27', () => {
    const idx = 0;
    const a = [10, 20, 30];
    const r = removeAt(a, idx);
    expect(r.length).toBe(2);
  });
  it('removeAt test 028: element at index removed i=28', () => {
    const idx = 1;
    const a = [10, 20, 30];
    const r = removeAt(a, idx);
    expect(r.length).toBe(2);
  });
  it('removeAt test 029: element at index removed i=29', () => {
    const idx = 2;
    const a = [10, 20, 30];
    const r = removeAt(a, idx);
    expect(r.length).toBe(2);
  });
  it('removeAt test 030: element at index removed i=30', () => {
    const idx = 0;
    const a = [10, 20, 30];
    const r = removeAt(a, idx);
    expect(r.length).toBe(2);
  });
  it('updateAt test 001: original unchanged', () => {
    const a = [1, 2, 1];
    updateAt(a, 2, v => v * 10);
    expect(a[2]).toBe(1);
  });
  it('updateAt test 002: original unchanged', () => {
    const a = [1, 2, 2];
    updateAt(a, 2, v => v * 10);
    expect(a[2]).toBe(2);
  });
  it('updateAt test 003: original unchanged', () => {
    const a = [1, 2, 3];
    updateAt(a, 2, v => v * 10);
    expect(a[2]).toBe(3);
  });
  it('updateAt test 004: original unchanged', () => {
    const a = [1, 2, 4];
    updateAt(a, 2, v => v * 10);
    expect(a[2]).toBe(4);
  });
  it('updateAt test 005: original unchanged', () => {
    const a = [1, 2, 5];
    updateAt(a, 2, v => v * 10);
    expect(a[2]).toBe(5);
  });
  it('updateAt test 006: original unchanged', () => {
    const a = [1, 2, 6];
    updateAt(a, 2, v => v * 10);
    expect(a[2]).toBe(6);
  });
  it('updateAt test 007: original unchanged', () => {
    const a = [1, 2, 7];
    updateAt(a, 2, v => v * 10);
    expect(a[2]).toBe(7);
  });
  it('updateAt test 008: original unchanged', () => {
    const a = [1, 2, 8];
    updateAt(a, 2, v => v * 10);
    expect(a[2]).toBe(8);
  });
  it('updateAt test 009: original unchanged', () => {
    const a = [1, 2, 9];
    updateAt(a, 2, v => v * 10);
    expect(a[2]).toBe(9);
  });
  it('updateAt test 010: original unchanged', () => {
    const a = [1, 2, 10];
    updateAt(a, 2, v => v * 10);
    expect(a[2]).toBe(10);
  });
  it('updateAt test 011: original unchanged', () => {
    const a = [1, 2, 11];
    updateAt(a, 2, v => v * 10);
    expect(a[2]).toBe(11);
  });
  it('updateAt test 012: original unchanged', () => {
    const a = [1, 2, 12];
    updateAt(a, 2, v => v * 10);
    expect(a[2]).toBe(12);
  });
  it('updateAt test 013: original unchanged', () => {
    const a = [1, 2, 13];
    updateAt(a, 2, v => v * 10);
    expect(a[2]).toBe(13);
  });
  it('updateAt test 014: original unchanged', () => {
    const a = [1, 2, 14];
    updateAt(a, 2, v => v * 10);
    expect(a[2]).toBe(14);
  });
  it('updateAt test 015: original unchanged', () => {
    const a = [1, 2, 15];
    updateAt(a, 2, v => v * 10);
    expect(a[2]).toBe(15);
  });
  it('updateAt test 016: fn applied at correct index i=16', () => {
    const a = [16, 17, 18];
    const r = updateAt(a, 1, v => v + 100);
    expect(r[1]).toBe(117);
  });
  it('updateAt test 017: fn applied at correct index i=17', () => {
    const a = [17, 18, 19];
    const r = updateAt(a, 1, v => v + 100);
    expect(r[1]).toBe(118);
  });
  it('updateAt test 018: fn applied at correct index i=18', () => {
    const a = [18, 19, 20];
    const r = updateAt(a, 1, v => v + 100);
    expect(r[1]).toBe(119);
  });
  it('updateAt test 019: fn applied at correct index i=19', () => {
    const a = [19, 20, 21];
    const r = updateAt(a, 1, v => v + 100);
    expect(r[1]).toBe(120);
  });
  it('updateAt test 020: fn applied at correct index i=20', () => {
    const a = [20, 21, 22];
    const r = updateAt(a, 1, v => v + 100);
    expect(r[1]).toBe(121);
  });
  it('updateAt test 021: fn applied at correct index i=21', () => {
    const a = [21, 22, 23];
    const r = updateAt(a, 1, v => v + 100);
    expect(r[1]).toBe(122);
  });
  it('updateAt test 022: fn applied at correct index i=22', () => {
    const a = [22, 23, 24];
    const r = updateAt(a, 1, v => v + 100);
    expect(r[1]).toBe(123);
  });
  it('updateAt test 023: fn applied at correct index i=23', () => {
    const a = [23, 24, 25];
    const r = updateAt(a, 1, v => v + 100);
    expect(r[1]).toBe(124);
  });
  it('updateAt test 024: fn applied at correct index i=24', () => {
    const a = [24, 25, 26];
    const r = updateAt(a, 1, v => v + 100);
    expect(r[1]).toBe(125);
  });
  it('updateAt test 025: fn applied at correct index i=25', () => {
    const a = [25, 26, 27];
    const r = updateAt(a, 1, v => v + 100);
    expect(r[1]).toBe(126);
  });
  it('updateAt test 026: fn applied at correct index i=26', () => {
    const a = [26, 27, 28];
    const r = updateAt(a, 1, v => v + 100);
    expect(r[1]).toBe(127);
  });
  it('updateAt test 027: fn applied at correct index i=27', () => {
    const a = [27, 28, 29];
    const r = updateAt(a, 1, v => v + 100);
    expect(r[1]).toBe(128);
  });
  it('updateAt test 028: fn applied at correct index i=28', () => {
    const a = [28, 29, 30];
    const r = updateAt(a, 1, v => v + 100);
    expect(r[1]).toBe(129);
  });
  it('updateAt test 029: fn applied at correct index i=29', () => {
    const a = [29, 30, 31];
    const r = updateAt(a, 1, v => v + 100);
    expect(r[1]).toBe(130);
  });
  it('updateAt test 030: fn applied at correct index i=30', () => {
    const a = [30, 31, 32];
    const r = updateAt(a, 1, v => v + 100);
    expect(r[1]).toBe(131);
  });
  it('setAt test 001: original unchanged', () => {
    const a = [1, 2, 1];
    setAt(a, 0, 999);
    expect(a[0]).toBe(1);
  });
  it('setAt test 002: original unchanged', () => {
    const a = [1, 2, 2];
    setAt(a, 0, 999);
    expect(a[0]).toBe(1);
  });
  it('setAt test 003: original unchanged', () => {
    const a = [1, 2, 3];
    setAt(a, 0, 999);
    expect(a[0]).toBe(1);
  });
  it('setAt test 004: original unchanged', () => {
    const a = [1, 2, 4];
    setAt(a, 0, 999);
    expect(a[0]).toBe(1);
  });
  it('setAt test 005: original unchanged', () => {
    const a = [1, 2, 5];
    setAt(a, 0, 999);
    expect(a[0]).toBe(1);
  });
  it('setAt test 006: original unchanged', () => {
    const a = [1, 2, 6];
    setAt(a, 0, 999);
    expect(a[0]).toBe(1);
  });
  it('setAt test 007: original unchanged', () => {
    const a = [1, 2, 7];
    setAt(a, 0, 999);
    expect(a[0]).toBe(1);
  });
  it('setAt test 008: original unchanged', () => {
    const a = [1, 2, 8];
    setAt(a, 0, 999);
    expect(a[0]).toBe(1);
  });
  it('setAt test 009: original unchanged', () => {
    const a = [1, 2, 9];
    setAt(a, 0, 999);
    expect(a[0]).toBe(1);
  });
  it('setAt test 010: original unchanged', () => {
    const a = [1, 2, 10];
    setAt(a, 0, 999);
    expect(a[0]).toBe(1);
  });
  it('setAt test 011: original unchanged', () => {
    const a = [1, 2, 11];
    setAt(a, 0, 999);
    expect(a[0]).toBe(1);
  });
  it('setAt test 012: original unchanged', () => {
    const a = [1, 2, 12];
    setAt(a, 0, 999);
    expect(a[0]).toBe(1);
  });
  it('setAt test 013: original unchanged', () => {
    const a = [1, 2, 13];
    setAt(a, 0, 999);
    expect(a[0]).toBe(1);
  });
  it('setAt test 014: original unchanged', () => {
    const a = [1, 2, 14];
    setAt(a, 0, 999);
    expect(a[0]).toBe(1);
  });
  it('setAt test 015: original unchanged', () => {
    const a = [1, 2, 15];
    setAt(a, 0, 999);
    expect(a[0]).toBe(1);
  });
  it('setAt test 016: value set at index i=16', () => {
    const a = [1, 2, 3];
    const r = setAt(a, 1, 112);
    expect(r[1]).toBe(112);
  });
  it('setAt test 017: value set at index i=17', () => {
    const a = [1, 2, 3];
    const r = setAt(a, 2, 119);
    expect(r[2]).toBe(119);
  });
  it('setAt test 018: value set at index i=18', () => {
    const a = [1, 2, 3];
    const r = setAt(a, 0, 126);
    expect(r[0]).toBe(126);
  });
  it('setAt test 019: value set at index i=19', () => {
    const a = [1, 2, 3];
    const r = setAt(a, 1, 133);
    expect(r[1]).toBe(133);
  });
  it('setAt test 020: value set at index i=20', () => {
    const a = [1, 2, 3];
    const r = setAt(a, 2, 140);
    expect(r[2]).toBe(140);
  });
  it('setAt test 021: value set at index i=21', () => {
    const a = [1, 2, 3];
    const r = setAt(a, 0, 147);
    expect(r[0]).toBe(147);
  });
  it('setAt test 022: value set at index i=22', () => {
    const a = [1, 2, 3];
    const r = setAt(a, 1, 154);
    expect(r[1]).toBe(154);
  });
  it('setAt test 023: value set at index i=23', () => {
    const a = [1, 2, 3];
    const r = setAt(a, 2, 161);
    expect(r[2]).toBe(161);
  });
  it('setAt test 024: value set at index i=24', () => {
    const a = [1, 2, 3];
    const r = setAt(a, 0, 168);
    expect(r[0]).toBe(168);
  });
  it('setAt test 025: value set at index i=25', () => {
    const a = [1, 2, 3];
    const r = setAt(a, 1, 175);
    expect(r[1]).toBe(175);
  });
  it('setAt test 026: value set at index i=26', () => {
    const a = [1, 2, 3];
    const r = setAt(a, 2, 182);
    expect(r[2]).toBe(182);
  });
  it('setAt test 027: value set at index i=27', () => {
    const a = [1, 2, 3];
    const r = setAt(a, 0, 189);
    expect(r[0]).toBe(189);
  });
  it('setAt test 028: value set at index i=28', () => {
    const a = [1, 2, 3];
    const r = setAt(a, 1, 196);
    expect(r[1]).toBe(196);
  });
  it('setAt test 029: value set at index i=29', () => {
    const a = [1, 2, 3];
    const r = setAt(a, 2, 203);
    expect(r[2]).toBe(203);
  });
  it('setAt test 030: value set at index i=30', () => {
    const a = [1, 2, 3];
    const r = setAt(a, 0, 210);
    expect(r[0]).toBe(210);
  });
});

describe('reverse / sort / move / swap', () => {
  it('reverse test 001: original unchanged', () => {
    const a = [1, 2, 3, 1];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 002: original unchanged', () => {
    const a = [1, 2, 3, 2];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 003: original unchanged', () => {
    const a = [1, 2, 3, 3];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 004: original unchanged', () => {
    const a = [1, 2, 3, 4];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 005: original unchanged', () => {
    const a = [1, 2, 3, 5];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 006: original unchanged', () => {
    const a = [1, 2, 3, 6];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 007: original unchanged', () => {
    const a = [1, 2, 3, 7];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 008: original unchanged', () => {
    const a = [1, 2, 3, 8];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 009: original unchanged', () => {
    const a = [1, 2, 3, 9];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 010: original unchanged', () => {
    const a = [1, 2, 3, 10];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 011: original unchanged', () => {
    const a = [1, 2, 3, 11];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 012: original unchanged', () => {
    const a = [1, 2, 3, 12];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 013: original unchanged', () => {
    const a = [1, 2, 3, 13];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 014: original unchanged', () => {
    const a = [1, 2, 3, 14];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 015: original unchanged', () => {
    const a = [1, 2, 3, 15];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 016: original unchanged', () => {
    const a = [1, 2, 3, 16];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 017: original unchanged', () => {
    const a = [1, 2, 3, 17];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 018: original unchanged', () => {
    const a = [1, 2, 3, 18];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 019: original unchanged', () => {
    const a = [1, 2, 3, 19];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 020: original unchanged', () => {
    const a = [1, 2, 3, 20];
    reverse(a);
    expect(a[0]).toBe(1);
  });
  it('reverse test 021: first becomes last i=21', () => {
    const a = [21, 22, 23];
    const r = reverse(a);
    expect(r[0]).toBe(23);
  });
  it('reverse test 022: first becomes last i=22', () => {
    const a = [22, 23, 24];
    const r = reverse(a);
    expect(r[0]).toBe(24);
  });
  it('reverse test 023: first becomes last i=23', () => {
    const a = [23, 24, 25];
    const r = reverse(a);
    expect(r[0]).toBe(25);
  });
  it('reverse test 024: first becomes last i=24', () => {
    const a = [24, 25, 26];
    const r = reverse(a);
    expect(r[0]).toBe(26);
  });
  it('reverse test 025: first becomes last i=25', () => {
    const a = [25, 26, 27];
    const r = reverse(a);
    expect(r[0]).toBe(27);
  });
  it('reverse test 026: first becomes last i=26', () => {
    const a = [26, 27, 28];
    const r = reverse(a);
    expect(r[0]).toBe(28);
  });
  it('reverse test 027: first becomes last i=27', () => {
    const a = [27, 28, 29];
    const r = reverse(a);
    expect(r[0]).toBe(29);
  });
  it('reverse test 028: first becomes last i=28', () => {
    const a = [28, 29, 30];
    const r = reverse(a);
    expect(r[0]).toBe(30);
  });
  it('reverse test 029: first becomes last i=29', () => {
    const a = [29, 30, 31];
    const r = reverse(a);
    expect(r[0]).toBe(31);
  });
  it('reverse test 030: first becomes last i=30', () => {
    const a = [30, 31, 32];
    const r = reverse(a);
    expect(r[0]).toBe(32);
  });
  it('reverse test 031: first becomes last i=31', () => {
    const a = [31, 32, 33];
    const r = reverse(a);
    expect(r[0]).toBe(33);
  });
  it('reverse test 032: first becomes last i=32', () => {
    const a = [32, 33, 34];
    const r = reverse(a);
    expect(r[0]).toBe(34);
  });
  it('reverse test 033: first becomes last i=33', () => {
    const a = [33, 34, 35];
    const r = reverse(a);
    expect(r[0]).toBe(35);
  });
  it('reverse test 034: first becomes last i=34', () => {
    const a = [34, 35, 36];
    const r = reverse(a);
    expect(r[0]).toBe(36);
  });
  it('reverse test 035: first becomes last i=35', () => {
    const a = [35, 36, 37];
    const r = reverse(a);
    expect(r[0]).toBe(37);
  });
  it('reverse test 036: first becomes last i=36', () => {
    const a = [36, 37, 38];
    const r = reverse(a);
    expect(r[0]).toBe(38);
  });
  it('reverse test 037: first becomes last i=37', () => {
    const a = [37, 38, 39];
    const r = reverse(a);
    expect(r[0]).toBe(39);
  });
  it('reverse test 038: first becomes last i=38', () => {
    const a = [38, 39, 40];
    const r = reverse(a);
    expect(r[0]).toBe(40);
  });
  it('reverse test 039: first becomes last i=39', () => {
    const a = [39, 40, 41];
    const r = reverse(a);
    expect(r[0]).toBe(41);
  });
  it('reverse test 040: first becomes last i=40', () => {
    const a = [40, 41, 42];
    const r = reverse(a);
    expect(r[0]).toBe(42);
  });
  it('sort test 001: original unchanged', () => {
    const a = [3, 1, 3, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 002: original unchanged', () => {
    const a = [3, 1, 4, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 003: original unchanged', () => {
    const a = [3, 1, 5, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 004: original unchanged', () => {
    const a = [3, 1, 6, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 005: original unchanged', () => {
    const a = [3, 1, 7, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 006: original unchanged', () => {
    const a = [3, 1, 8, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 007: original unchanged', () => {
    const a = [3, 1, 9, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 008: original unchanged', () => {
    const a = [3, 1, 10, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 009: original unchanged', () => {
    const a = [3, 1, 11, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 010: original unchanged', () => {
    const a = [3, 1, 12, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 011: original unchanged', () => {
    const a = [3, 1, 13, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 012: original unchanged', () => {
    const a = [3, 1, 14, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 013: original unchanged', () => {
    const a = [3, 1, 15, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 014: original unchanged', () => {
    const a = [3, 1, 16, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 015: original unchanged', () => {
    const a = [3, 1, 17, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 016: original unchanged', () => {
    const a = [3, 1, 18, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 017: original unchanged', () => {
    const a = [3, 1, 19, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 018: original unchanged', () => {
    const a = [3, 1, 20, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 019: original unchanged', () => {
    const a = [3, 1, 21, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 020: original unchanged', () => {
    const a = [3, 1, 22, 2];
    sort(a);
    expect(a[0]).toBe(3);
  });
  it('sort test 021: numeric sort correct i=21', () => {
    const a = [23, 21, 22];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(21);
  });
  it('sort test 022: numeric sort correct i=22', () => {
    const a = [24, 22, 23];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(22);
  });
  it('sort test 023: numeric sort correct i=23', () => {
    const a = [25, 23, 24];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(23);
  });
  it('sort test 024: numeric sort correct i=24', () => {
    const a = [26, 24, 25];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(24);
  });
  it('sort test 025: numeric sort correct i=25', () => {
    const a = [27, 25, 26];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(25);
  });
  it('sort test 026: numeric sort correct i=26', () => {
    const a = [28, 26, 27];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(26);
  });
  it('sort test 027: numeric sort correct i=27', () => {
    const a = [29, 27, 28];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(27);
  });
  it('sort test 028: numeric sort correct i=28', () => {
    const a = [30, 28, 29];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(28);
  });
  it('sort test 029: numeric sort correct i=29', () => {
    const a = [31, 29, 30];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(29);
  });
  it('sort test 030: numeric sort correct i=30', () => {
    const a = [32, 30, 31];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(30);
  });
  it('sort test 031: numeric sort correct i=31', () => {
    const a = [33, 31, 32];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(31);
  });
  it('sort test 032: numeric sort correct i=32', () => {
    const a = [34, 32, 33];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(32);
  });
  it('sort test 033: numeric sort correct i=33', () => {
    const a = [35, 33, 34];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(33);
  });
  it('sort test 034: numeric sort correct i=34', () => {
    const a = [36, 34, 35];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(34);
  });
  it('sort test 035: numeric sort correct i=35', () => {
    const a = [37, 35, 36];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(35);
  });
  it('sort test 036: numeric sort correct i=36', () => {
    const a = [38, 36, 37];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(36);
  });
  it('sort test 037: numeric sort correct i=37', () => {
    const a = [39, 37, 38];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(37);
  });
  it('sort test 038: numeric sort correct i=38', () => {
    const a = [40, 38, 39];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(38);
  });
  it('sort test 039: numeric sort correct i=39', () => {
    const a = [41, 39, 40];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(39);
  });
  it('sort test 040: numeric sort correct i=40', () => {
    const a = [42, 40, 41];
    const r = sort(a, (x, y) => x - y);
    expect(r[0]).toBe(40);
  });
  it('move test 001: original unchanged', () => {
    const a = [1, 2, 3, 4, 5];
    move(a, 0, 2);
    expect(a[0]).toBe(1);
  });
  it('move test 002: original unchanged', () => {
    const a = [1, 2, 3, 4, 5];
    move(a, 0, 3);
    expect(a[0]).toBe(1);
  });
  it('move test 003: original unchanged', () => {
    const a = [1, 2, 3, 4, 5];
    move(a, 0, 4);
    expect(a[0]).toBe(1);
  });
  it('move test 004: original unchanged', () => {
    const a = [1, 2, 3, 4, 5];
    move(a, 0, 1);
    expect(a[0]).toBe(1);
  });
  it('move test 005: original unchanged', () => {
    const a = [1, 2, 3, 4, 5];
    move(a, 0, 2);
    expect(a[0]).toBe(1);
  });
  it('move test 006: original unchanged', () => {
    const a = [1, 2, 3, 4, 5];
    move(a, 0, 3);
    expect(a[0]).toBe(1);
  });
  it('move test 007: original unchanged', () => {
    const a = [1, 2, 3, 4, 5];
    move(a, 0, 4);
    expect(a[0]).toBe(1);
  });
  it('move test 008: original unchanged', () => {
    const a = [1, 2, 3, 4, 5];
    move(a, 0, 1);
    expect(a[0]).toBe(1);
  });
  it('move test 009: original unchanged', () => {
    const a = [1, 2, 3, 4, 5];
    move(a, 0, 2);
    expect(a[0]).toBe(1);
  });
  it('move test 010: original unchanged', () => {
    const a = [1, 2, 3, 4, 5];
    move(a, 0, 3);
    expect(a[0]).toBe(1);
  });
  it('move test 011: original unchanged', () => {
    const a = [1, 2, 3, 4, 5];
    move(a, 0, 4);
    expect(a[0]).toBe(1);
  });
  it('move test 012: original unchanged', () => {
    const a = [1, 2, 3, 4, 5];
    move(a, 0, 1);
    expect(a[0]).toBe(1);
  });
  it('move test 013: original unchanged', () => {
    const a = [1, 2, 3, 4, 5];
    move(a, 0, 2);
    expect(a[0]).toBe(1);
  });
  it('move test 014: original unchanged', () => {
    const a = [1, 2, 3, 4, 5];
    move(a, 0, 3);
    expect(a[0]).toBe(1);
  });
  it('move test 015: original unchanged', () => {
    const a = [1, 2, 3, 4, 5];
    move(a, 0, 4);
    expect(a[0]).toBe(1);
  });
  it('move test 016: original unchanged', () => {
    const a = [1, 2, 3, 4, 5];
    move(a, 0, 1);
    expect(a[0]).toBe(1);
  });
  it('move test 017: original unchanged', () => {
    const a = [1, 2, 3, 4, 5];
    move(a, 0, 2);
    expect(a[0]).toBe(1);
  });
  it('move test 018: length preserved after move i=18', () => {
    const a = [10, 20, 30, 40];
    const r = move(a, 0, 1);
    expect(r.length).toBe(4);
  });
  it('move test 019: length preserved after move i=19', () => {
    const a = [10, 20, 30, 40];
    const r = move(a, 0, 2);
    expect(r.length).toBe(4);
  });
  it('move test 020: length preserved after move i=20', () => {
    const a = [10, 20, 30, 40];
    const r = move(a, 0, 3);
    expect(r.length).toBe(4);
  });
  it('move test 021: length preserved after move i=21', () => {
    const a = [10, 20, 30, 40];
    const r = move(a, 0, 1);
    expect(r.length).toBe(4);
  });
  it('move test 022: length preserved after move i=22', () => {
    const a = [10, 20, 30, 40];
    const r = move(a, 0, 2);
    expect(r.length).toBe(4);
  });
  it('move test 023: length preserved after move i=23', () => {
    const a = [10, 20, 30, 40];
    const r = move(a, 0, 3);
    expect(r.length).toBe(4);
  });
  it('move test 024: length preserved after move i=24', () => {
    const a = [10, 20, 30, 40];
    const r = move(a, 0, 1);
    expect(r.length).toBe(4);
  });
  it('move test 025: length preserved after move i=25', () => {
    const a = [10, 20, 30, 40];
    const r = move(a, 0, 2);
    expect(r.length).toBe(4);
  });
  it('move test 026: length preserved after move i=26', () => {
    const a = [10, 20, 30, 40];
    const r = move(a, 0, 3);
    expect(r.length).toBe(4);
  });
  it('move test 027: length preserved after move i=27', () => {
    const a = [10, 20, 30, 40];
    const r = move(a, 0, 1);
    expect(r.length).toBe(4);
  });
  it('move test 028: length preserved after move i=28', () => {
    const a = [10, 20, 30, 40];
    const r = move(a, 0, 2);
    expect(r.length).toBe(4);
  });
  it('move test 029: length preserved after move i=29', () => {
    const a = [10, 20, 30, 40];
    const r = move(a, 0, 3);
    expect(r.length).toBe(4);
  });
  it('move test 030: length preserved after move i=30', () => {
    const a = [10, 20, 30, 40];
    const r = move(a, 0, 1);
    expect(r.length).toBe(4);
  });
  it('move test 031: length preserved after move i=31', () => {
    const a = [10, 20, 30, 40];
    const r = move(a, 0, 2);
    expect(r.length).toBe(4);
  });
  it('move test 032: length preserved after move i=32', () => {
    const a = [10, 20, 30, 40];
    const r = move(a, 0, 3);
    expect(r.length).toBe(4);
  });
  it('move test 033: length preserved after move i=33', () => {
    const a = [10, 20, 30, 40];
    const r = move(a, 0, 1);
    expect(r.length).toBe(4);
  });
  it('move test 034: length preserved after move i=34', () => {
    const a = [10, 20, 30, 40];
    const r = move(a, 0, 2);
    expect(r.length).toBe(4);
  });
  it('move test 035: length preserved after move i=35', () => {
    const a = [10, 20, 30, 40];
    const r = move(a, 0, 3);
    expect(r.length).toBe(4);
  });
  it('swap test 001: original unchanged', () => {
    const a = [10, 20, 30];
    swap(a, 0, 2);
    expect(a[0]).toBe(10);
  });
  it('swap test 002: original unchanged', () => {
    const a = [10, 20, 30];
    swap(a, 0, 2);
    expect(a[0]).toBe(10);
  });
  it('swap test 003: original unchanged', () => {
    const a = [10, 20, 30];
    swap(a, 0, 2);
    expect(a[0]).toBe(10);
  });
  it('swap test 004: original unchanged', () => {
    const a = [10, 20, 30];
    swap(a, 0, 2);
    expect(a[0]).toBe(10);
  });
  it('swap test 005: original unchanged', () => {
    const a = [10, 20, 30];
    swap(a, 0, 2);
    expect(a[0]).toBe(10);
  });
  it('swap test 006: original unchanged', () => {
    const a = [10, 20, 30];
    swap(a, 0, 2);
    expect(a[0]).toBe(10);
  });
  it('swap test 007: original unchanged', () => {
    const a = [10, 20, 30];
    swap(a, 0, 2);
    expect(a[0]).toBe(10);
  });
  it('swap test 008: original unchanged', () => {
    const a = [10, 20, 30];
    swap(a, 0, 2);
    expect(a[0]).toBe(10);
  });
  it('swap test 009: original unchanged', () => {
    const a = [10, 20, 30];
    swap(a, 0, 2);
    expect(a[0]).toBe(10);
  });
  it('swap test 010: original unchanged', () => {
    const a = [10, 20, 30];
    swap(a, 0, 2);
    expect(a[0]).toBe(10);
  });
  it('swap test 011: original unchanged', () => {
    const a = [10, 20, 30];
    swap(a, 0, 2);
    expect(a[0]).toBe(10);
  });
  it('swap test 012: original unchanged', () => {
    const a = [10, 20, 30];
    swap(a, 0, 2);
    expect(a[0]).toBe(10);
  });
  it('swap test 013: original unchanged', () => {
    const a = [10, 20, 30];
    swap(a, 0, 2);
    expect(a[0]).toBe(10);
  });
  it('swap test 014: original unchanged', () => {
    const a = [10, 20, 30];
    swap(a, 0, 2);
    expect(a[0]).toBe(10);
  });
  it('swap test 015: original unchanged', () => {
    const a = [10, 20, 30];
    swap(a, 0, 2);
    expect(a[0]).toBe(10);
  });
  it('swap test 016: original unchanged', () => {
    const a = [10, 20, 30];
    swap(a, 0, 2);
    expect(a[0]).toBe(10);
  });
  it('swap test 017: original unchanged', () => {
    const a = [10, 20, 30];
    swap(a, 0, 2);
    expect(a[0]).toBe(10);
  });
  it('swap test 018: values exchanged correctly i=18', () => {
    const a = [18, 23, 28];
    const r = swap(a, 0, 2);
    expect(r[0]).toBe(28);
    expect(r[2]).toBe(18);
  });
  it('swap test 019: values exchanged correctly i=19', () => {
    const a = [19, 24, 29];
    const r = swap(a, 0, 2);
    expect(r[0]).toBe(29);
    expect(r[2]).toBe(19);
  });
  it('swap test 020: values exchanged correctly i=20', () => {
    const a = [20, 25, 30];
    const r = swap(a, 0, 2);
    expect(r[0]).toBe(30);
    expect(r[2]).toBe(20);
  });
  it('swap test 021: values exchanged correctly i=21', () => {
    const a = [21, 26, 31];
    const r = swap(a, 0, 2);
    expect(r[0]).toBe(31);
    expect(r[2]).toBe(21);
  });
  it('swap test 022: values exchanged correctly i=22', () => {
    const a = [22, 27, 32];
    const r = swap(a, 0, 2);
    expect(r[0]).toBe(32);
    expect(r[2]).toBe(22);
  });
  it('swap test 023: values exchanged correctly i=23', () => {
    const a = [23, 28, 33];
    const r = swap(a, 0, 2);
    expect(r[0]).toBe(33);
    expect(r[2]).toBe(23);
  });
  it('swap test 024: values exchanged correctly i=24', () => {
    const a = [24, 29, 34];
    const r = swap(a, 0, 2);
    expect(r[0]).toBe(34);
    expect(r[2]).toBe(24);
  });
  it('swap test 025: values exchanged correctly i=25', () => {
    const a = [25, 30, 35];
    const r = swap(a, 0, 2);
    expect(r[0]).toBe(35);
    expect(r[2]).toBe(25);
  });
  it('swap test 026: values exchanged correctly i=26', () => {
    const a = [26, 31, 36];
    const r = swap(a, 0, 2);
    expect(r[0]).toBe(36);
    expect(r[2]).toBe(26);
  });
  it('swap test 027: values exchanged correctly i=27', () => {
    const a = [27, 32, 37];
    const r = swap(a, 0, 2);
    expect(r[0]).toBe(37);
    expect(r[2]).toBe(27);
  });
  it('swap test 028: values exchanged correctly i=28', () => {
    const a = [28, 33, 38];
    const r = swap(a, 0, 2);
    expect(r[0]).toBe(38);
    expect(r[2]).toBe(28);
  });
  it('swap test 029: values exchanged correctly i=29', () => {
    const a = [29, 34, 39];
    const r = swap(a, 0, 2);
    expect(r[0]).toBe(39);
    expect(r[2]).toBe(29);
  });
  it('swap test 030: values exchanged correctly i=30', () => {
    const a = [30, 35, 40];
    const r = swap(a, 0, 2);
    expect(r[0]).toBe(40);
    expect(r[2]).toBe(30);
  });
  it('swap test 031: values exchanged correctly i=31', () => {
    const a = [31, 36, 41];
    const r = swap(a, 0, 2);
    expect(r[0]).toBe(41);
    expect(r[2]).toBe(31);
  });
  it('swap test 032: values exchanged correctly i=32', () => {
    const a = [32, 37, 42];
    const r = swap(a, 0, 2);
    expect(r[0]).toBe(42);
    expect(r[2]).toBe(32);
  });
  it('swap test 033: values exchanged correctly i=33', () => {
    const a = [33, 38, 43];
    const r = swap(a, 0, 2);
    expect(r[0]).toBe(43);
    expect(r[2]).toBe(33);
  });
  it('swap test 034: values exchanged correctly i=34', () => {
    const a = [34, 39, 44];
    const r = swap(a, 0, 2);
    expect(r[0]).toBe(44);
    expect(r[2]).toBe(34);
  });
  it('swap test 035: values exchanged correctly i=35', () => {
    const a = [35, 40, 45];
    const r = swap(a, 0, 2);
    expect(r[0]).toBe(45);
    expect(r[2]).toBe(35);
  });
});

describe('setKey / deleteKey / mergeMap', () => {
  it('setKey test 001: original map unchanged', () => {
    const m = new Map([['a', 1]]);
    setKey(m, 'a', 10);
    expect(m.get('a')).toBe(1);
  });
  it('setKey test 002: original map unchanged', () => {
    const m = new Map([['a', 2]]);
    setKey(m, 'a', 20);
    expect(m.get('a')).toBe(2);
  });
  it('setKey test 003: original map unchanged', () => {
    const m = new Map([['a', 3]]);
    setKey(m, 'a', 30);
    expect(m.get('a')).toBe(3);
  });
  it('setKey test 004: original map unchanged', () => {
    const m = new Map([['a', 4]]);
    setKey(m, 'a', 40);
    expect(m.get('a')).toBe(4);
  });
  it('setKey test 005: original map unchanged', () => {
    const m = new Map([['a', 5]]);
    setKey(m, 'a', 50);
    expect(m.get('a')).toBe(5);
  });
  it('setKey test 006: original map unchanged', () => {
    const m = new Map([['a', 6]]);
    setKey(m, 'a', 60);
    expect(m.get('a')).toBe(6);
  });
  it('setKey test 007: original map unchanged', () => {
    const m = new Map([['a', 7]]);
    setKey(m, 'a', 70);
    expect(m.get('a')).toBe(7);
  });
  it('setKey test 008: original map unchanged', () => {
    const m = new Map([['a', 8]]);
    setKey(m, 'a', 80);
    expect(m.get('a')).toBe(8);
  });
  it('setKey test 009: original map unchanged', () => {
    const m = new Map([['a', 9]]);
    setKey(m, 'a', 90);
    expect(m.get('a')).toBe(9);
  });
  it('setKey test 010: original map unchanged', () => {
    const m = new Map([['a', 10]]);
    setKey(m, 'a', 100);
    expect(m.get('a')).toBe(10);
  });
  it('setKey test 011: original map unchanged', () => {
    const m = new Map([['a', 11]]);
    setKey(m, 'a', 110);
    expect(m.get('a')).toBe(11);
  });
  it('setKey test 012: original map unchanged', () => {
    const m = new Map([['a', 12]]);
    setKey(m, 'a', 120);
    expect(m.get('a')).toBe(12);
  });
  it('setKey test 013: original map unchanged', () => {
    const m = new Map([['a', 13]]);
    setKey(m, 'a', 130);
    expect(m.get('a')).toBe(13);
  });
  it('setKey test 014: original map unchanged', () => {
    const m = new Map([['a', 14]]);
    setKey(m, 'a', 140);
    expect(m.get('a')).toBe(14);
  });
  it('setKey test 015: original map unchanged', () => {
    const m = new Map([['a', 15]]);
    setKey(m, 'a', 150);
    expect(m.get('a')).toBe(15);
  });
  it('setKey test 016: original map unchanged', () => {
    const m = new Map([['a', 16]]);
    setKey(m, 'a', 160);
    expect(m.get('a')).toBe(16);
  });
  it('setKey test 017: original map unchanged', () => {
    const m = new Map([['a', 17]]);
    setKey(m, 'a', 170);
    expect(m.get('a')).toBe(17);
  });
  it('setKey test 018: new map has updated value i=18', () => {
    const m = new Map([['k', 18]]);
    const r = setKey(m, 'k', 68);
    expect(r.get('k')).toBe(68);
  });
  it('setKey test 019: new map has updated value i=19', () => {
    const m = new Map([['k', 19]]);
    const r = setKey(m, 'k', 69);
    expect(r.get('k')).toBe(69);
  });
  it('setKey test 020: new map has updated value i=20', () => {
    const m = new Map([['k', 20]]);
    const r = setKey(m, 'k', 70);
    expect(r.get('k')).toBe(70);
  });
  it('setKey test 021: new map has updated value i=21', () => {
    const m = new Map([['k', 21]]);
    const r = setKey(m, 'k', 71);
    expect(r.get('k')).toBe(71);
  });
  it('setKey test 022: new map has updated value i=22', () => {
    const m = new Map([['k', 22]]);
    const r = setKey(m, 'k', 72);
    expect(r.get('k')).toBe(72);
  });
  it('setKey test 023: new map has updated value i=23', () => {
    const m = new Map([['k', 23]]);
    const r = setKey(m, 'k', 73);
    expect(r.get('k')).toBe(73);
  });
  it('setKey test 024: new map has updated value i=24', () => {
    const m = new Map([['k', 24]]);
    const r = setKey(m, 'k', 74);
    expect(r.get('k')).toBe(74);
  });
  it('setKey test 025: new map has updated value i=25', () => {
    const m = new Map([['k', 25]]);
    const r = setKey(m, 'k', 75);
    expect(r.get('k')).toBe(75);
  });
  it('setKey test 026: new map has updated value i=26', () => {
    const m = new Map([['k', 26]]);
    const r = setKey(m, 'k', 76);
    expect(r.get('k')).toBe(76);
  });
  it('setKey test 027: new map has updated value i=27', () => {
    const m = new Map([['k', 27]]);
    const r = setKey(m, 'k', 77);
    expect(r.get('k')).toBe(77);
  });
  it('setKey test 028: new map has updated value i=28', () => {
    const m = new Map([['k', 28]]);
    const r = setKey(m, 'k', 78);
    expect(r.get('k')).toBe(78);
  });
  it('setKey test 029: new map has updated value i=29', () => {
    const m = new Map([['k', 29]]);
    const r = setKey(m, 'k', 79);
    expect(r.get('k')).toBe(79);
  });
  it('setKey test 030: new map has updated value i=30', () => {
    const m = new Map([['k', 30]]);
    const r = setKey(m, 'k', 80);
    expect(r.get('k')).toBe(80);
  });
  it('setKey test 031: new map has updated value i=31', () => {
    const m = new Map([['k', 31]]);
    const r = setKey(m, 'k', 81);
    expect(r.get('k')).toBe(81);
  });
  it('setKey test 032: new map has updated value i=32', () => {
    const m = new Map([['k', 32]]);
    const r = setKey(m, 'k', 82);
    expect(r.get('k')).toBe(82);
  });
  it('setKey test 033: new map has updated value i=33', () => {
    const m = new Map([['k', 33]]);
    const r = setKey(m, 'k', 83);
    expect(r.get('k')).toBe(83);
  });
  it('setKey test 034: new map has updated value i=34', () => {
    const m = new Map([['k', 34]]);
    const r = setKey(m, 'k', 84);
    expect(r.get('k')).toBe(84);
  });
  it('setKey test 035: new map has updated value i=35', () => {
    const m = new Map([['k', 35]]);
    const r = setKey(m, 'k', 85);
    expect(r.get('k')).toBe(85);
  });
  it('deleteKey test 001: original map unchanged', () => {
    const m = new Map([['x', 1], ['y', 2]]);
    deleteKey(m, 'x');
    expect(m.has('x')).toBe(true);
  });
  it('deleteKey test 002: original map unchanged', () => {
    const m = new Map([['x', 2], ['y', 3]]);
    deleteKey(m, 'x');
    expect(m.has('x')).toBe(true);
  });
  it('deleteKey test 003: original map unchanged', () => {
    const m = new Map([['x', 3], ['y', 4]]);
    deleteKey(m, 'x');
    expect(m.has('x')).toBe(true);
  });
  it('deleteKey test 004: original map unchanged', () => {
    const m = new Map([['x', 4], ['y', 5]]);
    deleteKey(m, 'x');
    expect(m.has('x')).toBe(true);
  });
  it('deleteKey test 005: original map unchanged', () => {
    const m = new Map([['x', 5], ['y', 6]]);
    deleteKey(m, 'x');
    expect(m.has('x')).toBe(true);
  });
  it('deleteKey test 006: original map unchanged', () => {
    const m = new Map([['x', 6], ['y', 7]]);
    deleteKey(m, 'x');
    expect(m.has('x')).toBe(true);
  });
  it('deleteKey test 007: original map unchanged', () => {
    const m = new Map([['x', 7], ['y', 8]]);
    deleteKey(m, 'x');
    expect(m.has('x')).toBe(true);
  });
  it('deleteKey test 008: original map unchanged', () => {
    const m = new Map([['x', 8], ['y', 9]]);
    deleteKey(m, 'x');
    expect(m.has('x')).toBe(true);
  });
  it('deleteKey test 009: original map unchanged', () => {
    const m = new Map([['x', 9], ['y', 10]]);
    deleteKey(m, 'x');
    expect(m.has('x')).toBe(true);
  });
  it('deleteKey test 010: original map unchanged', () => {
    const m = new Map([['x', 10], ['y', 11]]);
    deleteKey(m, 'x');
    expect(m.has('x')).toBe(true);
  });
  it('deleteKey test 011: original map unchanged', () => {
    const m = new Map([['x', 11], ['y', 12]]);
    deleteKey(m, 'x');
    expect(m.has('x')).toBe(true);
  });
  it('deleteKey test 012: original map unchanged', () => {
    const m = new Map([['x', 12], ['y', 13]]);
    deleteKey(m, 'x');
    expect(m.has('x')).toBe(true);
  });
  it('deleteKey test 013: original map unchanged', () => {
    const m = new Map([['x', 13], ['y', 14]]);
    deleteKey(m, 'x');
    expect(m.has('x')).toBe(true);
  });
  it('deleteKey test 014: original map unchanged', () => {
    const m = new Map([['x', 14], ['y', 15]]);
    deleteKey(m, 'x');
    expect(m.has('x')).toBe(true);
  });
  it('deleteKey test 015: original map unchanged', () => {
    const m = new Map([['x', 15], ['y', 16]]);
    deleteKey(m, 'x');
    expect(m.has('x')).toBe(true);
  });
  it('deleteKey test 016: original map unchanged', () => {
    const m = new Map([['x', 16], ['y', 17]]);
    deleteKey(m, 'x');
    expect(m.has('x')).toBe(true);
  });
  it('deleteKey test 017: original map unchanged', () => {
    const m = new Map([['x', 17], ['y', 18]]);
    deleteKey(m, 'x');
    expect(m.has('x')).toBe(true);
  });
  it('deleteKey test 018: key removed from new map i=18', () => {
    const m = new Map([['k', 18]]);
    const r = deleteKey(m, 'k');
    expect(r.has('k')).toBe(false);
  });
  it('deleteKey test 019: key removed from new map i=19', () => {
    const m = new Map([['k', 19]]);
    const r = deleteKey(m, 'k');
    expect(r.has('k')).toBe(false);
  });
  it('deleteKey test 020: key removed from new map i=20', () => {
    const m = new Map([['k', 20]]);
    const r = deleteKey(m, 'k');
    expect(r.has('k')).toBe(false);
  });
  it('deleteKey test 021: key removed from new map i=21', () => {
    const m = new Map([['k', 21]]);
    const r = deleteKey(m, 'k');
    expect(r.has('k')).toBe(false);
  });
  it('deleteKey test 022: key removed from new map i=22', () => {
    const m = new Map([['k', 22]]);
    const r = deleteKey(m, 'k');
    expect(r.has('k')).toBe(false);
  });
  it('deleteKey test 023: key removed from new map i=23', () => {
    const m = new Map([['k', 23]]);
    const r = deleteKey(m, 'k');
    expect(r.has('k')).toBe(false);
  });
  it('deleteKey test 024: key removed from new map i=24', () => {
    const m = new Map([['k', 24]]);
    const r = deleteKey(m, 'k');
    expect(r.has('k')).toBe(false);
  });
  it('deleteKey test 025: key removed from new map i=25', () => {
    const m = new Map([['k', 25]]);
    const r = deleteKey(m, 'k');
    expect(r.has('k')).toBe(false);
  });
  it('deleteKey test 026: key removed from new map i=26', () => {
    const m = new Map([['k', 26]]);
    const r = deleteKey(m, 'k');
    expect(r.has('k')).toBe(false);
  });
  it('deleteKey test 027: key removed from new map i=27', () => {
    const m = new Map([['k', 27]]);
    const r = deleteKey(m, 'k');
    expect(r.has('k')).toBe(false);
  });
  it('deleteKey test 028: key removed from new map i=28', () => {
    const m = new Map([['k', 28]]);
    const r = deleteKey(m, 'k');
    expect(r.has('k')).toBe(false);
  });
  it('deleteKey test 029: key removed from new map i=29', () => {
    const m = new Map([['k', 29]]);
    const r = deleteKey(m, 'k');
    expect(r.has('k')).toBe(false);
  });
  it('deleteKey test 030: key removed from new map i=30', () => {
    const m = new Map([['k', 30]]);
    const r = deleteKey(m, 'k');
    expect(r.has('k')).toBe(false);
  });
  it('deleteKey test 031: key removed from new map i=31', () => {
    const m = new Map([['k', 31]]);
    const r = deleteKey(m, 'k');
    expect(r.has('k')).toBe(false);
  });
  it('deleteKey test 032: key removed from new map i=32', () => {
    const m = new Map([['k', 32]]);
    const r = deleteKey(m, 'k');
    expect(r.has('k')).toBe(false);
  });
  it('deleteKey test 033: key removed from new map i=33', () => {
    const m = new Map([['k', 33]]);
    const r = deleteKey(m, 'k');
    expect(r.has('k')).toBe(false);
  });
  it('deleteKey test 034: key removed from new map i=34', () => {
    const m = new Map([['k', 34]]);
    const r = deleteKey(m, 'k');
    expect(r.has('k')).toBe(false);
  });
  it('deleteKey test 035: key removed from new map i=35', () => {
    const m = new Map([['k', 35]]);
    const r = deleteKey(m, 'k');
    expect(r.has('k')).toBe(false);
  });
  it('mergeMap test 001: originals unchanged', () => {
    const a = new Map([['a', 1]]);
    const b = new Map([['b', 2]]);
    mergeMap(a, b);
    expect(a.size).toBe(1);
  });
  it('mergeMap test 002: originals unchanged', () => {
    const a = new Map([['a', 2]]);
    const b = new Map([['b', 3]]);
    mergeMap(a, b);
    expect(a.size).toBe(1);
  });
  it('mergeMap test 003: originals unchanged', () => {
    const a = new Map([['a', 3]]);
    const b = new Map([['b', 4]]);
    mergeMap(a, b);
    expect(a.size).toBe(1);
  });
  it('mergeMap test 004: originals unchanged', () => {
    const a = new Map([['a', 4]]);
    const b = new Map([['b', 5]]);
    mergeMap(a, b);
    expect(a.size).toBe(1);
  });
  it('mergeMap test 005: originals unchanged', () => {
    const a = new Map([['a', 5]]);
    const b = new Map([['b', 6]]);
    mergeMap(a, b);
    expect(a.size).toBe(1);
  });
  it('mergeMap test 006: originals unchanged', () => {
    const a = new Map([['a', 6]]);
    const b = new Map([['b', 7]]);
    mergeMap(a, b);
    expect(a.size).toBe(1);
  });
  it('mergeMap test 007: originals unchanged', () => {
    const a = new Map([['a', 7]]);
    const b = new Map([['b', 8]]);
    mergeMap(a, b);
    expect(a.size).toBe(1);
  });
  it('mergeMap test 008: originals unchanged', () => {
    const a = new Map([['a', 8]]);
    const b = new Map([['b', 9]]);
    mergeMap(a, b);
    expect(a.size).toBe(1);
  });
  it('mergeMap test 009: originals unchanged', () => {
    const a = new Map([['a', 9]]);
    const b = new Map([['b', 10]]);
    mergeMap(a, b);
    expect(a.size).toBe(1);
  });
  it('mergeMap test 010: originals unchanged', () => {
    const a = new Map([['a', 10]]);
    const b = new Map([['b', 11]]);
    mergeMap(a, b);
    expect(a.size).toBe(1);
  });
  it('mergeMap test 011: originals unchanged', () => {
    const a = new Map([['a', 11]]);
    const b = new Map([['b', 12]]);
    mergeMap(a, b);
    expect(a.size).toBe(1);
  });
  it('mergeMap test 012: originals unchanged', () => {
    const a = new Map([['a', 12]]);
    const b = new Map([['b', 13]]);
    mergeMap(a, b);
    expect(a.size).toBe(1);
  });
  it('mergeMap test 013: originals unchanged', () => {
    const a = new Map([['a', 13]]);
    const b = new Map([['b', 14]]);
    mergeMap(a, b);
    expect(a.size).toBe(1);
  });
  it('mergeMap test 014: originals unchanged', () => {
    const a = new Map([['a', 14]]);
    const b = new Map([['b', 15]]);
    mergeMap(a, b);
    expect(a.size).toBe(1);
  });
  it('mergeMap test 015: originals unchanged', () => {
    const a = new Map([['a', 15]]);
    const b = new Map([['b', 16]]);
    mergeMap(a, b);
    expect(a.size).toBe(1);
  });
  it('mergeMap test 016: merged map has all keys i=16', () => {
    const a = new Map([['a', 16]]);
    const b = new Map([['b', 17]]);
    const r = mergeMap(a, b);
    expect(r.size).toBe(2);
  });
  it('mergeMap test 017: merged map has all keys i=17', () => {
    const a = new Map([['a', 17]]);
    const b = new Map([['b', 18]]);
    const r = mergeMap(a, b);
    expect(r.size).toBe(2);
  });
  it('mergeMap test 018: merged map has all keys i=18', () => {
    const a = new Map([['a', 18]]);
    const b = new Map([['b', 19]]);
    const r = mergeMap(a, b);
    expect(r.size).toBe(2);
  });
  it('mergeMap test 019: merged map has all keys i=19', () => {
    const a = new Map([['a', 19]]);
    const b = new Map([['b', 20]]);
    const r = mergeMap(a, b);
    expect(r.size).toBe(2);
  });
  it('mergeMap test 020: merged map has all keys i=20', () => {
    const a = new Map([['a', 20]]);
    const b = new Map([['b', 21]]);
    const r = mergeMap(a, b);
    expect(r.size).toBe(2);
  });
  it('mergeMap test 021: merged map has all keys i=21', () => {
    const a = new Map([['a', 21]]);
    const b = new Map([['b', 22]]);
    const r = mergeMap(a, b);
    expect(r.size).toBe(2);
  });
  it('mergeMap test 022: merged map has all keys i=22', () => {
    const a = new Map([['a', 22]]);
    const b = new Map([['b', 23]]);
    const r = mergeMap(a, b);
    expect(r.size).toBe(2);
  });
  it('mergeMap test 023: merged map has all keys i=23', () => {
    const a = new Map([['a', 23]]);
    const b = new Map([['b', 24]]);
    const r = mergeMap(a, b);
    expect(r.size).toBe(2);
  });
  it('mergeMap test 024: merged map has all keys i=24', () => {
    const a = new Map([['a', 24]]);
    const b = new Map([['b', 25]]);
    const r = mergeMap(a, b);
    expect(r.size).toBe(2);
  });
  it('mergeMap test 025: merged map has all keys i=25', () => {
    const a = new Map([['a', 25]]);
    const b = new Map([['b', 26]]);
    const r = mergeMap(a, b);
    expect(r.size).toBe(2);
  });
  it('mergeMap test 026: merged map has all keys i=26', () => {
    const a = new Map([['a', 26]]);
    const b = new Map([['b', 27]]);
    const r = mergeMap(a, b);
    expect(r.size).toBe(2);
  });
  it('mergeMap test 027: merged map has all keys i=27', () => {
    const a = new Map([['a', 27]]);
    const b = new Map([['b', 28]]);
    const r = mergeMap(a, b);
    expect(r.size).toBe(2);
  });
  it('mergeMap test 028: merged map has all keys i=28', () => {
    const a = new Map([['a', 28]]);
    const b = new Map([['b', 29]]);
    const r = mergeMap(a, b);
    expect(r.size).toBe(2);
  });
  it('mergeMap test 029: merged map has all keys i=29', () => {
    const a = new Map([['a', 29]]);
    const b = new Map([['b', 30]]);
    const r = mergeMap(a, b);
    expect(r.size).toBe(2);
  });
  it('mergeMap test 030: merged map has all keys i=30', () => {
    const a = new Map([['a', 30]]);
    const b = new Map([['b', 31]]);
    const r = mergeMap(a, b);
    expect(r.size).toBe(2);
  });
});

describe('edge cases and structural tests', () => {
  it('edge test 001: getIn returns undefined for missing key i=1', () => {
    const o = { a: 1 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 002: getIn returns undefined for missing key i=2', () => {
    const o = { a: 2 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 003: getIn returns undefined for missing key i=3', () => {
    const o = { a: 3 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 004: getIn returns undefined for missing key i=4', () => {
    const o = { a: 4 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 005: getIn returns undefined for missing key i=5', () => {
    const o = { a: 5 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 006: getIn returns undefined for missing key i=6', () => {
    const o = { a: 6 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 007: getIn returns undefined for missing key i=7', () => {
    const o = { a: 7 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 008: getIn returns undefined for missing key i=8', () => {
    const o = { a: 8 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 009: getIn returns undefined for missing key i=9', () => {
    const o = { a: 9 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 010: getIn returns undefined for missing key i=10', () => {
    const o = { a: 10 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 011: getIn returns undefined for missing key i=11', () => {
    const o = { a: 11 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 012: getIn returns undefined for missing key i=12', () => {
    const o = { a: 12 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 013: getIn returns undefined for missing key i=13', () => {
    const o = { a: 13 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 014: getIn returns undefined for missing key i=14', () => {
    const o = { a: 14 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 015: getIn returns undefined for missing key i=15', () => {
    const o = { a: 15 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 016: getIn returns undefined for missing key i=16', () => {
    const o = { a: 16 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 017: getIn returns undefined for missing key i=17', () => {
    const o = { a: 17 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 018: getIn returns undefined for missing key i=18', () => {
    const o = { a: 18 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 019: getIn returns undefined for missing key i=19', () => {
    const o = { a: 19 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 020: getIn returns undefined for missing key i=20', () => {
    const o = { a: 20 };
    expect(getIn(o, ['z'])).toBeUndefined();
  });
  it('edge test 021: setIn with empty path returns value itself i=21', () => {
    const r = setIn({ a: 1 }, [], 21);
    expect(r).toBe(21);
  });
  it('edge test 022: setIn with empty path returns value itself i=22', () => {
    const r = setIn({ a: 1 }, [], 22);
    expect(r).toBe(22);
  });
  it('edge test 023: setIn with empty path returns value itself i=23', () => {
    const r = setIn({ a: 1 }, [], 23);
    expect(r).toBe(23);
  });
  it('edge test 024: setIn with empty path returns value itself i=24', () => {
    const r = setIn({ a: 1 }, [], 24);
    expect(r).toBe(24);
  });
  it('edge test 025: setIn with empty path returns value itself i=25', () => {
    const r = setIn({ a: 1 }, [], 25);
    expect(r).toBe(25);
  });
  it('edge test 026: setIn with empty path returns value itself i=26', () => {
    const r = setIn({ a: 1 }, [], 26);
    expect(r).toBe(26);
  });
  it('edge test 027: setIn with empty path returns value itself i=27', () => {
    const r = setIn({ a: 1 }, [], 27);
    expect(r).toBe(27);
  });
  it('edge test 028: setIn with empty path returns value itself i=28', () => {
    const r = setIn({ a: 1 }, [], 28);
    expect(r).toBe(28);
  });
  it('edge test 029: setIn with empty path returns value itself i=29', () => {
    const r = setIn({ a: 1 }, [], 29);
    expect(r).toBe(29);
  });
  it('edge test 030: setIn with empty path returns value itself i=30', () => {
    const r = setIn({ a: 1 }, [], 30);
    expect(r).toBe(30);
  });
  it('edge test 031: setIn with empty path returns value itself i=31', () => {
    const r = setIn({ a: 1 }, [], 31);
    expect(r).toBe(31);
  });
  it('edge test 032: setIn with empty path returns value itself i=32', () => {
    const r = setIn({ a: 1 }, [], 32);
    expect(r).toBe(32);
  });
  it('edge test 033: setIn with empty path returns value itself i=33', () => {
    const r = setIn({ a: 1 }, [], 33);
    expect(r).toBe(33);
  });
  it('edge test 034: setIn with empty path returns value itself i=34', () => {
    const r = setIn({ a: 1 }, [], 34);
    expect(r).toBe(34);
  });
  it('edge test 035: setIn with empty path returns value itself i=35', () => {
    const r = setIn({ a: 1 }, [], 35);
    expect(r).toBe(35);
  });
  it('edge test 036: deleteIn with empty path returns original i=36', () => {
    const o = { n: 36 };
    const r = deleteIn(o, []);
    expect((r as any).n).toBe(36);
  });
  it('edge test 037: deleteIn with empty path returns original i=37', () => {
    const o = { n: 37 };
    const r = deleteIn(o, []);
    expect((r as any).n).toBe(37);
  });
  it('edge test 038: deleteIn with empty path returns original i=38', () => {
    const o = { n: 38 };
    const r = deleteIn(o, []);
    expect((r as any).n).toBe(38);
  });
  it('edge test 039: deleteIn with empty path returns original i=39', () => {
    const o = { n: 39 };
    const r = deleteIn(o, []);
    expect((r as any).n).toBe(39);
  });
  it('edge test 040: deleteIn with empty path returns original i=40', () => {
    const o = { n: 40 };
    const r = deleteIn(o, []);
    expect((r as any).n).toBe(40);
  });
  it('edge test 041: deleteIn with empty path returns original i=41', () => {
    const o = { n: 41 };
    const r = deleteIn(o, []);
    expect((r as any).n).toBe(41);
  });
  it('edge test 042: deleteIn with empty path returns original i=42', () => {
    const o = { n: 42 };
    const r = deleteIn(o, []);
    expect((r as any).n).toBe(42);
  });
  it('edge test 043: deleteIn with empty path returns original i=43', () => {
    const o = { n: 43 };
    const r = deleteIn(o, []);
    expect((r as any).n).toBe(43);
  });
  it('edge test 044: deleteIn with empty path returns original i=44', () => {
    const o = { n: 44 };
    const r = deleteIn(o, []);
    expect((r as any).n).toBe(44);
  });
  it('edge test 045: deleteIn with empty path returns original i=45', () => {
    const o = { n: 45 };
    const r = deleteIn(o, []);
    expect((r as any).n).toBe(45);
  });
  it('edge test 046: deleteIn with empty path returns original i=46', () => {
    const o = { n: 46 };
    const r = deleteIn(o, []);
    expect((r as any).n).toBe(46);
  });
  it('edge test 047: deleteIn with empty path returns original i=47', () => {
    const o = { n: 47 };
    const r = deleteIn(o, []);
    expect((r as any).n).toBe(47);
  });
  it('edge test 048: deleteIn with empty path returns original i=48', () => {
    const o = { n: 48 };
    const r = deleteIn(o, []);
    expect((r as any).n).toBe(48);
  });
  it('edge test 049: deleteIn with empty path returns original i=49', () => {
    const o = { n: 49 };
    const r = deleteIn(o, []);
    expect((r as any).n).toBe(49);
  });
  it('edge test 050: deleteIn with empty path returns original i=50', () => {
    const o = { n: 50 };
    const r = deleteIn(o, []);
    expect((r as any).n).toBe(50);
  });
  it('edge test 051: move from===to returns copy i=51', () => {
    const a = [1, 2, 51];
    const r = move(a, 2, 2);
    expect(r[2]).toBe(51);
  });
  it('edge test 052: move from===to returns copy i=52', () => {
    const a = [1, 2, 52];
    const r = move(a, 2, 2);
    expect(r[2]).toBe(52);
  });
  it('edge test 053: move from===to returns copy i=53', () => {
    const a = [1, 2, 53];
    const r = move(a, 2, 2);
    expect(r[2]).toBe(53);
  });
  it('edge test 054: move from===to returns copy i=54', () => {
    const a = [1, 2, 54];
    const r = move(a, 2, 2);
    expect(r[2]).toBe(54);
  });
  it('edge test 055: move from===to returns copy i=55', () => {
    const a = [1, 2, 55];
    const r = move(a, 2, 2);
    expect(r[2]).toBe(55);
  });
  it('edge test 056: move from===to returns copy i=56', () => {
    const a = [1, 2, 56];
    const r = move(a, 2, 2);
    expect(r[2]).toBe(56);
  });
  it('edge test 057: move from===to returns copy i=57', () => {
    const a = [1, 2, 57];
    const r = move(a, 2, 2);
    expect(r[2]).toBe(57);
  });
  it('edge test 058: move from===to returns copy i=58', () => {
    const a = [1, 2, 58];
    const r = move(a, 2, 2);
    expect(r[2]).toBe(58);
  });
  it('edge test 059: move from===to returns copy i=59', () => {
    const a = [1, 2, 59];
    const r = move(a, 2, 2);
    expect(r[2]).toBe(59);
  });
  it('edge test 060: move from===to returns copy i=60', () => {
    const a = [1, 2, 60];
    const r = move(a, 2, 2);
    expect(r[2]).toBe(60);
  });
  it('edge test 061: move from===to returns copy i=61', () => {
    const a = [1, 2, 61];
    const r = move(a, 2, 2);
    expect(r[2]).toBe(61);
  });
  it('edge test 062: move from===to returns copy i=62', () => {
    const a = [1, 2, 62];
    const r = move(a, 2, 2);
    expect(r[2]).toBe(62);
  });
  it('edge test 063: move from===to returns copy i=63', () => {
    const a = [1, 2, 63];
    const r = move(a, 2, 2);
    expect(r[2]).toBe(63);
  });
  it('edge test 064: move from===to returns copy i=64', () => {
    const a = [1, 2, 64];
    const r = move(a, 2, 2);
    expect(r[2]).toBe(64);
  });
  it('edge test 065: move from===to returns copy i=65', () => {
    const a = [1, 2, 65];
    const r = move(a, 2, 2);
    expect(r[2]).toBe(65);
  });
  it('edge test 066: swap i===j returns copy i=66', () => {
    const a = [66, 67];
    const r = swap(a, 0, 0);
    expect(r[0]).toBe(66);
  });
  it('edge test 067: swap i===j returns copy i=67', () => {
    const a = [67, 68];
    const r = swap(a, 0, 0);
    expect(r[0]).toBe(67);
  });
  it('edge test 068: swap i===j returns copy i=68', () => {
    const a = [68, 69];
    const r = swap(a, 0, 0);
    expect(r[0]).toBe(68);
  });
  it('edge test 069: swap i===j returns copy i=69', () => {
    const a = [69, 70];
    const r = swap(a, 0, 0);
    expect(r[0]).toBe(69);
  });
  it('edge test 070: swap i===j returns copy i=70', () => {
    const a = [70, 71];
    const r = swap(a, 0, 0);
    expect(r[0]).toBe(70);
  });
  it('edge test 071: swap i===j returns copy i=71', () => {
    const a = [71, 72];
    const r = swap(a, 0, 0);
    expect(r[0]).toBe(71);
  });
  it('edge test 072: swap i===j returns copy i=72', () => {
    const a = [72, 73];
    const r = swap(a, 0, 0);
    expect(r[0]).toBe(72);
  });
  it('edge test 073: swap i===j returns copy i=73', () => {
    const a = [73, 74];
    const r = swap(a, 0, 0);
    expect(r[0]).toBe(73);
  });
  it('edge test 074: swap i===j returns copy i=74', () => {
    const a = [74, 75];
    const r = swap(a, 0, 0);
    expect(r[0]).toBe(74);
  });
  it('edge test 075: swap i===j returns copy i=75', () => {
    const a = [75, 76];
    const r = swap(a, 0, 0);
    expect(r[0]).toBe(75);
  });
  it('edge test 076: swap i===j returns copy i=76', () => {
    const a = [76, 77];
    const r = swap(a, 0, 0);
    expect(r[0]).toBe(76);
  });
  it('edge test 077: swap i===j returns copy i=77', () => {
    const a = [77, 78];
    const r = swap(a, 0, 0);
    expect(r[0]).toBe(77);
  });
  it('edge test 078: swap i===j returns copy i=78', () => {
    const a = [78, 79];
    const r = swap(a, 0, 0);
    expect(r[0]).toBe(78);
  });
  it('edge test 079: swap i===j returns copy i=79', () => {
    const a = [79, 80];
    const r = swap(a, 0, 0);
    expect(r[0]).toBe(79);
  });
  it('edge test 080: swap i===j returns copy i=80', () => {
    const a = [80, 81];
    const r = swap(a, 0, 0);
    expect(r[0]).toBe(80);
  });
  it('edge test 081: mergeDeep overwrites non-object with non-object i=81', () => {
    const r = mergeDeep({ a: 81 }, { a: 281 });
    expect((r as any).a).toBe(281);
  });
  it('edge test 082: mergeDeep overwrites non-object with non-object i=82', () => {
    const r = mergeDeep({ a: 82 }, { a: 282 });
    expect((r as any).a).toBe(282);
  });
  it('edge test 083: mergeDeep overwrites non-object with non-object i=83', () => {
    const r = mergeDeep({ a: 83 }, { a: 283 });
    expect((r as any).a).toBe(283);
  });
  it('edge test 084: mergeDeep overwrites non-object with non-object i=84', () => {
    const r = mergeDeep({ a: 84 }, { a: 284 });
    expect((r as any).a).toBe(284);
  });
  it('edge test 085: mergeDeep overwrites non-object with non-object i=85', () => {
    const r = mergeDeep({ a: 85 }, { a: 285 });
    expect((r as any).a).toBe(285);
  });
  it('edge test 086: mergeDeep overwrites non-object with non-object i=86', () => {
    const r = mergeDeep({ a: 86 }, { a: 286 });
    expect((r as any).a).toBe(286);
  });
  it('edge test 087: mergeDeep overwrites non-object with non-object i=87', () => {
    const r = mergeDeep({ a: 87 }, { a: 287 });
    expect((r as any).a).toBe(287);
  });
  it('edge test 088: mergeDeep overwrites non-object with non-object i=88', () => {
    const r = mergeDeep({ a: 88 }, { a: 288 });
    expect((r as any).a).toBe(288);
  });
  it('edge test 089: mergeDeep overwrites non-object with non-object i=89', () => {
    const r = mergeDeep({ a: 89 }, { a: 289 });
    expect((r as any).a).toBe(289);
  });
  it('edge test 090: mergeDeep overwrites non-object with non-object i=90', () => {
    const r = mergeDeep({ a: 90 }, { a: 290 });
    expect((r as any).a).toBe(290);
  });
  it('edge test 091: mergeDeep overwrites non-object with non-object i=91', () => {
    const r = mergeDeep({ a: 91 }, { a: 291 });
    expect((r as any).a).toBe(291);
  });
  it('edge test 092: mergeDeep overwrites non-object with non-object i=92', () => {
    const r = mergeDeep({ a: 92 }, { a: 292 });
    expect((r as any).a).toBe(292);
  });
  it('edge test 093: mergeDeep overwrites non-object with non-object i=93', () => {
    const r = mergeDeep({ a: 93 }, { a: 293 });
    expect((r as any).a).toBe(293);
  });
  it('edge test 094: mergeDeep overwrites non-object with non-object i=94', () => {
    const r = mergeDeep({ a: 94 }, { a: 294 });
    expect((r as any).a).toBe(294);
  });
  it('edge test 095: mergeDeep overwrites non-object with non-object i=95', () => {
    const r = mergeDeep({ a: 95 }, { a: 295 });
    expect((r as any).a).toBe(295);
  });
  it('edge test 096: push multiple items at once i=96', () => {
    const r = push([1], 96, 97);
    expect(r.length).toBe(3);
  });
  it('edge test 097: push multiple items at once i=97', () => {
    const r = push([1], 97, 98);
    expect(r.length).toBe(3);
  });
  it('edge test 098: push multiple items at once i=98', () => {
    const r = push([1], 98, 99);
    expect(r.length).toBe(3);
  });
  it('edge test 099: push multiple items at once i=99', () => {
    const r = push([1], 99, 100);
    expect(r.length).toBe(3);
  });
  it('edge test 100: push multiple items at once i=100', () => {
    const r = push([1], 100, 101);
    expect(r.length).toBe(3);
  });
  it('edge test 101: push multiple items at once i=101', () => {
    const r = push([1], 101, 102);
    expect(r.length).toBe(3);
  });
  it('edge test 102: push multiple items at once i=102', () => {
    const r = push([1], 102, 103);
    expect(r.length).toBe(3);
  });
  it('edge test 103: push multiple items at once i=103', () => {
    const r = push([1], 103, 104);
    expect(r.length).toBe(3);
  });
  it('edge test 104: push multiple items at once i=104', () => {
    const r = push([1], 104, 105);
    expect(r.length).toBe(3);
  });
  it('edge test 105: push multiple items at once i=105', () => {
    const r = push([1], 105, 106);
    expect(r.length).toBe(3);
  });
  it('edge test 106: push multiple items at once i=106', () => {
    const r = push([1], 106, 107);
    expect(r.length).toBe(3);
  });
  it('edge test 107: push multiple items at once i=107', () => {
    const r = push([1], 107, 108);
    expect(r.length).toBe(3);
  });
  it('edge test 108: push multiple items at once i=108', () => {
    const r = push([1], 108, 109);
    expect(r.length).toBe(3);
  });
  it('edge test 109: push multiple items at once i=109', () => {
    const r = push([1], 109, 110);
    expect(r.length).toBe(3);
  });
  it('edge test 110: push multiple items at once i=110', () => {
    const r = push([1], 110, 111);
    expect(r.length).toBe(3);
  });
  it('edge test 111: unshift multiple items at once i=111', () => {
    const r = unshift([1], 111, 112);
    expect(r.length).toBe(3);
  });
  it('edge test 112: unshift multiple items at once i=112', () => {
    const r = unshift([1], 112, 113);
    expect(r.length).toBe(3);
  });
  it('edge test 113: unshift multiple items at once i=113', () => {
    const r = unshift([1], 113, 114);
    expect(r.length).toBe(3);
  });
  it('edge test 114: unshift multiple items at once i=114', () => {
    const r = unshift([1], 114, 115);
    expect(r.length).toBe(3);
  });
  it('edge test 115: unshift multiple items at once i=115', () => {
    const r = unshift([1], 115, 116);
    expect(r.length).toBe(3);
  });
  it('edge test 116: unshift multiple items at once i=116', () => {
    const r = unshift([1], 116, 117);
    expect(r.length).toBe(3);
  });
  it('edge test 117: unshift multiple items at once i=117', () => {
    const r = unshift([1], 117, 118);
    expect(r.length).toBe(3);
  });
  it('edge test 118: unshift multiple items at once i=118', () => {
    const r = unshift([1], 118, 119);
    expect(r.length).toBe(3);
  });
  it('edge test 119: unshift multiple items at once i=119', () => {
    const r = unshift([1], 119, 120);
    expect(r.length).toBe(3);
  });
  it('edge test 120: unshift multiple items at once i=120', () => {
    const r = unshift([1], 120, 121);
    expect(r.length).toBe(3);
  });
  it('edge test 121: unshift multiple items at once i=121', () => {
    const r = unshift([1], 121, 122);
    expect(r.length).toBe(3);
  });
  it('edge test 122: unshift multiple items at once i=122', () => {
    const r = unshift([1], 122, 123);
    expect(r.length).toBe(3);
  });
  it('edge test 123: unshift multiple items at once i=123', () => {
    const r = unshift([1], 123, 124);
    expect(r.length).toBe(3);
  });
  it('edge test 124: unshift multiple items at once i=124', () => {
    const r = unshift([1], 124, 125);
    expect(r.length).toBe(3);
  });
  it('edge test 125: unshift multiple items at once i=125', () => {
    const r = unshift([1], 125, 126);
    expect(r.length).toBe(3);
  });
  it('edge test 126: splice with no deleteCount removes from start i=126', () => {
    const a = [1, 2, 3, 126];
    const r = splice(a, 2);
    expect(r.length).toBe(2);
  });
  it('edge test 127: splice with no deleteCount removes from start i=127', () => {
    const a = [1, 2, 3, 127];
    const r = splice(a, 2);
    expect(r.length).toBe(2);
  });
  it('edge test 128: splice with no deleteCount removes from start i=128', () => {
    const a = [1, 2, 3, 128];
    const r = splice(a, 2);
    expect(r.length).toBe(2);
  });
  it('edge test 129: splice with no deleteCount removes from start i=129', () => {
    const a = [1, 2, 3, 129];
    const r = splice(a, 2);
    expect(r.length).toBe(2);
  });
  it('edge test 130: splice with no deleteCount removes from start i=130', () => {
    const a = [1, 2, 3, 130];
    const r = splice(a, 2);
    expect(r.length).toBe(2);
  });
  it('edge test 131: splice with no deleteCount removes from start i=131', () => {
    const a = [1, 2, 3, 131];
    const r = splice(a, 2);
    expect(r.length).toBe(2);
  });
  it('edge test 132: splice with no deleteCount removes from start i=132', () => {
    const a = [1, 2, 3, 132];
    const r = splice(a, 2);
    expect(r.length).toBe(2);
  });
  it('edge test 133: splice with no deleteCount removes from start i=133', () => {
    const a = [1, 2, 3, 133];
    const r = splice(a, 2);
    expect(r.length).toBe(2);
  });
  it('edge test 134: splice with no deleteCount removes from start i=134', () => {
    const a = [1, 2, 3, 134];
    const r = splice(a, 2);
    expect(r.length).toBe(2);
  });
  it('edge test 135: splice with no deleteCount removes from start i=135', () => {
    const a = [1, 2, 3, 135];
    const r = splice(a, 2);
    expect(r.length).toBe(2);
  });
  it('edge test 136: splice with no deleteCount removes from start i=136', () => {
    const a = [1, 2, 3, 136];
    const r = splice(a, 2);
    expect(r.length).toBe(2);
  });
  it('edge test 137: splice with no deleteCount removes from start i=137', () => {
    const a = [1, 2, 3, 137];
    const r = splice(a, 2);
    expect(r.length).toBe(2);
  });
  it('edge test 138: splice with no deleteCount removes from start i=138', () => {
    const a = [1, 2, 3, 138];
    const r = splice(a, 2);
    expect(r.length).toBe(2);
  });
  it('edge test 139: splice with no deleteCount removes from start i=139', () => {
    const a = [1, 2, 3, 139];
    const r = splice(a, 2);
    expect(r.length).toBe(2);
  });
  it('edge test 140: splice with no deleteCount removes from start i=140', () => {
    const a = [1, 2, 3, 140];
    const r = splice(a, 2);
    expect(r.length).toBe(2);
  });
  it('edge test 141: pick with empty keys returns empty object i=141', () => {
    const r = pick({ a: 141 }, [] as never[]);
    expect(Object.keys(r).length).toBe(0);
  });
  it('edge test 142: pick with empty keys returns empty object i=142', () => {
    const r = pick({ a: 142 }, [] as never[]);
    expect(Object.keys(r).length).toBe(0);
  });
  it('edge test 143: pick with empty keys returns empty object i=143', () => {
    const r = pick({ a: 143 }, [] as never[]);
    expect(Object.keys(r).length).toBe(0);
  });
  it('edge test 144: pick with empty keys returns empty object i=144', () => {
    const r = pick({ a: 144 }, [] as never[]);
    expect(Object.keys(r).length).toBe(0);
  });
  it('edge test 145: pick with empty keys returns empty object i=145', () => {
    const r = pick({ a: 145 }, [] as never[]);
    expect(Object.keys(r).length).toBe(0);
  });
  it('edge test 146: pick with empty keys returns empty object i=146', () => {
    const r = pick({ a: 146 }, [] as never[]);
    expect(Object.keys(r).length).toBe(0);
  });
  it('edge test 147: pick with empty keys returns empty object i=147', () => {
    const r = pick({ a: 147 }, [] as never[]);
    expect(Object.keys(r).length).toBe(0);
  });
  it('edge test 148: pick with empty keys returns empty object i=148', () => {
    const r = pick({ a: 148 }, [] as never[]);
    expect(Object.keys(r).length).toBe(0);
  });
  it('edge test 149: pick with empty keys returns empty object i=149', () => {
    const r = pick({ a: 149 }, [] as never[]);
    expect(Object.keys(r).length).toBe(0);
  });
  it('edge test 150: pick with empty keys returns empty object i=150', () => {
    const r = pick({ a: 150 }, [] as never[]);
    expect(Object.keys(r).length).toBe(0);
  });
  it('edge test 151: pick with empty keys returns empty object i=151', () => {
    const r = pick({ a: 151 }, [] as never[]);
    expect(Object.keys(r).length).toBe(0);
  });
  it('edge test 152: pick with empty keys returns empty object i=152', () => {
    const r = pick({ a: 152 }, [] as never[]);
    expect(Object.keys(r).length).toBe(0);
  });
  it('edge test 153: pick with empty keys returns empty object i=153', () => {
    const r = pick({ a: 153 }, [] as never[]);
    expect(Object.keys(r).length).toBe(0);
  });
  it('edge test 154: pick with empty keys returns empty object i=154', () => {
    const r = pick({ a: 154 }, [] as never[]);
    expect(Object.keys(r).length).toBe(0);
  });
  it('edge test 155: pick with empty keys returns empty object i=155', () => {
    const r = pick({ a: 155 }, [] as never[]);
    expect(Object.keys(r).length).toBe(0);
  });
  it('edge test 156: omit with empty keys returns copy i=156', () => {
    const o = { a: 156 };
    const r = omit(o, [] as never[]);
    expect((r as any).a).toBe(156);
  });
  it('edge test 157: omit with empty keys returns copy i=157', () => {
    const o = { a: 157 };
    const r = omit(o, [] as never[]);
    expect((r as any).a).toBe(157);
  });
  it('edge test 158: omit with empty keys returns copy i=158', () => {
    const o = { a: 158 };
    const r = omit(o, [] as never[]);
    expect((r as any).a).toBe(158);
  });
  it('edge test 159: omit with empty keys returns copy i=159', () => {
    const o = { a: 159 };
    const r = omit(o, [] as never[]);
    expect((r as any).a).toBe(159);
  });
  it('edge test 160: omit with empty keys returns copy i=160', () => {
    const o = { a: 160 };
    const r = omit(o, [] as never[]);
    expect((r as any).a).toBe(160);
  });
  it('edge test 161: omit with empty keys returns copy i=161', () => {
    const o = { a: 161 };
    const r = omit(o, [] as never[]);
    expect((r as any).a).toBe(161);
  });
  it('edge test 162: omit with empty keys returns copy i=162', () => {
    const o = { a: 162 };
    const r = omit(o, [] as never[]);
    expect((r as any).a).toBe(162);
  });
  it('edge test 163: omit with empty keys returns copy i=163', () => {
    const o = { a: 163 };
    const r = omit(o, [] as never[]);
    expect((r as any).a).toBe(163);
  });
  it('edge test 164: omit with empty keys returns copy i=164', () => {
    const o = { a: 164 };
    const r = omit(o, [] as never[]);
    expect((r as any).a).toBe(164);
  });
  it('edge test 165: omit with empty keys returns copy i=165', () => {
    const o = { a: 165 };
    const r = omit(o, [] as never[]);
    expect((r as any).a).toBe(165);
  });
  it('edge test 166: omit with empty keys returns copy i=166', () => {
    const o = { a: 166 };
    const r = omit(o, [] as never[]);
    expect((r as any).a).toBe(166);
  });
  it('edge test 167: omit with empty keys returns copy i=167', () => {
    const o = { a: 167 };
    const r = omit(o, [] as never[]);
    expect((r as any).a).toBe(167);
  });
  it('edge test 168: omit with empty keys returns copy i=168', () => {
    const o = { a: 168 };
    const r = omit(o, [] as never[]);
    expect((r as any).a).toBe(168);
  });
  it('edge test 169: omit with empty keys returns copy i=169', () => {
    const o = { a: 169 };
    const r = omit(o, [] as never[]);
    expect((r as any).a).toBe(169);
  });
  it('edge test 170: omit with empty keys returns copy i=170', () => {
    const o = { a: 170 };
    const r = omit(o, [] as never[]);
    expect((r as any).a).toBe(170);
  });
  it('edge test 171: merge multiple sources last wins i=171', () => {
    const r = merge({ v: 1 }, { v: 171 }, { v: 172 });
    expect(r.v).toBe(172);
  });
  it('edge test 172: merge multiple sources last wins i=172', () => {
    const r = merge({ v: 1 }, { v: 172 }, { v: 173 });
    expect(r.v).toBe(173);
  });
  it('edge test 173: merge multiple sources last wins i=173', () => {
    const r = merge({ v: 1 }, { v: 173 }, { v: 174 });
    expect(r.v).toBe(174);
  });
  it('edge test 174: merge multiple sources last wins i=174', () => {
    const r = merge({ v: 1 }, { v: 174 }, { v: 175 });
    expect(r.v).toBe(175);
  });
  it('edge test 175: merge multiple sources last wins i=175', () => {
    const r = merge({ v: 1 }, { v: 175 }, { v: 176 });
    expect(r.v).toBe(176);
  });
  it('edge test 176: merge multiple sources last wins i=176', () => {
    const r = merge({ v: 1 }, { v: 176 }, { v: 177 });
    expect(r.v).toBe(177);
  });
  it('edge test 177: merge multiple sources last wins i=177', () => {
    const r = merge({ v: 1 }, { v: 177 }, { v: 178 });
    expect(r.v).toBe(178);
  });
  it('edge test 178: merge multiple sources last wins i=178', () => {
    const r = merge({ v: 1 }, { v: 178 }, { v: 179 });
    expect(r.v).toBe(179);
  });
  it('edge test 179: merge multiple sources last wins i=179', () => {
    const r = merge({ v: 1 }, { v: 179 }, { v: 180 });
    expect(r.v).toBe(180);
  });
  it('edge test 180: merge multiple sources last wins i=180', () => {
    const r = merge({ v: 1 }, { v: 180 }, { v: 181 });
    expect(r.v).toBe(181);
  });
  it('edge test 181: merge multiple sources last wins i=181', () => {
    const r = merge({ v: 1 }, { v: 181 }, { v: 182 });
    expect(r.v).toBe(182);
  });
  it('edge test 182: merge multiple sources last wins i=182', () => {
    const r = merge({ v: 1 }, { v: 182 }, { v: 183 });
    expect(r.v).toBe(183);
  });
  it('edge test 183: merge multiple sources last wins i=183', () => {
    const r = merge({ v: 1 }, { v: 183 }, { v: 184 });
    expect(r.v).toBe(184);
  });
  it('edge test 184: merge multiple sources last wins i=184', () => {
    const r = merge({ v: 1 }, { v: 184 }, { v: 185 });
    expect(r.v).toBe(185);
  });
  it('edge test 185: merge multiple sources last wins i=185', () => {
    const r = merge({ v: 1 }, { v: 185 }, { v: 186 });
    expect(r.v).toBe(186);
  });
  it('edge test 186: setKey adds new key to map i=186', () => {
    const m = new Map<string, number>();
    const r = setKey(m, 'new186', 186);
    expect(r.get('new186')).toBe(186);
  });
  it('edge test 187: setKey adds new key to map i=187', () => {
    const m = new Map<string, number>();
    const r = setKey(m, 'new187', 187);
    expect(r.get('new187')).toBe(187);
  });
  it('edge test 188: setKey adds new key to map i=188', () => {
    const m = new Map<string, number>();
    const r = setKey(m, 'new188', 188);
    expect(r.get('new188')).toBe(188);
  });
  it('edge test 189: setKey adds new key to map i=189', () => {
    const m = new Map<string, number>();
    const r = setKey(m, 'new189', 189);
    expect(r.get('new189')).toBe(189);
  });
  it('edge test 190: setKey adds new key to map i=190', () => {
    const m = new Map<string, number>();
    const r = setKey(m, 'new190', 190);
    expect(r.get('new190')).toBe(190);
  });
  it('edge test 191: setKey adds new key to map i=191', () => {
    const m = new Map<string, number>();
    const r = setKey(m, 'new191', 191);
    expect(r.get('new191')).toBe(191);
  });
  it('edge test 192: setKey adds new key to map i=192', () => {
    const m = new Map<string, number>();
    const r = setKey(m, 'new192', 192);
    expect(r.get('new192')).toBe(192);
  });
  it('edge test 193: setKey adds new key to map i=193', () => {
    const m = new Map<string, number>();
    const r = setKey(m, 'new193', 193);
    expect(r.get('new193')).toBe(193);
  });
  it('edge test 194: setKey adds new key to map i=194', () => {
    const m = new Map<string, number>();
    const r = setKey(m, 'new194', 194);
    expect(r.get('new194')).toBe(194);
  });
  it('edge test 195: setKey adds new key to map i=195', () => {
    const m = new Map<string, number>();
    const r = setKey(m, 'new195', 195);
    expect(r.get('new195')).toBe(195);
  });
  it('edge test 196: setKey adds new key to map i=196', () => {
    const m = new Map<string, number>();
    const r = setKey(m, 'new196', 196);
    expect(r.get('new196')).toBe(196);
  });
  it('edge test 197: setKey adds new key to map i=197', () => {
    const m = new Map<string, number>();
    const r = setKey(m, 'new197', 197);
    expect(r.get('new197')).toBe(197);
  });
  it('edge test 198: setKey adds new key to map i=198', () => {
    const m = new Map<string, number>();
    const r = setKey(m, 'new198', 198);
    expect(r.get('new198')).toBe(198);
  });
  it('edge test 199: setKey adds new key to map i=199', () => {
    const m = new Map<string, number>();
    const r = setKey(m, 'new199', 199);
    expect(r.get('new199')).toBe(199);
  });
  it('edge test 200: setKey adds new key to map i=200', () => {
    const m = new Map<string, number>();
    const r = setKey(m, 'new200', 200);
    expect(r.get('new200')).toBe(200);
  });
  it('edge test 201: deleteKey non-existent key returns same size i=201', () => {
    const m = new Map([['a', 201]]);
    const r = deleteKey(m, 'z');
    expect(r.size).toBe(1);
  });
  it('edge test 202: deleteKey non-existent key returns same size i=202', () => {
    const m = new Map([['a', 202]]);
    const r = deleteKey(m, 'z');
    expect(r.size).toBe(1);
  });
  it('edge test 203: deleteKey non-existent key returns same size i=203', () => {
    const m = new Map([['a', 203]]);
    const r = deleteKey(m, 'z');
    expect(r.size).toBe(1);
  });
  it('edge test 204: deleteKey non-existent key returns same size i=204', () => {
    const m = new Map([['a', 204]]);
    const r = deleteKey(m, 'z');
    expect(r.size).toBe(1);
  });
  it('edge test 205: deleteKey non-existent key returns same size i=205', () => {
    const m = new Map([['a', 205]]);
    const r = deleteKey(m, 'z');
    expect(r.size).toBe(1);
  });
  it('edge test 206: deleteKey non-existent key returns same size i=206', () => {
    const m = new Map([['a', 206]]);
    const r = deleteKey(m, 'z');
    expect(r.size).toBe(1);
  });
  it('edge test 207: deleteKey non-existent key returns same size i=207', () => {
    const m = new Map([['a', 207]]);
    const r = deleteKey(m, 'z');
    expect(r.size).toBe(1);
  });
  it('edge test 208: deleteKey non-existent key returns same size i=208', () => {
    const m = new Map([['a', 208]]);
    const r = deleteKey(m, 'z');
    expect(r.size).toBe(1);
  });
  it('edge test 209: deleteKey non-existent key returns same size i=209', () => {
    const m = new Map([['a', 209]]);
    const r = deleteKey(m, 'z');
    expect(r.size).toBe(1);
  });
  it('edge test 210: deleteKey non-existent key returns same size i=210', () => {
    const m = new Map([['a', 210]]);
    const r = deleteKey(m, 'z');
    expect(r.size).toBe(1);
  });
  it('edge test 211: deleteKey non-existent key returns same size i=211', () => {
    const m = new Map([['a', 211]]);
    const r = deleteKey(m, 'z');
    expect(r.size).toBe(1);
  });
  it('edge test 212: deleteKey non-existent key returns same size i=212', () => {
    const m = new Map([['a', 212]]);
    const r = deleteKey(m, 'z');
    expect(r.size).toBe(1);
  });
  it('edge test 213: deleteKey non-existent key returns same size i=213', () => {
    const m = new Map([['a', 213]]);
    const r = deleteKey(m, 'z');
    expect(r.size).toBe(1);
  });
  it('edge test 214: deleteKey non-existent key returns same size i=214', () => {
    const m = new Map([['a', 214]]);
    const r = deleteKey(m, 'z');
    expect(r.size).toBe(1);
  });
  it('edge test 215: deleteKey non-existent key returns same size i=215', () => {
    const m = new Map([['a', 215]]);
    const r = deleteKey(m, 'z');
    expect(r.size).toBe(1);
  });
  it('edge test 216: sort with no compareFn sorts lexicographically i=216', () => {
    const a = ['b216', 'a216', 'c216'];
    const r = sort(a);
    expect(r[0]).toBe('a216');
  });
  it('edge test 217: sort with no compareFn sorts lexicographically i=217', () => {
    const a = ['b217', 'a217', 'c217'];
    const r = sort(a);
    expect(r[0]).toBe('a217');
  });
  it('edge test 218: sort with no compareFn sorts lexicographically i=218', () => {
    const a = ['b218', 'a218', 'c218'];
    const r = sort(a);
    expect(r[0]).toBe('a218');
  });
  it('edge test 219: sort with no compareFn sorts lexicographically i=219', () => {
    const a = ['b219', 'a219', 'c219'];
    const r = sort(a);
    expect(r[0]).toBe('a219');
  });
  it('edge test 220: sort with no compareFn sorts lexicographically i=220', () => {
    const a = ['b220', 'a220', 'c220'];
    const r = sort(a);
    expect(r[0]).toBe('a220');
  });
  it('edge test 221: sort with no compareFn sorts lexicographically i=221', () => {
    const a = ['b221', 'a221', 'c221'];
    const r = sort(a);
    expect(r[0]).toBe('a221');
  });
  it('edge test 222: sort with no compareFn sorts lexicographically i=222', () => {
    const a = ['b222', 'a222', 'c222'];
    const r = sort(a);
    expect(r[0]).toBe('a222');
  });
  it('edge test 223: sort with no compareFn sorts lexicographically i=223', () => {
    const a = ['b223', 'a223', 'c223'];
    const r = sort(a);
    expect(r[0]).toBe('a223');
  });
  it('edge test 224: sort with no compareFn sorts lexicographically i=224', () => {
    const a = ['b224', 'a224', 'c224'];
    const r = sort(a);
    expect(r[0]).toBe('a224');
  });
  it('edge test 225: sort with no compareFn sorts lexicographically i=225', () => {
    const a = ['b225', 'a225', 'c225'];
    const r = sort(a);
    expect(r[0]).toBe('a225');
  });
  it('edge test 226: sort with no compareFn sorts lexicographically i=226', () => {
    const a = ['b226', 'a226', 'c226'];
    const r = sort(a);
    expect(r[0]).toBe('a226');
  });
  it('edge test 227: sort with no compareFn sorts lexicographically i=227', () => {
    const a = ['b227', 'a227', 'c227'];
    const r = sort(a);
    expect(r[0]).toBe('a227');
  });
  it('edge test 228: sort with no compareFn sorts lexicographically i=228', () => {
    const a = ['b228', 'a228', 'c228'];
    const r = sort(a);
    expect(r[0]).toBe('a228');
  });
  it('edge test 229: sort with no compareFn sorts lexicographically i=229', () => {
    const a = ['b229', 'a229', 'c229'];
    const r = sort(a);
    expect(r[0]).toBe('a229');
  });
  it('edge test 230: sort with no compareFn sorts lexicographically i=230', () => {
    const a = ['b230', 'a230', 'c230'];
    const r = sort(a);
    expect(r[0]).toBe('a230');
  });
  it('edge test 231: reverse empty array returns empty i=231', () => {
    expect(reverse([])).toEqual([]);
  });
  it('edge test 232: reverse empty array returns empty i=232', () => {
    expect(reverse([])).toEqual([]);
  });
  it('edge test 233: reverse empty array returns empty i=233', () => {
    expect(reverse([])).toEqual([]);
  });
  it('edge test 234: reverse empty array returns empty i=234', () => {
    expect(reverse([])).toEqual([]);
  });
  it('edge test 235: reverse empty array returns empty i=235', () => {
    expect(reverse([])).toEqual([]);
  });
  it('edge test 236: reverse empty array returns empty i=236', () => {
    expect(reverse([])).toEqual([]);
  });
  it('edge test 237: reverse empty array returns empty i=237', () => {
    expect(reverse([])).toEqual([]);
  });
  it('edge test 238: reverse empty array returns empty i=238', () => {
    expect(reverse([])).toEqual([]);
  });
  it('edge test 239: reverse empty array returns empty i=239', () => {
    expect(reverse([])).toEqual([]);
  });
  it('edge test 240: reverse empty array returns empty i=240', () => {
    expect(reverse([])).toEqual([]);
  });
  it('edge test 241: reverse empty array returns empty i=241', () => {
    expect(reverse([])).toEqual([]);
  });
  it('edge test 242: reverse empty array returns empty i=242', () => {
    expect(reverse([])).toEqual([]);
  });
  it('edge test 243: reverse empty array returns empty i=243', () => {
    expect(reverse([])).toEqual([]);
  });
  it('edge test 244: reverse empty array returns empty i=244', () => {
    expect(reverse([])).toEqual([]);
  });
  it('edge test 245: reverse empty array returns empty i=245', () => {
    expect(reverse([])).toEqual([]);
  });
  it('edge test 246: pop single-element array returns empty i=246', () => {
    expect(pop([246])).toEqual([]);
  });
  it('edge test 247: pop single-element array returns empty i=247', () => {
    expect(pop([247])).toEqual([]);
  });
  it('edge test 248: pop single-element array returns empty i=248', () => {
    expect(pop([248])).toEqual([]);
  });
  it('edge test 249: pop single-element array returns empty i=249', () => {
    expect(pop([249])).toEqual([]);
  });
  it('edge test 250: pop single-element array returns empty i=250', () => {
    expect(pop([250])).toEqual([]);
  });
  it('edge test 251: pop single-element array returns empty i=251', () => {
    expect(pop([251])).toEqual([]);
  });
  it('edge test 252: pop single-element array returns empty i=252', () => {
    expect(pop([252])).toEqual([]);
  });
  it('edge test 253: pop single-element array returns empty i=253', () => {
    expect(pop([253])).toEqual([]);
  });
  it('edge test 254: pop single-element array returns empty i=254', () => {
    expect(pop([254])).toEqual([]);
  });
  it('edge test 255: pop single-element array returns empty i=255', () => {
    expect(pop([255])).toEqual([]);
  });
  it('edge test 256: pop single-element array returns empty i=256', () => {
    expect(pop([256])).toEqual([]);
  });
  it('edge test 257: pop single-element array returns empty i=257', () => {
    expect(pop([257])).toEqual([]);
  });
  it('edge test 258: pop single-element array returns empty i=258', () => {
    expect(pop([258])).toEqual([]);
  });
  it('edge test 259: pop single-element array returns empty i=259', () => {
    expect(pop([259])).toEqual([]);
  });
  it('edge test 260: pop single-element array returns empty i=260', () => {
    expect(pop([260])).toEqual([]);
  });
  it('edge test 261: shift single-element array returns empty i=261', () => {
    expect(shift([261])).toEqual([]);
  });
  it('edge test 262: shift single-element array returns empty i=262', () => {
    expect(shift([262])).toEqual([]);
  });
  it('edge test 263: shift single-element array returns empty i=263', () => {
    expect(shift([263])).toEqual([]);
  });
  it('edge test 264: shift single-element array returns empty i=264', () => {
    expect(shift([264])).toEqual([]);
  });
  it('edge test 265: shift single-element array returns empty i=265', () => {
    expect(shift([265])).toEqual([]);
  });
  it('edge test 266: shift single-element array returns empty i=266', () => {
    expect(shift([266])).toEqual([]);
  });
  it('edge test 267: shift single-element array returns empty i=267', () => {
    expect(shift([267])).toEqual([]);
  });
  it('edge test 268: shift single-element array returns empty i=268', () => {
    expect(shift([268])).toEqual([]);
  });
  it('edge test 269: shift single-element array returns empty i=269', () => {
    expect(shift([269])).toEqual([]);
  });
  it('edge test 270: shift single-element array returns empty i=270', () => {
    expect(shift([270])).toEqual([]);
  });
  it('edge test 271: shift single-element array returns empty i=271', () => {
    expect(shift([271])).toEqual([]);
  });
  it('edge test 272: shift single-element array returns empty i=272', () => {
    expect(shift([272])).toEqual([]);
  });
  it('edge test 273: shift single-element array returns empty i=273', () => {
    expect(shift([273])).toEqual([]);
  });
  it('edge test 274: shift single-element array returns empty i=274', () => {
    expect(shift([274])).toEqual([]);
  });
  it('edge test 275: shift single-element array returns empty i=275', () => {
    expect(shift([275])).toEqual([]);
  });
  it('edge test 276: updateAt identity fn returns same values i=276', () => {
    const a = [276, 277];
    const r = updateAt(a, 0, v => v);
    expect(r[0]).toBe(276);
  });
  it('edge test 277: updateAt identity fn returns same values i=277', () => {
    const a = [277, 278];
    const r = updateAt(a, 0, v => v);
    expect(r[0]).toBe(277);
  });
  it('edge test 278: updateAt identity fn returns same values i=278', () => {
    const a = [278, 279];
    const r = updateAt(a, 0, v => v);
    expect(r[0]).toBe(278);
  });
  it('edge test 279: updateAt identity fn returns same values i=279', () => {
    const a = [279, 280];
    const r = updateAt(a, 0, v => v);
    expect(r[0]).toBe(279);
  });
  it('edge test 280: updateAt identity fn returns same values i=280', () => {
    const a = [280, 281];
    const r = updateAt(a, 0, v => v);
    expect(r[0]).toBe(280);
  });
  it('edge test 281: updateAt identity fn returns same values i=281', () => {
    const a = [281, 282];
    const r = updateAt(a, 0, v => v);
    expect(r[0]).toBe(281);
  });
  it('edge test 282: updateAt identity fn returns same values i=282', () => {
    const a = [282, 283];
    const r = updateAt(a, 0, v => v);
    expect(r[0]).toBe(282);
  });
  it('edge test 283: updateAt identity fn returns same values i=283', () => {
    const a = [283, 284];
    const r = updateAt(a, 0, v => v);
    expect(r[0]).toBe(283);
  });
  it('edge test 284: updateAt identity fn returns same values i=284', () => {
    const a = [284, 285];
    const r = updateAt(a, 0, v => v);
    expect(r[0]).toBe(284);
  });
  it('edge test 285: updateAt identity fn returns same values i=285', () => {
    const a = [285, 286];
    const r = updateAt(a, 0, v => v);
    expect(r[0]).toBe(285);
  });
  it('edge test 286: updateAt identity fn returns same values i=286', () => {
    const a = [286, 287];
    const r = updateAt(a, 0, v => v);
    expect(r[0]).toBe(286);
  });
  it('edge test 287: updateAt identity fn returns same values i=287', () => {
    const a = [287, 288];
    const r = updateAt(a, 0, v => v);
    expect(r[0]).toBe(287);
  });
  it('edge test 288: updateAt identity fn returns same values i=288', () => {
    const a = [288, 289];
    const r = updateAt(a, 0, v => v);
    expect(r[0]).toBe(288);
  });
  it('edge test 289: updateAt identity fn returns same values i=289', () => {
    const a = [289, 290];
    const r = updateAt(a, 0, v => v);
    expect(r[0]).toBe(289);
  });
  it('edge test 290: updateAt identity fn returns same values i=290', () => {
    const a = [290, 291];
    const r = updateAt(a, 0, v => v);
    expect(r[0]).toBe(290);
  });
  it('edge test 291: setAt same value is idempotent i=291', () => {
    const a = [291, 292];
    const r = setAt(a, 0, 291);
    expect(r[0]).toBe(291);
  });
  it('edge test 292: setAt same value is idempotent i=292', () => {
    const a = [292, 293];
    const r = setAt(a, 0, 292);
    expect(r[0]).toBe(292);
  });
  it('edge test 293: setAt same value is idempotent i=293', () => {
    const a = [293, 294];
    const r = setAt(a, 0, 293);
    expect(r[0]).toBe(293);
  });
  it('edge test 294: setAt same value is idempotent i=294', () => {
    const a = [294, 295];
    const r = setAt(a, 0, 294);
    expect(r[0]).toBe(294);
  });
  it('edge test 295: setAt same value is idempotent i=295', () => {
    const a = [295, 296];
    const r = setAt(a, 0, 295);
    expect(r[0]).toBe(295);
  });
  it('edge test 296: setAt same value is idempotent i=296', () => {
    const a = [296, 297];
    const r = setAt(a, 0, 296);
    expect(r[0]).toBe(296);
  });
  it('edge test 297: setAt same value is idempotent i=297', () => {
    const a = [297, 298];
    const r = setAt(a, 0, 297);
    expect(r[0]).toBe(297);
  });
  it('edge test 298: setAt same value is idempotent i=298', () => {
    const a = [298, 299];
    const r = setAt(a, 0, 298);
    expect(r[0]).toBe(298);
  });
  it('edge test 299: setAt same value is idempotent i=299', () => {
    const a = [299, 300];
    const r = setAt(a, 0, 299);
    expect(r[0]).toBe(299);
  });
  it('edge test 300: setAt same value is idempotent i=300', () => {
    const a = [300, 301];
    const r = setAt(a, 0, 300);
    expect(r[0]).toBe(300);
  });
  it('edge test 301: setAt same value is idempotent i=301', () => {
    const a = [301, 302];
    const r = setAt(a, 0, 301);
    expect(r[0]).toBe(301);
  });
  it('edge test 302: setAt same value is idempotent i=302', () => {
    const a = [302, 303];
    const r = setAt(a, 0, 302);
    expect(r[0]).toBe(302);
  });
  it('edge test 303: setAt same value is idempotent i=303', () => {
    const a = [303, 304];
    const r = setAt(a, 0, 303);
    expect(r[0]).toBe(303);
  });
  it('edge test 304: setAt same value is idempotent i=304', () => {
    const a = [304, 305];
    const r = setAt(a, 0, 304);
    expect(r[0]).toBe(304);
  });
  it('edge test 305: setAt same value is idempotent i=305', () => {
    const a = [305, 306];
    const r = setAt(a, 0, 305);
    expect(r[0]).toBe(305);
  });
});
