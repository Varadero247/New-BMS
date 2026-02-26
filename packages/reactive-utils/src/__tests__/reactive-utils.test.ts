// Copyright (c) 2026 Nexara DMCC. All rights reserved.

import {
  createSignal,
  createComputed,
  createEffect,
  fromArray,
  mapStream,
  filterStream,
  takeStream,
  dropStream,
  scanStream,
  flatMapStream,
  zipStream,
  mergeArrays,
  distinctStream,
  chunkStream,
  windowStream,
  groupByStream,
  partitionStream,
  reduceStream,
  countByStream,
  sumStream,
  maxStream,
  minStream,
  avgStream,
} from '../reactive-utils';

describe('createSignal', () => {
  it('signal stores and retrieves value 0', () => {
    const s = createSignal(0);
    expect(s.get()).toBe(0);
  });
  it('signal stores and retrieves value 1', () => {
    const s = createSignal(1);
    expect(s.get()).toBe(1);
  });
  it('signal stores and retrieves value 2', () => {
    const s = createSignal(2);
    expect(s.get()).toBe(2);
  });
  it('signal stores and retrieves value 3', () => {
    const s = createSignal(3);
    expect(s.get()).toBe(3);
  });
  it('signal stores and retrieves value 4', () => {
    const s = createSignal(4);
    expect(s.get()).toBe(4);
  });
  it('signal stores and retrieves value 5', () => {
    const s = createSignal(5);
    expect(s.get()).toBe(5);
  });
  it('signal stores and retrieves value 6', () => {
    const s = createSignal(6);
    expect(s.get()).toBe(6);
  });
  it('signal stores and retrieves value 7', () => {
    const s = createSignal(7);
    expect(s.get()).toBe(7);
  });
  it('signal stores and retrieves value 8', () => {
    const s = createSignal(8);
    expect(s.get()).toBe(8);
  });
  it('signal stores and retrieves value 9', () => {
    const s = createSignal(9);
    expect(s.get()).toBe(9);
  });
  it('signal stores and retrieves value 10', () => {
    const s = createSignal(10);
    expect(s.get()).toBe(10);
  });
  it('signal stores and retrieves value 11', () => {
    const s = createSignal(11);
    expect(s.get()).toBe(11);
  });
  it('signal stores and retrieves value 12', () => {
    const s = createSignal(12);
    expect(s.get()).toBe(12);
  });
  it('signal stores and retrieves value 13', () => {
    const s = createSignal(13);
    expect(s.get()).toBe(13);
  });
  it('signal stores and retrieves value 14', () => {
    const s = createSignal(14);
    expect(s.get()).toBe(14);
  });
  it('signal stores and retrieves value 15', () => {
    const s = createSignal(15);
    expect(s.get()).toBe(15);
  });
  it('signal stores and retrieves value 16', () => {
    const s = createSignal(16);
    expect(s.get()).toBe(16);
  });
  it('signal stores and retrieves value 17', () => {
    const s = createSignal(17);
    expect(s.get()).toBe(17);
  });
  it('signal stores and retrieves value 18', () => {
    const s = createSignal(18);
    expect(s.get()).toBe(18);
  });
  it('signal stores and retrieves value 19', () => {
    const s = createSignal(19);
    expect(s.get()).toBe(19);
  });
  it('signal stores and retrieves value 20', () => {
    const s = createSignal(20);
    expect(s.get()).toBe(20);
  });
  it('signal stores and retrieves value 21', () => {
    const s = createSignal(21);
    expect(s.get()).toBe(21);
  });
  it('signal stores and retrieves value 22', () => {
    const s = createSignal(22);
    expect(s.get()).toBe(22);
  });
  it('signal stores and retrieves value 23', () => {
    const s = createSignal(23);
    expect(s.get()).toBe(23);
  });
  it('signal stores and retrieves value 24', () => {
    const s = createSignal(24);
    expect(s.get()).toBe(24);
  });
  it('signal stores and retrieves value 25', () => {
    const s = createSignal(25);
    expect(s.get()).toBe(25);
  });
  it('signal stores and retrieves value 26', () => {
    const s = createSignal(26);
    expect(s.get()).toBe(26);
  });
  it('signal stores and retrieves value 27', () => {
    const s = createSignal(27);
    expect(s.get()).toBe(27);
  });
  it('signal stores and retrieves value 28', () => {
    const s = createSignal(28);
    expect(s.get()).toBe(28);
  });
  it('signal stores and retrieves value 29', () => {
    const s = createSignal(29);
    expect(s.get()).toBe(29);
  });
  it('signal stores and retrieves value 30', () => {
    const s = createSignal(30);
    expect(s.get()).toBe(30);
  });
  it('signal stores and retrieves value 31', () => {
    const s = createSignal(31);
    expect(s.get()).toBe(31);
  });
  it('signal stores and retrieves value 32', () => {
    const s = createSignal(32);
    expect(s.get()).toBe(32);
  });
  it('signal stores and retrieves value 33', () => {
    const s = createSignal(33);
    expect(s.get()).toBe(33);
  });
  it('signal stores and retrieves value 34', () => {
    const s = createSignal(34);
    expect(s.get()).toBe(34);
  });
  it('signal stores and retrieves value 35', () => {
    const s = createSignal(35);
    expect(s.get()).toBe(35);
  });
  it('signal stores and retrieves value 36', () => {
    const s = createSignal(36);
    expect(s.get()).toBe(36);
  });
  it('signal stores and retrieves value 37', () => {
    const s = createSignal(37);
    expect(s.get()).toBe(37);
  });
  it('signal stores and retrieves value 38', () => {
    const s = createSignal(38);
    expect(s.get()).toBe(38);
  });
  it('signal stores and retrieves value 39', () => {
    const s = createSignal(39);
    expect(s.get()).toBe(39);
  });
  it('signal stores and retrieves value 40', () => {
    const s = createSignal(40);
    expect(s.get()).toBe(40);
  });
  it('signal stores and retrieves value 41', () => {
    const s = createSignal(41);
    expect(s.get()).toBe(41);
  });
  it('signal stores and retrieves value 42', () => {
    const s = createSignal(42);
    expect(s.get()).toBe(42);
  });
  it('signal stores and retrieves value 43', () => {
    const s = createSignal(43);
    expect(s.get()).toBe(43);
  });
  it('signal stores and retrieves value 44', () => {
    const s = createSignal(44);
    expect(s.get()).toBe(44);
  });
  it('signal stores and retrieves value 45', () => {
    const s = createSignal(45);
    expect(s.get()).toBe(45);
  });
  it('signal stores and retrieves value 46', () => {
    const s = createSignal(46);
    expect(s.get()).toBe(46);
  });
  it('signal stores and retrieves value 47', () => {
    const s = createSignal(47);
    expect(s.get()).toBe(47);
  });
  it('signal stores and retrieves value 48', () => {
    const s = createSignal(48);
    expect(s.get()).toBe(48);
  });
  it('signal stores and retrieves value 49', () => {
    const s = createSignal(49);
    expect(s.get()).toBe(49);
  });
});

describe('createSignal set', () => {
  it('signal updates from 0 to 1', () => {
    const s = createSignal(0);
    s.set(1);
    expect(s.get()).toBe(1);
  });
  it('signal updates from 1 to 3', () => {
    const s = createSignal(1);
    s.set(3);
    expect(s.get()).toBe(3);
  });
  it('signal updates from 2 to 5', () => {
    const s = createSignal(2);
    s.set(5);
    expect(s.get()).toBe(5);
  });
  it('signal updates from 3 to 7', () => {
    const s = createSignal(3);
    s.set(7);
    expect(s.get()).toBe(7);
  });
  it('signal updates from 4 to 9', () => {
    const s = createSignal(4);
    s.set(9);
    expect(s.get()).toBe(9);
  });
  it('signal updates from 5 to 11', () => {
    const s = createSignal(5);
    s.set(11);
    expect(s.get()).toBe(11);
  });
  it('signal updates from 6 to 13', () => {
    const s = createSignal(6);
    s.set(13);
    expect(s.get()).toBe(13);
  });
  it('signal updates from 7 to 15', () => {
    const s = createSignal(7);
    s.set(15);
    expect(s.get()).toBe(15);
  });
  it('signal updates from 8 to 17', () => {
    const s = createSignal(8);
    s.set(17);
    expect(s.get()).toBe(17);
  });
  it('signal updates from 9 to 19', () => {
    const s = createSignal(9);
    s.set(19);
    expect(s.get()).toBe(19);
  });
  it('signal updates from 10 to 21', () => {
    const s = createSignal(10);
    s.set(21);
    expect(s.get()).toBe(21);
  });
  it('signal updates from 11 to 23', () => {
    const s = createSignal(11);
    s.set(23);
    expect(s.get()).toBe(23);
  });
  it('signal updates from 12 to 25', () => {
    const s = createSignal(12);
    s.set(25);
    expect(s.get()).toBe(25);
  });
  it('signal updates from 13 to 27', () => {
    const s = createSignal(13);
    s.set(27);
    expect(s.get()).toBe(27);
  });
  it('signal updates from 14 to 29', () => {
    const s = createSignal(14);
    s.set(29);
    expect(s.get()).toBe(29);
  });
  it('signal updates from 15 to 31', () => {
    const s = createSignal(15);
    s.set(31);
    expect(s.get()).toBe(31);
  });
  it('signal updates from 16 to 33', () => {
    const s = createSignal(16);
    s.set(33);
    expect(s.get()).toBe(33);
  });
  it('signal updates from 17 to 35', () => {
    const s = createSignal(17);
    s.set(35);
    expect(s.get()).toBe(35);
  });
  it('signal updates from 18 to 37', () => {
    const s = createSignal(18);
    s.set(37);
    expect(s.get()).toBe(37);
  });
  it('signal updates from 19 to 39', () => {
    const s = createSignal(19);
    s.set(39);
    expect(s.get()).toBe(39);
  });
  it('signal updates from 20 to 41', () => {
    const s = createSignal(20);
    s.set(41);
    expect(s.get()).toBe(41);
  });
  it('signal updates from 21 to 43', () => {
    const s = createSignal(21);
    s.set(43);
    expect(s.get()).toBe(43);
  });
  it('signal updates from 22 to 45', () => {
    const s = createSignal(22);
    s.set(45);
    expect(s.get()).toBe(45);
  });
  it('signal updates from 23 to 47', () => {
    const s = createSignal(23);
    s.set(47);
    expect(s.get()).toBe(47);
  });
  it('signal updates from 24 to 49', () => {
    const s = createSignal(24);
    s.set(49);
    expect(s.get()).toBe(49);
  });
  it('signal updates from 25 to 51', () => {
    const s = createSignal(25);
    s.set(51);
    expect(s.get()).toBe(51);
  });
  it('signal updates from 26 to 53', () => {
    const s = createSignal(26);
    s.set(53);
    expect(s.get()).toBe(53);
  });
  it('signal updates from 27 to 55', () => {
    const s = createSignal(27);
    s.set(55);
    expect(s.get()).toBe(55);
  });
  it('signal updates from 28 to 57', () => {
    const s = createSignal(28);
    s.set(57);
    expect(s.get()).toBe(57);
  });
  it('signal updates from 29 to 59', () => {
    const s = createSignal(29);
    s.set(59);
    expect(s.get()).toBe(59);
  });
});

describe('createSignal subscribe', () => {
  it('subscribe fires callback when set to 100', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(100);
    expect(received).toEqual([100]);
  });
  it('subscribe fires callback when set to 101', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(101);
    expect(received).toEqual([101]);
  });
  it('subscribe fires callback when set to 102', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(102);
    expect(received).toEqual([102]);
  });
  it('subscribe fires callback when set to 103', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(103);
    expect(received).toEqual([103]);
  });
  it('subscribe fires callback when set to 104', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(104);
    expect(received).toEqual([104]);
  });
  it('subscribe fires callback when set to 105', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(105);
    expect(received).toEqual([105]);
  });
  it('subscribe fires callback when set to 106', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(106);
    expect(received).toEqual([106]);
  });
  it('subscribe fires callback when set to 107', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(107);
    expect(received).toEqual([107]);
  });
  it('subscribe fires callback when set to 108', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(108);
    expect(received).toEqual([108]);
  });
  it('subscribe fires callback when set to 109', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(109);
    expect(received).toEqual([109]);
  });
  it('subscribe fires callback when set to 110', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(110);
    expect(received).toEqual([110]);
  });
  it('subscribe fires callback when set to 111', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(111);
    expect(received).toEqual([111]);
  });
  it('subscribe fires callback when set to 112', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(112);
    expect(received).toEqual([112]);
  });
  it('subscribe fires callback when set to 113', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(113);
    expect(received).toEqual([113]);
  });
  it('subscribe fires callback when set to 114', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(114);
    expect(received).toEqual([114]);
  });
  it('subscribe fires callback when set to 115', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(115);
    expect(received).toEqual([115]);
  });
  it('subscribe fires callback when set to 116', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(116);
    expect(received).toEqual([116]);
  });
  it('subscribe fires callback when set to 117', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(117);
    expect(received).toEqual([117]);
  });
  it('subscribe fires callback when set to 118', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(118);
    expect(received).toEqual([118]);
  });
  it('subscribe fires callback when set to 119', () => {
    const s = createSignal(0);
    const received: number[] = [];
    s.subscribe((v) => received.push(v));
    s.set(119);
    expect(received).toEqual([119]);
  });
});

describe('createComputed', () => {
  it('computed derives value from two signals (i=1)', () => {
    const a = createSignal(1);
    const b = createSignal(2);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(3);
  });
  it('computed derives value from two signals (i=2)', () => {
    const a = createSignal(2);
    const b = createSignal(4);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(6);
  });
  it('computed derives value from two signals (i=3)', () => {
    const a = createSignal(3);
    const b = createSignal(6);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(9);
  });
  it('computed derives value from two signals (i=4)', () => {
    const a = createSignal(4);
    const b = createSignal(8);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(12);
  });
  it('computed derives value from two signals (i=5)', () => {
    const a = createSignal(5);
    const b = createSignal(10);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(15);
  });
  it('computed derives value from two signals (i=6)', () => {
    const a = createSignal(6);
    const b = createSignal(12);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(18);
  });
  it('computed derives value from two signals (i=7)', () => {
    const a = createSignal(7);
    const b = createSignal(14);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(21);
  });
  it('computed derives value from two signals (i=8)', () => {
    const a = createSignal(8);
    const b = createSignal(16);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(24);
  });
  it('computed derives value from two signals (i=9)', () => {
    const a = createSignal(9);
    const b = createSignal(18);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(27);
  });
  it('computed derives value from two signals (i=10)', () => {
    const a = createSignal(10);
    const b = createSignal(20);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(30);
  });
  it('computed derives value from two signals (i=11)', () => {
    const a = createSignal(11);
    const b = createSignal(22);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(33);
  });
  it('computed derives value from two signals (i=12)', () => {
    const a = createSignal(12);
    const b = createSignal(24);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(36);
  });
  it('computed derives value from two signals (i=13)', () => {
    const a = createSignal(13);
    const b = createSignal(26);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(39);
  });
  it('computed derives value from two signals (i=14)', () => {
    const a = createSignal(14);
    const b = createSignal(28);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(42);
  });
  it('computed derives value from two signals (i=15)', () => {
    const a = createSignal(15);
    const b = createSignal(30);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(45);
  });
  it('computed derives value from two signals (i=16)', () => {
    const a = createSignal(16);
    const b = createSignal(32);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(48);
  });
  it('computed derives value from two signals (i=17)', () => {
    const a = createSignal(17);
    const b = createSignal(34);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(51);
  });
  it('computed derives value from two signals (i=18)', () => {
    const a = createSignal(18);
    const b = createSignal(36);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(54);
  });
  it('computed derives value from two signals (i=19)', () => {
    const a = createSignal(19);
    const b = createSignal(38);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(57);
  });
  it('computed derives value from two signals (i=20)', () => {
    const a = createSignal(20);
    const b = createSignal(40);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(60);
  });
  it('computed derives value from two signals (i=21)', () => {
    const a = createSignal(21);
    const b = createSignal(42);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(63);
  });
  it('computed derives value from two signals (i=22)', () => {
    const a = createSignal(22);
    const b = createSignal(44);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(66);
  });
  it('computed derives value from two signals (i=23)', () => {
    const a = createSignal(23);
    const b = createSignal(46);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(69);
  });
  it('computed derives value from two signals (i=24)', () => {
    const a = createSignal(24);
    const b = createSignal(48);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(72);
  });
  it('computed derives value from two signals (i=25)', () => {
    const a = createSignal(25);
    const b = createSignal(50);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(75);
  });
  it('computed derives value from two signals (i=26)', () => {
    const a = createSignal(26);
    const b = createSignal(52);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(78);
  });
  it('computed derives value from two signals (i=27)', () => {
    const a = createSignal(27);
    const b = createSignal(54);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(81);
  });
  it('computed derives value from two signals (i=28)', () => {
    const a = createSignal(28);
    const b = createSignal(56);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(84);
  });
  it('computed derives value from two signals (i=29)', () => {
    const a = createSignal(29);
    const b = createSignal(58);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(87);
  });
  it('computed derives value from two signals (i=30)', () => {
    const a = createSignal(30);
    const b = createSignal(60);
    const c = createComputed([a, b], (x, y) => (x as number) + (y as number));
    expect(c.get()).toBe(90);
  });
});

describe('createEffect', () => {
  it('effect runs immediately (run 0)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 1)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 2)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 3)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 4)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 5)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 6)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 7)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 8)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 9)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 10)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 11)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 12)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 13)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 14)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 15)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 16)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 17)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 18)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
  it('effect runs immediately (run 19)', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    expect(ran).toBe(true);
  });
});

describe('fromArray', () => {
  it('fromArray(1 elements).toArray() returns correct array', () => {
    const result = fromArray([0]).toArray();
    expect(result).toEqual([0]);
  });
  it('fromArray(2 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1]).toArray();
    expect(result).toEqual([0, 1]);
  });
  it('fromArray(3 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2]).toArray();
    expect(result).toEqual([0, 1, 2]);
  });
  it('fromArray(4 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3]).toArray();
    expect(result).toEqual([0, 1, 2, 3]);
  });
  it('fromArray(5 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4]);
  });
  it('fromArray(6 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it('fromArray(7 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
  it('fromArray(8 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
  it('fromArray(9 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('fromArray(10 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('fromArray(11 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  it('fromArray(12 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
  it('fromArray(13 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
  it('fromArray(14 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });
  it('fromArray(15 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });
  it('fromArray(16 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });
  it('fromArray(17 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });
  it('fromArray(18 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
  });
  it('fromArray(19 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
  });
  it('fromArray(20 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('fromArray(21 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('fromArray(22 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]);
  });
  it('fromArray(23 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]);
  });
  it('fromArray(24 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
  });
  it('fromArray(25 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
  });
  it('fromArray(26 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]);
  });
  it('fromArray(27 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]);
  });
  it('fromArray(28 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]);
  });
  it('fromArray(29 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]);
  });
  it('fromArray(30 elements).toArray() returns correct array', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]).toArray();
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]);
  });
});

describe('fromArray map chained', () => {
  it('fromArray map double 1 elements', () => {
    const result = fromArray([0]).map((x) => x * 2).toArray();
    expect(result).toEqual([0]);
  });
  it('fromArray map double 2 elements', () => {
    const result = fromArray([0, 1]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2]);
  });
  it('fromArray map double 3 elements', () => {
    const result = fromArray([0, 1, 2]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2, 4]);
  });
  it('fromArray map double 4 elements', () => {
    const result = fromArray([0, 1, 2, 3]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2, 4, 6]);
  });
  it('fromArray map double 5 elements', () => {
    const result = fromArray([0, 1, 2, 3, 4]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2, 4, 6, 8]);
  });
  it('fromArray map double 6 elements', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2, 4, 6, 8, 10]);
  });
  it('fromArray map double 7 elements', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2, 4, 6, 8, 10, 12]);
  });
  it('fromArray map double 8 elements', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14]);
  });
  it('fromArray map double 9 elements', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16]);
  });
  it('fromArray map double 10 elements', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
  });
  it('fromArray map double 11 elements', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
  });
  it('fromArray map double 12 elements', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]);
  });
  it('fromArray map double 13 elements', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]);
  });
  it('fromArray map double 14 elements', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26]);
  });
  it('fromArray map double 15 elements', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28]);
  });
  it('fromArray map double 16 elements', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]);
  });
  it('fromArray map double 17 elements', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32]);
  });
  it('fromArray map double 18 elements', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34]);
  });
  it('fromArray map double 19 elements', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36]);
  });
  it('fromArray map double 20 elements', () => {
    const result = fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]).map((x) => x * 2).toArray();
    expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38]);
  });
});

describe('mapStream', () => {
  it('mapStream adds 0 to each element (test 1)', () => {
    expect(mapStream([0], (x) => x + 0)).toEqual([0]);
  });
  it('mapStream adds 1 to each element (test 2)', () => {
    expect(mapStream([0, 1], (x) => x + 1)).toEqual([1, 2]);
  });
  it('mapStream adds 2 to each element (test 3)', () => {
    expect(mapStream([0, 1, 2], (x) => x + 2)).toEqual([2, 3, 4]);
  });
  it('mapStream adds 3 to each element (test 4)', () => {
    expect(mapStream([0, 1, 2, 3], (x) => x + 3)).toEqual([3, 4, 5, 6]);
  });
  it('mapStream adds 4 to each element (test 5)', () => {
    expect(mapStream([0, 1, 2, 3, 4], (x) => x + 4)).toEqual([4, 5, 6, 7, 8]);
  });
  it('mapStream adds 5 to each element (test 6)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5], (x) => x + 5)).toEqual([5, 6, 7, 8, 9, 10]);
  });
  it('mapStream adds 6 to each element (test 7)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6], (x) => x + 6)).toEqual([6, 7, 8, 9, 10, 11, 12]);
  });
  it('mapStream adds 0 to each element (test 8)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7], (x) => x + 0)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
  it('mapStream adds 1 to each element (test 9)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => x + 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('mapStream adds 2 to each element (test 10)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], (x) => x + 2)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
  it('mapStream adds 3 to each element (test 11)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (x) => x + 3)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });
  it('mapStream adds 4 to each element (test 12)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => x + 4)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });
  it('mapStream adds 5 to each element (test 13)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], (x) => x + 5)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
  });
  it('mapStream adds 6 to each element (test 14)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], (x) => x + 6)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('mapStream adds 0 to each element (test 15)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], (x) => x + 0)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });
  it('mapStream adds 1 to each element (test 16)', () => {
    expect(mapStream([0], (x) => x + 1)).toEqual([1]);
  });
  it('mapStream adds 2 to each element (test 17)', () => {
    expect(mapStream([0, 1], (x) => x + 2)).toEqual([2, 3]);
  });
  it('mapStream adds 3 to each element (test 18)', () => {
    expect(mapStream([0, 1, 2], (x) => x + 3)).toEqual([3, 4, 5]);
  });
  it('mapStream adds 4 to each element (test 19)', () => {
    expect(mapStream([0, 1, 2, 3], (x) => x + 4)).toEqual([4, 5, 6, 7]);
  });
  it('mapStream adds 5 to each element (test 20)', () => {
    expect(mapStream([0, 1, 2, 3, 4], (x) => x + 5)).toEqual([5, 6, 7, 8, 9]);
  });
  it('mapStream adds 6 to each element (test 21)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5], (x) => x + 6)).toEqual([6, 7, 8, 9, 10, 11]);
  });
  it('mapStream adds 0 to each element (test 22)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6], (x) => x + 0)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
  it('mapStream adds 1 to each element (test 23)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7], (x) => x + 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('mapStream adds 2 to each element (test 24)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => x + 2)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  it('mapStream adds 3 to each element (test 25)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], (x) => x + 3)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
  it('mapStream adds 4 to each element (test 26)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (x) => x + 4)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });
  it('mapStream adds 5 to each element (test 27)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => x + 5)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });
  it('mapStream adds 6 to each element (test 28)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], (x) => x + 6)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
  });
  it('mapStream adds 0 to each element (test 29)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], (x) => x + 0)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });
  it('mapStream adds 1 to each element (test 30)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], (x) => x + 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });
  it('mapStream adds 2 to each element (test 31)', () => {
    expect(mapStream([0], (x) => x + 2)).toEqual([2]);
  });
  it('mapStream adds 3 to each element (test 32)', () => {
    expect(mapStream([0, 1], (x) => x + 3)).toEqual([3, 4]);
  });
  it('mapStream adds 4 to each element (test 33)', () => {
    expect(mapStream([0, 1, 2], (x) => x + 4)).toEqual([4, 5, 6]);
  });
  it('mapStream adds 5 to each element (test 34)', () => {
    expect(mapStream([0, 1, 2, 3], (x) => x + 5)).toEqual([5, 6, 7, 8]);
  });
  it('mapStream adds 6 to each element (test 35)', () => {
    expect(mapStream([0, 1, 2, 3, 4], (x) => x + 6)).toEqual([6, 7, 8, 9, 10]);
  });
  it('mapStream adds 0 to each element (test 36)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5], (x) => x + 0)).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it('mapStream adds 1 to each element (test 37)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6], (x) => x + 1)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it('mapStream adds 2 to each element (test 38)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7], (x) => x + 2)).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('mapStream adds 3 to each element (test 39)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => x + 3)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
  it('mapStream adds 4 to each element (test 40)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], (x) => x + 4)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });
  it('mapStream adds 5 to each element (test 41)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (x) => x + 5)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });
  it('mapStream adds 6 to each element (test 42)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => x + 6)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
  });
  it('mapStream adds 0 to each element (test 43)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], (x) => x + 0)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
  it('mapStream adds 1 to each element (test 44)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], (x) => x + 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });
  it('mapStream adds 2 to each element (test 45)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], (x) => x + 2)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });
  it('mapStream adds 3 to each element (test 46)', () => {
    expect(mapStream([0], (x) => x + 3)).toEqual([3]);
  });
  it('mapStream adds 4 to each element (test 47)', () => {
    expect(mapStream([0, 1], (x) => x + 4)).toEqual([4, 5]);
  });
  it('mapStream adds 5 to each element (test 48)', () => {
    expect(mapStream([0, 1, 2], (x) => x + 5)).toEqual([5, 6, 7]);
  });
  it('mapStream adds 6 to each element (test 49)', () => {
    expect(mapStream([0, 1, 2, 3], (x) => x + 6)).toEqual([6, 7, 8, 9]);
  });
  it('mapStream adds 0 to each element (test 50)', () => {
    expect(mapStream([0, 1, 2, 3, 4], (x) => x + 0)).toEqual([0, 1, 2, 3, 4]);
  });
  it('mapStream adds 1 to each element (test 51)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5], (x) => x + 1)).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('mapStream adds 2 to each element (test 52)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6], (x) => x + 2)).toEqual([2, 3, 4, 5, 6, 7, 8]);
  });
  it('mapStream adds 3 to each element (test 53)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7], (x) => x + 3)).toEqual([3, 4, 5, 6, 7, 8, 9, 10]);
  });
  it('mapStream adds 4 to each element (test 54)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => x + 4)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
  it('mapStream adds 5 to each element (test 55)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], (x) => x + 5)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });
  it('mapStream adds 6 to each element (test 56)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (x) => x + 6)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });
  it('mapStream adds 0 to each element (test 57)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => x + 0)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
  it('mapStream adds 1 to each element (test 58)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], (x) => x + 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });
  it('mapStream adds 2 to each element (test 59)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], (x) => x + 2)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });
  it('mapStream adds 3 to each element (test 60)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], (x) => x + 3)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
  });
  it('mapStream adds 4 to each element (test 61)', () => {
    expect(mapStream([0], (x) => x + 4)).toEqual([4]);
  });
  it('mapStream adds 5 to each element (test 62)', () => {
    expect(mapStream([0, 1], (x) => x + 5)).toEqual([5, 6]);
  });
  it('mapStream adds 6 to each element (test 63)', () => {
    expect(mapStream([0, 1, 2], (x) => x + 6)).toEqual([6, 7, 8]);
  });
  it('mapStream adds 0 to each element (test 64)', () => {
    expect(mapStream([0, 1, 2, 3], (x) => x + 0)).toEqual([0, 1, 2, 3]);
  });
  it('mapStream adds 1 to each element (test 65)', () => {
    expect(mapStream([0, 1, 2, 3, 4], (x) => x + 1)).toEqual([1, 2, 3, 4, 5]);
  });
  it('mapStream adds 2 to each element (test 66)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5], (x) => x + 2)).toEqual([2, 3, 4, 5, 6, 7]);
  });
  it('mapStream adds 3 to each element (test 67)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6], (x) => x + 3)).toEqual([3, 4, 5, 6, 7, 8, 9]);
  });
  it('mapStream adds 4 to each element (test 68)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7], (x) => x + 4)).toEqual([4, 5, 6, 7, 8, 9, 10, 11]);
  });
  it('mapStream adds 5 to each element (test 69)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => x + 5)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });
  it('mapStream adds 6 to each element (test 70)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], (x) => x + 6)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });
  it('mapStream adds 0 to each element (test 71)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (x) => x + 0)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  it('mapStream adds 1 to each element (test 72)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => x + 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
  it('mapStream adds 2 to each element (test 73)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], (x) => x + 2)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });
  it('mapStream adds 3 to each element (test 74)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], (x) => x + 3)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });
  it('mapStream adds 4 to each element (test 75)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], (x) => x + 4)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
  });
  it('mapStream adds 5 to each element (test 76)', () => {
    expect(mapStream([0], (x) => x + 5)).toEqual([5]);
  });
  it('mapStream adds 6 to each element (test 77)', () => {
    expect(mapStream([0, 1], (x) => x + 6)).toEqual([6, 7]);
  });
  it('mapStream adds 0 to each element (test 78)', () => {
    expect(mapStream([0, 1, 2], (x) => x + 0)).toEqual([0, 1, 2]);
  });
  it('mapStream adds 1 to each element (test 79)', () => {
    expect(mapStream([0, 1, 2, 3], (x) => x + 1)).toEqual([1, 2, 3, 4]);
  });
  it('mapStream adds 2 to each element (test 80)', () => {
    expect(mapStream([0, 1, 2, 3, 4], (x) => x + 2)).toEqual([2, 3, 4, 5, 6]);
  });
  it('mapStream adds 3 to each element (test 81)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5], (x) => x + 3)).toEqual([3, 4, 5, 6, 7, 8]);
  });
  it('mapStream adds 4 to each element (test 82)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6], (x) => x + 4)).toEqual([4, 5, 6, 7, 8, 9, 10]);
  });
  it('mapStream adds 5 to each element (test 83)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7], (x) => x + 5)).toEqual([5, 6, 7, 8, 9, 10, 11, 12]);
  });
  it('mapStream adds 6 to each element (test 84)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => x + 6)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });
  it('mapStream adds 0 to each element (test 85)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], (x) => x + 0)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('mapStream adds 1 to each element (test 86)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (x) => x + 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
  it('mapStream adds 2 to each element (test 87)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => x + 2)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });
  it('mapStream adds 3 to each element (test 88)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], (x) => x + 3)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });
  it('mapStream adds 4 to each element (test 89)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], (x) => x + 4)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
  });
  it('mapStream adds 5 to each element (test 90)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], (x) => x + 5)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('mapStream adds 6 to each element (test 91)', () => {
    expect(mapStream([0], (x) => x + 6)).toEqual([6]);
  });
  it('mapStream adds 0 to each element (test 92)', () => {
    expect(mapStream([0, 1], (x) => x + 0)).toEqual([0, 1]);
  });
  it('mapStream adds 1 to each element (test 93)', () => {
    expect(mapStream([0, 1, 2], (x) => x + 1)).toEqual([1, 2, 3]);
  });
  it('mapStream adds 2 to each element (test 94)', () => {
    expect(mapStream([0, 1, 2, 3], (x) => x + 2)).toEqual([2, 3, 4, 5]);
  });
  it('mapStream adds 3 to each element (test 95)', () => {
    expect(mapStream([0, 1, 2, 3, 4], (x) => x + 3)).toEqual([3, 4, 5, 6, 7]);
  });
  it('mapStream adds 4 to each element (test 96)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5], (x) => x + 4)).toEqual([4, 5, 6, 7, 8, 9]);
  });
  it('mapStream adds 5 to each element (test 97)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6], (x) => x + 5)).toEqual([5, 6, 7, 8, 9, 10, 11]);
  });
  it('mapStream adds 6 to each element (test 98)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7], (x) => x + 6)).toEqual([6, 7, 8, 9, 10, 11, 12, 13]);
  });
  it('mapStream adds 0 to each element (test 99)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => x + 0)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('mapStream adds 1 to each element (test 100)', () => {
    expect(mapStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], (x) => x + 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});

describe('filterStream', () => {
  it('filterStream greater than 1 (test 1)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 1)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 2 (test 2)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 2)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 3 (test 3)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 3)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 4 (test 4)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 4)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 5 (test 5)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 5)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 6 (test 6)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 6)).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 7 (test 7)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 7)).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 8 (test 8)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 8)).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 9 (test 9)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 9)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 10 (test 10)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 10)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 11 (test 11)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 11)).toEqual([12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 12 (test 12)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 12)).toEqual([13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 13 (test 13)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 13)).toEqual([14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 14 (test 14)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 14)).toEqual([15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 15 (test 15)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 15)).toEqual([16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 1 (test 16)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 1)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 2 (test 17)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 2)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 3 (test 18)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 3)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 4 (test 19)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 4)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 5 (test 20)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 5)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 6 (test 21)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 6)).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 7 (test 22)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 7)).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 8 (test 23)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 8)).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 9 (test 24)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 9)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 10 (test 25)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 10)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 11 (test 26)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 11)).toEqual([12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 12 (test 27)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 12)).toEqual([13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 13 (test 28)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 13)).toEqual([14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 14 (test 29)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 14)).toEqual([15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 15 (test 30)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 15)).toEqual([16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 1 (test 31)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 1)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 2 (test 32)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 2)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 3 (test 33)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 3)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 4 (test 34)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 4)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 5 (test 35)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 5)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 6 (test 36)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 6)).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 7 (test 37)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 7)).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 8 (test 38)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 8)).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 9 (test 39)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 9)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 10 (test 40)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 10)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 11 (test 41)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 11)).toEqual([12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 12 (test 42)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 12)).toEqual([13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 13 (test 43)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 13)).toEqual([14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 14 (test 44)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 14)).toEqual([15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 15 (test 45)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 15)).toEqual([16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 1 (test 46)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 1)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 2 (test 47)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 2)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 3 (test 48)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 3)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 4 (test 49)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 4)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream greater than 5 (test 50)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x > 5)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
  it('filterStream divisible by 2 (test 51)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 2 === 0)).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
  });
  it('filterStream divisible by 3 (test 52)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 3 === 0)).toEqual([3, 6, 9, 12, 15, 18]);
  });
  it('filterStream divisible by 4 (test 53)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 4 === 0)).toEqual([4, 8, 12, 16, 20]);
  });
  it('filterStream divisible by 5 (test 54)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 5 === 0)).toEqual([5, 10, 15, 20]);
  });
  it('filterStream divisible by 6 (test 55)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 6 === 0)).toEqual([6, 12, 18]);
  });
  it('filterStream divisible by 2 (test 56)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 2 === 0)).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
  });
  it('filterStream divisible by 3 (test 57)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 3 === 0)).toEqual([3, 6, 9, 12, 15, 18]);
  });
  it('filterStream divisible by 4 (test 58)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 4 === 0)).toEqual([4, 8, 12, 16, 20]);
  });
  it('filterStream divisible by 5 (test 59)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 5 === 0)).toEqual([5, 10, 15, 20]);
  });
  it('filterStream divisible by 6 (test 60)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 6 === 0)).toEqual([6, 12, 18]);
  });
  it('filterStream divisible by 2 (test 61)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 2 === 0)).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
  });
  it('filterStream divisible by 3 (test 62)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 3 === 0)).toEqual([3, 6, 9, 12, 15, 18]);
  });
  it('filterStream divisible by 4 (test 63)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 4 === 0)).toEqual([4, 8, 12, 16, 20]);
  });
  it('filterStream divisible by 5 (test 64)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 5 === 0)).toEqual([5, 10, 15, 20]);
  });
  it('filterStream divisible by 6 (test 65)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 6 === 0)).toEqual([6, 12, 18]);
  });
  it('filterStream divisible by 2 (test 66)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 2 === 0)).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
  });
  it('filterStream divisible by 3 (test 67)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 3 === 0)).toEqual([3, 6, 9, 12, 15, 18]);
  });
  it('filterStream divisible by 4 (test 68)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 4 === 0)).toEqual([4, 8, 12, 16, 20]);
  });
  it('filterStream divisible by 5 (test 69)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 5 === 0)).toEqual([5, 10, 15, 20]);
  });
  it('filterStream divisible by 6 (test 70)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 6 === 0)).toEqual([6, 12, 18]);
  });
  it('filterStream divisible by 2 (test 71)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 2 === 0)).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
  });
  it('filterStream divisible by 3 (test 72)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 3 === 0)).toEqual([3, 6, 9, 12, 15, 18]);
  });
  it('filterStream divisible by 4 (test 73)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 4 === 0)).toEqual([4, 8, 12, 16, 20]);
  });
  it('filterStream divisible by 5 (test 74)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 5 === 0)).toEqual([5, 10, 15, 20]);
  });
  it('filterStream divisible by 6 (test 75)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 6 === 0)).toEqual([6, 12, 18]);
  });
  it('filterStream divisible by 2 (test 76)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 2 === 0)).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
  });
  it('filterStream divisible by 3 (test 77)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 3 === 0)).toEqual([3, 6, 9, 12, 15, 18]);
  });
  it('filterStream divisible by 4 (test 78)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 4 === 0)).toEqual([4, 8, 12, 16, 20]);
  });
  it('filterStream divisible by 5 (test 79)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 5 === 0)).toEqual([5, 10, 15, 20]);
  });
  it('filterStream divisible by 6 (test 80)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 6 === 0)).toEqual([6, 12, 18]);
  });
  it('filterStream divisible by 2 (test 81)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 2 === 0)).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
  });
  it('filterStream divisible by 3 (test 82)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 3 === 0)).toEqual([3, 6, 9, 12, 15, 18]);
  });
  it('filterStream divisible by 4 (test 83)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 4 === 0)).toEqual([4, 8, 12, 16, 20]);
  });
  it('filterStream divisible by 5 (test 84)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 5 === 0)).toEqual([5, 10, 15, 20]);
  });
  it('filterStream divisible by 6 (test 85)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 6 === 0)).toEqual([6, 12, 18]);
  });
  it('filterStream divisible by 2 (test 86)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 2 === 0)).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
  });
  it('filterStream divisible by 3 (test 87)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 3 === 0)).toEqual([3, 6, 9, 12, 15, 18]);
  });
  it('filterStream divisible by 4 (test 88)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 4 === 0)).toEqual([4, 8, 12, 16, 20]);
  });
  it('filterStream divisible by 5 (test 89)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 5 === 0)).toEqual([5, 10, 15, 20]);
  });
  it('filterStream divisible by 6 (test 90)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 6 === 0)).toEqual([6, 12, 18]);
  });
  it('filterStream divisible by 2 (test 91)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 2 === 0)).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
  });
  it('filterStream divisible by 3 (test 92)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 3 === 0)).toEqual([3, 6, 9, 12, 15, 18]);
  });
  it('filterStream divisible by 4 (test 93)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 4 === 0)).toEqual([4, 8, 12, 16, 20]);
  });
  it('filterStream divisible by 5 (test 94)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 5 === 0)).toEqual([5, 10, 15, 20]);
  });
  it('filterStream divisible by 6 (test 95)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 6 === 0)).toEqual([6, 12, 18]);
  });
  it('filterStream divisible by 2 (test 96)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 2 === 0)).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
  });
  it('filterStream divisible by 3 (test 97)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 3 === 0)).toEqual([3, 6, 9, 12, 15, 18]);
  });
  it('filterStream divisible by 4 (test 98)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 4 === 0)).toEqual([4, 8, 12, 16, 20]);
  });
  it('filterStream divisible by 5 (test 99)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 5 === 0)).toEqual([5, 10, 15, 20]);
  });
  it('filterStream divisible by 6 (test 100)', () => {
    expect(filterStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], (x) => x % 6 === 0)).toEqual([6, 12, 18]);
  });
});

describe('takeStream', () => {
  it('takeStream(0) from 20-element array (test 1)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 0)).toEqual([]);
  });
  it('takeStream(1) from 20-element array (test 2)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 1)).toEqual([0]);
  });
  it('takeStream(2) from 20-element array (test 3)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 2)).toEqual([0, 1]);
  });
  it('takeStream(3) from 20-element array (test 4)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 3)).toEqual([0, 1, 2]);
  });
  it('takeStream(4) from 20-element array (test 5)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 4)).toEqual([0, 1, 2, 3]);
  });
  it('takeStream(5) from 20-element array (test 6)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 5)).toEqual([0, 1, 2, 3, 4]);
  });
  it('takeStream(6) from 20-element array (test 7)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 6)).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it('takeStream(7) from 20-element array (test 8)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
  it('takeStream(8) from 20-element array (test 9)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 8)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
  it('takeStream(9) from 20-element array (test 10)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 9)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('takeStream(10) from 20-element array (test 11)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('takeStream(11) from 20-element array (test 12)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 11)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  it('takeStream(12) from 20-element array (test 13)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 12)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
  it('takeStream(13) from 20-element array (test 14)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 13)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
  it('takeStream(14) from 20-element array (test 15)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 14)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });
  it('takeStream(15) from 20-element array (test 16)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 15)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });
  it('takeStream(16) from 20-element array (test 17)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 16)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });
  it('takeStream(17) from 20-element array (test 18)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 17)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });
  it('takeStream(18) from 20-element array (test 19)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 18)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
  });
  it('takeStream(19) from 20-element array (test 20)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 19)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
  });
  it('takeStream(20) from 20-element array (test 21)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 20)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('takeStream(0) from 20-element array (test 22)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 0)).toEqual([]);
  });
  it('takeStream(1) from 20-element array (test 23)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 1)).toEqual([0]);
  });
  it('takeStream(2) from 20-element array (test 24)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 2)).toEqual([0, 1]);
  });
  it('takeStream(3) from 20-element array (test 25)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 3)).toEqual([0, 1, 2]);
  });
  it('takeStream(4) from 20-element array (test 26)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 4)).toEqual([0, 1, 2, 3]);
  });
  it('takeStream(5) from 20-element array (test 27)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 5)).toEqual([0, 1, 2, 3, 4]);
  });
  it('takeStream(6) from 20-element array (test 28)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 6)).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it('takeStream(7) from 20-element array (test 29)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
  it('takeStream(8) from 20-element array (test 30)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 8)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
  it('takeStream(9) from 20-element array (test 31)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 9)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('takeStream(10) from 20-element array (test 32)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('takeStream(11) from 20-element array (test 33)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 11)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  it('takeStream(12) from 20-element array (test 34)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 12)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
  it('takeStream(13) from 20-element array (test 35)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 13)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
  it('takeStream(14) from 20-element array (test 36)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 14)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });
  it('takeStream(15) from 20-element array (test 37)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 15)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });
  it('takeStream(16) from 20-element array (test 38)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 16)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });
  it('takeStream(17) from 20-element array (test 39)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 17)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });
  it('takeStream(18) from 20-element array (test 40)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 18)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
  });
  it('takeStream(19) from 20-element array (test 41)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 19)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
  });
  it('takeStream(20) from 20-element array (test 42)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 20)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('takeStream(0) from 20-element array (test 43)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 0)).toEqual([]);
  });
  it('takeStream(1) from 20-element array (test 44)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 1)).toEqual([0]);
  });
  it('takeStream(2) from 20-element array (test 45)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 2)).toEqual([0, 1]);
  });
  it('takeStream(3) from 20-element array (test 46)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 3)).toEqual([0, 1, 2]);
  });
  it('takeStream(4) from 20-element array (test 47)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 4)).toEqual([0, 1, 2, 3]);
  });
  it('takeStream(5) from 20-element array (test 48)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 5)).toEqual([0, 1, 2, 3, 4]);
  });
  it('takeStream(6) from 20-element array (test 49)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 6)).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it('takeStream(7) from 20-element array (test 50)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
  it('takeStream(8) from 20-element array (test 51)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 8)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
  it('takeStream(9) from 20-element array (test 52)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 9)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('takeStream(10) from 20-element array (test 53)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('takeStream(11) from 20-element array (test 54)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 11)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  it('takeStream(12) from 20-element array (test 55)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 12)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
  it('takeStream(13) from 20-element array (test 56)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 13)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
  it('takeStream(14) from 20-element array (test 57)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 14)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });
  it('takeStream(15) from 20-element array (test 58)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 15)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });
  it('takeStream(16) from 20-element array (test 59)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 16)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });
  it('takeStream(17) from 20-element array (test 60)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 17)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });
  it('takeStream(18) from 20-element array (test 61)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 18)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
  });
  it('takeStream(19) from 20-element array (test 62)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 19)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
  });
  it('takeStream(20) from 20-element array (test 63)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 20)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('takeStream(0) from 20-element array (test 64)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 0)).toEqual([]);
  });
  it('takeStream(1) from 20-element array (test 65)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 1)).toEqual([0]);
  });
  it('takeStream(2) from 20-element array (test 66)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 2)).toEqual([0, 1]);
  });
  it('takeStream(3) from 20-element array (test 67)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 3)).toEqual([0, 1, 2]);
  });
  it('takeStream(4) from 20-element array (test 68)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 4)).toEqual([0, 1, 2, 3]);
  });
  it('takeStream(5) from 20-element array (test 69)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 5)).toEqual([0, 1, 2, 3, 4]);
  });
  it('takeStream(6) from 20-element array (test 70)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 6)).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it('takeStream(7) from 20-element array (test 71)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
  it('takeStream(8) from 20-element array (test 72)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 8)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
  it('takeStream(9) from 20-element array (test 73)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 9)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('takeStream(10) from 20-element array (test 74)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('takeStream(11) from 20-element array (test 75)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 11)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  it('takeStream(12) from 20-element array (test 76)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 12)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
  it('takeStream(13) from 20-element array (test 77)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 13)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
  it('takeStream(14) from 20-element array (test 78)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 14)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });
  it('takeStream(15) from 20-element array (test 79)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 15)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });
  it('takeStream(16) from 20-element array (test 80)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 16)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });
  it('takeStream(17) from 20-element array (test 81)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 17)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });
  it('takeStream(18) from 20-element array (test 82)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 18)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
  });
  it('takeStream(19) from 20-element array (test 83)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 19)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
  });
  it('takeStream(20) from 20-element array (test 84)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 20)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('takeStream(0) from 20-element array (test 85)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 0)).toEqual([]);
  });
  it('takeStream(1) from 20-element array (test 86)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 1)).toEqual([0]);
  });
  it('takeStream(2) from 20-element array (test 87)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 2)).toEqual([0, 1]);
  });
  it('takeStream(3) from 20-element array (test 88)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 3)).toEqual([0, 1, 2]);
  });
  it('takeStream(4) from 20-element array (test 89)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 4)).toEqual([0, 1, 2, 3]);
  });
  it('takeStream(5) from 20-element array (test 90)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 5)).toEqual([0, 1, 2, 3, 4]);
  });
  it('takeStream(6) from 20-element array (test 91)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 6)).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it('takeStream(7) from 20-element array (test 92)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
  it('takeStream(8) from 20-element array (test 93)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 8)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
  it('takeStream(9) from 20-element array (test 94)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 9)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('takeStream(10) from 20-element array (test 95)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('takeStream(11) from 20-element array (test 96)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 11)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  it('takeStream(12) from 20-element array (test 97)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 12)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
  it('takeStream(13) from 20-element array (test 98)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 13)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
  it('takeStream(14) from 20-element array (test 99)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 14)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });
  it('takeStream(15) from 20-element array (test 100)', () => {
    expect(takeStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 15)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });
});

describe('dropStream', () => {
  it('dropStream(0) from 20-element array (test 1)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 0)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(1) from 20-element array (test 2)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(2) from 20-element array (test 3)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 2)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(3) from 20-element array (test 4)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 3)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(4) from 20-element array (test 5)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 4)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(5) from 20-element array (test 6)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 5)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(6) from 20-element array (test 7)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 6)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(7) from 20-element array (test 8)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 7)).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(8) from 20-element array (test 9)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 8)).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(9) from 20-element array (test 10)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 9)).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(10) from 20-element array (test 11)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 10)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(11) from 20-element array (test 12)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 11)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(12) from 20-element array (test 13)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 12)).toEqual([12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(13) from 20-element array (test 14)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 13)).toEqual([13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(14) from 20-element array (test 15)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 14)).toEqual([14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(15) from 20-element array (test 16)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 15)).toEqual([15, 16, 17, 18, 19]);
  });
  it('dropStream(16) from 20-element array (test 17)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 16)).toEqual([16, 17, 18, 19]);
  });
  it('dropStream(17) from 20-element array (test 18)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 17)).toEqual([17, 18, 19]);
  });
  it('dropStream(18) from 20-element array (test 19)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 18)).toEqual([18, 19]);
  });
  it('dropStream(19) from 20-element array (test 20)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 19)).toEqual([19]);
  });
  it('dropStream(20) from 20-element array (test 21)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 20)).toEqual([]);
  });
  it('dropStream(0) from 20-element array (test 22)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 0)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(1) from 20-element array (test 23)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(2) from 20-element array (test 24)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 2)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(3) from 20-element array (test 25)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 3)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(4) from 20-element array (test 26)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 4)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(5) from 20-element array (test 27)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 5)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(6) from 20-element array (test 28)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 6)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(7) from 20-element array (test 29)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 7)).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(8) from 20-element array (test 30)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 8)).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(9) from 20-element array (test 31)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 9)).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(10) from 20-element array (test 32)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 10)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(11) from 20-element array (test 33)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 11)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(12) from 20-element array (test 34)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 12)).toEqual([12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(13) from 20-element array (test 35)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 13)).toEqual([13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(14) from 20-element array (test 36)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 14)).toEqual([14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(15) from 20-element array (test 37)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 15)).toEqual([15, 16, 17, 18, 19]);
  });
  it('dropStream(16) from 20-element array (test 38)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 16)).toEqual([16, 17, 18, 19]);
  });
  it('dropStream(17) from 20-element array (test 39)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 17)).toEqual([17, 18, 19]);
  });
  it('dropStream(18) from 20-element array (test 40)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 18)).toEqual([18, 19]);
  });
  it('dropStream(19) from 20-element array (test 41)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 19)).toEqual([19]);
  });
  it('dropStream(20) from 20-element array (test 42)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 20)).toEqual([]);
  });
  it('dropStream(0) from 20-element array (test 43)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 0)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(1) from 20-element array (test 44)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(2) from 20-element array (test 45)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 2)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(3) from 20-element array (test 46)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 3)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(4) from 20-element array (test 47)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 4)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(5) from 20-element array (test 48)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 5)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(6) from 20-element array (test 49)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 6)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(7) from 20-element array (test 50)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 7)).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(8) from 20-element array (test 51)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 8)).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(9) from 20-element array (test 52)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 9)).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(10) from 20-element array (test 53)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 10)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(11) from 20-element array (test 54)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 11)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(12) from 20-element array (test 55)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 12)).toEqual([12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(13) from 20-element array (test 56)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 13)).toEqual([13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(14) from 20-element array (test 57)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 14)).toEqual([14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(15) from 20-element array (test 58)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 15)).toEqual([15, 16, 17, 18, 19]);
  });
  it('dropStream(16) from 20-element array (test 59)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 16)).toEqual([16, 17, 18, 19]);
  });
  it('dropStream(17) from 20-element array (test 60)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 17)).toEqual([17, 18, 19]);
  });
  it('dropStream(18) from 20-element array (test 61)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 18)).toEqual([18, 19]);
  });
  it('dropStream(19) from 20-element array (test 62)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 19)).toEqual([19]);
  });
  it('dropStream(20) from 20-element array (test 63)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 20)).toEqual([]);
  });
  it('dropStream(0) from 20-element array (test 64)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 0)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(1) from 20-element array (test 65)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(2) from 20-element array (test 66)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 2)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(3) from 20-element array (test 67)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 3)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(4) from 20-element array (test 68)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 4)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(5) from 20-element array (test 69)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 5)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(6) from 20-element array (test 70)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 6)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(7) from 20-element array (test 71)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 7)).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(8) from 20-element array (test 72)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 8)).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(9) from 20-element array (test 73)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 9)).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(10) from 20-element array (test 74)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 10)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(11) from 20-element array (test 75)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 11)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(12) from 20-element array (test 76)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 12)).toEqual([12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(13) from 20-element array (test 77)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 13)).toEqual([13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(14) from 20-element array (test 78)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 14)).toEqual([14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(15) from 20-element array (test 79)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 15)).toEqual([15, 16, 17, 18, 19]);
  });
  it('dropStream(16) from 20-element array (test 80)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 16)).toEqual([16, 17, 18, 19]);
  });
  it('dropStream(17) from 20-element array (test 81)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 17)).toEqual([17, 18, 19]);
  });
  it('dropStream(18) from 20-element array (test 82)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 18)).toEqual([18, 19]);
  });
  it('dropStream(19) from 20-element array (test 83)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 19)).toEqual([19]);
  });
  it('dropStream(20) from 20-element array (test 84)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 20)).toEqual([]);
  });
  it('dropStream(0) from 20-element array (test 85)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 0)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(1) from 20-element array (test 86)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(2) from 20-element array (test 87)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 2)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(3) from 20-element array (test 88)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 3)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(4) from 20-element array (test 89)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 4)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(5) from 20-element array (test 90)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 5)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(6) from 20-element array (test 91)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 6)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(7) from 20-element array (test 92)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 7)).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(8) from 20-element array (test 93)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 8)).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(9) from 20-element array (test 94)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 9)).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(10) from 20-element array (test 95)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 10)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(11) from 20-element array (test 96)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 11)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(12) from 20-element array (test 97)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 12)).toEqual([12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(13) from 20-element array (test 98)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 13)).toEqual([13, 14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(14) from 20-element array (test 99)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 14)).toEqual([14, 15, 16, 17, 18, 19]);
  });
  it('dropStream(15) from 20-element array (test 100)', () => {
    expect(dropStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 15)).toEqual([15, 16, 17, 18, 19]);
  });
});

describe('scanStream', () => {
  it('scanStream running sum of 1 elements (test 1)', () => {
    expect(scanStream([1], (acc, x) => acc + x, 0)).toEqual([1]);
  });
  it('scanStream running sum of 2 elements (test 2)', () => {
    expect(scanStream([1, 2], (acc, x) => acc + x, 0)).toEqual([1, 3]);
  });
  it('scanStream running sum of 3 elements (test 3)', () => {
    expect(scanStream([1, 2, 3], (acc, x) => acc + x, 0)).toEqual([1, 3, 6]);
  });
  it('scanStream running sum of 4 elements (test 4)', () => {
    expect(scanStream([1, 2, 3, 4], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10]);
  });
  it('scanStream running sum of 5 elements (test 5)', () => {
    expect(scanStream([1, 2, 3, 4, 5], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15]);
  });
  it('scanStream running sum of 6 elements (test 6)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21]);
  });
  it('scanStream running sum of 7 elements (test 7)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28]);
  });
  it('scanStream running sum of 8 elements (test 8)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36]);
  });
  it('scanStream running sum of 9 elements (test 9)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45]);
  });
  it('scanStream running sum of 10 elements (test 10)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45, 55]);
  });
  it('scanStream running sum of 1 elements (test 11)', () => {
    expect(scanStream([1], (acc, x) => acc + x, 0)).toEqual([1]);
  });
  it('scanStream running sum of 2 elements (test 12)', () => {
    expect(scanStream([1, 2], (acc, x) => acc + x, 0)).toEqual([1, 3]);
  });
  it('scanStream running sum of 3 elements (test 13)', () => {
    expect(scanStream([1, 2, 3], (acc, x) => acc + x, 0)).toEqual([1, 3, 6]);
  });
  it('scanStream running sum of 4 elements (test 14)', () => {
    expect(scanStream([1, 2, 3, 4], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10]);
  });
  it('scanStream running sum of 5 elements (test 15)', () => {
    expect(scanStream([1, 2, 3, 4, 5], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15]);
  });
  it('scanStream running sum of 6 elements (test 16)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21]);
  });
  it('scanStream running sum of 7 elements (test 17)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28]);
  });
  it('scanStream running sum of 8 elements (test 18)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36]);
  });
  it('scanStream running sum of 9 elements (test 19)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45]);
  });
  it('scanStream running sum of 10 elements (test 20)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45, 55]);
  });
  it('scanStream running sum of 1 elements (test 21)', () => {
    expect(scanStream([1], (acc, x) => acc + x, 0)).toEqual([1]);
  });
  it('scanStream running sum of 2 elements (test 22)', () => {
    expect(scanStream([1, 2], (acc, x) => acc + x, 0)).toEqual([1, 3]);
  });
  it('scanStream running sum of 3 elements (test 23)', () => {
    expect(scanStream([1, 2, 3], (acc, x) => acc + x, 0)).toEqual([1, 3, 6]);
  });
  it('scanStream running sum of 4 elements (test 24)', () => {
    expect(scanStream([1, 2, 3, 4], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10]);
  });
  it('scanStream running sum of 5 elements (test 25)', () => {
    expect(scanStream([1, 2, 3, 4, 5], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15]);
  });
  it('scanStream running sum of 6 elements (test 26)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21]);
  });
  it('scanStream running sum of 7 elements (test 27)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28]);
  });
  it('scanStream running sum of 8 elements (test 28)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36]);
  });
  it('scanStream running sum of 9 elements (test 29)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45]);
  });
  it('scanStream running sum of 10 elements (test 30)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45, 55]);
  });
  it('scanStream running sum of 1 elements (test 31)', () => {
    expect(scanStream([1], (acc, x) => acc + x, 0)).toEqual([1]);
  });
  it('scanStream running sum of 2 elements (test 32)', () => {
    expect(scanStream([1, 2], (acc, x) => acc + x, 0)).toEqual([1, 3]);
  });
  it('scanStream running sum of 3 elements (test 33)', () => {
    expect(scanStream([1, 2, 3], (acc, x) => acc + x, 0)).toEqual([1, 3, 6]);
  });
  it('scanStream running sum of 4 elements (test 34)', () => {
    expect(scanStream([1, 2, 3, 4], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10]);
  });
  it('scanStream running sum of 5 elements (test 35)', () => {
    expect(scanStream([1, 2, 3, 4, 5], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15]);
  });
  it('scanStream running sum of 6 elements (test 36)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21]);
  });
  it('scanStream running sum of 7 elements (test 37)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28]);
  });
  it('scanStream running sum of 8 elements (test 38)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36]);
  });
  it('scanStream running sum of 9 elements (test 39)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45]);
  });
  it('scanStream running sum of 10 elements (test 40)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45, 55]);
  });
  it('scanStream running sum of 1 elements (test 41)', () => {
    expect(scanStream([1], (acc, x) => acc + x, 0)).toEqual([1]);
  });
  it('scanStream running sum of 2 elements (test 42)', () => {
    expect(scanStream([1, 2], (acc, x) => acc + x, 0)).toEqual([1, 3]);
  });
  it('scanStream running sum of 3 elements (test 43)', () => {
    expect(scanStream([1, 2, 3], (acc, x) => acc + x, 0)).toEqual([1, 3, 6]);
  });
  it('scanStream running sum of 4 elements (test 44)', () => {
    expect(scanStream([1, 2, 3, 4], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10]);
  });
  it('scanStream running sum of 5 elements (test 45)', () => {
    expect(scanStream([1, 2, 3, 4, 5], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15]);
  });
  it('scanStream running sum of 6 elements (test 46)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21]);
  });
  it('scanStream running sum of 7 elements (test 47)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28]);
  });
  it('scanStream running sum of 8 elements (test 48)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36]);
  });
  it('scanStream running sum of 9 elements (test 49)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45]);
  });
  it('scanStream running sum of 10 elements (test 50)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45, 55]);
  });
  it('scanStream running sum of 1 elements (test 51)', () => {
    expect(scanStream([1], (acc, x) => acc + x, 0)).toEqual([1]);
  });
  it('scanStream running sum of 2 elements (test 52)', () => {
    expect(scanStream([1, 2], (acc, x) => acc + x, 0)).toEqual([1, 3]);
  });
  it('scanStream running sum of 3 elements (test 53)', () => {
    expect(scanStream([1, 2, 3], (acc, x) => acc + x, 0)).toEqual([1, 3, 6]);
  });
  it('scanStream running sum of 4 elements (test 54)', () => {
    expect(scanStream([1, 2, 3, 4], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10]);
  });
  it('scanStream running sum of 5 elements (test 55)', () => {
    expect(scanStream([1, 2, 3, 4, 5], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15]);
  });
  it('scanStream running sum of 6 elements (test 56)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21]);
  });
  it('scanStream running sum of 7 elements (test 57)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28]);
  });
  it('scanStream running sum of 8 elements (test 58)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36]);
  });
  it('scanStream running sum of 9 elements (test 59)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45]);
  });
  it('scanStream running sum of 10 elements (test 60)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45, 55]);
  });
  it('scanStream running sum of 1 elements (test 61)', () => {
    expect(scanStream([1], (acc, x) => acc + x, 0)).toEqual([1]);
  });
  it('scanStream running sum of 2 elements (test 62)', () => {
    expect(scanStream([1, 2], (acc, x) => acc + x, 0)).toEqual([1, 3]);
  });
  it('scanStream running sum of 3 elements (test 63)', () => {
    expect(scanStream([1, 2, 3], (acc, x) => acc + x, 0)).toEqual([1, 3, 6]);
  });
  it('scanStream running sum of 4 elements (test 64)', () => {
    expect(scanStream([1, 2, 3, 4], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10]);
  });
  it('scanStream running sum of 5 elements (test 65)', () => {
    expect(scanStream([1, 2, 3, 4, 5], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15]);
  });
  it('scanStream running sum of 6 elements (test 66)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21]);
  });
  it('scanStream running sum of 7 elements (test 67)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28]);
  });
  it('scanStream running sum of 8 elements (test 68)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36]);
  });
  it('scanStream running sum of 9 elements (test 69)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45]);
  });
  it('scanStream running sum of 10 elements (test 70)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45, 55]);
  });
  it('scanStream running sum of 1 elements (test 71)', () => {
    expect(scanStream([1], (acc, x) => acc + x, 0)).toEqual([1]);
  });
  it('scanStream running sum of 2 elements (test 72)', () => {
    expect(scanStream([1, 2], (acc, x) => acc + x, 0)).toEqual([1, 3]);
  });
  it('scanStream running sum of 3 elements (test 73)', () => {
    expect(scanStream([1, 2, 3], (acc, x) => acc + x, 0)).toEqual([1, 3, 6]);
  });
  it('scanStream running sum of 4 elements (test 74)', () => {
    expect(scanStream([1, 2, 3, 4], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10]);
  });
  it('scanStream running sum of 5 elements (test 75)', () => {
    expect(scanStream([1, 2, 3, 4, 5], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15]);
  });
  it('scanStream running sum of 6 elements (test 76)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21]);
  });
  it('scanStream running sum of 7 elements (test 77)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28]);
  });
  it('scanStream running sum of 8 elements (test 78)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36]);
  });
  it('scanStream running sum of 9 elements (test 79)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45]);
  });
  it('scanStream running sum of 10 elements (test 80)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45, 55]);
  });
  it('scanStream running sum of 1 elements (test 81)', () => {
    expect(scanStream([1], (acc, x) => acc + x, 0)).toEqual([1]);
  });
  it('scanStream running sum of 2 elements (test 82)', () => {
    expect(scanStream([1, 2], (acc, x) => acc + x, 0)).toEqual([1, 3]);
  });
  it('scanStream running sum of 3 elements (test 83)', () => {
    expect(scanStream([1, 2, 3], (acc, x) => acc + x, 0)).toEqual([1, 3, 6]);
  });
  it('scanStream running sum of 4 elements (test 84)', () => {
    expect(scanStream([1, 2, 3, 4], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10]);
  });
  it('scanStream running sum of 5 elements (test 85)', () => {
    expect(scanStream([1, 2, 3, 4, 5], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15]);
  });
  it('scanStream running sum of 6 elements (test 86)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21]);
  });
  it('scanStream running sum of 7 elements (test 87)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28]);
  });
  it('scanStream running sum of 8 elements (test 88)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36]);
  });
  it('scanStream running sum of 9 elements (test 89)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45]);
  });
  it('scanStream running sum of 10 elements (test 90)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45, 55]);
  });
  it('scanStream running sum of 1 elements (test 91)', () => {
    expect(scanStream([1], (acc, x) => acc + x, 0)).toEqual([1]);
  });
  it('scanStream running sum of 2 elements (test 92)', () => {
    expect(scanStream([1, 2], (acc, x) => acc + x, 0)).toEqual([1, 3]);
  });
  it('scanStream running sum of 3 elements (test 93)', () => {
    expect(scanStream([1, 2, 3], (acc, x) => acc + x, 0)).toEqual([1, 3, 6]);
  });
  it('scanStream running sum of 4 elements (test 94)', () => {
    expect(scanStream([1, 2, 3, 4], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10]);
  });
  it('scanStream running sum of 5 elements (test 95)', () => {
    expect(scanStream([1, 2, 3, 4, 5], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15]);
  });
  it('scanStream running sum of 6 elements (test 96)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21]);
  });
  it('scanStream running sum of 7 elements (test 97)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28]);
  });
  it('scanStream running sum of 8 elements (test 98)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36]);
  });
  it('scanStream running sum of 9 elements (test 99)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45]);
  });
  it('scanStream running sum of 10 elements (test 100)', () => {
    expect(scanStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (acc, x) => acc + x, 0)).toEqual([1, 3, 6, 10, 15, 21, 28, 36, 45, 55]);
  });
});

describe('flatMapStream', () => {
  it('flatMapStream repeat each 1 times, 1 elements (test 1)', () => {
    expect(flatMapStream([1], (x) => Array(1).fill(x))).toEqual([1]);
  });
  it('flatMapStream repeat each 2 times, 2 elements (test 2)', () => {
    expect(flatMapStream([1, 2], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2]);
  });
  it('flatMapStream repeat each 3 times, 3 elements (test 3)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3]);
  });
  it('flatMapStream repeat each 1 times, 4 elements (test 4)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(1).fill(x))).toEqual([1, 2, 3, 4]);
  });
  it('flatMapStream repeat each 2 times, 5 elements (test 5)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  });
  it('flatMapStream repeat each 3 times, 1 elements (test 6)', () => {
    expect(flatMapStream([1], (x) => Array(3).fill(x))).toEqual([1, 1, 1]);
  });
  it('flatMapStream repeat each 1 times, 2 elements (test 7)', () => {
    expect(flatMapStream([1, 2], (x) => Array(1).fill(x))).toEqual([1, 2]);
  });
  it('flatMapStream repeat each 2 times, 3 elements (test 8)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3]);
  });
  it('flatMapStream repeat each 3 times, 4 elements (test 9)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4]);
  });
  it('flatMapStream repeat each 1 times, 5 elements (test 10)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(1).fill(x))).toEqual([1, 2, 3, 4, 5]);
  });
  it('flatMapStream repeat each 2 times, 1 elements (test 11)', () => {
    expect(flatMapStream([1], (x) => Array(2).fill(x))).toEqual([1, 1]);
  });
  it('flatMapStream repeat each 3 times, 2 elements (test 12)', () => {
    expect(flatMapStream([1, 2], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2]);
  });
  it('flatMapStream repeat each 1 times, 3 elements (test 13)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(1).fill(x))).toEqual([1, 2, 3]);
  });
  it('flatMapStream repeat each 2 times, 4 elements (test 14)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
  });
  it('flatMapStream repeat each 3 times, 5 elements (test 15)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5]);
  });
  it('flatMapStream repeat each 1 times, 1 elements (test 16)', () => {
    expect(flatMapStream([1], (x) => Array(1).fill(x))).toEqual([1]);
  });
  it('flatMapStream repeat each 2 times, 2 elements (test 17)', () => {
    expect(flatMapStream([1, 2], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2]);
  });
  it('flatMapStream repeat each 3 times, 3 elements (test 18)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3]);
  });
  it('flatMapStream repeat each 1 times, 4 elements (test 19)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(1).fill(x))).toEqual([1, 2, 3, 4]);
  });
  it('flatMapStream repeat each 2 times, 5 elements (test 20)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  });
  it('flatMapStream repeat each 3 times, 1 elements (test 21)', () => {
    expect(flatMapStream([1], (x) => Array(3).fill(x))).toEqual([1, 1, 1]);
  });
  it('flatMapStream repeat each 1 times, 2 elements (test 22)', () => {
    expect(flatMapStream([1, 2], (x) => Array(1).fill(x))).toEqual([1, 2]);
  });
  it('flatMapStream repeat each 2 times, 3 elements (test 23)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3]);
  });
  it('flatMapStream repeat each 3 times, 4 elements (test 24)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4]);
  });
  it('flatMapStream repeat each 1 times, 5 elements (test 25)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(1).fill(x))).toEqual([1, 2, 3, 4, 5]);
  });
  it('flatMapStream repeat each 2 times, 1 elements (test 26)', () => {
    expect(flatMapStream([1], (x) => Array(2).fill(x))).toEqual([1, 1]);
  });
  it('flatMapStream repeat each 3 times, 2 elements (test 27)', () => {
    expect(flatMapStream([1, 2], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2]);
  });
  it('flatMapStream repeat each 1 times, 3 elements (test 28)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(1).fill(x))).toEqual([1, 2, 3]);
  });
  it('flatMapStream repeat each 2 times, 4 elements (test 29)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
  });
  it('flatMapStream repeat each 3 times, 5 elements (test 30)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5]);
  });
  it('flatMapStream repeat each 1 times, 1 elements (test 31)', () => {
    expect(flatMapStream([1], (x) => Array(1).fill(x))).toEqual([1]);
  });
  it('flatMapStream repeat each 2 times, 2 elements (test 32)', () => {
    expect(flatMapStream([1, 2], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2]);
  });
  it('flatMapStream repeat each 3 times, 3 elements (test 33)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3]);
  });
  it('flatMapStream repeat each 1 times, 4 elements (test 34)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(1).fill(x))).toEqual([1, 2, 3, 4]);
  });
  it('flatMapStream repeat each 2 times, 5 elements (test 35)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  });
  it('flatMapStream repeat each 3 times, 1 elements (test 36)', () => {
    expect(flatMapStream([1], (x) => Array(3).fill(x))).toEqual([1, 1, 1]);
  });
  it('flatMapStream repeat each 1 times, 2 elements (test 37)', () => {
    expect(flatMapStream([1, 2], (x) => Array(1).fill(x))).toEqual([1, 2]);
  });
  it('flatMapStream repeat each 2 times, 3 elements (test 38)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3]);
  });
  it('flatMapStream repeat each 3 times, 4 elements (test 39)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4]);
  });
  it('flatMapStream repeat each 1 times, 5 elements (test 40)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(1).fill(x))).toEqual([1, 2, 3, 4, 5]);
  });
  it('flatMapStream repeat each 2 times, 1 elements (test 41)', () => {
    expect(flatMapStream([1], (x) => Array(2).fill(x))).toEqual([1, 1]);
  });
  it('flatMapStream repeat each 3 times, 2 elements (test 42)', () => {
    expect(flatMapStream([1, 2], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2]);
  });
  it('flatMapStream repeat each 1 times, 3 elements (test 43)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(1).fill(x))).toEqual([1, 2, 3]);
  });
  it('flatMapStream repeat each 2 times, 4 elements (test 44)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
  });
  it('flatMapStream repeat each 3 times, 5 elements (test 45)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5]);
  });
  it('flatMapStream repeat each 1 times, 1 elements (test 46)', () => {
    expect(flatMapStream([1], (x) => Array(1).fill(x))).toEqual([1]);
  });
  it('flatMapStream repeat each 2 times, 2 elements (test 47)', () => {
    expect(flatMapStream([1, 2], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2]);
  });
  it('flatMapStream repeat each 3 times, 3 elements (test 48)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3]);
  });
  it('flatMapStream repeat each 1 times, 4 elements (test 49)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(1).fill(x))).toEqual([1, 2, 3, 4]);
  });
  it('flatMapStream repeat each 2 times, 5 elements (test 50)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  });
  it('flatMapStream repeat each 3 times, 1 elements (test 51)', () => {
    expect(flatMapStream([1], (x) => Array(3).fill(x))).toEqual([1, 1, 1]);
  });
  it('flatMapStream repeat each 1 times, 2 elements (test 52)', () => {
    expect(flatMapStream([1, 2], (x) => Array(1).fill(x))).toEqual([1, 2]);
  });
  it('flatMapStream repeat each 2 times, 3 elements (test 53)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3]);
  });
  it('flatMapStream repeat each 3 times, 4 elements (test 54)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4]);
  });
  it('flatMapStream repeat each 1 times, 5 elements (test 55)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(1).fill(x))).toEqual([1, 2, 3, 4, 5]);
  });
  it('flatMapStream repeat each 2 times, 1 elements (test 56)', () => {
    expect(flatMapStream([1], (x) => Array(2).fill(x))).toEqual([1, 1]);
  });
  it('flatMapStream repeat each 3 times, 2 elements (test 57)', () => {
    expect(flatMapStream([1, 2], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2]);
  });
  it('flatMapStream repeat each 1 times, 3 elements (test 58)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(1).fill(x))).toEqual([1, 2, 3]);
  });
  it('flatMapStream repeat each 2 times, 4 elements (test 59)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
  });
  it('flatMapStream repeat each 3 times, 5 elements (test 60)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5]);
  });
  it('flatMapStream repeat each 1 times, 1 elements (test 61)', () => {
    expect(flatMapStream([1], (x) => Array(1).fill(x))).toEqual([1]);
  });
  it('flatMapStream repeat each 2 times, 2 elements (test 62)', () => {
    expect(flatMapStream([1, 2], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2]);
  });
  it('flatMapStream repeat each 3 times, 3 elements (test 63)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3]);
  });
  it('flatMapStream repeat each 1 times, 4 elements (test 64)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(1).fill(x))).toEqual([1, 2, 3, 4]);
  });
  it('flatMapStream repeat each 2 times, 5 elements (test 65)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  });
  it('flatMapStream repeat each 3 times, 1 elements (test 66)', () => {
    expect(flatMapStream([1], (x) => Array(3).fill(x))).toEqual([1, 1, 1]);
  });
  it('flatMapStream repeat each 1 times, 2 elements (test 67)', () => {
    expect(flatMapStream([1, 2], (x) => Array(1).fill(x))).toEqual([1, 2]);
  });
  it('flatMapStream repeat each 2 times, 3 elements (test 68)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3]);
  });
  it('flatMapStream repeat each 3 times, 4 elements (test 69)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4]);
  });
  it('flatMapStream repeat each 1 times, 5 elements (test 70)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(1).fill(x))).toEqual([1, 2, 3, 4, 5]);
  });
  it('flatMapStream repeat each 2 times, 1 elements (test 71)', () => {
    expect(flatMapStream([1], (x) => Array(2).fill(x))).toEqual([1, 1]);
  });
  it('flatMapStream repeat each 3 times, 2 elements (test 72)', () => {
    expect(flatMapStream([1, 2], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2]);
  });
  it('flatMapStream repeat each 1 times, 3 elements (test 73)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(1).fill(x))).toEqual([1, 2, 3]);
  });
  it('flatMapStream repeat each 2 times, 4 elements (test 74)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
  });
  it('flatMapStream repeat each 3 times, 5 elements (test 75)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5]);
  });
  it('flatMapStream repeat each 1 times, 1 elements (test 76)', () => {
    expect(flatMapStream([1], (x) => Array(1).fill(x))).toEqual([1]);
  });
  it('flatMapStream repeat each 2 times, 2 elements (test 77)', () => {
    expect(flatMapStream([1, 2], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2]);
  });
  it('flatMapStream repeat each 3 times, 3 elements (test 78)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3]);
  });
  it('flatMapStream repeat each 1 times, 4 elements (test 79)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(1).fill(x))).toEqual([1, 2, 3, 4]);
  });
  it('flatMapStream repeat each 2 times, 5 elements (test 80)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  });
  it('flatMapStream repeat each 3 times, 1 elements (test 81)', () => {
    expect(flatMapStream([1], (x) => Array(3).fill(x))).toEqual([1, 1, 1]);
  });
  it('flatMapStream repeat each 1 times, 2 elements (test 82)', () => {
    expect(flatMapStream([1, 2], (x) => Array(1).fill(x))).toEqual([1, 2]);
  });
  it('flatMapStream repeat each 2 times, 3 elements (test 83)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3]);
  });
  it('flatMapStream repeat each 3 times, 4 elements (test 84)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4]);
  });
  it('flatMapStream repeat each 1 times, 5 elements (test 85)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(1).fill(x))).toEqual([1, 2, 3, 4, 5]);
  });
  it('flatMapStream repeat each 2 times, 1 elements (test 86)', () => {
    expect(flatMapStream([1], (x) => Array(2).fill(x))).toEqual([1, 1]);
  });
  it('flatMapStream repeat each 3 times, 2 elements (test 87)', () => {
    expect(flatMapStream([1, 2], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2]);
  });
  it('flatMapStream repeat each 1 times, 3 elements (test 88)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(1).fill(x))).toEqual([1, 2, 3]);
  });
  it('flatMapStream repeat each 2 times, 4 elements (test 89)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
  });
  it('flatMapStream repeat each 3 times, 5 elements (test 90)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5]);
  });
  it('flatMapStream repeat each 1 times, 1 elements (test 91)', () => {
    expect(flatMapStream([1], (x) => Array(1).fill(x))).toEqual([1]);
  });
  it('flatMapStream repeat each 2 times, 2 elements (test 92)', () => {
    expect(flatMapStream([1, 2], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2]);
  });
  it('flatMapStream repeat each 3 times, 3 elements (test 93)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3]);
  });
  it('flatMapStream repeat each 1 times, 4 elements (test 94)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(1).fill(x))).toEqual([1, 2, 3, 4]);
  });
  it('flatMapStream repeat each 2 times, 5 elements (test 95)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  });
  it('flatMapStream repeat each 3 times, 1 elements (test 96)', () => {
    expect(flatMapStream([1], (x) => Array(3).fill(x))).toEqual([1, 1, 1]);
  });
  it('flatMapStream repeat each 1 times, 2 elements (test 97)', () => {
    expect(flatMapStream([1, 2], (x) => Array(1).fill(x))).toEqual([1, 2]);
  });
  it('flatMapStream repeat each 2 times, 3 elements (test 98)', () => {
    expect(flatMapStream([1, 2, 3], (x) => Array(2).fill(x))).toEqual([1, 1, 2, 2, 3, 3]);
  });
  it('flatMapStream repeat each 3 times, 4 elements (test 99)', () => {
    expect(flatMapStream([1, 2, 3, 4], (x) => Array(3).fill(x))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4]);
  });
  it('flatMapStream repeat each 1 times, 5 elements (test 100)', () => {
    expect(flatMapStream([1, 2, 3, 4, 5], (x) => Array(1).fill(x))).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('zipStream', () => {
  it('zipStream of 1 elements each (test 1)', () => {
    expect(zipStream([0], [1])).toEqual([[0, 1]]);
  });
  it('zipStream of 2 elements each (test 2)', () => {
    expect(zipStream([0, 1], [2, 3])).toEqual([[0, 2], [1, 3]]);
  });
  it('zipStream of 3 elements each (test 3)', () => {
    expect(zipStream([0, 1, 2], [3, 4, 5])).toEqual([[0, 3], [1, 4], [2, 5]]);
  });
  it('zipStream of 4 elements each (test 4)', () => {
    expect(zipStream([0, 1, 2, 3], [4, 5, 6, 7])).toEqual([[0, 4], [1, 5], [2, 6], [3, 7]]);
  });
  it('zipStream of 5 elements each (test 5)', () => {
    expect(zipStream([0, 1, 2, 3, 4], [5, 6, 7, 8, 9])).toEqual([[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]]);
  });
  it('zipStream of 6 elements each (test 6)', () => {
    expect(zipStream([0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11])).toEqual([[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]]);
  });
  it('zipStream of 7 elements each (test 7)', () => {
    expect(zipStream([0, 1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12, 13])).toEqual([[0, 7], [1, 8], [2, 9], [3, 10], [4, 11], [5, 12], [6, 13]]);
  });
  it('zipStream of 8 elements each (test 8)', () => {
    expect(zipStream([0, 1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14, 15])).toEqual([[0, 8], [1, 9], [2, 10], [3, 11], [4, 12], [5, 13], [6, 14], [7, 15]]);
  });
  it('zipStream of 1 elements each (test 9)', () => {
    expect(zipStream([0], [1])).toEqual([[0, 1]]);
  });
  it('zipStream of 2 elements each (test 10)', () => {
    expect(zipStream([0, 1], [2, 3])).toEqual([[0, 2], [1, 3]]);
  });
  it('zipStream of 3 elements each (test 11)', () => {
    expect(zipStream([0, 1, 2], [3, 4, 5])).toEqual([[0, 3], [1, 4], [2, 5]]);
  });
  it('zipStream of 4 elements each (test 12)', () => {
    expect(zipStream([0, 1, 2, 3], [4, 5, 6, 7])).toEqual([[0, 4], [1, 5], [2, 6], [3, 7]]);
  });
  it('zipStream of 5 elements each (test 13)', () => {
    expect(zipStream([0, 1, 2, 3, 4], [5, 6, 7, 8, 9])).toEqual([[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]]);
  });
  it('zipStream of 6 elements each (test 14)', () => {
    expect(zipStream([0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11])).toEqual([[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]]);
  });
  it('zipStream of 7 elements each (test 15)', () => {
    expect(zipStream([0, 1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12, 13])).toEqual([[0, 7], [1, 8], [2, 9], [3, 10], [4, 11], [5, 12], [6, 13]]);
  });
  it('zipStream of 8 elements each (test 16)', () => {
    expect(zipStream([0, 1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14, 15])).toEqual([[0, 8], [1, 9], [2, 10], [3, 11], [4, 12], [5, 13], [6, 14], [7, 15]]);
  });
  it('zipStream of 1 elements each (test 17)', () => {
    expect(zipStream([0], [1])).toEqual([[0, 1]]);
  });
  it('zipStream of 2 elements each (test 18)', () => {
    expect(zipStream([0, 1], [2, 3])).toEqual([[0, 2], [1, 3]]);
  });
  it('zipStream of 3 elements each (test 19)', () => {
    expect(zipStream([0, 1, 2], [3, 4, 5])).toEqual([[0, 3], [1, 4], [2, 5]]);
  });
  it('zipStream of 4 elements each (test 20)', () => {
    expect(zipStream([0, 1, 2, 3], [4, 5, 6, 7])).toEqual([[0, 4], [1, 5], [2, 6], [3, 7]]);
  });
  it('zipStream of 5 elements each (test 21)', () => {
    expect(zipStream([0, 1, 2, 3, 4], [5, 6, 7, 8, 9])).toEqual([[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]]);
  });
  it('zipStream of 6 elements each (test 22)', () => {
    expect(zipStream([0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11])).toEqual([[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]]);
  });
  it('zipStream of 7 elements each (test 23)', () => {
    expect(zipStream([0, 1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12, 13])).toEqual([[0, 7], [1, 8], [2, 9], [3, 10], [4, 11], [5, 12], [6, 13]]);
  });
  it('zipStream of 8 elements each (test 24)', () => {
    expect(zipStream([0, 1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14, 15])).toEqual([[0, 8], [1, 9], [2, 10], [3, 11], [4, 12], [5, 13], [6, 14], [7, 15]]);
  });
  it('zipStream of 1 elements each (test 25)', () => {
    expect(zipStream([0], [1])).toEqual([[0, 1]]);
  });
  it('zipStream of 2 elements each (test 26)', () => {
    expect(zipStream([0, 1], [2, 3])).toEqual([[0, 2], [1, 3]]);
  });
  it('zipStream of 3 elements each (test 27)', () => {
    expect(zipStream([0, 1, 2], [3, 4, 5])).toEqual([[0, 3], [1, 4], [2, 5]]);
  });
  it('zipStream of 4 elements each (test 28)', () => {
    expect(zipStream([0, 1, 2, 3], [4, 5, 6, 7])).toEqual([[0, 4], [1, 5], [2, 6], [3, 7]]);
  });
  it('zipStream of 5 elements each (test 29)', () => {
    expect(zipStream([0, 1, 2, 3, 4], [5, 6, 7, 8, 9])).toEqual([[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]]);
  });
  it('zipStream of 6 elements each (test 30)', () => {
    expect(zipStream([0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11])).toEqual([[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]]);
  });
  it('zipStream of 7 elements each (test 31)', () => {
    expect(zipStream([0, 1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12, 13])).toEqual([[0, 7], [1, 8], [2, 9], [3, 10], [4, 11], [5, 12], [6, 13]]);
  });
  it('zipStream of 8 elements each (test 32)', () => {
    expect(zipStream([0, 1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14, 15])).toEqual([[0, 8], [1, 9], [2, 10], [3, 11], [4, 12], [5, 13], [6, 14], [7, 15]]);
  });
  it('zipStream of 1 elements each (test 33)', () => {
    expect(zipStream([0], [1])).toEqual([[0, 1]]);
  });
  it('zipStream of 2 elements each (test 34)', () => {
    expect(zipStream([0, 1], [2, 3])).toEqual([[0, 2], [1, 3]]);
  });
  it('zipStream of 3 elements each (test 35)', () => {
    expect(zipStream([0, 1, 2], [3, 4, 5])).toEqual([[0, 3], [1, 4], [2, 5]]);
  });
  it('zipStream of 4 elements each (test 36)', () => {
    expect(zipStream([0, 1, 2, 3], [4, 5, 6, 7])).toEqual([[0, 4], [1, 5], [2, 6], [3, 7]]);
  });
  it('zipStream of 5 elements each (test 37)', () => {
    expect(zipStream([0, 1, 2, 3, 4], [5, 6, 7, 8, 9])).toEqual([[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]]);
  });
  it('zipStream of 6 elements each (test 38)', () => {
    expect(zipStream([0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11])).toEqual([[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]]);
  });
  it('zipStream of 7 elements each (test 39)', () => {
    expect(zipStream([0, 1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12, 13])).toEqual([[0, 7], [1, 8], [2, 9], [3, 10], [4, 11], [5, 12], [6, 13]]);
  });
  it('zipStream of 8 elements each (test 40)', () => {
    expect(zipStream([0, 1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14, 15])).toEqual([[0, 8], [1, 9], [2, 10], [3, 11], [4, 12], [5, 13], [6, 14], [7, 15]]);
  });
  it('zipStream of 1 elements each (test 41)', () => {
    expect(zipStream([0], [1])).toEqual([[0, 1]]);
  });
  it('zipStream of 2 elements each (test 42)', () => {
    expect(zipStream([0, 1], [2, 3])).toEqual([[0, 2], [1, 3]]);
  });
  it('zipStream of 3 elements each (test 43)', () => {
    expect(zipStream([0, 1, 2], [3, 4, 5])).toEqual([[0, 3], [1, 4], [2, 5]]);
  });
  it('zipStream of 4 elements each (test 44)', () => {
    expect(zipStream([0, 1, 2, 3], [4, 5, 6, 7])).toEqual([[0, 4], [1, 5], [2, 6], [3, 7]]);
  });
  it('zipStream of 5 elements each (test 45)', () => {
    expect(zipStream([0, 1, 2, 3, 4], [5, 6, 7, 8, 9])).toEqual([[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]]);
  });
  it('zipStream of 6 elements each (test 46)', () => {
    expect(zipStream([0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11])).toEqual([[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]]);
  });
  it('zipStream of 7 elements each (test 47)', () => {
    expect(zipStream([0, 1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12, 13])).toEqual([[0, 7], [1, 8], [2, 9], [3, 10], [4, 11], [5, 12], [6, 13]]);
  });
  it('zipStream of 8 elements each (test 48)', () => {
    expect(zipStream([0, 1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14, 15])).toEqual([[0, 8], [1, 9], [2, 10], [3, 11], [4, 12], [5, 13], [6, 14], [7, 15]]);
  });
  it('zipStream of 1 elements each (test 49)', () => {
    expect(zipStream([0], [1])).toEqual([[0, 1]]);
  });
  it('zipStream of 2 elements each (test 50)', () => {
    expect(zipStream([0, 1], [2, 3])).toEqual([[0, 2], [1, 3]]);
  });
});

describe('mergeArrays', () => {
  it('mergeArrays of two arrays len 1 (test 1)', () => {
    expect(mergeArrays([0], [1])).toEqual([0, 1]);
  });
  it('mergeArrays of two arrays len 2 (test 2)', () => {
    expect(mergeArrays([0, 1], [2, 3])).toEqual([0, 1, 2, 3]);
  });
  it('mergeArrays of two arrays len 3 (test 3)', () => {
    expect(mergeArrays([0, 1, 2], [3, 4, 5])).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it('mergeArrays of two arrays len 4 (test 4)', () => {
    expect(mergeArrays([0, 1, 2, 3], [4, 5, 6, 7])).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
  it('mergeArrays of two arrays len 5 (test 5)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4], [5, 6, 7, 8, 9])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('mergeArrays of two arrays len 6 (test 6)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
  it('mergeArrays of two arrays len 7 (test 7)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12, 13])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });
  it('mergeArrays of two arrays len 8 (test 8)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14, 15])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });
  it('mergeArrays of two arrays len 9 (test 9)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8], [9, 10, 11, 12, 13, 14, 15, 16, 17])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
  });
  it('mergeArrays of two arrays len 10 (test 10)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [10, 11, 12, 13, 14, 15, 16, 17, 18, 19])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
  it('mergeArrays of two arrays len 11 (test 11)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]);
  });
  it('mergeArrays of two arrays len 12 (test 12)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
  });
  it('mergeArrays of two arrays len 13 (test 13)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]);
  });
  it('mergeArrays of two arrays len 14 (test 14)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]);
  });
  it('mergeArrays of two arrays len 15 (test 15)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]);
  });
  it('mergeArrays of two arrays len 16 (test 16)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]);
  });
  it('mergeArrays of two arrays len 17 (test 17)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33]);
  });
  it('mergeArrays of two arrays len 18 (test 18)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]);
  });
  it('mergeArrays of two arrays len 19 (test 19)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37]);
  });
  it('mergeArrays of two arrays len 20 (test 20)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39]);
  });
  it('mergeArrays of two arrays len 21 (test 21)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41]);
  });
  it('mergeArrays of two arrays len 22 (test 22)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43]);
  });
  it('mergeArrays of two arrays len 23 (test 23)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45]);
  });
  it('mergeArrays of two arrays len 24 (test 24)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47]);
  });
  it('mergeArrays of two arrays len 25 (test 25)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49]);
  });
  it('mergeArrays of two arrays len 26 (test 26)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51]);
  });
  it('mergeArrays of two arrays len 27 (test 27)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53]);
  });
  it('mergeArrays of two arrays len 28 (test 28)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27], [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55]);
  });
  it('mergeArrays of two arrays len 29 (test 29)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28], [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57]);
  });
  it('mergeArrays of two arrays len 30 (test 30)', () => {
    expect(mergeArrays([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29], [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]);
  });
});

describe('distinctStream', () => {
  it('distinctStream removes duplicates (test 1)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 2)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 3)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 4)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 5)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 6)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 7)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 8)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 9)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 10)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 11)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 12)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 13)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 14)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 15)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 16)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 17)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 18)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 19)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 20)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 21)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 22)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 23)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 24)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream removes duplicates (test 25)', () => {
    expect(distinctStream([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream no-op on unique array len 1 (test 26)', () => {
    expect(distinctStream([0])).toEqual([0]);
  });
  it('distinctStream no-op on unique array len 2 (test 27)', () => {
    expect(distinctStream([0, 1])).toEqual([0, 1]);
  });
  it('distinctStream no-op on unique array len 3 (test 28)', () => {
    expect(distinctStream([0, 1, 2])).toEqual([0, 1, 2]);
  });
  it('distinctStream no-op on unique array len 4 (test 29)', () => {
    expect(distinctStream([0, 1, 2, 3])).toEqual([0, 1, 2, 3]);
  });
  it('distinctStream no-op on unique array len 5 (test 30)', () => {
    expect(distinctStream([0, 1, 2, 3, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream no-op on unique array len 6 (test 31)', () => {
    expect(distinctStream([0, 1, 2, 3, 4, 5])).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it('distinctStream no-op on unique array len 7 (test 32)', () => {
    expect(distinctStream([0, 1, 2, 3, 4, 5, 6])).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
  it('distinctStream no-op on unique array len 8 (test 33)', () => {
    expect(distinctStream([0, 1, 2, 3, 4, 5, 6, 7])).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
  it('distinctStream no-op on unique array len 1 (test 34)', () => {
    expect(distinctStream([0])).toEqual([0]);
  });
  it('distinctStream no-op on unique array len 2 (test 35)', () => {
    expect(distinctStream([0, 1])).toEqual([0, 1]);
  });
  it('distinctStream no-op on unique array len 3 (test 36)', () => {
    expect(distinctStream([0, 1, 2])).toEqual([0, 1, 2]);
  });
  it('distinctStream no-op on unique array len 4 (test 37)', () => {
    expect(distinctStream([0, 1, 2, 3])).toEqual([0, 1, 2, 3]);
  });
  it('distinctStream no-op on unique array len 5 (test 38)', () => {
    expect(distinctStream([0, 1, 2, 3, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream no-op on unique array len 6 (test 39)', () => {
    expect(distinctStream([0, 1, 2, 3, 4, 5])).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it('distinctStream no-op on unique array len 7 (test 40)', () => {
    expect(distinctStream([0, 1, 2, 3, 4, 5, 6])).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
  it('distinctStream no-op on unique array len 8 (test 41)', () => {
    expect(distinctStream([0, 1, 2, 3, 4, 5, 6, 7])).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
  it('distinctStream no-op on unique array len 1 (test 42)', () => {
    expect(distinctStream([0])).toEqual([0]);
  });
  it('distinctStream no-op on unique array len 2 (test 43)', () => {
    expect(distinctStream([0, 1])).toEqual([0, 1]);
  });
  it('distinctStream no-op on unique array len 3 (test 44)', () => {
    expect(distinctStream([0, 1, 2])).toEqual([0, 1, 2]);
  });
  it('distinctStream no-op on unique array len 4 (test 45)', () => {
    expect(distinctStream([0, 1, 2, 3])).toEqual([0, 1, 2, 3]);
  });
  it('distinctStream no-op on unique array len 5 (test 46)', () => {
    expect(distinctStream([0, 1, 2, 3, 4])).toEqual([0, 1, 2, 3, 4]);
  });
  it('distinctStream no-op on unique array len 6 (test 47)', () => {
    expect(distinctStream([0, 1, 2, 3, 4, 5])).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it('distinctStream no-op on unique array len 7 (test 48)', () => {
    expect(distinctStream([0, 1, 2, 3, 4, 5, 6])).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
  it('distinctStream no-op on unique array len 8 (test 49)', () => {
    expect(distinctStream([0, 1, 2, 3, 4, 5, 6, 7])).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
  it('distinctStream no-op on unique array len 1 (test 50)', () => {
    expect(distinctStream([0])).toEqual([0]);
  });
});

describe('chunkStream', () => {
  it('chunkStream size=2 on 4-element array (test 1)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 2)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 3)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 4)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 5)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 6)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 7)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 8)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 9)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 10)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 11)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 12)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 13)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 14)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 15)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 16)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 17)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 18)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 19)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 20)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 21)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 22)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 23)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 24)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 25)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 26)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 27)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 28)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 29)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 30)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 31)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 32)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 33)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 34)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 35)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 36)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 37)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 38)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 39)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 40)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 41)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 42)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 43)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 44)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 45)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 46)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 47)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 48)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 49)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 50)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 51)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 52)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 53)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 54)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 55)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 56)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 57)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 58)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 59)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 60)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 61)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 62)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 63)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 64)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 65)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 66)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 67)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 68)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 69)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 70)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 71)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 72)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 73)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 74)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 75)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 76)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 77)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 78)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 79)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 80)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 81)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 82)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 83)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 84)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 85)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 86)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 87)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 88)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 89)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 90)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 91)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 92)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 93)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 94)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 95)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 96)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
  it('chunkStream size=2 on 4-element array (test 97)', () => {
    expect(chunkStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [2, 3]]);
  });
  it('chunkStream size=3 on 9-element array (test 98)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('chunkStream size=4 on 16-element array (test 99)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 4)).toEqual([[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]);
  });
  it('chunkStream size=5 on 25-element array (test 100)', () => {
    expect(chunkStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 5)).toEqual([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]]);
  });
});

describe('windowStream', () => {
  it('windowStream size=2 total=2 (test 1)', () => {
    expect(windowStream([0, 1], 2)).toEqual([[0, 1]]);
  });
  it('windowStream size=3 total=4 (test 2)', () => {
    expect(windowStream([0, 1, 2, 3], 3)).toEqual([[0, 1, 2], [1, 2, 3]]);
  });
  it('windowStream size=4 total=6 (test 3)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5], 4)).toEqual([[0, 1, 2, 3], [1, 2, 3, 4], [2, 3, 4, 5]]);
  });
  it('windowStream size=5 total=8 (test 4)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5, 6, 7], 5)).toEqual([[0, 1, 2, 3, 4], [1, 2, 3, 4, 5], [2, 3, 4, 5, 6], [3, 4, 5, 6, 7]]);
  });
  it('windowStream size=2 total=6 (test 5)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5], 2)).toEqual([[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]]);
  });
  it('windowStream size=3 total=3 (test 6)', () => {
    expect(windowStream([0, 1, 2], 3)).toEqual([[0, 1, 2]]);
  });
  it('windowStream size=4 total=5 (test 7)', () => {
    expect(windowStream([0, 1, 2, 3, 4], 4)).toEqual([[0, 1, 2, 3], [1, 2, 3, 4]]);
  });
  it('windowStream size=5 total=7 (test 8)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5, 6], 5)).toEqual([[0, 1, 2, 3, 4], [1, 2, 3, 4, 5], [2, 3, 4, 5, 6]]);
  });
  it('windowStream size=2 total=5 (test 9)', () => {
    expect(windowStream([0, 1, 2, 3, 4], 2)).toEqual([[0, 1], [1, 2], [2, 3], [3, 4]]);
  });
  it('windowStream size=3 total=7 (test 10)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5, 6], 3)).toEqual([[0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6]]);
  });
  it('windowStream size=4 total=4 (test 11)', () => {
    expect(windowStream([0, 1, 2, 3], 4)).toEqual([[0, 1, 2, 3]]);
  });
  it('windowStream size=5 total=6 (test 12)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5], 5)).toEqual([[0, 1, 2, 3, 4], [1, 2, 3, 4, 5]]);
  });
  it('windowStream size=2 total=4 (test 13)', () => {
    expect(windowStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [1, 2], [2, 3]]);
  });
  it('windowStream size=3 total=6 (test 14)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5], 3)).toEqual([[0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5]]);
  });
  it('windowStream size=4 total=8 (test 15)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5, 6, 7], 4)).toEqual([[0, 1, 2, 3], [1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6], [4, 5, 6, 7]]);
  });
  it('windowStream size=5 total=5 (test 16)', () => {
    expect(windowStream([0, 1, 2, 3, 4], 5)).toEqual([[0, 1, 2, 3, 4]]);
  });
  it('windowStream size=2 total=3 (test 17)', () => {
    expect(windowStream([0, 1, 2], 2)).toEqual([[0, 1], [1, 2]]);
  });
  it('windowStream size=3 total=5 (test 18)', () => {
    expect(windowStream([0, 1, 2, 3, 4], 3)).toEqual([[0, 1, 2], [1, 2, 3], [2, 3, 4]]);
  });
  it('windowStream size=4 total=7 (test 19)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5, 6], 4)).toEqual([[0, 1, 2, 3], [1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]]);
  });
  it('windowStream size=5 total=9 (test 20)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 5)).toEqual([[0, 1, 2, 3, 4], [1, 2, 3, 4, 5], [2, 3, 4, 5, 6], [3, 4, 5, 6, 7], [4, 5, 6, 7, 8]]);
  });
  it('windowStream size=2 total=2 (test 21)', () => {
    expect(windowStream([0, 1], 2)).toEqual([[0, 1]]);
  });
  it('windowStream size=3 total=4 (test 22)', () => {
    expect(windowStream([0, 1, 2, 3], 3)).toEqual([[0, 1, 2], [1, 2, 3]]);
  });
  it('windowStream size=4 total=6 (test 23)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5], 4)).toEqual([[0, 1, 2, 3], [1, 2, 3, 4], [2, 3, 4, 5]]);
  });
  it('windowStream size=5 total=8 (test 24)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5, 6, 7], 5)).toEqual([[0, 1, 2, 3, 4], [1, 2, 3, 4, 5], [2, 3, 4, 5, 6], [3, 4, 5, 6, 7]]);
  });
  it('windowStream size=2 total=6 (test 25)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5], 2)).toEqual([[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]]);
  });
  it('windowStream size=3 total=3 (test 26)', () => {
    expect(windowStream([0, 1, 2], 3)).toEqual([[0, 1, 2]]);
  });
  it('windowStream size=4 total=5 (test 27)', () => {
    expect(windowStream([0, 1, 2, 3, 4], 4)).toEqual([[0, 1, 2, 3], [1, 2, 3, 4]]);
  });
  it('windowStream size=5 total=7 (test 28)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5, 6], 5)).toEqual([[0, 1, 2, 3, 4], [1, 2, 3, 4, 5], [2, 3, 4, 5, 6]]);
  });
  it('windowStream size=2 total=5 (test 29)', () => {
    expect(windowStream([0, 1, 2, 3, 4], 2)).toEqual([[0, 1], [1, 2], [2, 3], [3, 4]]);
  });
  it('windowStream size=3 total=7 (test 30)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5, 6], 3)).toEqual([[0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6]]);
  });
  it('windowStream size=4 total=4 (test 31)', () => {
    expect(windowStream([0, 1, 2, 3], 4)).toEqual([[0, 1, 2, 3]]);
  });
  it('windowStream size=5 total=6 (test 32)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5], 5)).toEqual([[0, 1, 2, 3, 4], [1, 2, 3, 4, 5]]);
  });
  it('windowStream size=2 total=4 (test 33)', () => {
    expect(windowStream([0, 1, 2, 3], 2)).toEqual([[0, 1], [1, 2], [2, 3]]);
  });
  it('windowStream size=3 total=6 (test 34)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5], 3)).toEqual([[0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5]]);
  });
  it('windowStream size=4 total=8 (test 35)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5, 6, 7], 4)).toEqual([[0, 1, 2, 3], [1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6], [4, 5, 6, 7]]);
  });
  it('windowStream size=5 total=5 (test 36)', () => {
    expect(windowStream([0, 1, 2, 3, 4], 5)).toEqual([[0, 1, 2, 3, 4]]);
  });
  it('windowStream size=2 total=3 (test 37)', () => {
    expect(windowStream([0, 1, 2], 2)).toEqual([[0, 1], [1, 2]]);
  });
  it('windowStream size=3 total=5 (test 38)', () => {
    expect(windowStream([0, 1, 2, 3, 4], 3)).toEqual([[0, 1, 2], [1, 2, 3], [2, 3, 4]]);
  });
  it('windowStream size=4 total=7 (test 39)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5, 6], 4)).toEqual([[0, 1, 2, 3], [1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]]);
  });
  it('windowStream size=5 total=9 (test 40)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5, 6, 7, 8], 5)).toEqual([[0, 1, 2, 3, 4], [1, 2, 3, 4, 5], [2, 3, 4, 5, 6], [3, 4, 5, 6, 7], [4, 5, 6, 7, 8]]);
  });
  it('windowStream size=2 total=2 (test 41)', () => {
    expect(windowStream([0, 1], 2)).toEqual([[0, 1]]);
  });
  it('windowStream size=3 total=4 (test 42)', () => {
    expect(windowStream([0, 1, 2, 3], 3)).toEqual([[0, 1, 2], [1, 2, 3]]);
  });
  it('windowStream size=4 total=6 (test 43)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5], 4)).toEqual([[0, 1, 2, 3], [1, 2, 3, 4], [2, 3, 4, 5]]);
  });
  it('windowStream size=5 total=8 (test 44)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5, 6, 7], 5)).toEqual([[0, 1, 2, 3, 4], [1, 2, 3, 4, 5], [2, 3, 4, 5, 6], [3, 4, 5, 6, 7]]);
  });
  it('windowStream size=2 total=6 (test 45)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5], 2)).toEqual([[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]]);
  });
  it('windowStream size=3 total=3 (test 46)', () => {
    expect(windowStream([0, 1, 2], 3)).toEqual([[0, 1, 2]]);
  });
  it('windowStream size=4 total=5 (test 47)', () => {
    expect(windowStream([0, 1, 2, 3, 4], 4)).toEqual([[0, 1, 2, 3], [1, 2, 3, 4]]);
  });
  it('windowStream size=5 total=7 (test 48)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5, 6], 5)).toEqual([[0, 1, 2, 3, 4], [1, 2, 3, 4, 5], [2, 3, 4, 5, 6]]);
  });
  it('windowStream size=2 total=5 (test 49)', () => {
    expect(windowStream([0, 1, 2, 3, 4], 2)).toEqual([[0, 1], [1, 2], [2, 3], [3, 4]]);
  });
  it('windowStream size=3 total=7 (test 50)', () => {
    expect(windowStream([0, 1, 2, 3, 4, 5, 6], 3)).toEqual([[0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6]]);
  });
});

describe('groupByStream', () => {
  it('groupByStream mod 2 on 6 elements (test 1)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": [0, 2, 4], "1": [1, 3, 5] });
  });
  it('groupByStream mod 3 on 9 elements (test 2)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": [0, 3, 6], "1": [1, 4, 7], "2": [2, 5, 8] });
  });
  it('groupByStream mod 4 on 12 elements (test 3)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": [0, 4, 8], "1": [1, 5, 9], "2": [2, 6, 10], "3": [3, 7, 11] });
  });
  it('groupByStream mod 2 on 6 elements (test 4)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": [0, 2, 4], "1": [1, 3, 5] });
  });
  it('groupByStream mod 3 on 9 elements (test 5)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": [0, 3, 6], "1": [1, 4, 7], "2": [2, 5, 8] });
  });
  it('groupByStream mod 4 on 12 elements (test 6)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": [0, 4, 8], "1": [1, 5, 9], "2": [2, 6, 10], "3": [3, 7, 11] });
  });
  it('groupByStream mod 2 on 6 elements (test 7)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": [0, 2, 4], "1": [1, 3, 5] });
  });
  it('groupByStream mod 3 on 9 elements (test 8)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": [0, 3, 6], "1": [1, 4, 7], "2": [2, 5, 8] });
  });
  it('groupByStream mod 4 on 12 elements (test 9)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": [0, 4, 8], "1": [1, 5, 9], "2": [2, 6, 10], "3": [3, 7, 11] });
  });
  it('groupByStream mod 2 on 6 elements (test 10)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": [0, 2, 4], "1": [1, 3, 5] });
  });
  it('groupByStream mod 3 on 9 elements (test 11)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": [0, 3, 6], "1": [1, 4, 7], "2": [2, 5, 8] });
  });
  it('groupByStream mod 4 on 12 elements (test 12)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": [0, 4, 8], "1": [1, 5, 9], "2": [2, 6, 10], "3": [3, 7, 11] });
  });
  it('groupByStream mod 2 on 6 elements (test 13)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": [0, 2, 4], "1": [1, 3, 5] });
  });
  it('groupByStream mod 3 on 9 elements (test 14)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": [0, 3, 6], "1": [1, 4, 7], "2": [2, 5, 8] });
  });
  it('groupByStream mod 4 on 12 elements (test 15)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": [0, 4, 8], "1": [1, 5, 9], "2": [2, 6, 10], "3": [3, 7, 11] });
  });
  it('groupByStream mod 2 on 6 elements (test 16)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": [0, 2, 4], "1": [1, 3, 5] });
  });
  it('groupByStream mod 3 on 9 elements (test 17)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": [0, 3, 6], "1": [1, 4, 7], "2": [2, 5, 8] });
  });
  it('groupByStream mod 4 on 12 elements (test 18)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": [0, 4, 8], "1": [1, 5, 9], "2": [2, 6, 10], "3": [3, 7, 11] });
  });
  it('groupByStream mod 2 on 6 elements (test 19)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": [0, 2, 4], "1": [1, 3, 5] });
  });
  it('groupByStream mod 3 on 9 elements (test 20)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": [0, 3, 6], "1": [1, 4, 7], "2": [2, 5, 8] });
  });
  it('groupByStream mod 4 on 12 elements (test 21)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": [0, 4, 8], "1": [1, 5, 9], "2": [2, 6, 10], "3": [3, 7, 11] });
  });
  it('groupByStream mod 2 on 6 elements (test 22)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": [0, 2, 4], "1": [1, 3, 5] });
  });
  it('groupByStream mod 3 on 9 elements (test 23)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": [0, 3, 6], "1": [1, 4, 7], "2": [2, 5, 8] });
  });
  it('groupByStream mod 4 on 12 elements (test 24)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": [0, 4, 8], "1": [1, 5, 9], "2": [2, 6, 10], "3": [3, 7, 11] });
  });
  it('groupByStream mod 2 on 6 elements (test 25)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": [0, 2, 4], "1": [1, 3, 5] });
  });
  it('groupByStream mod 3 on 9 elements (test 26)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": [0, 3, 6], "1": [1, 4, 7], "2": [2, 5, 8] });
  });
  it('groupByStream mod 4 on 12 elements (test 27)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": [0, 4, 8], "1": [1, 5, 9], "2": [2, 6, 10], "3": [3, 7, 11] });
  });
  it('groupByStream mod 2 on 6 elements (test 28)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": [0, 2, 4], "1": [1, 3, 5] });
  });
  it('groupByStream mod 3 on 9 elements (test 29)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": [0, 3, 6], "1": [1, 4, 7], "2": [2, 5, 8] });
  });
  it('groupByStream mod 4 on 12 elements (test 30)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": [0, 4, 8], "1": [1, 5, 9], "2": [2, 6, 10], "3": [3, 7, 11] });
  });
  it('groupByStream mod 2 on 6 elements (test 31)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": [0, 2, 4], "1": [1, 3, 5] });
  });
  it('groupByStream mod 3 on 9 elements (test 32)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": [0, 3, 6], "1": [1, 4, 7], "2": [2, 5, 8] });
  });
  it('groupByStream mod 4 on 12 elements (test 33)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": [0, 4, 8], "1": [1, 5, 9], "2": [2, 6, 10], "3": [3, 7, 11] });
  });
  it('groupByStream mod 2 on 6 elements (test 34)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": [0, 2, 4], "1": [1, 3, 5] });
  });
  it('groupByStream mod 3 on 9 elements (test 35)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": [0, 3, 6], "1": [1, 4, 7], "2": [2, 5, 8] });
  });
  it('groupByStream mod 4 on 12 elements (test 36)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": [0, 4, 8], "1": [1, 5, 9], "2": [2, 6, 10], "3": [3, 7, 11] });
  });
  it('groupByStream mod 2 on 6 elements (test 37)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": [0, 2, 4], "1": [1, 3, 5] });
  });
  it('groupByStream mod 3 on 9 elements (test 38)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": [0, 3, 6], "1": [1, 4, 7], "2": [2, 5, 8] });
  });
  it('groupByStream mod 4 on 12 elements (test 39)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": [0, 4, 8], "1": [1, 5, 9], "2": [2, 6, 10], "3": [3, 7, 11] });
  });
  it('groupByStream mod 2 on 6 elements (test 40)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": [0, 2, 4], "1": [1, 3, 5] });
  });
  it('groupByStream mod 3 on 9 elements (test 41)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": [0, 3, 6], "1": [1, 4, 7], "2": [2, 5, 8] });
  });
  it('groupByStream mod 4 on 12 elements (test 42)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": [0, 4, 8], "1": [1, 5, 9], "2": [2, 6, 10], "3": [3, 7, 11] });
  });
  it('groupByStream mod 2 on 6 elements (test 43)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": [0, 2, 4], "1": [1, 3, 5] });
  });
  it('groupByStream mod 3 on 9 elements (test 44)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": [0, 3, 6], "1": [1, 4, 7], "2": [2, 5, 8] });
  });
  it('groupByStream mod 4 on 12 elements (test 45)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": [0, 4, 8], "1": [1, 5, 9], "2": [2, 6, 10], "3": [3, 7, 11] });
  });
  it('groupByStream mod 2 on 6 elements (test 46)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": [0, 2, 4], "1": [1, 3, 5] });
  });
  it('groupByStream mod 3 on 9 elements (test 47)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": [0, 3, 6], "1": [1, 4, 7], "2": [2, 5, 8] });
  });
  it('groupByStream mod 4 on 12 elements (test 48)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": [0, 4, 8], "1": [1, 5, 9], "2": [2, 6, 10], "3": [3, 7, 11] });
  });
  it('groupByStream mod 2 on 6 elements (test 49)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": [0, 2, 4], "1": [1, 3, 5] });
  });
  it('groupByStream mod 3 on 9 elements (test 50)', () => {
    expect(groupByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": [0, 3, 6], "1": [1, 4, 7], "2": [2, 5, 8] });
  });
});

describe('partitionStream', () => {
  it('partitionStream > 3 (test 1)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 3);
    expect(pass).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3]);
  });
  it('partitionStream > 4 (test 2)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 4);
    expect(pass).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4]);
  });
  it('partitionStream > 5 (test 3)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 5);
    expect(pass).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5]);
  });
  it('partitionStream > 6 (test 4)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 6);
    expect(pass).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('partitionStream > 7 (test 5)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 7);
    expect(pass).toEqual([8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it('partitionStream > 8 (test 6)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 8);
    expect(pass).toEqual([9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('partitionStream > 9 (test 7)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 9);
    expect(pass).toEqual([10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('partitionStream > 10 (test 8)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 10);
    expect(pass).toEqual([11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  it('partitionStream > 3 (test 9)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 3);
    expect(pass).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3]);
  });
  it('partitionStream > 4 (test 10)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 4);
    expect(pass).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4]);
  });
  it('partitionStream > 5 (test 11)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 5);
    expect(pass).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5]);
  });
  it('partitionStream > 6 (test 12)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 6);
    expect(pass).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('partitionStream > 7 (test 13)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 7);
    expect(pass).toEqual([8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it('partitionStream > 8 (test 14)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 8);
    expect(pass).toEqual([9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('partitionStream > 9 (test 15)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 9);
    expect(pass).toEqual([10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('partitionStream > 10 (test 16)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 10);
    expect(pass).toEqual([11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  it('partitionStream > 3 (test 17)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 3);
    expect(pass).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3]);
  });
  it('partitionStream > 4 (test 18)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 4);
    expect(pass).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4]);
  });
  it('partitionStream > 5 (test 19)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 5);
    expect(pass).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5]);
  });
  it('partitionStream > 6 (test 20)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 6);
    expect(pass).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('partitionStream > 7 (test 21)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 7);
    expect(pass).toEqual([8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it('partitionStream > 8 (test 22)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 8);
    expect(pass).toEqual([9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('partitionStream > 9 (test 23)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 9);
    expect(pass).toEqual([10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('partitionStream > 10 (test 24)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 10);
    expect(pass).toEqual([11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  it('partitionStream > 3 (test 25)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 3);
    expect(pass).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3]);
  });
  it('partitionStream > 4 (test 26)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 4);
    expect(pass).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4]);
  });
  it('partitionStream > 5 (test 27)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 5);
    expect(pass).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5]);
  });
  it('partitionStream > 6 (test 28)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 6);
    expect(pass).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('partitionStream > 7 (test 29)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 7);
    expect(pass).toEqual([8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it('partitionStream > 8 (test 30)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 8);
    expect(pass).toEqual([9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('partitionStream > 9 (test 31)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 9);
    expect(pass).toEqual([10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('partitionStream > 10 (test 32)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 10);
    expect(pass).toEqual([11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  it('partitionStream > 3 (test 33)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 3);
    expect(pass).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3]);
  });
  it('partitionStream > 4 (test 34)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 4);
    expect(pass).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4]);
  });
  it('partitionStream > 5 (test 35)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 5);
    expect(pass).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5]);
  });
  it('partitionStream > 6 (test 36)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 6);
    expect(pass).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('partitionStream > 7 (test 37)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 7);
    expect(pass).toEqual([8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it('partitionStream > 8 (test 38)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 8);
    expect(pass).toEqual([9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('partitionStream > 9 (test 39)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 9);
    expect(pass).toEqual([10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('partitionStream > 10 (test 40)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 10);
    expect(pass).toEqual([11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  it('partitionStream > 3 (test 41)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 3);
    expect(pass).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3]);
  });
  it('partitionStream > 4 (test 42)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 4);
    expect(pass).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4]);
  });
  it('partitionStream > 5 (test 43)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 5);
    expect(pass).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5]);
  });
  it('partitionStream > 6 (test 44)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 6);
    expect(pass).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('partitionStream > 7 (test 45)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 7);
    expect(pass).toEqual([8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it('partitionStream > 8 (test 46)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 8);
    expect(pass).toEqual([9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('partitionStream > 9 (test 47)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 9);
    expect(pass).toEqual([10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('partitionStream > 10 (test 48)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 10);
    expect(pass).toEqual([11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
  it('partitionStream > 3 (test 49)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 3);
    expect(pass).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3]);
  });
  it('partitionStream > 4 (test 50)', () => {
    const [pass, fail] = partitionStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], (x) => x > 4);
    expect(pass).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(fail).toEqual([1, 2, 3, 4]);
  });
});

describe('reduceStream', () => {
  it('reduceStream sum of 2 elements = 3 (test 1)', () => {
    expect(reduceStream([1, 2], (acc, x) => acc + x, 0)).toBe(3);
  });
  it('reduceStream sum of 3 elements = 6 (test 2)', () => {
    expect(reduceStream([1, 2, 3], (acc, x) => acc + x, 0)).toBe(6);
  });
  it('reduceStream sum of 4 elements = 10 (test 3)', () => {
    expect(reduceStream([1, 2, 3, 4], (acc, x) => acc + x, 0)).toBe(10);
  });
  it('reduceStream sum of 5 elements = 15 (test 4)', () => {
    expect(reduceStream([1, 2, 3, 4, 5], (acc, x) => acc + x, 0)).toBe(15);
  });
  it('reduceStream sum of 6 elements = 21 (test 5)', () => {
    expect(reduceStream([1, 2, 3, 4, 5, 6], (acc, x) => acc + x, 0)).toBe(21);
  });
  it('reduceStream sum of 7 elements = 28 (test 6)', () => {
    expect(reduceStream([1, 2, 3, 4, 5, 6, 7], (acc, x) => acc + x, 0)).toBe(28);
  });
  it('reduceStream sum of 8 elements = 36 (test 7)', () => {
    expect(reduceStream([1, 2, 3, 4, 5, 6, 7, 8], (acc, x) => acc + x, 0)).toBe(36);
  });
  it('reduceStream sum of 9 elements = 45 (test 8)', () => {
    expect(reduceStream([1, 2, 3, 4, 5, 6, 7, 8, 9], (acc, x) => acc + x, 0)).toBe(45);
  });
  it('reduceStream sum of 2 elements = 3 (test 9)', () => {
    expect(reduceStream([1, 2], (acc, x) => acc + x, 0)).toBe(3);
  });
  it('reduceStream sum of 3 elements = 6 (test 10)', () => {
    expect(reduceStream([1, 2, 3], (acc, x) => acc + x, 0)).toBe(6);
  });
  it('reduceStream sum of 4 elements = 10 (test 11)', () => {
    expect(reduceStream([1, 2, 3, 4], (acc, x) => acc + x, 0)).toBe(10);
  });
  it('reduceStream sum of 5 elements = 15 (test 12)', () => {
    expect(reduceStream([1, 2, 3, 4, 5], (acc, x) => acc + x, 0)).toBe(15);
  });
  it('reduceStream sum of 6 elements = 21 (test 13)', () => {
    expect(reduceStream([1, 2, 3, 4, 5, 6], (acc, x) => acc + x, 0)).toBe(21);
  });
  it('reduceStream sum of 7 elements = 28 (test 14)', () => {
    expect(reduceStream([1, 2, 3, 4, 5, 6, 7], (acc, x) => acc + x, 0)).toBe(28);
  });
  it('reduceStream sum of 8 elements = 36 (test 15)', () => {
    expect(reduceStream([1, 2, 3, 4, 5, 6, 7, 8], (acc, x) => acc + x, 0)).toBe(36);
  });
  it('reduceStream sum of 9 elements = 45 (test 16)', () => {
    expect(reduceStream([1, 2, 3, 4, 5, 6, 7, 8, 9], (acc, x) => acc + x, 0)).toBe(45);
  });
  it('reduceStream sum of 2 elements = 3 (test 17)', () => {
    expect(reduceStream([1, 2], (acc, x) => acc + x, 0)).toBe(3);
  });
  it('reduceStream sum of 3 elements = 6 (test 18)', () => {
    expect(reduceStream([1, 2, 3], (acc, x) => acc + x, 0)).toBe(6);
  });
  it('reduceStream sum of 4 elements = 10 (test 19)', () => {
    expect(reduceStream([1, 2, 3, 4], (acc, x) => acc + x, 0)).toBe(10);
  });
  it('reduceStream sum of 5 elements = 15 (test 20)', () => {
    expect(reduceStream([1, 2, 3, 4, 5], (acc, x) => acc + x, 0)).toBe(15);
  });
  it('reduceStream sum of 6 elements = 21 (test 21)', () => {
    expect(reduceStream([1, 2, 3, 4, 5, 6], (acc, x) => acc + x, 0)).toBe(21);
  });
  it('reduceStream sum of 7 elements = 28 (test 22)', () => {
    expect(reduceStream([1, 2, 3, 4, 5, 6, 7], (acc, x) => acc + x, 0)).toBe(28);
  });
  it('reduceStream sum of 8 elements = 36 (test 23)', () => {
    expect(reduceStream([1, 2, 3, 4, 5, 6, 7, 8], (acc, x) => acc + x, 0)).toBe(36);
  });
  it('reduceStream sum of 9 elements = 45 (test 24)', () => {
    expect(reduceStream([1, 2, 3, 4, 5, 6, 7, 8, 9], (acc, x) => acc + x, 0)).toBe(45);
  });
  it('reduceStream sum of 2 elements = 3 (test 25)', () => {
    expect(reduceStream([1, 2], (acc, x) => acc + x, 0)).toBe(3);
  });
  it('reduceStream sum of 3 elements = 6 (test 26)', () => {
    expect(reduceStream([1, 2, 3], (acc, x) => acc + x, 0)).toBe(6);
  });
  it('reduceStream sum of 4 elements = 10 (test 27)', () => {
    expect(reduceStream([1, 2, 3, 4], (acc, x) => acc + x, 0)).toBe(10);
  });
  it('reduceStream sum of 5 elements = 15 (test 28)', () => {
    expect(reduceStream([1, 2, 3, 4, 5], (acc, x) => acc + x, 0)).toBe(15);
  });
  it('reduceStream sum of 6 elements = 21 (test 29)', () => {
    expect(reduceStream([1, 2, 3, 4, 5, 6], (acc, x) => acc + x, 0)).toBe(21);
  });
  it('reduceStream sum of 7 elements = 28 (test 30)', () => {
    expect(reduceStream([1, 2, 3, 4, 5, 6, 7], (acc, x) => acc + x, 0)).toBe(28);
  });
});

describe('countByStream', () => {
  it('countByStream mod 2 on 6 elements (test 1)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": 3, "1": 3 });
  });
  it('countByStream mod 3 on 9 elements (test 2)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": 3, "1": 3, "2": 3 });
  });
  it('countByStream mod 4 on 12 elements (test 3)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": 3, "1": 3, "2": 3, "3": 3 });
  });
  it('countByStream mod 2 on 6 elements (test 4)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": 3, "1": 3 });
  });
  it('countByStream mod 3 on 9 elements (test 5)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": 3, "1": 3, "2": 3 });
  });
  it('countByStream mod 4 on 12 elements (test 6)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": 3, "1": 3, "2": 3, "3": 3 });
  });
  it('countByStream mod 2 on 6 elements (test 7)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": 3, "1": 3 });
  });
  it('countByStream mod 3 on 9 elements (test 8)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": 3, "1": 3, "2": 3 });
  });
  it('countByStream mod 4 on 12 elements (test 9)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": 3, "1": 3, "2": 3, "3": 3 });
  });
  it('countByStream mod 2 on 6 elements (test 10)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": 3, "1": 3 });
  });
  it('countByStream mod 3 on 9 elements (test 11)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": 3, "1": 3, "2": 3 });
  });
  it('countByStream mod 4 on 12 elements (test 12)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": 3, "1": 3, "2": 3, "3": 3 });
  });
  it('countByStream mod 2 on 6 elements (test 13)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": 3, "1": 3 });
  });
  it('countByStream mod 3 on 9 elements (test 14)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": 3, "1": 3, "2": 3 });
  });
  it('countByStream mod 4 on 12 elements (test 15)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": 3, "1": 3, "2": 3, "3": 3 });
  });
  it('countByStream mod 2 on 6 elements (test 16)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": 3, "1": 3 });
  });
  it('countByStream mod 3 on 9 elements (test 17)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": 3, "1": 3, "2": 3 });
  });
  it('countByStream mod 4 on 12 elements (test 18)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": 3, "1": 3, "2": 3, "3": 3 });
  });
  it('countByStream mod 2 on 6 elements (test 19)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": 3, "1": 3 });
  });
  it('countByStream mod 3 on 9 elements (test 20)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": 3, "1": 3, "2": 3 });
  });
  it('countByStream mod 4 on 12 elements (test 21)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": 3, "1": 3, "2": 3, "3": 3 });
  });
  it('countByStream mod 2 on 6 elements (test 22)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": 3, "1": 3 });
  });
  it('countByStream mod 3 on 9 elements (test 23)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": 3, "1": 3, "2": 3 });
  });
  it('countByStream mod 4 on 12 elements (test 24)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": 3, "1": 3, "2": 3, "3": 3 });
  });
  it('countByStream mod 2 on 6 elements (test 25)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": 3, "1": 3 });
  });
  it('countByStream mod 3 on 9 elements (test 26)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": 3, "1": 3, "2": 3 });
  });
  it('countByStream mod 4 on 12 elements (test 27)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": 3, "1": 3, "2": 3, "3": 3 });
  });
  it('countByStream mod 2 on 6 elements (test 28)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5], (x) => String(x % 2))).toEqual({ "0": 3, "1": 3 });
  });
  it('countByStream mod 3 on 9 elements (test 29)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => String(x % 3))).toEqual({ "0": 3, "1": 3, "2": 3 });
  });
  it('countByStream mod 4 on 12 elements (test 30)', () => {
    expect(countByStream([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (x) => String(x % 4))).toEqual({ "0": 3, "1": 3, "2": 3, "3": 3 });
  });
});

describe('sumStream', () => {
  it('sumStream of 1 elements = 1 (test 1)', () => {
    expect(sumStream([1])).toBe(1);
  });
  it('sumStream of 2 elements = 3 (test 2)', () => {
    expect(sumStream([1, 2])).toBe(3);
  });
  it('sumStream of 3 elements = 6 (test 3)', () => {
    expect(sumStream([1, 2, 3])).toBe(6);
  });
  it('sumStream of 4 elements = 10 (test 4)', () => {
    expect(sumStream([1, 2, 3, 4])).toBe(10);
  });
  it('sumStream of 5 elements = 15 (test 5)', () => {
    expect(sumStream([1, 2, 3, 4, 5])).toBe(15);
  });
  it('sumStream of 6 elements = 21 (test 6)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6])).toBe(21);
  });
  it('sumStream of 7 elements = 28 (test 7)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7])).toBe(28);
  });
  it('sumStream of 8 elements = 36 (test 8)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7, 8])).toBe(36);
  });
  it('sumStream of 9 elements = 45 (test 9)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(45);
  });
  it('sumStream of 10 elements = 55 (test 10)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(55);
  });
  it('sumStream of 1 elements = 1 (test 11)', () => {
    expect(sumStream([1])).toBe(1);
  });
  it('sumStream of 2 elements = 3 (test 12)', () => {
    expect(sumStream([1, 2])).toBe(3);
  });
  it('sumStream of 3 elements = 6 (test 13)', () => {
    expect(sumStream([1, 2, 3])).toBe(6);
  });
  it('sumStream of 4 elements = 10 (test 14)', () => {
    expect(sumStream([1, 2, 3, 4])).toBe(10);
  });
  it('sumStream of 5 elements = 15 (test 15)', () => {
    expect(sumStream([1, 2, 3, 4, 5])).toBe(15);
  });
  it('sumStream of 6 elements = 21 (test 16)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6])).toBe(21);
  });
  it('sumStream of 7 elements = 28 (test 17)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7])).toBe(28);
  });
  it('sumStream of 8 elements = 36 (test 18)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7, 8])).toBe(36);
  });
  it('sumStream of 9 elements = 45 (test 19)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(45);
  });
  it('sumStream of 10 elements = 55 (test 20)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(55);
  });
  it('sumStream of 1 elements = 1 (test 21)', () => {
    expect(sumStream([1])).toBe(1);
  });
  it('sumStream of 2 elements = 3 (test 22)', () => {
    expect(sumStream([1, 2])).toBe(3);
  });
  it('sumStream of 3 elements = 6 (test 23)', () => {
    expect(sumStream([1, 2, 3])).toBe(6);
  });
  it('sumStream of 4 elements = 10 (test 24)', () => {
    expect(sumStream([1, 2, 3, 4])).toBe(10);
  });
  it('sumStream of 5 elements = 15 (test 25)', () => {
    expect(sumStream([1, 2, 3, 4, 5])).toBe(15);
  });
  it('sumStream of 6 elements = 21 (test 26)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6])).toBe(21);
  });
  it('sumStream of 7 elements = 28 (test 27)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7])).toBe(28);
  });
  it('sumStream of 8 elements = 36 (test 28)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7, 8])).toBe(36);
  });
  it('sumStream of 9 elements = 45 (test 29)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(45);
  });
  it('sumStream of 10 elements = 55 (test 30)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(55);
  });
  it('sumStream of 1 elements = 1 (test 31)', () => {
    expect(sumStream([1])).toBe(1);
  });
  it('sumStream of 2 elements = 3 (test 32)', () => {
    expect(sumStream([1, 2])).toBe(3);
  });
  it('sumStream of 3 elements = 6 (test 33)', () => {
    expect(sumStream([1, 2, 3])).toBe(6);
  });
  it('sumStream of 4 elements = 10 (test 34)', () => {
    expect(sumStream([1, 2, 3, 4])).toBe(10);
  });
  it('sumStream of 5 elements = 15 (test 35)', () => {
    expect(sumStream([1, 2, 3, 4, 5])).toBe(15);
  });
  it('sumStream of 6 elements = 21 (test 36)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6])).toBe(21);
  });
  it('sumStream of 7 elements = 28 (test 37)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7])).toBe(28);
  });
  it('sumStream of 8 elements = 36 (test 38)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7, 8])).toBe(36);
  });
  it('sumStream of 9 elements = 45 (test 39)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(45);
  });
  it('sumStream of 10 elements = 55 (test 40)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(55);
  });
  it('sumStream of 1 elements = 1 (test 41)', () => {
    expect(sumStream([1])).toBe(1);
  });
  it('sumStream of 2 elements = 3 (test 42)', () => {
    expect(sumStream([1, 2])).toBe(3);
  });
  it('sumStream of 3 elements = 6 (test 43)', () => {
    expect(sumStream([1, 2, 3])).toBe(6);
  });
  it('sumStream of 4 elements = 10 (test 44)', () => {
    expect(sumStream([1, 2, 3, 4])).toBe(10);
  });
  it('sumStream of 5 elements = 15 (test 45)', () => {
    expect(sumStream([1, 2, 3, 4, 5])).toBe(15);
  });
  it('sumStream of 6 elements = 21 (test 46)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6])).toBe(21);
  });
  it('sumStream of 7 elements = 28 (test 47)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7])).toBe(28);
  });
  it('sumStream of 8 elements = 36 (test 48)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7, 8])).toBe(36);
  });
  it('sumStream of 9 elements = 45 (test 49)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(45);
  });
  it('sumStream of 10 elements = 55 (test 50)', () => {
    expect(sumStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(55);
  });
});

describe('maxStream', () => {
  it('maxStream of 1 elements = 1 (test 1)', () => {
    expect(maxStream([1])).toBe(1);
  });
  it('maxStream of 2 elements = 2 (test 2)', () => {
    expect(maxStream([1, 2])).toBe(2);
  });
  it('maxStream of 3 elements = 3 (test 3)', () => {
    expect(maxStream([1, 2, 3])).toBe(3);
  });
  it('maxStream of 4 elements = 4 (test 4)', () => {
    expect(maxStream([1, 2, 3, 4])).toBe(4);
  });
  it('maxStream of 5 elements = 5 (test 5)', () => {
    expect(maxStream([1, 2, 3, 4, 5])).toBe(5);
  });
  it('maxStream of 6 elements = 6 (test 6)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6])).toBe(6);
  });
  it('maxStream of 7 elements = 7 (test 7)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7])).toBe(7);
  });
  it('maxStream of 8 elements = 8 (test 8)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8])).toBe(8);
  });
  it('maxStream of 9 elements = 9 (test 9)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(9);
  });
  it('maxStream of 10 elements = 10 (test 10)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(10);
  });
  it('maxStream of 1 elements = 1 (test 11)', () => {
    expect(maxStream([1])).toBe(1);
  });
  it('maxStream of 2 elements = 2 (test 12)', () => {
    expect(maxStream([1, 2])).toBe(2);
  });
  it('maxStream of 3 elements = 3 (test 13)', () => {
    expect(maxStream([1, 2, 3])).toBe(3);
  });
  it('maxStream of 4 elements = 4 (test 14)', () => {
    expect(maxStream([1, 2, 3, 4])).toBe(4);
  });
  it('maxStream of 5 elements = 5 (test 15)', () => {
    expect(maxStream([1, 2, 3, 4, 5])).toBe(5);
  });
  it('maxStream of 6 elements = 6 (test 16)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6])).toBe(6);
  });
  it('maxStream of 7 elements = 7 (test 17)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7])).toBe(7);
  });
  it('maxStream of 8 elements = 8 (test 18)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8])).toBe(8);
  });
  it('maxStream of 9 elements = 9 (test 19)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(9);
  });
  it('maxStream of 10 elements = 10 (test 20)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(10);
  });
  it('maxStream of 1 elements = 1 (test 21)', () => {
    expect(maxStream([1])).toBe(1);
  });
  it('maxStream of 2 elements = 2 (test 22)', () => {
    expect(maxStream([1, 2])).toBe(2);
  });
  it('maxStream of 3 elements = 3 (test 23)', () => {
    expect(maxStream([1, 2, 3])).toBe(3);
  });
  it('maxStream of 4 elements = 4 (test 24)', () => {
    expect(maxStream([1, 2, 3, 4])).toBe(4);
  });
  it('maxStream of 5 elements = 5 (test 25)', () => {
    expect(maxStream([1, 2, 3, 4, 5])).toBe(5);
  });
  it('maxStream of 6 elements = 6 (test 26)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6])).toBe(6);
  });
  it('maxStream of 7 elements = 7 (test 27)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7])).toBe(7);
  });
  it('maxStream of 8 elements = 8 (test 28)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8])).toBe(8);
  });
  it('maxStream of 9 elements = 9 (test 29)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(9);
  });
  it('maxStream of 10 elements = 10 (test 30)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(10);
  });
  it('maxStream of 1 elements = 1 (test 31)', () => {
    expect(maxStream([1])).toBe(1);
  });
  it('maxStream of 2 elements = 2 (test 32)', () => {
    expect(maxStream([1, 2])).toBe(2);
  });
  it('maxStream of 3 elements = 3 (test 33)', () => {
    expect(maxStream([1, 2, 3])).toBe(3);
  });
  it('maxStream of 4 elements = 4 (test 34)', () => {
    expect(maxStream([1, 2, 3, 4])).toBe(4);
  });
  it('maxStream of 5 elements = 5 (test 35)', () => {
    expect(maxStream([1, 2, 3, 4, 5])).toBe(5);
  });
  it('maxStream of 6 elements = 6 (test 36)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6])).toBe(6);
  });
  it('maxStream of 7 elements = 7 (test 37)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7])).toBe(7);
  });
  it('maxStream of 8 elements = 8 (test 38)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8])).toBe(8);
  });
  it('maxStream of 9 elements = 9 (test 39)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(9);
  });
  it('maxStream of 10 elements = 10 (test 40)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(10);
  });
  it('maxStream of 1 elements = 1 (test 41)', () => {
    expect(maxStream([1])).toBe(1);
  });
  it('maxStream of 2 elements = 2 (test 42)', () => {
    expect(maxStream([1, 2])).toBe(2);
  });
  it('maxStream of 3 elements = 3 (test 43)', () => {
    expect(maxStream([1, 2, 3])).toBe(3);
  });
  it('maxStream of 4 elements = 4 (test 44)', () => {
    expect(maxStream([1, 2, 3, 4])).toBe(4);
  });
  it('maxStream of 5 elements = 5 (test 45)', () => {
    expect(maxStream([1, 2, 3, 4, 5])).toBe(5);
  });
  it('maxStream of 6 elements = 6 (test 46)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6])).toBe(6);
  });
  it('maxStream of 7 elements = 7 (test 47)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7])).toBe(7);
  });
  it('maxStream of 8 elements = 8 (test 48)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8])).toBe(8);
  });
  it('maxStream of 9 elements = 9 (test 49)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(9);
  });
  it('maxStream of 10 elements = 10 (test 50)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(10);
  });
});

describe('minStream', () => {
  it('minStream of 2 elements = 1 (test 1)', () => {
    expect(minStream([1, 2])).toBe(1);
  });
  it('minStream of 3 elements = 1 (test 2)', () => {
    expect(minStream([1, 2, 3])).toBe(1);
  });
  it('minStream of 4 elements = 1 (test 3)', () => {
    expect(minStream([1, 2, 3, 4])).toBe(1);
  });
  it('minStream of 5 elements = 1 (test 4)', () => {
    expect(minStream([1, 2, 3, 4, 5])).toBe(1);
  });
  it('minStream of 6 elements = 1 (test 5)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6])).toBe(1);
  });
  it('minStream of 7 elements = 1 (test 6)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7])).toBe(1);
  });
  it('minStream of 8 elements = 1 (test 7)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8])).toBe(1);
  });
  it('minStream of 9 elements = 1 (test 8)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(1);
  });
  it('minStream of 10 elements = 1 (test 9)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(1);
  });
  it('minStream of 11 elements = 1 (test 10)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toBe(1);
  });
  it('minStream of 2 elements = 1 (test 11)', () => {
    expect(minStream([1, 2])).toBe(1);
  });
  it('minStream of 3 elements = 1 (test 12)', () => {
    expect(minStream([1, 2, 3])).toBe(1);
  });
  it('minStream of 4 elements = 1 (test 13)', () => {
    expect(minStream([1, 2, 3, 4])).toBe(1);
  });
  it('minStream of 5 elements = 1 (test 14)', () => {
    expect(minStream([1, 2, 3, 4, 5])).toBe(1);
  });
  it('minStream of 6 elements = 1 (test 15)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6])).toBe(1);
  });
  it('minStream of 7 elements = 1 (test 16)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7])).toBe(1);
  });
  it('minStream of 8 elements = 1 (test 17)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8])).toBe(1);
  });
  it('minStream of 9 elements = 1 (test 18)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(1);
  });
  it('minStream of 10 elements = 1 (test 19)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(1);
  });
  it('minStream of 11 elements = 1 (test 20)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toBe(1);
  });
  it('minStream of 2 elements = 1 (test 21)', () => {
    expect(minStream([1, 2])).toBe(1);
  });
  it('minStream of 3 elements = 1 (test 22)', () => {
    expect(minStream([1, 2, 3])).toBe(1);
  });
  it('minStream of 4 elements = 1 (test 23)', () => {
    expect(minStream([1, 2, 3, 4])).toBe(1);
  });
  it('minStream of 5 elements = 1 (test 24)', () => {
    expect(minStream([1, 2, 3, 4, 5])).toBe(1);
  });
  it('minStream of 6 elements = 1 (test 25)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6])).toBe(1);
  });
  it('minStream of 7 elements = 1 (test 26)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7])).toBe(1);
  });
  it('minStream of 8 elements = 1 (test 27)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8])).toBe(1);
  });
  it('minStream of 9 elements = 1 (test 28)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(1);
  });
  it('minStream of 10 elements = 1 (test 29)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(1);
  });
  it('minStream of 11 elements = 1 (test 30)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toBe(1);
  });
  it('minStream of 2 elements = 1 (test 31)', () => {
    expect(minStream([1, 2])).toBe(1);
  });
  it('minStream of 3 elements = 1 (test 32)', () => {
    expect(minStream([1, 2, 3])).toBe(1);
  });
  it('minStream of 4 elements = 1 (test 33)', () => {
    expect(minStream([1, 2, 3, 4])).toBe(1);
  });
  it('minStream of 5 elements = 1 (test 34)', () => {
    expect(minStream([1, 2, 3, 4, 5])).toBe(1);
  });
  it('minStream of 6 elements = 1 (test 35)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6])).toBe(1);
  });
  it('minStream of 7 elements = 1 (test 36)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7])).toBe(1);
  });
  it('minStream of 8 elements = 1 (test 37)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8])).toBe(1);
  });
  it('minStream of 9 elements = 1 (test 38)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(1);
  });
  it('minStream of 10 elements = 1 (test 39)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(1);
  });
  it('minStream of 11 elements = 1 (test 40)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toBe(1);
  });
  it('minStream of 2 elements = 1 (test 41)', () => {
    expect(minStream([1, 2])).toBe(1);
  });
  it('minStream of 3 elements = 1 (test 42)', () => {
    expect(minStream([1, 2, 3])).toBe(1);
  });
  it('minStream of 4 elements = 1 (test 43)', () => {
    expect(minStream([1, 2, 3, 4])).toBe(1);
  });
  it('minStream of 5 elements = 1 (test 44)', () => {
    expect(minStream([1, 2, 3, 4, 5])).toBe(1);
  });
  it('minStream of 6 elements = 1 (test 45)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6])).toBe(1);
  });
  it('minStream of 7 elements = 1 (test 46)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7])).toBe(1);
  });
  it('minStream of 8 elements = 1 (test 47)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8])).toBe(1);
  });
  it('minStream of 9 elements = 1 (test 48)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(1);
  });
  it('minStream of 10 elements = 1 (test 49)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(1);
  });
  it('minStream of 11 elements = 1 (test 50)', () => {
    expect(minStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toBe(1);
  });
});

describe('avgStream', () => {
  it('avgStream of 1 elements = 1.0 (test 1)', () => {
    expect(avgStream([1])).toBeCloseTo(1.0, 8);
  });
  it('avgStream of 2 elements = 1.5 (test 2)', () => {
    expect(avgStream([1, 2])).toBeCloseTo(1.5, 8);
  });
  it('avgStream of 3 elements = 2.0 (test 3)', () => {
    expect(avgStream([1, 2, 3])).toBeCloseTo(2.0, 8);
  });
  it('avgStream of 4 elements = 2.5 (test 4)', () => {
    expect(avgStream([1, 2, 3, 4])).toBeCloseTo(2.5, 8);
  });
  it('avgStream of 5 elements = 3.0 (test 5)', () => {
    expect(avgStream([1, 2, 3, 4, 5])).toBeCloseTo(3.0, 8);
  });
  it('avgStream of 1 elements = 1.0 (test 6)', () => {
    expect(avgStream([1])).toBeCloseTo(1.0, 8);
  });
  it('avgStream of 2 elements = 1.5 (test 7)', () => {
    expect(avgStream([1, 2])).toBeCloseTo(1.5, 8);
  });
  it('avgStream of 3 elements = 2.0 (test 8)', () => {
    expect(avgStream([1, 2, 3])).toBeCloseTo(2.0, 8);
  });
  it('avgStream of 4 elements = 2.5 (test 9)', () => {
    expect(avgStream([1, 2, 3, 4])).toBeCloseTo(2.5, 8);
  });
  it('avgStream of 5 elements = 3.0 (test 10)', () => {
    expect(avgStream([1, 2, 3, 4, 5])).toBeCloseTo(3.0, 8);
  });
  it('avgStream of 1 elements = 1.0 (test 11)', () => {
    expect(avgStream([1])).toBeCloseTo(1.0, 8);
  });
  it('avgStream of 2 elements = 1.5 (test 12)', () => {
    expect(avgStream([1, 2])).toBeCloseTo(1.5, 8);
  });
  it('avgStream of 3 elements = 2.0 (test 13)', () => {
    expect(avgStream([1, 2, 3])).toBeCloseTo(2.0, 8);
  });
  it('avgStream of 4 elements = 2.5 (test 14)', () => {
    expect(avgStream([1, 2, 3, 4])).toBeCloseTo(2.5, 8);
  });
  it('avgStream of 5 elements = 3.0 (test 15)', () => {
    expect(avgStream([1, 2, 3, 4, 5])).toBeCloseTo(3.0, 8);
  });
  it('avgStream of 1 elements = 1.0 (test 16)', () => {
    expect(avgStream([1])).toBeCloseTo(1.0, 8);
  });
  it('avgStream of 2 elements = 1.5 (test 17)', () => {
    expect(avgStream([1, 2])).toBeCloseTo(1.5, 8);
  });
  it('avgStream of 3 elements = 2.0 (test 18)', () => {
    expect(avgStream([1, 2, 3])).toBeCloseTo(2.0, 8);
  });
  it('avgStream of 4 elements = 2.5 (test 19)', () => {
    expect(avgStream([1, 2, 3, 4])).toBeCloseTo(2.5, 8);
  });
  it('avgStream of 5 elements = 3.0 (test 20)', () => {
    expect(avgStream([1, 2, 3, 4, 5])).toBeCloseTo(3.0, 8);
  });
  it('avgStream of 1 elements = 1.0 (test 21)', () => {
    expect(avgStream([1])).toBeCloseTo(1.0, 8);
  });
  it('avgStream of 2 elements = 1.5 (test 22)', () => {
    expect(avgStream([1, 2])).toBeCloseTo(1.5, 8);
  });
  it('avgStream of 3 elements = 2.0 (test 23)', () => {
    expect(avgStream([1, 2, 3])).toBeCloseTo(2.0, 8);
  });
  it('avgStream of 4 elements = 2.5 (test 24)', () => {
    expect(avgStream([1, 2, 3, 4])).toBeCloseTo(2.5, 8);
  });
  it('avgStream of 5 elements = 3.0 (test 25)', () => {
    expect(avgStream([1, 2, 3, 4, 5])).toBeCloseTo(3.0, 8);
  });
  it('avgStream of 1 elements = 1.0 (test 26)', () => {
    expect(avgStream([1])).toBeCloseTo(1.0, 8);
  });
  it('avgStream of 2 elements = 1.5 (test 27)', () => {
    expect(avgStream([1, 2])).toBeCloseTo(1.5, 8);
  });
  it('avgStream of 3 elements = 2.0 (test 28)', () => {
    expect(avgStream([1, 2, 3])).toBeCloseTo(2.0, 8);
  });
  it('avgStream of 4 elements = 2.5 (test 29)', () => {
    expect(avgStream([1, 2, 3, 4])).toBeCloseTo(2.5, 8);
  });
  it('avgStream of 5 elements = 3.0 (test 30)', () => {
    expect(avgStream([1, 2, 3, 4, 5])).toBeCloseTo(3.0, 8);
  });
  it('avgStream of 1 elements = 1.0 (test 31)', () => {
    expect(avgStream([1])).toBeCloseTo(1.0, 8);
  });
  it('avgStream of 2 elements = 1.5 (test 32)', () => {
    expect(avgStream([1, 2])).toBeCloseTo(1.5, 8);
  });
  it('avgStream of 3 elements = 2.0 (test 33)', () => {
    expect(avgStream([1, 2, 3])).toBeCloseTo(2.0, 8);
  });
  it('avgStream of 4 elements = 2.5 (test 34)', () => {
    expect(avgStream([1, 2, 3, 4])).toBeCloseTo(2.5, 8);
  });
  it('avgStream of 5 elements = 3.0 (test 35)', () => {
    expect(avgStream([1, 2, 3, 4, 5])).toBeCloseTo(3.0, 8);
  });
  it('avgStream of 1 elements = 1.0 (test 36)', () => {
    expect(avgStream([1])).toBeCloseTo(1.0, 8);
  });
  it('avgStream of 2 elements = 1.5 (test 37)', () => {
    expect(avgStream([1, 2])).toBeCloseTo(1.5, 8);
  });
  it('avgStream of 3 elements = 2.0 (test 38)', () => {
    expect(avgStream([1, 2, 3])).toBeCloseTo(2.0, 8);
  });
  it('avgStream of 4 elements = 2.5 (test 39)', () => {
    expect(avgStream([1, 2, 3, 4])).toBeCloseTo(2.5, 8);
  });
  it('avgStream of 5 elements = 3.0 (test 40)', () => {
    expect(avgStream([1, 2, 3, 4, 5])).toBeCloseTo(3.0, 8);
  });
  it('avgStream of 1 elements = 1.0 (test 41)', () => {
    expect(avgStream([1])).toBeCloseTo(1.0, 8);
  });
  it('avgStream of 2 elements = 1.5 (test 42)', () => {
    expect(avgStream([1, 2])).toBeCloseTo(1.5, 8);
  });
  it('avgStream of 3 elements = 2.0 (test 43)', () => {
    expect(avgStream([1, 2, 3])).toBeCloseTo(2.0, 8);
  });
  it('avgStream of 4 elements = 2.5 (test 44)', () => {
    expect(avgStream([1, 2, 3, 4])).toBeCloseTo(2.5, 8);
  });
  it('avgStream of 5 elements = 3.0 (test 45)', () => {
    expect(avgStream([1, 2, 3, 4, 5])).toBeCloseTo(3.0, 8);
  });
  it('avgStream of 1 elements = 1.0 (test 46)', () => {
    expect(avgStream([1])).toBeCloseTo(1.0, 8);
  });
  it('avgStream of 2 elements = 1.5 (test 47)', () => {
    expect(avgStream([1, 2])).toBeCloseTo(1.5, 8);
  });
  it('avgStream of 3 elements = 2.0 (test 48)', () => {
    expect(avgStream([1, 2, 3])).toBeCloseTo(2.0, 8);
  });
  it('avgStream of 4 elements = 2.5 (test 49)', () => {
    expect(avgStream([1, 2, 3, 4])).toBeCloseTo(2.5, 8);
  });
  it('avgStream of 5 elements = 3.0 (test 50)', () => {
    expect(avgStream([1, 2, 3, 4, 5])).toBeCloseTo(3.0, 8);
  });
});

describe('sumStream edge cases', () => {
  it('sumStream empty array = 0', () => {
    expect(sumStream([])).toBe(0);
  });
  it('sumStream single element', () => {
    expect(sumStream([42])).toBe(42);
  });
  it('sumStream of repeated value 10 x 5 (test 3)', () => {
    expect(sumStream([10, 10, 10, 10, 10])).toBe(50);
  });
  it('sumStream of repeated value 20 x 5 (test 4)', () => {
    expect(sumStream([20, 20, 20, 20, 20])).toBe(100);
  });
  it('sumStream of repeated value 30 x 5 (test 5)', () => {
    expect(sumStream([30, 30, 30, 30, 30])).toBe(150);
  });
  it('sumStream of repeated value 40 x 5 (test 6)', () => {
    expect(sumStream([40, 40, 40, 40, 40])).toBe(200);
  });
  it('sumStream of repeated value 50 x 5 (test 7)', () => {
    expect(sumStream([50, 50, 50, 50, 50])).toBe(250);
  });
  it('sumStream of repeated value 60 x 5 (test 8)', () => {
    expect(sumStream([60, 60, 60, 60, 60])).toBe(300);
  });
  it('sumStream of repeated value 70 x 5 (test 9)', () => {
    expect(sumStream([70, 70, 70, 70, 70])).toBe(350);
  });
  it('sumStream of repeated value 80 x 5 (test 10)', () => {
    expect(sumStream([80, 80, 80, 80, 80])).toBe(400);
  });
  it('sumStream of repeated value 90 x 5 (test 11)', () => {
    expect(sumStream([90, 90, 90, 90, 90])).toBe(450);
  });
  it('sumStream of repeated value 100 x 5 (test 12)', () => {
    expect(sumStream([100, 100, 100, 100, 100])).toBe(500);
  });
  it('sumStream of repeated value 110 x 5 (test 13)', () => {
    expect(sumStream([110, 110, 110, 110, 110])).toBe(550);
  });
  it('sumStream of repeated value 120 x 5 (test 14)', () => {
    expect(sumStream([120, 120, 120, 120, 120])).toBe(600);
  });
  it('sumStream of repeated value 130 x 5 (test 15)', () => {
    expect(sumStream([130, 130, 130, 130, 130])).toBe(650);
  });
  it('sumStream of repeated value 140 x 5 (test 16)', () => {
    expect(sumStream([140, 140, 140, 140, 140])).toBe(700);
  });
  it('sumStream of repeated value 150 x 5 (test 17)', () => {
    expect(sumStream([150, 150, 150, 150, 150])).toBe(750);
  });
  it('sumStream of repeated value 160 x 5 (test 18)', () => {
    expect(sumStream([160, 160, 160, 160, 160])).toBe(800);
  });
  it('sumStream of repeated value 170 x 5 (test 19)', () => {
    expect(sumStream([170, 170, 170, 170, 170])).toBe(850);
  });
  it('sumStream of repeated value 180 x 5 (test 20)', () => {
    expect(sumStream([180, 180, 180, 180, 180])).toBe(900);
  });
});

describe('maxStream edge cases', () => {
  it('maxStream empty returns -Infinity', () => {
    expect(maxStream([])).toBe(-Infinity);
  });
  it('maxStream single element 99', () => {
    expect(maxStream([99])).toBe(99);
  });
  it('maxStream scrambled returns max 2 (test 3)', () => {
    expect(maxStream([1, 2])).toBe(2);
  });
  it('maxStream scrambled returns max 3 (test 4)', () => {
    expect(maxStream([1, 2, 3])).toBe(3);
  });
  it('maxStream scrambled returns max 4 (test 5)', () => {
    expect(maxStream([1, 2, 3, 4])).toBe(4);
  });
  it('maxStream scrambled returns max 5 (test 6)', () => {
    expect(maxStream([1, 2, 3, 4, 5])).toBe(5);
  });
  it('maxStream scrambled returns max 6 (test 7)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6])).toBe(6);
  });
  it('maxStream scrambled returns max 7 (test 8)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7])).toBe(7);
  });
  it('maxStream scrambled returns max 8 (test 9)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8])).toBe(8);
  });
  it('maxStream scrambled returns max 9 (test 10)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(9);
  });
  it('maxStream scrambled returns max 10 (test 11)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(10);
  });
  it('maxStream scrambled returns max 11 (test 12)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toBe(11);
  });
  it('maxStream scrambled returns max 12 (test 13)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBe(12);
  });
  it('maxStream scrambled returns max 13 (test 14)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])).toBe(13);
  });
  it('maxStream scrambled returns max 14 (test 15)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])).toBe(14);
  });
  it('maxStream scrambled returns max 15 (test 16)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])).toBe(15);
  });
  it('maxStream scrambled returns max 16 (test 17)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])).toBe(16);
  });
  it('maxStream scrambled returns max 17 (test 18)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17])).toBe(17);
  });
  it('maxStream scrambled returns max 18 (test 19)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])).toBe(18);
  });
  it('maxStream scrambled returns max 19 (test 20)', () => {
    expect(maxStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19])).toBe(19);
  });
});

describe('minStream edge cases', () => {
  it('minStream empty returns Infinity', () => {
    expect(minStream([])).toBe(Infinity);
  });
  it('minStream single element 5', () => {
    expect(minStream([5])).toBe(5);
  });
  it('minStream starting at 2 returns 2 (test 3)', () => {
    expect(minStream([2, 3, 4, 5, 6])).toBe(2);
  });
  it('minStream starting at 3 returns 3 (test 4)', () => {
    expect(minStream([3, 4, 5, 6, 7])).toBe(3);
  });
  it('minStream starting at 4 returns 4 (test 5)', () => {
    expect(minStream([4, 5, 6, 7, 8])).toBe(4);
  });
  it('minStream starting at 5 returns 5 (test 6)', () => {
    expect(minStream([5, 6, 7, 8, 9])).toBe(5);
  });
  it('minStream starting at 6 returns 6 (test 7)', () => {
    expect(minStream([6, 7, 8, 9, 10])).toBe(6);
  });
  it('minStream starting at 7 returns 7 (test 8)', () => {
    expect(minStream([7, 8, 9, 10, 11])).toBe(7);
  });
  it('minStream starting at 8 returns 8 (test 9)', () => {
    expect(minStream([8, 9, 10, 11, 12])).toBe(8);
  });
  it('minStream starting at 9 returns 9 (test 10)', () => {
    expect(minStream([9, 10, 11, 12, 13])).toBe(9);
  });
  it('minStream starting at 10 returns 10 (test 11)', () => {
    expect(minStream([10, 11, 12, 13, 14])).toBe(10);
  });
  it('minStream starting at 11 returns 11 (test 12)', () => {
    expect(minStream([11, 12, 13, 14, 15])).toBe(11);
  });
  it('minStream starting at 12 returns 12 (test 13)', () => {
    expect(minStream([12, 13, 14, 15, 16])).toBe(12);
  });
  it('minStream starting at 13 returns 13 (test 14)', () => {
    expect(minStream([13, 14, 15, 16, 17])).toBe(13);
  });
  it('minStream starting at 14 returns 14 (test 15)', () => {
    expect(minStream([14, 15, 16, 17, 18])).toBe(14);
  });
  it('minStream starting at 15 returns 15 (test 16)', () => {
    expect(minStream([15, 16, 17, 18, 19])).toBe(15);
  });
  it('minStream starting at 16 returns 16 (test 17)', () => {
    expect(minStream([16, 17, 18, 19, 20])).toBe(16);
  });
  it('minStream starting at 17 returns 17 (test 18)', () => {
    expect(minStream([17, 18, 19, 20, 21])).toBe(17);
  });
  it('minStream starting at 18 returns 18 (test 19)', () => {
    expect(minStream([18, 19, 20, 21, 22])).toBe(18);
  });
  it('minStream starting at 19 returns 19 (test 20)', () => {
    expect(minStream([19, 20, 21, 22, 23])).toBe(19);
  });
});

describe('avgStream edge cases', () => {
  it('avgStream empty array = 0', () => {
    expect(avgStream([])).toBe(0);
  });
  it('avgStream single element 7 = 7', () => {
    expect(avgStream([7])).toBe(7);
  });
  it('avgStream [1, 3] = 2', () => {
    expect(avgStream([1, 3])).toBe(2);
  });
  it('avgStream [2, 4, 6] = 4', () => {
    expect(avgStream([2, 4, 6])).toBe(4);
  });
  it('avgStream [10, 20] = 15', () => {
    expect(avgStream([10, 20])).toBe(15);
  });
  it('avgStream 1..4 = 2.5 (test 6)', () => {
    expect(avgStream([1, 2, 3, 4])).toBeCloseTo(2.5, 8);
  });
  it('avgStream 1..6 = 3.5 (test 7)', () => {
    expect(avgStream([1, 2, 3, 4, 5, 6])).toBeCloseTo(3.5, 8);
  });
  it('avgStream 1..8 = 4.5 (test 8)', () => {
    expect(avgStream([1, 2, 3, 4, 5, 6, 7, 8])).toBeCloseTo(4.5, 8);
  });
  it('avgStream 1..10 = 5.5 (test 9)', () => {
    expect(avgStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBeCloseTo(5.5, 8);
  });
  it('avgStream 1..12 = 6.5 (test 10)', () => {
    expect(avgStream([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBeCloseTo(6.5, 8);
  });
});

