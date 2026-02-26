// Copyright (c) 2026 Nexara DMCC. All rights reserved.

import {
  lazy,
  lazyCached,
  defer,
  deferred,
  thunk,
  force,
  createWeakCache,
  batch,
  once,
  nthCall,
  range,
  naturals,
  fibonacci,
  primes,
  repeat,
  cycle,
  interleave,
  flatten,
  uniqueBy,
  groupConsecutive,
} from '../lazy-utils';

describe('lazy', () => {
  it('lazy test 1: computes value 3 on first get', () => {
    const l = lazy(() => 3);
    expect(l.get()).toBe(3);
  });
  it('lazy test 2: computes value 6 on first get', () => {
    const l = lazy(() => 6);
    expect(l.get()).toBe(6);
  });
  it('lazy test 3: computes value 9 on first get', () => {
    const l = lazy(() => 9);
    expect(l.get()).toBe(9);
  });
  it('lazy test 4: computes value 12 on first get', () => {
    const l = lazy(() => 12);
    expect(l.get()).toBe(12);
  });
  it('lazy test 5: computes value 15 on first get', () => {
    const l = lazy(() => 15);
    expect(l.get()).toBe(15);
  });
  it('lazy test 6: computes value 18 on first get', () => {
    const l = lazy(() => 18);
    expect(l.get()).toBe(18);
  });
  it('lazy test 7: computes value 21 on first get', () => {
    const l = lazy(() => 21);
    expect(l.get()).toBe(21);
  });
  it('lazy test 8: computes value 24 on first get', () => {
    const l = lazy(() => 24);
    expect(l.get()).toBe(24);
  });
  it('lazy test 9: computes value 27 on first get', () => {
    const l = lazy(() => 27);
    expect(l.get()).toBe(27);
  });
  it('lazy test 10: computes value 30 on first get', () => {
    const l = lazy(() => 30);
    expect(l.get()).toBe(30);
  });
  it('lazy test 11: computes value 33 on first get', () => {
    const l = lazy(() => 33);
    expect(l.get()).toBe(33);
  });
  it('lazy test 12: computes value 36 on first get', () => {
    const l = lazy(() => 36);
    expect(l.get()).toBe(36);
  });
  it('lazy test 13: computes value 39 on first get', () => {
    const l = lazy(() => 39);
    expect(l.get()).toBe(39);
  });
  it('lazy test 14: computes value 42 on first get', () => {
    const l = lazy(() => 42);
    expect(l.get()).toBe(42);
  });
  it('lazy test 15: computes value 45 on first get', () => {
    const l = lazy(() => 45);
    expect(l.get()).toBe(45);
  });
  it('lazy test 16: computes value 48 on first get', () => {
    const l = lazy(() => 48);
    expect(l.get()).toBe(48);
  });
  it('lazy test 17: computes value 51 on first get', () => {
    const l = lazy(() => 51);
    expect(l.get()).toBe(51);
  });
  it('lazy test 18: computes value 54 on first get', () => {
    const l = lazy(() => 54);
    expect(l.get()).toBe(54);
  });
  it('lazy test 19: computes value 57 on first get', () => {
    const l = lazy(() => 57);
    expect(l.get()).toBe(57);
  });
  it('lazy test 20: computes value 60 on first get', () => {
    const l = lazy(() => 60);
    expect(l.get()).toBe(60);
  });
  it('lazy test 21: computes value 63 on first get', () => {
    const l = lazy(() => 63);
    expect(l.get()).toBe(63);
  });
  it('lazy test 22: computes value 66 on first get', () => {
    const l = lazy(() => 66);
    expect(l.get()).toBe(66);
  });
  it('lazy test 23: computes value 69 on first get', () => {
    const l = lazy(() => 69);
    expect(l.get()).toBe(69);
  });
  it('lazy test 24: computes value 72 on first get', () => {
    const l = lazy(() => 72);
    expect(l.get()).toBe(72);
  });
  it('lazy test 25: computes value 75 on first get', () => {
    const l = lazy(() => 75);
    expect(l.get()).toBe(75);
  });
  it('lazy test 26: computes value 78 on first get', () => {
    const l = lazy(() => 78);
    expect(l.get()).toBe(78);
  });
  it('lazy test 27: computes value 81 on first get', () => {
    const l = lazy(() => 81);
    expect(l.get()).toBe(81);
  });
  it('lazy test 28: computes value 84 on first get', () => {
    const l = lazy(() => 84);
    expect(l.get()).toBe(84);
  });
  it('lazy test 29: computes value 87 on first get', () => {
    const l = lazy(() => 87);
    expect(l.get()).toBe(87);
  });
  it('lazy test 30: computes value 90 on first get', () => {
    const l = lazy(() => 90);
    expect(l.get()).toBe(90);
  });
  it('lazy test 31: computes value 93 on first get', () => {
    const l = lazy(() => 93);
    expect(l.get()).toBe(93);
  });
  it('lazy test 32: computes value 96 on first get', () => {
    const l = lazy(() => 96);
    expect(l.get()).toBe(96);
  });
  it('lazy test 33: computes value 99 on first get', () => {
    const l = lazy(() => 99);
    expect(l.get()).toBe(99);
  });
  it('lazy test 34: computes value 102 on first get', () => {
    const l = lazy(() => 102);
    expect(l.get()).toBe(102);
  });
  it('lazy test 35: computes value 105 on first get', () => {
    const l = lazy(() => 105);
    expect(l.get()).toBe(105);
  });
  it('lazy test 36: computes value 108 on first get', () => {
    const l = lazy(() => 108);
    expect(l.get()).toBe(108);
  });
  it('lazy test 37: computes value 111 on first get', () => {
    const l = lazy(() => 111);
    expect(l.get()).toBe(111);
  });
  it('lazy test 38: computes value 114 on first get', () => {
    const l = lazy(() => 114);
    expect(l.get()).toBe(114);
  });
  it('lazy test 39: computes value 117 on first get', () => {
    const l = lazy(() => 117);
    expect(l.get()).toBe(117);
  });
  it('lazy test 40: computes value 120 on first get', () => {
    const l = lazy(() => 120);
    expect(l.get()).toBe(120);
  });
  it('lazy test 41: computes value 123 on first get', () => {
    const l = lazy(() => 123);
    expect(l.get()).toBe(123);
  });
  it('lazy test 42: computes value 126 on first get', () => {
    const l = lazy(() => 126);
    expect(l.get()).toBe(126);
  });
  it('lazy test 43: computes value 129 on first get', () => {
    const l = lazy(() => 129);
    expect(l.get()).toBe(129);
  });
  it('lazy test 44: computes value 132 on first get', () => {
    const l = lazy(() => 132);
    expect(l.get()).toBe(132);
  });
  it('lazy test 45: computes value 135 on first get', () => {
    const l = lazy(() => 135);
    expect(l.get()).toBe(135);
  });
  it('lazy test 46: computes value 138 on first get', () => {
    const l = lazy(() => 138);
    expect(l.get()).toBe(138);
  });
  it('lazy test 47: computes value 141 on first get', () => {
    const l = lazy(() => 141);
    expect(l.get()).toBe(141);
  });
  it('lazy test 48: computes value 144 on first get', () => {
    const l = lazy(() => 144);
    expect(l.get()).toBe(144);
  });
  it('lazy test 49: computes value 147 on first get', () => {
    const l = lazy(() => 147);
    expect(l.get()).toBe(147);
  });
  it('lazy test 50: computes value 150 on first get', () => {
    const l = lazy(() => 150);
    expect(l.get()).toBe(150);
  });
  it('lazy test 51: isComputed is false before get, true after', () => {
    const l = lazy(() => 151);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 52: isComputed is false before get, true after', () => {
    const l = lazy(() => 152);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 53: isComputed is false before get, true after', () => {
    const l = lazy(() => 153);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 54: isComputed is false before get, true after', () => {
    const l = lazy(() => 154);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 55: isComputed is false before get, true after', () => {
    const l = lazy(() => 155);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 56: isComputed is false before get, true after', () => {
    const l = lazy(() => 156);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 57: isComputed is false before get, true after', () => {
    const l = lazy(() => 157);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 58: isComputed is false before get, true after', () => {
    const l = lazy(() => 158);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 59: isComputed is false before get, true after', () => {
    const l = lazy(() => 159);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 60: isComputed is false before get, true after', () => {
    const l = lazy(() => 160);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 61: isComputed is false before get, true after', () => {
    const l = lazy(() => 161);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 62: isComputed is false before get, true after', () => {
    const l = lazy(() => 162);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 63: isComputed is false before get, true after', () => {
    const l = lazy(() => 163);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 64: isComputed is false before get, true after', () => {
    const l = lazy(() => 164);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 65: isComputed is false before get, true after', () => {
    const l = lazy(() => 165);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 66: isComputed is false before get, true after', () => {
    const l = lazy(() => 166);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 67: isComputed is false before get, true after', () => {
    const l = lazy(() => 167);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 68: isComputed is false before get, true after', () => {
    const l = lazy(() => 168);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 69: isComputed is false before get, true after', () => {
    const l = lazy(() => 169);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 70: isComputed is false before get, true after', () => {
    const l = lazy(() => 170);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 71: isComputed is false before get, true after', () => {
    const l = lazy(() => 171);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 72: isComputed is false before get, true after', () => {
    const l = lazy(() => 172);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 73: isComputed is false before get, true after', () => {
    const l = lazy(() => 173);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 74: isComputed is false before get, true after', () => {
    const l = lazy(() => 174);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 75: isComputed is false before get, true after', () => {
    const l = lazy(() => 175);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 76: isComputed is false before get, true after', () => {
    const l = lazy(() => 176);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 77: isComputed is false before get, true after', () => {
    const l = lazy(() => 177);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 78: isComputed is false before get, true after', () => {
    const l = lazy(() => 178);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 79: isComputed is false before get, true after', () => {
    const l = lazy(() => 179);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 80: isComputed is false before get, true after', () => {
    const l = lazy(() => 180);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 81: isComputed is false before get, true after', () => {
    const l = lazy(() => 181);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 82: isComputed is false before get, true after', () => {
    const l = lazy(() => 182);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 83: isComputed is false before get, true after', () => {
    const l = lazy(() => 183);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 84: isComputed is false before get, true after', () => {
    const l = lazy(() => 184);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 85: isComputed is false before get, true after', () => {
    const l = lazy(() => 185);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 86: isComputed is false before get, true after', () => {
    const l = lazy(() => 186);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 87: isComputed is false before get, true after', () => {
    const l = lazy(() => 187);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 88: isComputed is false before get, true after', () => {
    const l = lazy(() => 188);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 89: isComputed is false before get, true after', () => {
    const l = lazy(() => 189);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 90: isComputed is false before get, true after', () => {
    const l = lazy(() => 190);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 91: isComputed is false before get, true after', () => {
    const l = lazy(() => 191);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 92: isComputed is false before get, true after', () => {
    const l = lazy(() => 192);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 93: isComputed is false before get, true after', () => {
    const l = lazy(() => 193);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 94: isComputed is false before get, true after', () => {
    const l = lazy(() => 194);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 95: isComputed is false before get, true after', () => {
    const l = lazy(() => 195);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 96: isComputed is false before get, true after', () => {
    const l = lazy(() => 196);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 97: isComputed is false before get, true after', () => {
    const l = lazy(() => 197);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 98: isComputed is false before get, true after', () => {
    const l = lazy(() => 198);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 99: isComputed is false before get, true after', () => {
    const l = lazy(() => 199);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 100: isComputed is false before get, true after', () => {
    const l = lazy(() => 200);
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(l.isComputed()).toBe(true);
  });
  it('lazy test 101: factory called once even after multiple gets (202)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 202; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 102: factory called once even after multiple gets (204)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 204; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 103: factory called once even after multiple gets (206)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 206; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 104: factory called once even after multiple gets (208)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 208; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 105: factory called once even after multiple gets (210)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 210; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 106: factory called once even after multiple gets (212)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 212; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 107: factory called once even after multiple gets (214)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 214; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 108: factory called once even after multiple gets (216)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 216; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 109: factory called once even after multiple gets (218)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 218; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 110: factory called once even after multiple gets (220)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 220; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 111: factory called once even after multiple gets (222)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 222; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 112: factory called once even after multiple gets (224)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 224; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 113: factory called once even after multiple gets (226)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 226; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 114: factory called once even after multiple gets (228)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 228; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 115: factory called once even after multiple gets (230)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 230; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 116: factory called once even after multiple gets (232)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 232; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 117: factory called once even after multiple gets (234)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 234; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 118: factory called once even after multiple gets (236)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 236; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 119: factory called once even after multiple gets (238)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 238; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 120: factory called once even after multiple gets (240)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 240; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 121: factory called once even after multiple gets (242)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 242; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 122: factory called once even after multiple gets (244)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 244; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 123: factory called once even after multiple gets (246)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 246; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 124: factory called once even after multiple gets (248)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 248; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 125: factory called once even after multiple gets (250)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 250; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 126: factory called once even after multiple gets (252)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 252; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 127: factory called once even after multiple gets (254)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 254; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 128: factory called once even after multiple gets (256)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 256; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 129: factory called once even after multiple gets (258)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 258; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 130: factory called once even after multiple gets (260)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 260; });
    l.get(); l.get(); l.get();
    expect(calls).toBe(1);
  });
  it('lazy test 131: reset allows re-computation (val=655)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 655; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 132: reset allows re-computation (val=660)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 660; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 133: reset allows re-computation (val=665)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 665; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 134: reset allows re-computation (val=670)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 670; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 135: reset allows re-computation (val=675)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 675; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 136: reset allows re-computation (val=680)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 680; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 137: reset allows re-computation (val=685)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 685; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 138: reset allows re-computation (val=690)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 690; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 139: reset allows re-computation (val=695)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 695; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 140: reset allows re-computation (val=700)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 700; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 141: reset allows re-computation (val=705)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 705; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 142: reset allows re-computation (val=710)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 710; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 143: reset allows re-computation (val=715)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 715; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 144: reset allows re-computation (val=720)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 720; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 145: reset allows re-computation (val=725)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 725; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 146: reset allows re-computation (val=730)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 730; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 147: reset allows re-computation (val=735)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 735; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 148: reset allows re-computation (val=740)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 740; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 149: reset allows re-computation (val=745)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 745; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
  it('lazy test 150: reset allows re-computation (val=750)', () => {
    let calls = 0;
    const l = lazy(() => { calls++; return 750; });
    l.get();
    expect(calls).toBe(1);
    l.reset();
    expect(l.isComputed()).toBe(false);
    l.get();
    expect(calls).toBe(2);
  });
});

describe('lazyCached', () => {
  it('lazyCached test 1: returns value 7', () => {
    const fn = lazyCached(() => 7);
    expect(fn()).toBe(7);
  });
  it('lazyCached test 2: returns value 14', () => {
    const fn = lazyCached(() => 14);
    expect(fn()).toBe(14);
  });
  it('lazyCached test 3: returns value 21', () => {
    const fn = lazyCached(() => 21);
    expect(fn()).toBe(21);
  });
  it('lazyCached test 4: returns value 28', () => {
    const fn = lazyCached(() => 28);
    expect(fn()).toBe(28);
  });
  it('lazyCached test 5: returns value 35', () => {
    const fn = lazyCached(() => 35);
    expect(fn()).toBe(35);
  });
  it('lazyCached test 6: returns value 42', () => {
    const fn = lazyCached(() => 42);
    expect(fn()).toBe(42);
  });
  it('lazyCached test 7: returns value 49', () => {
    const fn = lazyCached(() => 49);
    expect(fn()).toBe(49);
  });
  it('lazyCached test 8: returns value 56', () => {
    const fn = lazyCached(() => 56);
    expect(fn()).toBe(56);
  });
  it('lazyCached test 9: returns value 63', () => {
    const fn = lazyCached(() => 63);
    expect(fn()).toBe(63);
  });
  it('lazyCached test 10: returns value 70', () => {
    const fn = lazyCached(() => 70);
    expect(fn()).toBe(70);
  });
  it('lazyCached test 11: returns value 77', () => {
    const fn = lazyCached(() => 77);
    expect(fn()).toBe(77);
  });
  it('lazyCached test 12: returns value 84', () => {
    const fn = lazyCached(() => 84);
    expect(fn()).toBe(84);
  });
  it('lazyCached test 13: returns value 91', () => {
    const fn = lazyCached(() => 91);
    expect(fn()).toBe(91);
  });
  it('lazyCached test 14: returns value 98', () => {
    const fn = lazyCached(() => 98);
    expect(fn()).toBe(98);
  });
  it('lazyCached test 15: returns value 105', () => {
    const fn = lazyCached(() => 105);
    expect(fn()).toBe(105);
  });
  it('lazyCached test 16: returns value 112', () => {
    const fn = lazyCached(() => 112);
    expect(fn()).toBe(112);
  });
  it('lazyCached test 17: returns value 119', () => {
    const fn = lazyCached(() => 119);
    expect(fn()).toBe(119);
  });
  it('lazyCached test 18: returns value 126', () => {
    const fn = lazyCached(() => 126);
    expect(fn()).toBe(126);
  });
  it('lazyCached test 19: returns value 133', () => {
    const fn = lazyCached(() => 133);
    expect(fn()).toBe(133);
  });
  it('lazyCached test 20: returns value 140', () => {
    const fn = lazyCached(() => 140);
    expect(fn()).toBe(140);
  });
  it('lazyCached test 21: returns value 147', () => {
    const fn = lazyCached(() => 147);
    expect(fn()).toBe(147);
  });
  it('lazyCached test 22: returns value 154', () => {
    const fn = lazyCached(() => 154);
    expect(fn()).toBe(154);
  });
  it('lazyCached test 23: returns value 161', () => {
    const fn = lazyCached(() => 161);
    expect(fn()).toBe(161);
  });
  it('lazyCached test 24: returns value 168', () => {
    const fn = lazyCached(() => 168);
    expect(fn()).toBe(168);
  });
  it('lazyCached test 25: returns value 175', () => {
    const fn = lazyCached(() => 175);
    expect(fn()).toBe(175);
  });
  it('lazyCached test 26: returns value 182', () => {
    const fn = lazyCached(() => 182);
    expect(fn()).toBe(182);
  });
  it('lazyCached test 27: returns value 189', () => {
    const fn = lazyCached(() => 189);
    expect(fn()).toBe(189);
  });
  it('lazyCached test 28: returns value 196', () => {
    const fn = lazyCached(() => 196);
    expect(fn()).toBe(196);
  });
  it('lazyCached test 29: returns value 203', () => {
    const fn = lazyCached(() => 203);
    expect(fn()).toBe(203);
  });
  it('lazyCached test 30: returns value 210', () => {
    const fn = lazyCached(() => 210);
    expect(fn()).toBe(210);
  });
  it('lazyCached test 31: returns value 217', () => {
    const fn = lazyCached(() => 217);
    expect(fn()).toBe(217);
  });
  it('lazyCached test 32: returns value 224', () => {
    const fn = lazyCached(() => 224);
    expect(fn()).toBe(224);
  });
  it('lazyCached test 33: returns value 231', () => {
    const fn = lazyCached(() => 231);
    expect(fn()).toBe(231);
  });
  it('lazyCached test 34: returns value 238', () => {
    const fn = lazyCached(() => 238);
    expect(fn()).toBe(238);
  });
  it('lazyCached test 35: returns value 245', () => {
    const fn = lazyCached(() => 245);
    expect(fn()).toBe(245);
  });
  it('lazyCached test 36: returns value 252', () => {
    const fn = lazyCached(() => 252);
    expect(fn()).toBe(252);
  });
  it('lazyCached test 37: returns value 259', () => {
    const fn = lazyCached(() => 259);
    expect(fn()).toBe(259);
  });
  it('lazyCached test 38: returns value 266', () => {
    const fn = lazyCached(() => 266);
    expect(fn()).toBe(266);
  });
  it('lazyCached test 39: returns value 273', () => {
    const fn = lazyCached(() => 273);
    expect(fn()).toBe(273);
  });
  it('lazyCached test 40: returns value 280', () => {
    const fn = lazyCached(() => 280);
    expect(fn()).toBe(280);
  });
  it('lazyCached test 41: returns value 287', () => {
    const fn = lazyCached(() => 287);
    expect(fn()).toBe(287);
  });
  it('lazyCached test 42: returns value 294', () => {
    const fn = lazyCached(() => 294);
    expect(fn()).toBe(294);
  });
  it('lazyCached test 43: returns value 301', () => {
    const fn = lazyCached(() => 301);
    expect(fn()).toBe(301);
  });
  it('lazyCached test 44: returns value 308', () => {
    const fn = lazyCached(() => 308);
    expect(fn()).toBe(308);
  });
  it('lazyCached test 45: returns value 315', () => {
    const fn = lazyCached(() => 315);
    expect(fn()).toBe(315);
  });
  it('lazyCached test 46: returns value 322', () => {
    const fn = lazyCached(() => 322);
    expect(fn()).toBe(322);
  });
  it('lazyCached test 47: returns value 329', () => {
    const fn = lazyCached(() => 329);
    expect(fn()).toBe(329);
  });
  it('lazyCached test 48: returns value 336', () => {
    const fn = lazyCached(() => 336);
    expect(fn()).toBe(336);
  });
  it('lazyCached test 49: returns value 343', () => {
    const fn = lazyCached(() => 343);
    expect(fn()).toBe(343);
  });
  it('lazyCached test 50: returns value 350', () => {
    const fn = lazyCached(() => 350);
    expect(fn()).toBe(350);
  });
  it('lazyCached test 51: factory called once (val=251)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 251; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(251);
  });
  it('lazyCached test 52: factory called once (val=252)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 252; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(252);
  });
  it('lazyCached test 53: factory called once (val=253)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 253; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(253);
  });
  it('lazyCached test 54: factory called once (val=254)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 254; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(254);
  });
  it('lazyCached test 55: factory called once (val=255)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 255; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(255);
  });
  it('lazyCached test 56: factory called once (val=256)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 256; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(256);
  });
  it('lazyCached test 57: factory called once (val=257)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 257; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(257);
  });
  it('lazyCached test 58: factory called once (val=258)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 258; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(258);
  });
  it('lazyCached test 59: factory called once (val=259)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 259; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(259);
  });
  it('lazyCached test 60: factory called once (val=260)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 260; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(260);
  });
  it('lazyCached test 61: factory called once (val=261)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 261; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(261);
  });
  it('lazyCached test 62: factory called once (val=262)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 262; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(262);
  });
  it('lazyCached test 63: factory called once (val=263)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 263; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(263);
  });
  it('lazyCached test 64: factory called once (val=264)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 264; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(264);
  });
  it('lazyCached test 65: factory called once (val=265)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 265; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(265);
  });
  it('lazyCached test 66: factory called once (val=266)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 266; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(266);
  });
  it('lazyCached test 67: factory called once (val=267)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 267; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(267);
  });
  it('lazyCached test 68: factory called once (val=268)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 268; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(268);
  });
  it('lazyCached test 69: factory called once (val=269)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 269; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(269);
  });
  it('lazyCached test 70: factory called once (val=270)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 270; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(270);
  });
  it('lazyCached test 71: factory called once (val=271)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 271; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(271);
  });
  it('lazyCached test 72: factory called once (val=272)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 272; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(272);
  });
  it('lazyCached test 73: factory called once (val=273)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 273; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(273);
  });
  it('lazyCached test 74: factory called once (val=274)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 274; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(274);
  });
  it('lazyCached test 75: factory called once (val=275)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 275; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(275);
  });
  it('lazyCached test 76: factory called once (val=276)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 276; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(276);
  });
  it('lazyCached test 77: factory called once (val=277)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 277; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(277);
  });
  it('lazyCached test 78: factory called once (val=278)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 278; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(278);
  });
  it('lazyCached test 79: factory called once (val=279)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 279; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(279);
  });
  it('lazyCached test 80: factory called once (val=280)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 280; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(280);
  });
  it('lazyCached test 81: factory called once (val=281)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 281; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(281);
  });
  it('lazyCached test 82: factory called once (val=282)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 282; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(282);
  });
  it('lazyCached test 83: factory called once (val=283)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 283; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(283);
  });
  it('lazyCached test 84: factory called once (val=284)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 284; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(284);
  });
  it('lazyCached test 85: factory called once (val=285)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 285; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(285);
  });
  it('lazyCached test 86: factory called once (val=286)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 286; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(286);
  });
  it('lazyCached test 87: factory called once (val=287)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 287; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(287);
  });
  it('lazyCached test 88: factory called once (val=288)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 288; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(288);
  });
  it('lazyCached test 89: factory called once (val=289)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 289; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(289);
  });
  it('lazyCached test 90: factory called once (val=290)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 290; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(290);
  });
  it('lazyCached test 91: factory called once (val=291)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 291; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(291);
  });
  it('lazyCached test 92: factory called once (val=292)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 292; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(292);
  });
  it('lazyCached test 93: factory called once (val=293)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 293; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(293);
  });
  it('lazyCached test 94: factory called once (val=294)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 294; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(294);
  });
  it('lazyCached test 95: factory called once (val=295)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 295; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(295);
  });
  it('lazyCached test 96: factory called once (val=296)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 296; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(296);
  });
  it('lazyCached test 97: factory called once (val=297)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 297; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(297);
  });
  it('lazyCached test 98: factory called once (val=298)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 298; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(298);
  });
  it('lazyCached test 99: factory called once (val=299)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 299; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(299);
  });
  it('lazyCached test 100: factory called once (val=300)', () => {
    let calls = 0;
    const fn = lazyCached(() => { calls++; return 300; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
    expect(fn()).toBe(300);
  });
});

describe('thunk', () => {
  it('thunk test 1: thunk(4) returns function returning 4', () => {
    const t = thunk(4);
    expect(typeof t).toBe('function');
    expect(t()).toBe(4);
    expect(t()).toBe(4);
  });
  it('thunk test 2: thunk(8) returns function returning 8', () => {
    const t = thunk(8);
    expect(typeof t).toBe('function');
    expect(t()).toBe(8);
    expect(t()).toBe(8);
  });
  it('thunk test 3: thunk(12) returns function returning 12', () => {
    const t = thunk(12);
    expect(typeof t).toBe('function');
    expect(t()).toBe(12);
    expect(t()).toBe(12);
  });
  it('thunk test 4: thunk(16) returns function returning 16', () => {
    const t = thunk(16);
    expect(typeof t).toBe('function');
    expect(t()).toBe(16);
    expect(t()).toBe(16);
  });
  it('thunk test 5: thunk(20) returns function returning 20', () => {
    const t = thunk(20);
    expect(typeof t).toBe('function');
    expect(t()).toBe(20);
    expect(t()).toBe(20);
  });
  it('thunk test 6: thunk(24) returns function returning 24', () => {
    const t = thunk(24);
    expect(typeof t).toBe('function');
    expect(t()).toBe(24);
    expect(t()).toBe(24);
  });
  it('thunk test 7: thunk(28) returns function returning 28', () => {
    const t = thunk(28);
    expect(typeof t).toBe('function');
    expect(t()).toBe(28);
    expect(t()).toBe(28);
  });
  it('thunk test 8: thunk(32) returns function returning 32', () => {
    const t = thunk(32);
    expect(typeof t).toBe('function');
    expect(t()).toBe(32);
    expect(t()).toBe(32);
  });
  it('thunk test 9: thunk(36) returns function returning 36', () => {
    const t = thunk(36);
    expect(typeof t).toBe('function');
    expect(t()).toBe(36);
    expect(t()).toBe(36);
  });
  it('thunk test 10: thunk(40) returns function returning 40', () => {
    const t = thunk(40);
    expect(typeof t).toBe('function');
    expect(t()).toBe(40);
    expect(t()).toBe(40);
  });
  it('thunk test 11: thunk(44) returns function returning 44', () => {
    const t = thunk(44);
    expect(typeof t).toBe('function');
    expect(t()).toBe(44);
    expect(t()).toBe(44);
  });
  it('thunk test 12: thunk(48) returns function returning 48', () => {
    const t = thunk(48);
    expect(typeof t).toBe('function');
    expect(t()).toBe(48);
    expect(t()).toBe(48);
  });
  it('thunk test 13: thunk(52) returns function returning 52', () => {
    const t = thunk(52);
    expect(typeof t).toBe('function');
    expect(t()).toBe(52);
    expect(t()).toBe(52);
  });
  it('thunk test 14: thunk(56) returns function returning 56', () => {
    const t = thunk(56);
    expect(typeof t).toBe('function');
    expect(t()).toBe(56);
    expect(t()).toBe(56);
  });
  it('thunk test 15: thunk(60) returns function returning 60', () => {
    const t = thunk(60);
    expect(typeof t).toBe('function');
    expect(t()).toBe(60);
    expect(t()).toBe(60);
  });
  it('thunk test 16: thunk(64) returns function returning 64', () => {
    const t = thunk(64);
    expect(typeof t).toBe('function');
    expect(t()).toBe(64);
    expect(t()).toBe(64);
  });
  it('thunk test 17: thunk(68) returns function returning 68', () => {
    const t = thunk(68);
    expect(typeof t).toBe('function');
    expect(t()).toBe(68);
    expect(t()).toBe(68);
  });
  it('thunk test 18: thunk(72) returns function returning 72', () => {
    const t = thunk(72);
    expect(typeof t).toBe('function');
    expect(t()).toBe(72);
    expect(t()).toBe(72);
  });
  it('thunk test 19: thunk(76) returns function returning 76', () => {
    const t = thunk(76);
    expect(typeof t).toBe('function');
    expect(t()).toBe(76);
    expect(t()).toBe(76);
  });
  it('thunk test 20: thunk(80) returns function returning 80', () => {
    const t = thunk(80);
    expect(typeof t).toBe('function');
    expect(t()).toBe(80);
    expect(t()).toBe(80);
  });
  it('thunk test 21: thunk(84) returns function returning 84', () => {
    const t = thunk(84);
    expect(typeof t).toBe('function');
    expect(t()).toBe(84);
    expect(t()).toBe(84);
  });
  it('thunk test 22: thunk(88) returns function returning 88', () => {
    const t = thunk(88);
    expect(typeof t).toBe('function');
    expect(t()).toBe(88);
    expect(t()).toBe(88);
  });
  it('thunk test 23: thunk(92) returns function returning 92', () => {
    const t = thunk(92);
    expect(typeof t).toBe('function');
    expect(t()).toBe(92);
    expect(t()).toBe(92);
  });
  it('thunk test 24: thunk(96) returns function returning 96', () => {
    const t = thunk(96);
    expect(typeof t).toBe('function');
    expect(t()).toBe(96);
    expect(t()).toBe(96);
  });
  it('thunk test 25: thunk(100) returns function returning 100', () => {
    const t = thunk(100);
    expect(typeof t).toBe('function');
    expect(t()).toBe(100);
    expect(t()).toBe(100);
  });
  it('thunk test 26: thunk(104) returns function returning 104', () => {
    const t = thunk(104);
    expect(typeof t).toBe('function');
    expect(t()).toBe(104);
    expect(t()).toBe(104);
  });
  it('thunk test 27: thunk(108) returns function returning 108', () => {
    const t = thunk(108);
    expect(typeof t).toBe('function');
    expect(t()).toBe(108);
    expect(t()).toBe(108);
  });
  it('thunk test 28: thunk(112) returns function returning 112', () => {
    const t = thunk(112);
    expect(typeof t).toBe('function');
    expect(t()).toBe(112);
    expect(t()).toBe(112);
  });
  it('thunk test 29: thunk(116) returns function returning 116', () => {
    const t = thunk(116);
    expect(typeof t).toBe('function');
    expect(t()).toBe(116);
    expect(t()).toBe(116);
  });
  it('thunk test 30: thunk(120) returns function returning 120', () => {
    const t = thunk(120);
    expect(typeof t).toBe('function');
    expect(t()).toBe(120);
    expect(t()).toBe(120);
  });
  it('thunk test 31: thunk(124) returns function returning 124', () => {
    const t = thunk(124);
    expect(typeof t).toBe('function');
    expect(t()).toBe(124);
    expect(t()).toBe(124);
  });
  it('thunk test 32: thunk(128) returns function returning 128', () => {
    const t = thunk(128);
    expect(typeof t).toBe('function');
    expect(t()).toBe(128);
    expect(t()).toBe(128);
  });
  it('thunk test 33: thunk(132) returns function returning 132', () => {
    const t = thunk(132);
    expect(typeof t).toBe('function');
    expect(t()).toBe(132);
    expect(t()).toBe(132);
  });
  it('thunk test 34: thunk(136) returns function returning 136', () => {
    const t = thunk(136);
    expect(typeof t).toBe('function');
    expect(t()).toBe(136);
    expect(t()).toBe(136);
  });
  it('thunk test 35: thunk(140) returns function returning 140', () => {
    const t = thunk(140);
    expect(typeof t).toBe('function');
    expect(t()).toBe(140);
    expect(t()).toBe(140);
  });
  it('thunk test 36: thunk(144) returns function returning 144', () => {
    const t = thunk(144);
    expect(typeof t).toBe('function');
    expect(t()).toBe(144);
    expect(t()).toBe(144);
  });
  it('thunk test 37: thunk(148) returns function returning 148', () => {
    const t = thunk(148);
    expect(typeof t).toBe('function');
    expect(t()).toBe(148);
    expect(t()).toBe(148);
  });
  it('thunk test 38: thunk(152) returns function returning 152', () => {
    const t = thunk(152);
    expect(typeof t).toBe('function');
    expect(t()).toBe(152);
    expect(t()).toBe(152);
  });
  it('thunk test 39: thunk(156) returns function returning 156', () => {
    const t = thunk(156);
    expect(typeof t).toBe('function');
    expect(t()).toBe(156);
    expect(t()).toBe(156);
  });
  it('thunk test 40: thunk(160) returns function returning 160', () => {
    const t = thunk(160);
    expect(typeof t).toBe('function');
    expect(t()).toBe(160);
    expect(t()).toBe(160);
  });
  it('thunk test 41: thunk(164) returns function returning 164', () => {
    const t = thunk(164);
    expect(typeof t).toBe('function');
    expect(t()).toBe(164);
    expect(t()).toBe(164);
  });
  it('thunk test 42: thunk(168) returns function returning 168', () => {
    const t = thunk(168);
    expect(typeof t).toBe('function');
    expect(t()).toBe(168);
    expect(t()).toBe(168);
  });
  it('thunk test 43: thunk(172) returns function returning 172', () => {
    const t = thunk(172);
    expect(typeof t).toBe('function');
    expect(t()).toBe(172);
    expect(t()).toBe(172);
  });
  it('thunk test 44: thunk(176) returns function returning 176', () => {
    const t = thunk(176);
    expect(typeof t).toBe('function');
    expect(t()).toBe(176);
    expect(t()).toBe(176);
  });
  it('thunk test 45: thunk(180) returns function returning 180', () => {
    const t = thunk(180);
    expect(typeof t).toBe('function');
    expect(t()).toBe(180);
    expect(t()).toBe(180);
  });
  it('thunk test 46: thunk(184) returns function returning 184', () => {
    const t = thunk(184);
    expect(typeof t).toBe('function');
    expect(t()).toBe(184);
    expect(t()).toBe(184);
  });
  it('thunk test 47: thunk(188) returns function returning 188', () => {
    const t = thunk(188);
    expect(typeof t).toBe('function');
    expect(t()).toBe(188);
    expect(t()).toBe(188);
  });
  it('thunk test 48: thunk(192) returns function returning 192', () => {
    const t = thunk(192);
    expect(typeof t).toBe('function');
    expect(t()).toBe(192);
    expect(t()).toBe(192);
  });
  it('thunk test 49: thunk(196) returns function returning 196', () => {
    const t = thunk(196);
    expect(typeof t).toBe('function');
    expect(t()).toBe(196);
    expect(t()).toBe(196);
  });
  it('thunk test 50: thunk(200) returns function returning 200', () => {
    const t = thunk(200);
    expect(typeof t).toBe('function');
    expect(t()).toBe(200);
    expect(t()).toBe(200);
  });
  it('thunk test 51: thunk(204) returns function returning 204', () => {
    const t = thunk(204);
    expect(typeof t).toBe('function');
    expect(t()).toBe(204);
    expect(t()).toBe(204);
  });
  it('thunk test 52: thunk(208) returns function returning 208', () => {
    const t = thunk(208);
    expect(typeof t).toBe('function');
    expect(t()).toBe(208);
    expect(t()).toBe(208);
  });
  it('thunk test 53: thunk(212) returns function returning 212', () => {
    const t = thunk(212);
    expect(typeof t).toBe('function');
    expect(t()).toBe(212);
    expect(t()).toBe(212);
  });
  it('thunk test 54: thunk(216) returns function returning 216', () => {
    const t = thunk(216);
    expect(typeof t).toBe('function');
    expect(t()).toBe(216);
    expect(t()).toBe(216);
  });
  it('thunk test 55: thunk(220) returns function returning 220', () => {
    const t = thunk(220);
    expect(typeof t).toBe('function');
    expect(t()).toBe(220);
    expect(t()).toBe(220);
  });
  it('thunk test 56: thunk(224) returns function returning 224', () => {
    const t = thunk(224);
    expect(typeof t).toBe('function');
    expect(t()).toBe(224);
    expect(t()).toBe(224);
  });
  it('thunk test 57: thunk(228) returns function returning 228', () => {
    const t = thunk(228);
    expect(typeof t).toBe('function');
    expect(t()).toBe(228);
    expect(t()).toBe(228);
  });
  it('thunk test 58: thunk(232) returns function returning 232', () => {
    const t = thunk(232);
    expect(typeof t).toBe('function');
    expect(t()).toBe(232);
    expect(t()).toBe(232);
  });
  it('thunk test 59: thunk(236) returns function returning 236', () => {
    const t = thunk(236);
    expect(typeof t).toBe('function');
    expect(t()).toBe(236);
    expect(t()).toBe(236);
  });
  it('thunk test 60: thunk(240) returns function returning 240', () => {
    const t = thunk(240);
    expect(typeof t).toBe('function');
    expect(t()).toBe(240);
    expect(t()).toBe(240);
  });
  it('thunk test 61: thunk(244) returns function returning 244', () => {
    const t = thunk(244);
    expect(typeof t).toBe('function');
    expect(t()).toBe(244);
    expect(t()).toBe(244);
  });
  it('thunk test 62: thunk(248) returns function returning 248', () => {
    const t = thunk(248);
    expect(typeof t).toBe('function');
    expect(t()).toBe(248);
    expect(t()).toBe(248);
  });
  it('thunk test 63: thunk(252) returns function returning 252', () => {
    const t = thunk(252);
    expect(typeof t).toBe('function');
    expect(t()).toBe(252);
    expect(t()).toBe(252);
  });
  it('thunk test 64: thunk(256) returns function returning 256', () => {
    const t = thunk(256);
    expect(typeof t).toBe('function');
    expect(t()).toBe(256);
    expect(t()).toBe(256);
  });
  it('thunk test 65: thunk(260) returns function returning 260', () => {
    const t = thunk(260);
    expect(typeof t).toBe('function');
    expect(t()).toBe(260);
    expect(t()).toBe(260);
  });
  it('thunk test 66: thunk(264) returns function returning 264', () => {
    const t = thunk(264);
    expect(typeof t).toBe('function');
    expect(t()).toBe(264);
    expect(t()).toBe(264);
  });
  it('thunk test 67: thunk(268) returns function returning 268', () => {
    const t = thunk(268);
    expect(typeof t).toBe('function');
    expect(t()).toBe(268);
    expect(t()).toBe(268);
  });
  it('thunk test 68: thunk(272) returns function returning 272', () => {
    const t = thunk(272);
    expect(typeof t).toBe('function');
    expect(t()).toBe(272);
    expect(t()).toBe(272);
  });
  it('thunk test 69: thunk(276) returns function returning 276', () => {
    const t = thunk(276);
    expect(typeof t).toBe('function');
    expect(t()).toBe(276);
    expect(t()).toBe(276);
  });
  it('thunk test 70: thunk(280) returns function returning 280', () => {
    const t = thunk(280);
    expect(typeof t).toBe('function');
    expect(t()).toBe(280);
    expect(t()).toBe(280);
  });
  it('thunk test 71: thunk(284) returns function returning 284', () => {
    const t = thunk(284);
    expect(typeof t).toBe('function');
    expect(t()).toBe(284);
    expect(t()).toBe(284);
  });
  it('thunk test 72: thunk(288) returns function returning 288', () => {
    const t = thunk(288);
    expect(typeof t).toBe('function');
    expect(t()).toBe(288);
    expect(t()).toBe(288);
  });
  it('thunk test 73: thunk(292) returns function returning 292', () => {
    const t = thunk(292);
    expect(typeof t).toBe('function');
    expect(t()).toBe(292);
    expect(t()).toBe(292);
  });
  it('thunk test 74: thunk(296) returns function returning 296', () => {
    const t = thunk(296);
    expect(typeof t).toBe('function');
    expect(t()).toBe(296);
    expect(t()).toBe(296);
  });
  it('thunk test 75: thunk(300) returns function returning 300', () => {
    const t = thunk(300);
    expect(typeof t).toBe('function');
    expect(t()).toBe(300);
    expect(t()).toBe(300);
  });
  it('thunk test 76: thunk(304) returns function returning 304', () => {
    const t = thunk(304);
    expect(typeof t).toBe('function');
    expect(t()).toBe(304);
    expect(t()).toBe(304);
  });
  it('thunk test 77: thunk(308) returns function returning 308', () => {
    const t = thunk(308);
    expect(typeof t).toBe('function');
    expect(t()).toBe(308);
    expect(t()).toBe(308);
  });
  it('thunk test 78: thunk(312) returns function returning 312', () => {
    const t = thunk(312);
    expect(typeof t).toBe('function');
    expect(t()).toBe(312);
    expect(t()).toBe(312);
  });
  it('thunk test 79: thunk(316) returns function returning 316', () => {
    const t = thunk(316);
    expect(typeof t).toBe('function');
    expect(t()).toBe(316);
    expect(t()).toBe(316);
  });
  it('thunk test 80: thunk(320) returns function returning 320', () => {
    const t = thunk(320);
    expect(typeof t).toBe('function');
    expect(t()).toBe(320);
    expect(t()).toBe(320);
  });
  it('thunk test 81: thunk(324) returns function returning 324', () => {
    const t = thunk(324);
    expect(typeof t).toBe('function');
    expect(t()).toBe(324);
    expect(t()).toBe(324);
  });
  it('thunk test 82: thunk(328) returns function returning 328', () => {
    const t = thunk(328);
    expect(typeof t).toBe('function');
    expect(t()).toBe(328);
    expect(t()).toBe(328);
  });
  it('thunk test 83: thunk(332) returns function returning 332', () => {
    const t = thunk(332);
    expect(typeof t).toBe('function');
    expect(t()).toBe(332);
    expect(t()).toBe(332);
  });
  it('thunk test 84: thunk(336) returns function returning 336', () => {
    const t = thunk(336);
    expect(typeof t).toBe('function');
    expect(t()).toBe(336);
    expect(t()).toBe(336);
  });
  it('thunk test 85: thunk(340) returns function returning 340', () => {
    const t = thunk(340);
    expect(typeof t).toBe('function');
    expect(t()).toBe(340);
    expect(t()).toBe(340);
  });
  it('thunk test 86: thunk(344) returns function returning 344', () => {
    const t = thunk(344);
    expect(typeof t).toBe('function');
    expect(t()).toBe(344);
    expect(t()).toBe(344);
  });
  it('thunk test 87: thunk(348) returns function returning 348', () => {
    const t = thunk(348);
    expect(typeof t).toBe('function');
    expect(t()).toBe(348);
    expect(t()).toBe(348);
  });
  it('thunk test 88: thunk(352) returns function returning 352', () => {
    const t = thunk(352);
    expect(typeof t).toBe('function');
    expect(t()).toBe(352);
    expect(t()).toBe(352);
  });
  it('thunk test 89: thunk(356) returns function returning 356', () => {
    const t = thunk(356);
    expect(typeof t).toBe('function');
    expect(t()).toBe(356);
    expect(t()).toBe(356);
  });
  it('thunk test 90: thunk(360) returns function returning 360', () => {
    const t = thunk(360);
    expect(typeof t).toBe('function');
    expect(t()).toBe(360);
    expect(t()).toBe(360);
  });
  it('thunk test 91: thunk(364) returns function returning 364', () => {
    const t = thunk(364);
    expect(typeof t).toBe('function');
    expect(t()).toBe(364);
    expect(t()).toBe(364);
  });
  it('thunk test 92: thunk(368) returns function returning 368', () => {
    const t = thunk(368);
    expect(typeof t).toBe('function');
    expect(t()).toBe(368);
    expect(t()).toBe(368);
  });
  it('thunk test 93: thunk(372) returns function returning 372', () => {
    const t = thunk(372);
    expect(typeof t).toBe('function');
    expect(t()).toBe(372);
    expect(t()).toBe(372);
  });
  it('thunk test 94: thunk(376) returns function returning 376', () => {
    const t = thunk(376);
    expect(typeof t).toBe('function');
    expect(t()).toBe(376);
    expect(t()).toBe(376);
  });
  it('thunk test 95: thunk(380) returns function returning 380', () => {
    const t = thunk(380);
    expect(typeof t).toBe('function');
    expect(t()).toBe(380);
    expect(t()).toBe(380);
  });
  it('thunk test 96: thunk(384) returns function returning 384', () => {
    const t = thunk(384);
    expect(typeof t).toBe('function');
    expect(t()).toBe(384);
    expect(t()).toBe(384);
  });
  it('thunk test 97: thunk(388) returns function returning 388', () => {
    const t = thunk(388);
    expect(typeof t).toBe('function');
    expect(t()).toBe(388);
    expect(t()).toBe(388);
  });
  it('thunk test 98: thunk(392) returns function returning 392', () => {
    const t = thunk(392);
    expect(typeof t).toBe('function');
    expect(t()).toBe(392);
    expect(t()).toBe(392);
  });
  it('thunk test 99: thunk(396) returns function returning 396', () => {
    const t = thunk(396);
    expect(typeof t).toBe('function');
    expect(t()).toBe(396);
    expect(t()).toBe(396);
  });
  it('thunk test 100: thunk(400) returns function returning 400', () => {
    const t = thunk(400);
    expect(typeof t).toBe('function');
    expect(t()).toBe(400);
    expect(t()).toBe(400);
  });
});

describe('force', () => {
  it('force test 1: force(() => 3) returns 3', () => {
    expect(force(() => 3)).toBe(3);
  });
  it('force test 2: force(() => 6) returns 6', () => {
    expect(force(() => 6)).toBe(6);
  });
  it('force test 3: force(() => 9) returns 9', () => {
    expect(force(() => 9)).toBe(9);
  });
  it('force test 4: force(() => 12) returns 12', () => {
    expect(force(() => 12)).toBe(12);
  });
  it('force test 5: force(() => 15) returns 15', () => {
    expect(force(() => 15)).toBe(15);
  });
  it('force test 6: force(() => 18) returns 18', () => {
    expect(force(() => 18)).toBe(18);
  });
  it('force test 7: force(() => 21) returns 21', () => {
    expect(force(() => 21)).toBe(21);
  });
  it('force test 8: force(() => 24) returns 24', () => {
    expect(force(() => 24)).toBe(24);
  });
  it('force test 9: force(() => 27) returns 27', () => {
    expect(force(() => 27)).toBe(27);
  });
  it('force test 10: force(() => 30) returns 30', () => {
    expect(force(() => 30)).toBe(30);
  });
  it('force test 11: force(() => 33) returns 33', () => {
    expect(force(() => 33)).toBe(33);
  });
  it('force test 12: force(() => 36) returns 36', () => {
    expect(force(() => 36)).toBe(36);
  });
  it('force test 13: force(() => 39) returns 39', () => {
    expect(force(() => 39)).toBe(39);
  });
  it('force test 14: force(() => 42) returns 42', () => {
    expect(force(() => 42)).toBe(42);
  });
  it('force test 15: force(() => 45) returns 45', () => {
    expect(force(() => 45)).toBe(45);
  });
  it('force test 16: force(() => 48) returns 48', () => {
    expect(force(() => 48)).toBe(48);
  });
  it('force test 17: force(() => 51) returns 51', () => {
    expect(force(() => 51)).toBe(51);
  });
  it('force test 18: force(() => 54) returns 54', () => {
    expect(force(() => 54)).toBe(54);
  });
  it('force test 19: force(() => 57) returns 57', () => {
    expect(force(() => 57)).toBe(57);
  });
  it('force test 20: force(() => 60) returns 60', () => {
    expect(force(() => 60)).toBe(60);
  });
  it('force test 21: force(() => 63) returns 63', () => {
    expect(force(() => 63)).toBe(63);
  });
  it('force test 22: force(() => 66) returns 66', () => {
    expect(force(() => 66)).toBe(66);
  });
  it('force test 23: force(() => 69) returns 69', () => {
    expect(force(() => 69)).toBe(69);
  });
  it('force test 24: force(() => 72) returns 72', () => {
    expect(force(() => 72)).toBe(72);
  });
  it('force test 25: force(() => 75) returns 75', () => {
    expect(force(() => 75)).toBe(75);
  });
  it('force test 26: force(() => 78) returns 78', () => {
    expect(force(() => 78)).toBe(78);
  });
  it('force test 27: force(() => 81) returns 81', () => {
    expect(force(() => 81)).toBe(81);
  });
  it('force test 28: force(() => 84) returns 84', () => {
    expect(force(() => 84)).toBe(84);
  });
  it('force test 29: force(() => 87) returns 87', () => {
    expect(force(() => 87)).toBe(87);
  });
  it('force test 30: force(() => 90) returns 90', () => {
    expect(force(() => 90)).toBe(90);
  });
  it('force test 31: force(() => 93) returns 93', () => {
    expect(force(() => 93)).toBe(93);
  });
  it('force test 32: force(() => 96) returns 96', () => {
    expect(force(() => 96)).toBe(96);
  });
  it('force test 33: force(() => 99) returns 99', () => {
    expect(force(() => 99)).toBe(99);
  });
  it('force test 34: force(() => 102) returns 102', () => {
    expect(force(() => 102)).toBe(102);
  });
  it('force test 35: force(() => 105) returns 105', () => {
    expect(force(() => 105)).toBe(105);
  });
  it('force test 36: force(() => 108) returns 108', () => {
    expect(force(() => 108)).toBe(108);
  });
  it('force test 37: force(() => 111) returns 111', () => {
    expect(force(() => 111)).toBe(111);
  });
  it('force test 38: force(() => 114) returns 114', () => {
    expect(force(() => 114)).toBe(114);
  });
  it('force test 39: force(() => 117) returns 117', () => {
    expect(force(() => 117)).toBe(117);
  });
  it('force test 40: force(() => 120) returns 120', () => {
    expect(force(() => 120)).toBe(120);
  });
  it('force test 41: force(() => 123) returns 123', () => {
    expect(force(() => 123)).toBe(123);
  });
  it('force test 42: force(() => 126) returns 126', () => {
    expect(force(() => 126)).toBe(126);
  });
  it('force test 43: force(() => 129) returns 129', () => {
    expect(force(() => 129)).toBe(129);
  });
  it('force test 44: force(() => 132) returns 132', () => {
    expect(force(() => 132)).toBe(132);
  });
  it('force test 45: force(() => 135) returns 135', () => {
    expect(force(() => 135)).toBe(135);
  });
  it('force test 46: force(() => 138) returns 138', () => {
    expect(force(() => 138)).toBe(138);
  });
  it('force test 47: force(() => 141) returns 141', () => {
    expect(force(() => 141)).toBe(141);
  });
  it('force test 48: force(() => 144) returns 144', () => {
    expect(force(() => 144)).toBe(144);
  });
  it('force test 49: force(() => 147) returns 147', () => {
    expect(force(() => 147)).toBe(147);
  });
  it('force test 50: force(() => 150) returns 150', () => {
    expect(force(() => 150)).toBe(150);
  });
  it('force test 51: force(351) returns 351 directly', () => {
    expect(force(351)).toBe(351);
  });
  it('force test 52: force(352) returns 352 directly', () => {
    expect(force(352)).toBe(352);
  });
  it('force test 53: force(353) returns 353 directly', () => {
    expect(force(353)).toBe(353);
  });
  it('force test 54: force(354) returns 354 directly', () => {
    expect(force(354)).toBe(354);
  });
  it('force test 55: force(355) returns 355 directly', () => {
    expect(force(355)).toBe(355);
  });
  it('force test 56: force(356) returns 356 directly', () => {
    expect(force(356)).toBe(356);
  });
  it('force test 57: force(357) returns 357 directly', () => {
    expect(force(357)).toBe(357);
  });
  it('force test 58: force(358) returns 358 directly', () => {
    expect(force(358)).toBe(358);
  });
  it('force test 59: force(359) returns 359 directly', () => {
    expect(force(359)).toBe(359);
  });
  it('force test 60: force(360) returns 360 directly', () => {
    expect(force(360)).toBe(360);
  });
  it('force test 61: force(361) returns 361 directly', () => {
    expect(force(361)).toBe(361);
  });
  it('force test 62: force(362) returns 362 directly', () => {
    expect(force(362)).toBe(362);
  });
  it('force test 63: force(363) returns 363 directly', () => {
    expect(force(363)).toBe(363);
  });
  it('force test 64: force(364) returns 364 directly', () => {
    expect(force(364)).toBe(364);
  });
  it('force test 65: force(365) returns 365 directly', () => {
    expect(force(365)).toBe(365);
  });
  it('force test 66: force(366) returns 366 directly', () => {
    expect(force(366)).toBe(366);
  });
  it('force test 67: force(367) returns 367 directly', () => {
    expect(force(367)).toBe(367);
  });
  it('force test 68: force(368) returns 368 directly', () => {
    expect(force(368)).toBe(368);
  });
  it('force test 69: force(369) returns 369 directly', () => {
    expect(force(369)).toBe(369);
  });
  it('force test 70: force(370) returns 370 directly', () => {
    expect(force(370)).toBe(370);
  });
  it('force test 71: force(371) returns 371 directly', () => {
    expect(force(371)).toBe(371);
  });
  it('force test 72: force(372) returns 372 directly', () => {
    expect(force(372)).toBe(372);
  });
  it('force test 73: force(373) returns 373 directly', () => {
    expect(force(373)).toBe(373);
  });
  it('force test 74: force(374) returns 374 directly', () => {
    expect(force(374)).toBe(374);
  });
  it('force test 75: force(375) returns 375 directly', () => {
    expect(force(375)).toBe(375);
  });
  it('force test 76: force(376) returns 376 directly', () => {
    expect(force(376)).toBe(376);
  });
  it('force test 77: force(377) returns 377 directly', () => {
    expect(force(377)).toBe(377);
  });
  it('force test 78: force(378) returns 378 directly', () => {
    expect(force(378)).toBe(378);
  });
  it('force test 79: force(379) returns 379 directly', () => {
    expect(force(379)).toBe(379);
  });
  it('force test 80: force(380) returns 380 directly', () => {
    expect(force(380)).toBe(380);
  });
  it('force test 81: force(381) returns 381 directly', () => {
    expect(force(381)).toBe(381);
  });
  it('force test 82: force(382) returns 382 directly', () => {
    expect(force(382)).toBe(382);
  });
  it('force test 83: force(383) returns 383 directly', () => {
    expect(force(383)).toBe(383);
  });
  it('force test 84: force(384) returns 384 directly', () => {
    expect(force(384)).toBe(384);
  });
  it('force test 85: force(385) returns 385 directly', () => {
    expect(force(385)).toBe(385);
  });
  it('force test 86: force(386) returns 386 directly', () => {
    expect(force(386)).toBe(386);
  });
  it('force test 87: force(387) returns 387 directly', () => {
    expect(force(387)).toBe(387);
  });
  it('force test 88: force(388) returns 388 directly', () => {
    expect(force(388)).toBe(388);
  });
  it('force test 89: force(389) returns 389 directly', () => {
    expect(force(389)).toBe(389);
  });
  it('force test 90: force(390) returns 390 directly', () => {
    expect(force(390)).toBe(390);
  });
  it('force test 91: force(391) returns 391 directly', () => {
    expect(force(391)).toBe(391);
  });
  it('force test 92: force(392) returns 392 directly', () => {
    expect(force(392)).toBe(392);
  });
  it('force test 93: force(393) returns 393 directly', () => {
    expect(force(393)).toBe(393);
  });
  it('force test 94: force(394) returns 394 directly', () => {
    expect(force(394)).toBe(394);
  });
  it('force test 95: force(395) returns 395 directly', () => {
    expect(force(395)).toBe(395);
  });
  it('force test 96: force(396) returns 396 directly', () => {
    expect(force(396)).toBe(396);
  });
  it('force test 97: force(397) returns 397 directly', () => {
    expect(force(397)).toBe(397);
  });
  it('force test 98: force(398) returns 398 directly', () => {
    expect(force(398)).toBe(398);
  });
  it('force test 99: force(399) returns 399 directly', () => {
    expect(force(399)).toBe(399);
  });
  it('force test 100: force(400) returns 400 directly', () => {
    expect(force(400)).toBe(400);
  });
});

describe('range', () => {
  it('range test 1: range(0, 2) has 2 elements', () => {
    const r = range(0, 2);
    expect(r.length).toBe(2);
    expect(r[0]).toBe(0);
    expect(r[1]).toBe(1);
  });
  it('range test 2: range(0, 3) has 3 elements', () => {
    const r = range(0, 3);
    expect(r.length).toBe(3);
    expect(r[0]).toBe(0);
    expect(r[2]).toBe(2);
  });
  it('range test 3: range(0, 4) has 4 elements', () => {
    const r = range(0, 4);
    expect(r.length).toBe(4);
    expect(r[0]).toBe(0);
    expect(r[3]).toBe(3);
  });
  it('range test 4: range(0, 5) has 5 elements', () => {
    const r = range(0, 5);
    expect(r.length).toBe(5);
    expect(r[0]).toBe(0);
    expect(r[4]).toBe(4);
  });
  it('range test 5: range(0, 6) has 6 elements', () => {
    const r = range(0, 6);
    expect(r.length).toBe(6);
    expect(r[0]).toBe(0);
    expect(r[5]).toBe(5);
  });
  it('range test 6: range(0, 7) has 7 elements', () => {
    const r = range(0, 7);
    expect(r.length).toBe(7);
    expect(r[0]).toBe(0);
    expect(r[6]).toBe(6);
  });
  it('range test 7: range(0, 8) has 8 elements', () => {
    const r = range(0, 8);
    expect(r.length).toBe(8);
    expect(r[0]).toBe(0);
    expect(r[7]).toBe(7);
  });
  it('range test 8: range(0, 9) has 9 elements', () => {
    const r = range(0, 9);
    expect(r.length).toBe(9);
    expect(r[0]).toBe(0);
    expect(r[8]).toBe(8);
  });
  it('range test 9: range(0, 10) has 10 elements', () => {
    const r = range(0, 10);
    expect(r.length).toBe(10);
    expect(r[0]).toBe(0);
    expect(r[9]).toBe(9);
  });
  it('range test 10: range(0, 11) has 11 elements', () => {
    const r = range(0, 11);
    expect(r.length).toBe(11);
    expect(r[0]).toBe(0);
    expect(r[10]).toBe(10);
  });
  it('range test 11: range(0, 12) has 12 elements', () => {
    const r = range(0, 12);
    expect(r.length).toBe(12);
    expect(r[0]).toBe(0);
    expect(r[11]).toBe(11);
  });
  it('range test 12: range(0, 13) has 13 elements', () => {
    const r = range(0, 13);
    expect(r.length).toBe(13);
    expect(r[0]).toBe(0);
    expect(r[12]).toBe(12);
  });
  it('range test 13: range(0, 14) has 14 elements', () => {
    const r = range(0, 14);
    expect(r.length).toBe(14);
    expect(r[0]).toBe(0);
    expect(r[13]).toBe(13);
  });
  it('range test 14: range(0, 15) has 15 elements', () => {
    const r = range(0, 15);
    expect(r.length).toBe(15);
    expect(r[0]).toBe(0);
    expect(r[14]).toBe(14);
  });
  it('range test 15: range(0, 16) has 16 elements', () => {
    const r = range(0, 16);
    expect(r.length).toBe(16);
    expect(r[0]).toBe(0);
    expect(r[15]).toBe(15);
  });
  it('range test 16: range(0, 17) has 17 elements', () => {
    const r = range(0, 17);
    expect(r.length).toBe(17);
    expect(r[0]).toBe(0);
    expect(r[16]).toBe(16);
  });
  it('range test 17: range(0, 18) has 18 elements', () => {
    const r = range(0, 18);
    expect(r.length).toBe(18);
    expect(r[0]).toBe(0);
    expect(r[17]).toBe(17);
  });
  it('range test 18: range(0, 19) has 19 elements', () => {
    const r = range(0, 19);
    expect(r.length).toBe(19);
    expect(r[0]).toBe(0);
    expect(r[18]).toBe(18);
  });
  it('range test 19: range(0, 20) has 20 elements', () => {
    const r = range(0, 20);
    expect(r.length).toBe(20);
    expect(r[0]).toBe(0);
    expect(r[19]).toBe(19);
  });
  it('range test 20: range(0, 21) has 21 elements', () => {
    const r = range(0, 21);
    expect(r.length).toBe(21);
    expect(r[0]).toBe(0);
    expect(r[20]).toBe(20);
  });
  it('range test 21: range(0, 22) has 22 elements', () => {
    const r = range(0, 22);
    expect(r.length).toBe(22);
    expect(r[0]).toBe(0);
    expect(r[21]).toBe(21);
  });
  it('range test 22: range(0, 23) has 23 elements', () => {
    const r = range(0, 23);
    expect(r.length).toBe(23);
    expect(r[0]).toBe(0);
    expect(r[22]).toBe(22);
  });
  it('range test 23: range(0, 24) has 24 elements', () => {
    const r = range(0, 24);
    expect(r.length).toBe(24);
    expect(r[0]).toBe(0);
    expect(r[23]).toBe(23);
  });
  it('range test 24: range(0, 25) has 25 elements', () => {
    const r = range(0, 25);
    expect(r.length).toBe(25);
    expect(r[0]).toBe(0);
    expect(r[24]).toBe(24);
  });
  it('range test 25: range(0, 26) has 26 elements', () => {
    const r = range(0, 26);
    expect(r.length).toBe(26);
    expect(r[0]).toBe(0);
    expect(r[25]).toBe(25);
  });
  it('range test 26: range(0, 27) has 27 elements', () => {
    const r = range(0, 27);
    expect(r.length).toBe(27);
    expect(r[0]).toBe(0);
    expect(r[26]).toBe(26);
  });
  it('range test 27: range(0, 28) has 28 elements', () => {
    const r = range(0, 28);
    expect(r.length).toBe(28);
    expect(r[0]).toBe(0);
    expect(r[27]).toBe(27);
  });
  it('range test 28: range(0, 29) has 29 elements', () => {
    const r = range(0, 29);
    expect(r.length).toBe(29);
    expect(r[0]).toBe(0);
    expect(r[28]).toBe(28);
  });
  it('range test 29: range(0, 30) has 30 elements', () => {
    const r = range(0, 30);
    expect(r.length).toBe(30);
    expect(r[0]).toBe(0);
    expect(r[29]).toBe(29);
  });
  it('range test 30: range(0, 31) has 31 elements', () => {
    const r = range(0, 31);
    expect(r.length).toBe(31);
    expect(r[0]).toBe(0);
    expect(r[30]).toBe(30);
  });
  it('range test 31: range(0, 32) has 32 elements', () => {
    const r = range(0, 32);
    expect(r.length).toBe(32);
    expect(r[0]).toBe(0);
    expect(r[31]).toBe(31);
  });
  it('range test 32: range(0, 33) has 33 elements', () => {
    const r = range(0, 33);
    expect(r.length).toBe(33);
    expect(r[0]).toBe(0);
    expect(r[32]).toBe(32);
  });
  it('range test 33: range(0, 34) has 34 elements', () => {
    const r = range(0, 34);
    expect(r.length).toBe(34);
    expect(r[0]).toBe(0);
    expect(r[33]).toBe(33);
  });
  it('range test 34: range(0, 35) has 35 elements', () => {
    const r = range(0, 35);
    expect(r.length).toBe(35);
    expect(r[0]).toBe(0);
    expect(r[34]).toBe(34);
  });
  it('range test 35: range(0, 36) has 36 elements', () => {
    const r = range(0, 36);
    expect(r.length).toBe(36);
    expect(r[0]).toBe(0);
    expect(r[35]).toBe(35);
  });
  it('range test 36: range(0, 37) has 37 elements', () => {
    const r = range(0, 37);
    expect(r.length).toBe(37);
    expect(r[0]).toBe(0);
    expect(r[36]).toBe(36);
  });
  it('range test 37: range(0, 38) has 38 elements', () => {
    const r = range(0, 38);
    expect(r.length).toBe(38);
    expect(r[0]).toBe(0);
    expect(r[37]).toBe(37);
  });
  it('range test 38: range(0, 39) has 39 elements', () => {
    const r = range(0, 39);
    expect(r.length).toBe(39);
    expect(r[0]).toBe(0);
    expect(r[38]).toBe(38);
  });
  it('range test 39: range(0, 40) has 40 elements', () => {
    const r = range(0, 40);
    expect(r.length).toBe(40);
    expect(r[0]).toBe(0);
    expect(r[39]).toBe(39);
  });
  it('range test 40: range(0, 41) has 41 elements', () => {
    const r = range(0, 41);
    expect(r.length).toBe(41);
    expect(r[0]).toBe(0);
    expect(r[40]).toBe(40);
  });
  it('range test 41: range(0, 42) has 42 elements', () => {
    const r = range(0, 42);
    expect(r.length).toBe(42);
    expect(r[0]).toBe(0);
    expect(r[41]).toBe(41);
  });
  it('range test 42: range(0, 43) has 43 elements', () => {
    const r = range(0, 43);
    expect(r.length).toBe(43);
    expect(r[0]).toBe(0);
    expect(r[42]).toBe(42);
  });
  it('range test 43: range(0, 44) has 44 elements', () => {
    const r = range(0, 44);
    expect(r.length).toBe(44);
    expect(r[0]).toBe(0);
    expect(r[43]).toBe(43);
  });
  it('range test 44: range(0, 45) has 45 elements', () => {
    const r = range(0, 45);
    expect(r.length).toBe(45);
    expect(r[0]).toBe(0);
    expect(r[44]).toBe(44);
  });
  it('range test 45: range(0, 46) has 46 elements', () => {
    const r = range(0, 46);
    expect(r.length).toBe(46);
    expect(r[0]).toBe(0);
    expect(r[45]).toBe(45);
  });
  it('range test 46: range(0, 47) has 47 elements', () => {
    const r = range(0, 47);
    expect(r.length).toBe(47);
    expect(r[0]).toBe(0);
    expect(r[46]).toBe(46);
  });
  it('range test 47: range(0, 48) has 48 elements', () => {
    const r = range(0, 48);
    expect(r.length).toBe(48);
    expect(r[0]).toBe(0);
    expect(r[47]).toBe(47);
  });
  it('range test 48: range(0, 49) has 49 elements', () => {
    const r = range(0, 49);
    expect(r.length).toBe(49);
    expect(r[0]).toBe(0);
    expect(r[48]).toBe(48);
  });
  it('range test 49: range(0, 50) has 50 elements', () => {
    const r = range(0, 50);
    expect(r.length).toBe(50);
    expect(r[0]).toBe(0);
    expect(r[49]).toBe(49);
  });
  it('range test 50: range(0, 51) has 51 elements', () => {
    const r = range(0, 51);
    expect(r.length).toBe(51);
    expect(r[0]).toBe(0);
    expect(r[50]).toBe(50);
  });
  it('range test 51: range(1, 21, 2) has 10 elements', () => {
    const r = range(1, 21, 2);
    expect(r.length).toBe(10);
  });
  it('range test 52: range(2, 22, 2) has 10 elements', () => {
    const r = range(2, 22, 2);
    expect(r.length).toBe(10);
  });
  it('range test 53: range(3, 23, 2) has 10 elements', () => {
    const r = range(3, 23, 2);
    expect(r.length).toBe(10);
  });
  it('range test 54: range(4, 24, 2) has 10 elements', () => {
    const r = range(4, 24, 2);
    expect(r.length).toBe(10);
  });
  it('range test 55: range(5, 25, 2) has 10 elements', () => {
    const r = range(5, 25, 2);
    expect(r.length).toBe(10);
  });
  it('range test 56: range(6, 26, 2) has 10 elements', () => {
    const r = range(6, 26, 2);
    expect(r.length).toBe(10);
  });
  it('range test 57: range(7, 27, 2) has 10 elements', () => {
    const r = range(7, 27, 2);
    expect(r.length).toBe(10);
  });
  it('range test 58: range(8, 28, 2) has 10 elements', () => {
    const r = range(8, 28, 2);
    expect(r.length).toBe(10);
  });
  it('range test 59: range(9, 29, 2) has 10 elements', () => {
    const r = range(9, 29, 2);
    expect(r.length).toBe(10);
  });
  it('range test 60: range(10, 30, 2) has 10 elements', () => {
    const r = range(10, 30, 2);
    expect(r.length).toBe(10);
  });
  it('range test 61: range(11, 31, 2) has 10 elements', () => {
    const r = range(11, 31, 2);
    expect(r.length).toBe(10);
  });
  it('range test 62: range(12, 32, 2) has 10 elements', () => {
    const r = range(12, 32, 2);
    expect(r.length).toBe(10);
  });
  it('range test 63: range(13, 33, 2) has 10 elements', () => {
    const r = range(13, 33, 2);
    expect(r.length).toBe(10);
  });
  it('range test 64: range(14, 34, 2) has 10 elements', () => {
    const r = range(14, 34, 2);
    expect(r.length).toBe(10);
  });
  it('range test 65: range(15, 35, 2) has 10 elements', () => {
    const r = range(15, 35, 2);
    expect(r.length).toBe(10);
  });
  it('range test 66: range(16, 36, 2) has 10 elements', () => {
    const r = range(16, 36, 2);
    expect(r.length).toBe(10);
  });
  it('range test 67: range(17, 37, 2) has 10 elements', () => {
    const r = range(17, 37, 2);
    expect(r.length).toBe(10);
  });
  it('range test 68: range(18, 38, 2) has 10 elements', () => {
    const r = range(18, 38, 2);
    expect(r.length).toBe(10);
  });
  it('range test 69: range(19, 39, 2) has 10 elements', () => {
    const r = range(19, 39, 2);
    expect(r.length).toBe(10);
  });
  it('range test 70: range(20, 40, 2) has 10 elements', () => {
    const r = range(20, 40, 2);
    expect(r.length).toBe(10);
  });
  it('range test 71: range(21, 41, 2) has 10 elements', () => {
    const r = range(21, 41, 2);
    expect(r.length).toBe(10);
  });
  it('range test 72: range(22, 42, 2) has 10 elements', () => {
    const r = range(22, 42, 2);
    expect(r.length).toBe(10);
  });
  it('range test 73: range(23, 43, 2) has 10 elements', () => {
    const r = range(23, 43, 2);
    expect(r.length).toBe(10);
  });
  it('range test 74: range(24, 44, 2) has 10 elements', () => {
    const r = range(24, 44, 2);
    expect(r.length).toBe(10);
  });
  it('range test 75: range(25, 45, 2) has 10 elements', () => {
    const r = range(25, 45, 2);
    expect(r.length).toBe(10);
  });
  it('range test 76: range(76, 86) first=76, last=85', () => {
    const r = range(76, 86);
    expect(r[0]).toBe(76);
    expect(r[r.length - 1]).toBe(85);
  });
  it('range test 77: range(77, 87) first=77, last=86', () => {
    const r = range(77, 87);
    expect(r[0]).toBe(77);
    expect(r[r.length - 1]).toBe(86);
  });
  it('range test 78: range(78, 88) first=78, last=87', () => {
    const r = range(78, 88);
    expect(r[0]).toBe(78);
    expect(r[r.length - 1]).toBe(87);
  });
  it('range test 79: range(79, 89) first=79, last=88', () => {
    const r = range(79, 89);
    expect(r[0]).toBe(79);
    expect(r[r.length - 1]).toBe(88);
  });
  it('range test 80: range(80, 90) first=80, last=89', () => {
    const r = range(80, 90);
    expect(r[0]).toBe(80);
    expect(r[r.length - 1]).toBe(89);
  });
  it('range test 81: range(81, 91) first=81, last=90', () => {
    const r = range(81, 91);
    expect(r[0]).toBe(81);
    expect(r[r.length - 1]).toBe(90);
  });
  it('range test 82: range(82, 92) first=82, last=91', () => {
    const r = range(82, 92);
    expect(r[0]).toBe(82);
    expect(r[r.length - 1]).toBe(91);
  });
  it('range test 83: range(83, 93) first=83, last=92', () => {
    const r = range(83, 93);
    expect(r[0]).toBe(83);
    expect(r[r.length - 1]).toBe(92);
  });
  it('range test 84: range(84, 94) first=84, last=93', () => {
    const r = range(84, 94);
    expect(r[0]).toBe(84);
    expect(r[r.length - 1]).toBe(93);
  });
  it('range test 85: range(85, 95) first=85, last=94', () => {
    const r = range(85, 95);
    expect(r[0]).toBe(85);
    expect(r[r.length - 1]).toBe(94);
  });
  it('range test 86: range(86, 96) first=86, last=95', () => {
    const r = range(86, 96);
    expect(r[0]).toBe(86);
    expect(r[r.length - 1]).toBe(95);
  });
  it('range test 87: range(87, 97) first=87, last=96', () => {
    const r = range(87, 97);
    expect(r[0]).toBe(87);
    expect(r[r.length - 1]).toBe(96);
  });
  it('range test 88: range(88, 98) first=88, last=97', () => {
    const r = range(88, 98);
    expect(r[0]).toBe(88);
    expect(r[r.length - 1]).toBe(97);
  });
  it('range test 89: range(89, 99) first=89, last=98', () => {
    const r = range(89, 99);
    expect(r[0]).toBe(89);
    expect(r[r.length - 1]).toBe(98);
  });
  it('range test 90: range(90, 100) first=90, last=99', () => {
    const r = range(90, 100);
    expect(r[0]).toBe(90);
    expect(r[r.length - 1]).toBe(99);
  });
  it('range test 91: range(91, 101) first=91, last=100', () => {
    const r = range(91, 101);
    expect(r[0]).toBe(91);
    expect(r[r.length - 1]).toBe(100);
  });
  it('range test 92: range(92, 102) first=92, last=101', () => {
    const r = range(92, 102);
    expect(r[0]).toBe(92);
    expect(r[r.length - 1]).toBe(101);
  });
  it('range test 93: range(93, 103) first=93, last=102', () => {
    const r = range(93, 103);
    expect(r[0]).toBe(93);
    expect(r[r.length - 1]).toBe(102);
  });
  it('range test 94: range(94, 104) first=94, last=103', () => {
    const r = range(94, 104);
    expect(r[0]).toBe(94);
    expect(r[r.length - 1]).toBe(103);
  });
  it('range test 95: range(95, 105) first=95, last=104', () => {
    const r = range(95, 105);
    expect(r[0]).toBe(95);
    expect(r[r.length - 1]).toBe(104);
  });
  it('range test 96: range(96, 106) first=96, last=105', () => {
    const r = range(96, 106);
    expect(r[0]).toBe(96);
    expect(r[r.length - 1]).toBe(105);
  });
  it('range test 97: range(97, 107) first=97, last=106', () => {
    const r = range(97, 107);
    expect(r[0]).toBe(97);
    expect(r[r.length - 1]).toBe(106);
  });
  it('range test 98: range(98, 108) first=98, last=107', () => {
    const r = range(98, 108);
    expect(r[0]).toBe(98);
    expect(r[r.length - 1]).toBe(107);
  });
  it('range test 99: range(99, 109) first=99, last=108', () => {
    const r = range(99, 109);
    expect(r[0]).toBe(99);
    expect(r[r.length - 1]).toBe(108);
  });
  it('range test 100: range(100, 110) first=100, last=109', () => {
    const r = range(100, 110);
    expect(r[0]).toBe(100);
    expect(r[r.length - 1]).toBe(109);
  });
});

describe('naturals', () => {
  it('naturals test 1: naturals(2).length === 2', () => {
    expect(naturals(2).length).toBe(2);
  });
  it('naturals test 2: naturals(3).length === 3', () => {
    expect(naturals(3).length).toBe(3);
  });
  it('naturals test 3: naturals(4).length === 4', () => {
    expect(naturals(4).length).toBe(4);
  });
  it('naturals test 4: naturals(5).length === 5', () => {
    expect(naturals(5).length).toBe(5);
  });
  it('naturals test 5: naturals(6).length === 6', () => {
    expect(naturals(6).length).toBe(6);
  });
  it('naturals test 6: naturals(7).length === 7', () => {
    expect(naturals(7).length).toBe(7);
  });
  it('naturals test 7: naturals(8).length === 8', () => {
    expect(naturals(8).length).toBe(8);
  });
  it('naturals test 8: naturals(9).length === 9', () => {
    expect(naturals(9).length).toBe(9);
  });
  it('naturals test 9: naturals(10).length === 10', () => {
    expect(naturals(10).length).toBe(10);
  });
  it('naturals test 10: naturals(11).length === 11', () => {
    expect(naturals(11).length).toBe(11);
  });
  it('naturals test 11: naturals(12).length === 12', () => {
    expect(naturals(12).length).toBe(12);
  });
  it('naturals test 12: naturals(13).length === 13', () => {
    expect(naturals(13).length).toBe(13);
  });
  it('naturals test 13: naturals(14).length === 14', () => {
    expect(naturals(14).length).toBe(14);
  });
  it('naturals test 14: naturals(15).length === 15', () => {
    expect(naturals(15).length).toBe(15);
  });
  it('naturals test 15: naturals(16).length === 16', () => {
    expect(naturals(16).length).toBe(16);
  });
  it('naturals test 16: naturals(17).length === 17', () => {
    expect(naturals(17).length).toBe(17);
  });
  it('naturals test 17: naturals(18).length === 18', () => {
    expect(naturals(18).length).toBe(18);
  });
  it('naturals test 18: naturals(19).length === 19', () => {
    expect(naturals(19).length).toBe(19);
  });
  it('naturals test 19: naturals(20).length === 20', () => {
    expect(naturals(20).length).toBe(20);
  });
  it('naturals test 20: naturals(21).length === 21', () => {
    expect(naturals(21).length).toBe(21);
  });
  it('naturals test 21: naturals(22).length === 22', () => {
    expect(naturals(22).length).toBe(22);
  });
  it('naturals test 22: naturals(23).length === 23', () => {
    expect(naturals(23).length).toBe(23);
  });
  it('naturals test 23: naturals(24).length === 24', () => {
    expect(naturals(24).length).toBe(24);
  });
  it('naturals test 24: naturals(25).length === 25', () => {
    expect(naturals(25).length).toBe(25);
  });
  it('naturals test 25: naturals(26).length === 26', () => {
    expect(naturals(26).length).toBe(26);
  });
  it('naturals test 26: naturals(27).length === 27', () => {
    expect(naturals(27).length).toBe(27);
  });
  it('naturals test 27: naturals(28).length === 28', () => {
    expect(naturals(28).length).toBe(28);
  });
  it('naturals test 28: naturals(29).length === 29', () => {
    expect(naturals(29).length).toBe(29);
  });
  it('naturals test 29: naturals(30).length === 30', () => {
    expect(naturals(30).length).toBe(30);
  });
  it('naturals test 30: naturals(31).length === 31', () => {
    expect(naturals(31).length).toBe(31);
  });
  it('naturals test 31: naturals(32).length === 32', () => {
    expect(naturals(32).length).toBe(32);
  });
  it('naturals test 32: naturals(33).length === 33', () => {
    expect(naturals(33).length).toBe(33);
  });
  it('naturals test 33: naturals(34).length === 34', () => {
    expect(naturals(34).length).toBe(34);
  });
  it('naturals test 34: naturals(35).length === 35', () => {
    expect(naturals(35).length).toBe(35);
  });
  it('naturals test 35: naturals(36).length === 36', () => {
    expect(naturals(36).length).toBe(36);
  });
  it('naturals test 36: naturals(37).length === 37', () => {
    expect(naturals(37).length).toBe(37);
  });
  it('naturals test 37: naturals(38).length === 38', () => {
    expect(naturals(38).length).toBe(38);
  });
  it('naturals test 38: naturals(39).length === 39', () => {
    expect(naturals(39).length).toBe(39);
  });
  it('naturals test 39: naturals(40).length === 40', () => {
    expect(naturals(40).length).toBe(40);
  });
  it('naturals test 40: naturals(41).length === 41', () => {
    expect(naturals(41).length).toBe(41);
  });
  it('naturals test 41: naturals(42).length === 42', () => {
    expect(naturals(42).length).toBe(42);
  });
  it('naturals test 42: naturals(43).length === 43', () => {
    expect(naturals(43).length).toBe(43);
  });
  it('naturals test 43: naturals(44).length === 44', () => {
    expect(naturals(44).length).toBe(44);
  });
  it('naturals test 44: naturals(45).length === 45', () => {
    expect(naturals(45).length).toBe(45);
  });
  it('naturals test 45: naturals(46).length === 46', () => {
    expect(naturals(46).length).toBe(46);
  });
  it('naturals test 46: naturals(47).length === 47', () => {
    expect(naturals(47).length).toBe(47);
  });
  it('naturals test 47: naturals(48).length === 48', () => {
    expect(naturals(48).length).toBe(48);
  });
  it('naturals test 48: naturals(49).length === 49', () => {
    expect(naturals(49).length).toBe(49);
  });
  it('naturals test 49: naturals(50).length === 50', () => {
    expect(naturals(50).length).toBe(50);
  });
  it('naturals test 50: naturals(51).length === 51', () => {
    expect(naturals(51).length).toBe(51);
  });
  it('naturals test 51: naturals(51)[50] === 50', () => {
    expect(naturals(51)[50]).toBe(50);
  });
  it('naturals test 52: naturals(52)[51] === 51', () => {
    expect(naturals(52)[51]).toBe(51);
  });
  it('naturals test 53: naturals(53)[52] === 52', () => {
    expect(naturals(53)[52]).toBe(52);
  });
  it('naturals test 54: naturals(54)[53] === 53', () => {
    expect(naturals(54)[53]).toBe(53);
  });
  it('naturals test 55: naturals(55)[54] === 54', () => {
    expect(naturals(55)[54]).toBe(54);
  });
  it('naturals test 56: naturals(56)[55] === 55', () => {
    expect(naturals(56)[55]).toBe(55);
  });
  it('naturals test 57: naturals(57)[56] === 56', () => {
    expect(naturals(57)[56]).toBe(56);
  });
  it('naturals test 58: naturals(58)[57] === 57', () => {
    expect(naturals(58)[57]).toBe(57);
  });
  it('naturals test 59: naturals(59)[58] === 58', () => {
    expect(naturals(59)[58]).toBe(58);
  });
  it('naturals test 60: naturals(60)[59] === 59', () => {
    expect(naturals(60)[59]).toBe(59);
  });
  it('naturals test 61: naturals(61)[60] === 60', () => {
    expect(naturals(61)[60]).toBe(60);
  });
  it('naturals test 62: naturals(62)[61] === 61', () => {
    expect(naturals(62)[61]).toBe(61);
  });
  it('naturals test 63: naturals(63)[62] === 62', () => {
    expect(naturals(63)[62]).toBe(62);
  });
  it('naturals test 64: naturals(64)[63] === 63', () => {
    expect(naturals(64)[63]).toBe(63);
  });
  it('naturals test 65: naturals(65)[64] === 64', () => {
    expect(naturals(65)[64]).toBe(64);
  });
  it('naturals test 66: naturals(66)[65] === 65', () => {
    expect(naturals(66)[65]).toBe(65);
  });
  it('naturals test 67: naturals(67)[66] === 66', () => {
    expect(naturals(67)[66]).toBe(66);
  });
  it('naturals test 68: naturals(68)[67] === 67', () => {
    expect(naturals(68)[67]).toBe(67);
  });
  it('naturals test 69: naturals(69)[68] === 68', () => {
    expect(naturals(69)[68]).toBe(68);
  });
  it('naturals test 70: naturals(70)[69] === 69', () => {
    expect(naturals(70)[69]).toBe(69);
  });
  it('naturals test 71: naturals(71)[70] === 70', () => {
    expect(naturals(71)[70]).toBe(70);
  });
  it('naturals test 72: naturals(72)[71] === 71', () => {
    expect(naturals(72)[71]).toBe(71);
  });
  it('naturals test 73: naturals(73)[72] === 72', () => {
    expect(naturals(73)[72]).toBe(72);
  });
  it('naturals test 74: naturals(74)[73] === 73', () => {
    expect(naturals(74)[73]).toBe(73);
  });
  it('naturals test 75: naturals(75)[74] === 74', () => {
    expect(naturals(75)[74]).toBe(74);
  });
  it('naturals test 76: naturals(76)[75] === 75', () => {
    expect(naturals(76)[75]).toBe(75);
  });
  it('naturals test 77: naturals(77)[76] === 76', () => {
    expect(naturals(77)[76]).toBe(76);
  });
  it('naturals test 78: naturals(78)[77] === 77', () => {
    expect(naturals(78)[77]).toBe(77);
  });
  it('naturals test 79: naturals(79)[78] === 78', () => {
    expect(naturals(79)[78]).toBe(78);
  });
  it('naturals test 80: naturals(80)[79] === 79', () => {
    expect(naturals(80)[79]).toBe(79);
  });
  it('naturals test 81: naturals(81)[80] === 80', () => {
    expect(naturals(81)[80]).toBe(80);
  });
  it('naturals test 82: naturals(82)[81] === 81', () => {
    expect(naturals(82)[81]).toBe(81);
  });
  it('naturals test 83: naturals(83)[82] === 82', () => {
    expect(naturals(83)[82]).toBe(82);
  });
  it('naturals test 84: naturals(84)[83] === 83', () => {
    expect(naturals(84)[83]).toBe(83);
  });
  it('naturals test 85: naturals(85)[84] === 84', () => {
    expect(naturals(85)[84]).toBe(84);
  });
  it('naturals test 86: naturals(86)[85] === 85', () => {
    expect(naturals(86)[85]).toBe(85);
  });
  it('naturals test 87: naturals(87)[86] === 86', () => {
    expect(naturals(87)[86]).toBe(86);
  });
  it('naturals test 88: naturals(88)[87] === 87', () => {
    expect(naturals(88)[87]).toBe(87);
  });
  it('naturals test 89: naturals(89)[88] === 88', () => {
    expect(naturals(89)[88]).toBe(88);
  });
  it('naturals test 90: naturals(90)[89] === 89', () => {
    expect(naturals(90)[89]).toBe(89);
  });
  it('naturals test 91: naturals(91)[90] === 90', () => {
    expect(naturals(91)[90]).toBe(90);
  });
  it('naturals test 92: naturals(92)[91] === 91', () => {
    expect(naturals(92)[91]).toBe(91);
  });
  it('naturals test 93: naturals(93)[92] === 92', () => {
    expect(naturals(93)[92]).toBe(92);
  });
  it('naturals test 94: naturals(94)[93] === 93', () => {
    expect(naturals(94)[93]).toBe(93);
  });
  it('naturals test 95: naturals(95)[94] === 94', () => {
    expect(naturals(95)[94]).toBe(94);
  });
  it('naturals test 96: naturals(96)[95] === 95', () => {
    expect(naturals(96)[95]).toBe(95);
  });
  it('naturals test 97: naturals(97)[96] === 96', () => {
    expect(naturals(97)[96]).toBe(96);
  });
  it('naturals test 98: naturals(98)[97] === 97', () => {
    expect(naturals(98)[97]).toBe(97);
  });
  it('naturals test 99: naturals(99)[98] === 98', () => {
    expect(naturals(99)[98]).toBe(98);
  });
  it('naturals test 100: naturals(100)[99] === 99', () => {
    expect(naturals(100)[99]).toBe(99);
  });
});

describe('fibonacci', () => {
  it('fibonacci test 1: fibonacci(2).length === 2', () => {
    expect(fibonacci(2).length).toBe(2);
  });
  it('fibonacci test 2: fibonacci(3).length === 3', () => {
    expect(fibonacci(3).length).toBe(3);
  });
  it('fibonacci test 3: fibonacci(4).length === 4', () => {
    expect(fibonacci(4).length).toBe(4);
  });
  it('fibonacci test 4: fibonacci(5).length === 5', () => {
    expect(fibonacci(5).length).toBe(5);
  });
  it('fibonacci test 5: fibonacci(6).length === 6', () => {
    expect(fibonacci(6).length).toBe(6);
  });
  it('fibonacci test 6: fibonacci(7).length === 7', () => {
    expect(fibonacci(7).length).toBe(7);
  });
  it('fibonacci test 7: fibonacci(8).length === 8', () => {
    expect(fibonacci(8).length).toBe(8);
  });
  it('fibonacci test 8: fibonacci(9).length === 9', () => {
    expect(fibonacci(9).length).toBe(9);
  });
  it('fibonacci test 9: fibonacci(10).length === 10', () => {
    expect(fibonacci(10).length).toBe(10);
  });
  it('fibonacci test 10: fibonacci(11).length === 11', () => {
    expect(fibonacci(11).length).toBe(11);
  });
  it('fibonacci test 11: fibonacci(12).length === 12', () => {
    expect(fibonacci(12).length).toBe(12);
  });
  it('fibonacci test 12: fibonacci(13).length === 13', () => {
    expect(fibonacci(13).length).toBe(13);
  });
  it('fibonacci test 13: fibonacci(14).length === 14', () => {
    expect(fibonacci(14).length).toBe(14);
  });
  it('fibonacci test 14: fibonacci(15).length === 15', () => {
    expect(fibonacci(15).length).toBe(15);
  });
  it('fibonacci test 15: fibonacci(16).length === 16', () => {
    expect(fibonacci(16).length).toBe(16);
  });
  it('fibonacci test 16: fibonacci(17).length === 17', () => {
    expect(fibonacci(17).length).toBe(17);
  });
  it('fibonacci test 17: fibonacci(18).length === 18', () => {
    expect(fibonacci(18).length).toBe(18);
  });
  it('fibonacci test 18: fibonacci(19).length === 19', () => {
    expect(fibonacci(19).length).toBe(19);
  });
  it('fibonacci test 19: fibonacci(20).length === 20', () => {
    expect(fibonacci(20).length).toBe(20);
  });
  it('fibonacci test 20: fibonacci(21).length === 21', () => {
    expect(fibonacci(21).length).toBe(21);
  });
  it('fibonacci test 21: fibonacci(22).length === 22', () => {
    expect(fibonacci(22).length).toBe(22);
  });
  it('fibonacci test 22: fibonacci(23).length === 23', () => {
    expect(fibonacci(23).length).toBe(23);
  });
  it('fibonacci test 23: fibonacci(24).length === 24', () => {
    expect(fibonacci(24).length).toBe(24);
  });
  it('fibonacci test 24: fibonacci(25).length === 25', () => {
    expect(fibonacci(25).length).toBe(25);
  });
  it('fibonacci test 25: fibonacci(26).length === 26', () => {
    expect(fibonacci(26).length).toBe(26);
  });
  it('fibonacci test 26: fibonacci(27).length === 27', () => {
    expect(fibonacci(27).length).toBe(27);
  });
  it('fibonacci test 27: fibonacci(28).length === 28', () => {
    expect(fibonacci(28).length).toBe(28);
  });
  it('fibonacci test 28: fibonacci(29).length === 29', () => {
    expect(fibonacci(29).length).toBe(29);
  });
  it('fibonacci test 29: fibonacci(30).length === 30', () => {
    expect(fibonacci(30).length).toBe(30);
  });
  it('fibonacci test 30: fibonacci(31).length === 31', () => {
    expect(fibonacci(31).length).toBe(31);
  });
  it('fibonacci test 31: fibonacci(32).length === 32', () => {
    expect(fibonacci(32).length).toBe(32);
  });
  it('fibonacci test 32: fibonacci(33).length === 33', () => {
    expect(fibonacci(33).length).toBe(33);
  });
  it('fibonacci test 33: fibonacci(34).length === 34', () => {
    expect(fibonacci(34).length).toBe(34);
  });
  it('fibonacci test 34: fibonacci(35).length === 35', () => {
    expect(fibonacci(35).length).toBe(35);
  });
  it('fibonacci test 35: fibonacci(36).length === 36', () => {
    expect(fibonacci(36).length).toBe(36);
  });
  it('fibonacci test 36: fibonacci(37).length === 37', () => {
    expect(fibonacci(37).length).toBe(37);
  });
  it('fibonacci test 37: fibonacci(38).length === 38', () => {
    expect(fibonacci(38).length).toBe(38);
  });
  it('fibonacci test 38: fibonacci(39).length === 39', () => {
    expect(fibonacci(39).length).toBe(39);
  });
  it('fibonacci test 39: fibonacci(40).length === 40', () => {
    expect(fibonacci(40).length).toBe(40);
  });
  it('fibonacci test 40: fibonacci(41).length === 41', () => {
    expect(fibonacci(41).length).toBe(41);
  });
  it('fibonacci test 41: fibonacci(42).length === 42', () => {
    expect(fibonacci(42).length).toBe(42);
  });
  it('fibonacci test 42: fibonacci(43).length === 43', () => {
    expect(fibonacci(43).length).toBe(43);
  });
  it('fibonacci test 43: fibonacci(44).length === 44', () => {
    expect(fibonacci(44).length).toBe(44);
  });
  it('fibonacci test 44: fibonacci(45).length === 45', () => {
    expect(fibonacci(45).length).toBe(45);
  });
  it('fibonacci test 45: fibonacci(46).length === 46', () => {
    expect(fibonacci(46).length).toBe(46);
  });
  it('fibonacci test 46: fibonacci(47).length === 47', () => {
    expect(fibonacci(47).length).toBe(47);
  });
  it('fibonacci test 47: fibonacci(48).length === 48', () => {
    expect(fibonacci(48).length).toBe(48);
  });
  it('fibonacci test 48: fibonacci(49).length === 49', () => {
    expect(fibonacci(49).length).toBe(49);
  });
  it('fibonacci test 49: fibonacci(50).length === 50', () => {
    expect(fibonacci(50).length).toBe(50);
  });
  it('fibonacci test 50: fibonacci(51).length === 51', () => {
    expect(fibonacci(51).length).toBe(51);
  });
  it('fibonacci test 51: fibonacci(51)[0] === 0', () => {
    expect(fibonacci(51)[0]).toBe(0);
  });
  it('fibonacci test 52: fibonacci(52)[0] === 0', () => {
    expect(fibonacci(52)[0]).toBe(0);
  });
  it('fibonacci test 53: fibonacci(53)[0] === 0', () => {
    expect(fibonacci(53)[0]).toBe(0);
  });
  it('fibonacci test 54: fibonacci(54)[0] === 0', () => {
    expect(fibonacci(54)[0]).toBe(0);
  });
  it('fibonacci test 55: fibonacci(55)[0] === 0', () => {
    expect(fibonacci(55)[0]).toBe(0);
  });
  it('fibonacci test 56: fibonacci(56)[0] === 0', () => {
    expect(fibonacci(56)[0]).toBe(0);
  });
  it('fibonacci test 57: fibonacci(57)[0] === 0', () => {
    expect(fibonacci(57)[0]).toBe(0);
  });
  it('fibonacci test 58: fibonacci(58)[0] === 0', () => {
    expect(fibonacci(58)[0]).toBe(0);
  });
  it('fibonacci test 59: fibonacci(59)[0] === 0', () => {
    expect(fibonacci(59)[0]).toBe(0);
  });
  it('fibonacci test 60: fibonacci(60)[0] === 0', () => {
    expect(fibonacci(60)[0]).toBe(0);
  });
  it('fibonacci test 61: fibonacci(61)[0] === 0', () => {
    expect(fibonacci(61)[0]).toBe(0);
  });
  it('fibonacci test 62: fibonacci(62)[0] === 0', () => {
    expect(fibonacci(62)[0]).toBe(0);
  });
  it('fibonacci test 63: fibonacci(63)[0] === 0', () => {
    expect(fibonacci(63)[0]).toBe(0);
  });
  it('fibonacci test 64: fibonacci(64)[0] === 0', () => {
    expect(fibonacci(64)[0]).toBe(0);
  });
  it('fibonacci test 65: fibonacci(65)[0] === 0', () => {
    expect(fibonacci(65)[0]).toBe(0);
  });
  it('fibonacci test 66: fibonacci(66)[0] === 0', () => {
    expect(fibonacci(66)[0]).toBe(0);
  });
  it('fibonacci test 67: fibonacci(67)[0] === 0', () => {
    expect(fibonacci(67)[0]).toBe(0);
  });
  it('fibonacci test 68: fibonacci(68)[0] === 0', () => {
    expect(fibonacci(68)[0]).toBe(0);
  });
  it('fibonacci test 69: fibonacci(69)[0] === 0', () => {
    expect(fibonacci(69)[0]).toBe(0);
  });
  it('fibonacci test 70: fibonacci(70)[0] === 0', () => {
    expect(fibonacci(70)[0]).toBe(0);
  });
  it('fibonacci test 71: fibonacci(71)[0] === 0', () => {
    expect(fibonacci(71)[0]).toBe(0);
  });
  it('fibonacci test 72: fibonacci(72)[0] === 0', () => {
    expect(fibonacci(72)[0]).toBe(0);
  });
  it('fibonacci test 73: fibonacci(73)[0] === 0', () => {
    expect(fibonacci(73)[0]).toBe(0);
  });
  it('fibonacci test 74: fibonacci(74)[0] === 0', () => {
    expect(fibonacci(74)[0]).toBe(0);
  });
  it('fibonacci test 75: fibonacci(75)[0] === 0', () => {
    expect(fibonacci(75)[0]).toBe(0);
  });
  it('fibonacci test 76: fibonacci(52)[1] === 1', () => {
    expect(fibonacci(52)[1]).toBe(1);
  });
  it('fibonacci test 77: fibonacci(53)[1] === 1', () => {
    expect(fibonacci(53)[1]).toBe(1);
  });
  it('fibonacci test 78: fibonacci(54)[1] === 1', () => {
    expect(fibonacci(54)[1]).toBe(1);
  });
  it('fibonacci test 79: fibonacci(55)[1] === 1', () => {
    expect(fibonacci(55)[1]).toBe(1);
  });
  it('fibonacci test 80: fibonacci(56)[1] === 1', () => {
    expect(fibonacci(56)[1]).toBe(1);
  });
  it('fibonacci test 81: fibonacci(57)[1] === 1', () => {
    expect(fibonacci(57)[1]).toBe(1);
  });
  it('fibonacci test 82: fibonacci(58)[1] === 1', () => {
    expect(fibonacci(58)[1]).toBe(1);
  });
  it('fibonacci test 83: fibonacci(59)[1] === 1', () => {
    expect(fibonacci(59)[1]).toBe(1);
  });
  it('fibonacci test 84: fibonacci(60)[1] === 1', () => {
    expect(fibonacci(60)[1]).toBe(1);
  });
  it('fibonacci test 85: fibonacci(61)[1] === 1', () => {
    expect(fibonacci(61)[1]).toBe(1);
  });
  it('fibonacci test 86: fibonacci(62)[1] === 1', () => {
    expect(fibonacci(62)[1]).toBe(1);
  });
  it('fibonacci test 87: fibonacci(63)[1] === 1', () => {
    expect(fibonacci(63)[1]).toBe(1);
  });
  it('fibonacci test 88: fibonacci(64)[1] === 1', () => {
    expect(fibonacci(64)[1]).toBe(1);
  });
  it('fibonacci test 89: fibonacci(65)[1] === 1', () => {
    expect(fibonacci(65)[1]).toBe(1);
  });
  it('fibonacci test 90: fibonacci(66)[1] === 1', () => {
    expect(fibonacci(66)[1]).toBe(1);
  });
  it('fibonacci test 91: fibonacci(67)[1] === 1', () => {
    expect(fibonacci(67)[1]).toBe(1);
  });
  it('fibonacci test 92: fibonacci(68)[1] === 1', () => {
    expect(fibonacci(68)[1]).toBe(1);
  });
  it('fibonacci test 93: fibonacci(69)[1] === 1', () => {
    expect(fibonacci(69)[1]).toBe(1);
  });
  it('fibonacci test 94: fibonacci(70)[1] === 1', () => {
    expect(fibonacci(70)[1]).toBe(1);
  });
  it('fibonacci test 95: fibonacci(71)[1] === 1', () => {
    expect(fibonacci(71)[1]).toBe(1);
  });
  it('fibonacci test 96: fibonacci(72)[1] === 1', () => {
    expect(fibonacci(72)[1]).toBe(1);
  });
  it('fibonacci test 97: fibonacci(73)[1] === 1', () => {
    expect(fibonacci(73)[1]).toBe(1);
  });
  it('fibonacci test 98: fibonacci(74)[1] === 1', () => {
    expect(fibonacci(74)[1]).toBe(1);
  });
  it('fibonacci test 99: fibonacci(75)[1] === 1', () => {
    expect(fibonacci(75)[1]).toBe(1);
  });
  it('fibonacci test 100: fibonacci(76)[1] === 1', () => {
    expect(fibonacci(76)[1]).toBe(1);
  });
});

describe('repeat', () => {
  it('repeat test 1: repeat(2, 3).length === 3', () => {
    expect(repeat(2, 3).length).toBe(3);
  });
  it('repeat test 2: repeat(4, 4).length === 4', () => {
    expect(repeat(4, 4).length).toBe(4);
  });
  it('repeat test 3: repeat(6, 5).length === 5', () => {
    expect(repeat(6, 5).length).toBe(5);
  });
  it('repeat test 4: repeat(8, 6).length === 6', () => {
    expect(repeat(8, 6).length).toBe(6);
  });
  it('repeat test 5: repeat(10, 7).length === 7', () => {
    expect(repeat(10, 7).length).toBe(7);
  });
  it('repeat test 6: repeat(12, 8).length === 8', () => {
    expect(repeat(12, 8).length).toBe(8);
  });
  it('repeat test 7: repeat(14, 9).length === 9', () => {
    expect(repeat(14, 9).length).toBe(9);
  });
  it('repeat test 8: repeat(16, 10).length === 10', () => {
    expect(repeat(16, 10).length).toBe(10);
  });
  it('repeat test 9: repeat(18, 11).length === 11', () => {
    expect(repeat(18, 11).length).toBe(11);
  });
  it('repeat test 10: repeat(20, 12).length === 12', () => {
    expect(repeat(20, 12).length).toBe(12);
  });
  it('repeat test 11: repeat(22, 13).length === 13', () => {
    expect(repeat(22, 13).length).toBe(13);
  });
  it('repeat test 12: repeat(24, 14).length === 14', () => {
    expect(repeat(24, 14).length).toBe(14);
  });
  it('repeat test 13: repeat(26, 15).length === 15', () => {
    expect(repeat(26, 15).length).toBe(15);
  });
  it('repeat test 14: repeat(28, 16).length === 16', () => {
    expect(repeat(28, 16).length).toBe(16);
  });
  it('repeat test 15: repeat(30, 17).length === 17', () => {
    expect(repeat(30, 17).length).toBe(17);
  });
  it('repeat test 16: repeat(32, 18).length === 18', () => {
    expect(repeat(32, 18).length).toBe(18);
  });
  it('repeat test 17: repeat(34, 19).length === 19', () => {
    expect(repeat(34, 19).length).toBe(19);
  });
  it('repeat test 18: repeat(36, 20).length === 20', () => {
    expect(repeat(36, 20).length).toBe(20);
  });
  it('repeat test 19: repeat(38, 21).length === 21', () => {
    expect(repeat(38, 21).length).toBe(21);
  });
  it('repeat test 20: repeat(40, 22).length === 22', () => {
    expect(repeat(40, 22).length).toBe(22);
  });
  it('repeat test 21: repeat(42, 23).length === 23', () => {
    expect(repeat(42, 23).length).toBe(23);
  });
  it('repeat test 22: repeat(44, 24).length === 24', () => {
    expect(repeat(44, 24).length).toBe(24);
  });
  it('repeat test 23: repeat(46, 25).length === 25', () => {
    expect(repeat(46, 25).length).toBe(25);
  });
  it('repeat test 24: repeat(48, 26).length === 26', () => {
    expect(repeat(48, 26).length).toBe(26);
  });
  it('repeat test 25: repeat(50, 27).length === 27', () => {
    expect(repeat(50, 27).length).toBe(27);
  });
  it('repeat test 26: repeat(52, 28).length === 28', () => {
    expect(repeat(52, 28).length).toBe(28);
  });
  it('repeat test 27: repeat(54, 29).length === 29', () => {
    expect(repeat(54, 29).length).toBe(29);
  });
  it('repeat test 28: repeat(56, 30).length === 30', () => {
    expect(repeat(56, 30).length).toBe(30);
  });
  it('repeat test 29: repeat(58, 31).length === 31', () => {
    expect(repeat(58, 31).length).toBe(31);
  });
  it('repeat test 30: repeat(60, 32).length === 32', () => {
    expect(repeat(60, 32).length).toBe(32);
  });
  it('repeat test 31: repeat(62, 33).length === 33', () => {
    expect(repeat(62, 33).length).toBe(33);
  });
  it('repeat test 32: repeat(64, 34).length === 34', () => {
    expect(repeat(64, 34).length).toBe(34);
  });
  it('repeat test 33: repeat(66, 35).length === 35', () => {
    expect(repeat(66, 35).length).toBe(35);
  });
  it('repeat test 34: repeat(68, 36).length === 36', () => {
    expect(repeat(68, 36).length).toBe(36);
  });
  it('repeat test 35: repeat(70, 37).length === 37', () => {
    expect(repeat(70, 37).length).toBe(37);
  });
  it('repeat test 36: repeat(72, 38).length === 38', () => {
    expect(repeat(72, 38).length).toBe(38);
  });
  it('repeat test 37: repeat(74, 39).length === 39', () => {
    expect(repeat(74, 39).length).toBe(39);
  });
  it('repeat test 38: repeat(76, 40).length === 40', () => {
    expect(repeat(76, 40).length).toBe(40);
  });
  it('repeat test 39: repeat(78, 41).length === 41', () => {
    expect(repeat(78, 41).length).toBe(41);
  });
  it('repeat test 40: repeat(80, 42).length === 42', () => {
    expect(repeat(80, 42).length).toBe(42);
  });
  it('repeat test 41: repeat(82, 43).length === 43', () => {
    expect(repeat(82, 43).length).toBe(43);
  });
  it('repeat test 42: repeat(84, 44).length === 44', () => {
    expect(repeat(84, 44).length).toBe(44);
  });
  it('repeat test 43: repeat(86, 45).length === 45', () => {
    expect(repeat(86, 45).length).toBe(45);
  });
  it('repeat test 44: repeat(88, 46).length === 46', () => {
    expect(repeat(88, 46).length).toBe(46);
  });
  it('repeat test 45: repeat(90, 47).length === 47', () => {
    expect(repeat(90, 47).length).toBe(47);
  });
  it('repeat test 46: repeat(92, 48).length === 48', () => {
    expect(repeat(92, 48).length).toBe(48);
  });
  it('repeat test 47: repeat(94, 49).length === 49', () => {
    expect(repeat(94, 49).length).toBe(49);
  });
  it('repeat test 48: repeat(96, 50).length === 50', () => {
    expect(repeat(96, 50).length).toBe(50);
  });
  it('repeat test 49: repeat(98, 51).length === 51', () => {
    expect(repeat(98, 51).length).toBe(51);
  });
  it('repeat test 50: repeat(100, 52).length === 52', () => {
    expect(repeat(100, 52).length).toBe(52);
  });
  it('repeat test 51: repeat(61, 11) all elements === 61', () => {
    const r = repeat(61, 11);
    expect(r.every(x => x === 61)).toBe(true);
  });
  it('repeat test 52: repeat(62, 12) all elements === 62', () => {
    const r = repeat(62, 12);
    expect(r.every(x => x === 62)).toBe(true);
  });
  it('repeat test 53: repeat(63, 13) all elements === 63', () => {
    const r = repeat(63, 13);
    expect(r.every(x => x === 63)).toBe(true);
  });
  it('repeat test 54: repeat(64, 14) all elements === 64', () => {
    const r = repeat(64, 14);
    expect(r.every(x => x === 64)).toBe(true);
  });
  it('repeat test 55: repeat(65, 15) all elements === 65', () => {
    const r = repeat(65, 15);
    expect(r.every(x => x === 65)).toBe(true);
  });
  it('repeat test 56: repeat(66, 16) all elements === 66', () => {
    const r = repeat(66, 16);
    expect(r.every(x => x === 66)).toBe(true);
  });
  it('repeat test 57: repeat(67, 17) all elements === 67', () => {
    const r = repeat(67, 17);
    expect(r.every(x => x === 67)).toBe(true);
  });
  it('repeat test 58: repeat(68, 18) all elements === 68', () => {
    const r = repeat(68, 18);
    expect(r.every(x => x === 68)).toBe(true);
  });
  it('repeat test 59: repeat(69, 19) all elements === 69', () => {
    const r = repeat(69, 19);
    expect(r.every(x => x === 69)).toBe(true);
  });
  it('repeat test 60: repeat(70, 20) all elements === 70', () => {
    const r = repeat(70, 20);
    expect(r.every(x => x === 70)).toBe(true);
  });
  it('repeat test 61: repeat(71, 21) all elements === 71', () => {
    const r = repeat(71, 21);
    expect(r.every(x => x === 71)).toBe(true);
  });
  it('repeat test 62: repeat(72, 22) all elements === 72', () => {
    const r = repeat(72, 22);
    expect(r.every(x => x === 72)).toBe(true);
  });
  it('repeat test 63: repeat(73, 23) all elements === 73', () => {
    const r = repeat(73, 23);
    expect(r.every(x => x === 73)).toBe(true);
  });
  it('repeat test 64: repeat(74, 24) all elements === 74', () => {
    const r = repeat(74, 24);
    expect(r.every(x => x === 74)).toBe(true);
  });
  it('repeat test 65: repeat(75, 25) all elements === 75', () => {
    const r = repeat(75, 25);
    expect(r.every(x => x === 75)).toBe(true);
  });
  it('repeat test 66: repeat(76, 26) all elements === 76', () => {
    const r = repeat(76, 26);
    expect(r.every(x => x === 76)).toBe(true);
  });
  it('repeat test 67: repeat(77, 27) all elements === 77', () => {
    const r = repeat(77, 27);
    expect(r.every(x => x === 77)).toBe(true);
  });
  it('repeat test 68: repeat(78, 28) all elements === 78', () => {
    const r = repeat(78, 28);
    expect(r.every(x => x === 78)).toBe(true);
  });
  it('repeat test 69: repeat(79, 29) all elements === 79', () => {
    const r = repeat(79, 29);
    expect(r.every(x => x === 79)).toBe(true);
  });
  it('repeat test 70: repeat(80, 30) all elements === 80', () => {
    const r = repeat(80, 30);
    expect(r.every(x => x === 80)).toBe(true);
  });
  it('repeat test 71: repeat(81, 31) all elements === 81', () => {
    const r = repeat(81, 31);
    expect(r.every(x => x === 81)).toBe(true);
  });
  it('repeat test 72: repeat(82, 32) all elements === 82', () => {
    const r = repeat(82, 32);
    expect(r.every(x => x === 82)).toBe(true);
  });
  it('repeat test 73: repeat(83, 33) all elements === 83', () => {
    const r = repeat(83, 33);
    expect(r.every(x => x === 83)).toBe(true);
  });
  it('repeat test 74: repeat(84, 34) all elements === 84', () => {
    const r = repeat(84, 34);
    expect(r.every(x => x === 84)).toBe(true);
  });
  it('repeat test 75: repeat(85, 35) all elements === 85', () => {
    const r = repeat(85, 35);
    expect(r.every(x => x === 85)).toBe(true);
  });
  it('repeat test 76: repeat(86, 36) all elements === 86', () => {
    const r = repeat(86, 36);
    expect(r.every(x => x === 86)).toBe(true);
  });
  it('repeat test 77: repeat(87, 37) all elements === 87', () => {
    const r = repeat(87, 37);
    expect(r.every(x => x === 87)).toBe(true);
  });
  it('repeat test 78: repeat(88, 38) all elements === 88', () => {
    const r = repeat(88, 38);
    expect(r.every(x => x === 88)).toBe(true);
  });
  it('repeat test 79: repeat(89, 39) all elements === 89', () => {
    const r = repeat(89, 39);
    expect(r.every(x => x === 89)).toBe(true);
  });
  it('repeat test 80: repeat(90, 40) all elements === 90', () => {
    const r = repeat(90, 40);
    expect(r.every(x => x === 90)).toBe(true);
  });
  it('repeat test 81: repeat(91, 41) all elements === 91', () => {
    const r = repeat(91, 41);
    expect(r.every(x => x === 91)).toBe(true);
  });
  it('repeat test 82: repeat(92, 42) all elements === 92', () => {
    const r = repeat(92, 42);
    expect(r.every(x => x === 92)).toBe(true);
  });
  it('repeat test 83: repeat(93, 43) all elements === 93', () => {
    const r = repeat(93, 43);
    expect(r.every(x => x === 93)).toBe(true);
  });
  it('repeat test 84: repeat(94, 44) all elements === 94', () => {
    const r = repeat(94, 44);
    expect(r.every(x => x === 94)).toBe(true);
  });
  it('repeat test 85: repeat(95, 45) all elements === 95', () => {
    const r = repeat(95, 45);
    expect(r.every(x => x === 95)).toBe(true);
  });
  it('repeat test 86: repeat(96, 46) all elements === 96', () => {
    const r = repeat(96, 46);
    expect(r.every(x => x === 96)).toBe(true);
  });
  it('repeat test 87: repeat(97, 47) all elements === 97', () => {
    const r = repeat(97, 47);
    expect(r.every(x => x === 97)).toBe(true);
  });
  it('repeat test 88: repeat(98, 48) all elements === 98', () => {
    const r = repeat(98, 48);
    expect(r.every(x => x === 98)).toBe(true);
  });
  it('repeat test 89: repeat(99, 49) all elements === 99', () => {
    const r = repeat(99, 49);
    expect(r.every(x => x === 99)).toBe(true);
  });
  it('repeat test 90: repeat(100, 50) all elements === 100', () => {
    const r = repeat(100, 50);
    expect(r.every(x => x === 100)).toBe(true);
  });
  it('repeat test 91: repeat(101, 51) all elements === 101', () => {
    const r = repeat(101, 51);
    expect(r.every(x => x === 101)).toBe(true);
  });
  it('repeat test 92: repeat(102, 52) all elements === 102', () => {
    const r = repeat(102, 52);
    expect(r.every(x => x === 102)).toBe(true);
  });
  it('repeat test 93: repeat(103, 53) all elements === 103', () => {
    const r = repeat(103, 53);
    expect(r.every(x => x === 103)).toBe(true);
  });
  it('repeat test 94: repeat(104, 54) all elements === 104', () => {
    const r = repeat(104, 54);
    expect(r.every(x => x === 104)).toBe(true);
  });
  it('repeat test 95: repeat(105, 55) all elements === 105', () => {
    const r = repeat(105, 55);
    expect(r.every(x => x === 105)).toBe(true);
  });
  it('repeat test 96: repeat(106, 56) all elements === 106', () => {
    const r = repeat(106, 56);
    expect(r.every(x => x === 106)).toBe(true);
  });
  it('repeat test 97: repeat(107, 57) all elements === 107', () => {
    const r = repeat(107, 57);
    expect(r.every(x => x === 107)).toBe(true);
  });
  it('repeat test 98: repeat(108, 58) all elements === 108', () => {
    const r = repeat(108, 58);
    expect(r.every(x => x === 108)).toBe(true);
  });
  it('repeat test 99: repeat(109, 59) all elements === 109', () => {
    const r = repeat(109, 59);
    expect(r.every(x => x === 109)).toBe(true);
  });
  it('repeat test 100: repeat(110, 60) all elements === 110', () => {
    const r = repeat(110, 60);
    expect(r.every(x => x === 110)).toBe(true);
  });
});

describe('cycle', () => {
  it('cycle test 1: cycle([1,2,3], 4).length === 4', () => {
    expect(cycle([1, 2, 3], 4).length).toBe(4);
  });
  it('cycle test 2: cycle([1,2,3], 5).length === 5', () => {
    expect(cycle([1, 2, 3], 5).length).toBe(5);
  });
  it('cycle test 3: cycle([1,2,3], 6).length === 6', () => {
    expect(cycle([1, 2, 3], 6).length).toBe(6);
  });
  it('cycle test 4: cycle([1,2,3], 7).length === 7', () => {
    expect(cycle([1, 2, 3], 7).length).toBe(7);
  });
  it('cycle test 5: cycle([1,2,3], 8).length === 8', () => {
    expect(cycle([1, 2, 3], 8).length).toBe(8);
  });
  it('cycle test 6: cycle([1,2,3], 9).length === 9', () => {
    expect(cycle([1, 2, 3], 9).length).toBe(9);
  });
  it('cycle test 7: cycle([1,2,3], 10).length === 10', () => {
    expect(cycle([1, 2, 3], 10).length).toBe(10);
  });
  it('cycle test 8: cycle([1,2,3], 11).length === 11', () => {
    expect(cycle([1, 2, 3], 11).length).toBe(11);
  });
  it('cycle test 9: cycle([1,2,3], 12).length === 12', () => {
    expect(cycle([1, 2, 3], 12).length).toBe(12);
  });
  it('cycle test 10: cycle([1,2,3], 13).length === 13', () => {
    expect(cycle([1, 2, 3], 13).length).toBe(13);
  });
  it('cycle test 11: cycle([1,2,3], 14).length === 14', () => {
    expect(cycle([1, 2, 3], 14).length).toBe(14);
  });
  it('cycle test 12: cycle([1,2,3], 15).length === 15', () => {
    expect(cycle([1, 2, 3], 15).length).toBe(15);
  });
  it('cycle test 13: cycle([1,2,3], 16).length === 16', () => {
    expect(cycle([1, 2, 3], 16).length).toBe(16);
  });
  it('cycle test 14: cycle([1,2,3], 17).length === 17', () => {
    expect(cycle([1, 2, 3], 17).length).toBe(17);
  });
  it('cycle test 15: cycle([1,2,3], 18).length === 18', () => {
    expect(cycle([1, 2, 3], 18).length).toBe(18);
  });
  it('cycle test 16: cycle([1,2,3], 19).length === 19', () => {
    expect(cycle([1, 2, 3], 19).length).toBe(19);
  });
  it('cycle test 17: cycle([1,2,3], 20).length === 20', () => {
    expect(cycle([1, 2, 3], 20).length).toBe(20);
  });
  it('cycle test 18: cycle([1,2,3], 21).length === 21', () => {
    expect(cycle([1, 2, 3], 21).length).toBe(21);
  });
  it('cycle test 19: cycle([1,2,3], 22).length === 22', () => {
    expect(cycle([1, 2, 3], 22).length).toBe(22);
  });
  it('cycle test 20: cycle([1,2,3], 23).length === 23', () => {
    expect(cycle([1, 2, 3], 23).length).toBe(23);
  });
  it('cycle test 21: cycle([1,2,3], 24).length === 24', () => {
    expect(cycle([1, 2, 3], 24).length).toBe(24);
  });
  it('cycle test 22: cycle([1,2,3], 25).length === 25', () => {
    expect(cycle([1, 2, 3], 25).length).toBe(25);
  });
  it('cycle test 23: cycle([1,2,3], 26).length === 26', () => {
    expect(cycle([1, 2, 3], 26).length).toBe(26);
  });
  it('cycle test 24: cycle([1,2,3], 27).length === 27', () => {
    expect(cycle([1, 2, 3], 27).length).toBe(27);
  });
  it('cycle test 25: cycle([1,2,3], 28).length === 28', () => {
    expect(cycle([1, 2, 3], 28).length).toBe(28);
  });
  it('cycle test 26: cycle([1,2,3], 29).length === 29', () => {
    expect(cycle([1, 2, 3], 29).length).toBe(29);
  });
  it('cycle test 27: cycle([1,2,3], 30).length === 30', () => {
    expect(cycle([1, 2, 3], 30).length).toBe(30);
  });
  it('cycle test 28: cycle([1,2,3], 31).length === 31', () => {
    expect(cycle([1, 2, 3], 31).length).toBe(31);
  });
  it('cycle test 29: cycle([1,2,3], 32).length === 32', () => {
    expect(cycle([1, 2, 3], 32).length).toBe(32);
  });
  it('cycle test 30: cycle([1,2,3], 33).length === 33', () => {
    expect(cycle([1, 2, 3], 33).length).toBe(33);
  });
  it('cycle test 31: cycle([1,2,3], 34).length === 34', () => {
    expect(cycle([1, 2, 3], 34).length).toBe(34);
  });
  it('cycle test 32: cycle([1,2,3], 35).length === 35', () => {
    expect(cycle([1, 2, 3], 35).length).toBe(35);
  });
  it('cycle test 33: cycle([1,2,3], 36).length === 36', () => {
    expect(cycle([1, 2, 3], 36).length).toBe(36);
  });
  it('cycle test 34: cycle([1,2,3], 37).length === 37', () => {
    expect(cycle([1, 2, 3], 37).length).toBe(37);
  });
  it('cycle test 35: cycle([1,2,3], 38).length === 38', () => {
    expect(cycle([1, 2, 3], 38).length).toBe(38);
  });
  it('cycle test 36: cycle([1,2,3], 39).length === 39', () => {
    expect(cycle([1, 2, 3], 39).length).toBe(39);
  });
  it('cycle test 37: cycle([1,2,3], 40).length === 40', () => {
    expect(cycle([1, 2, 3], 40).length).toBe(40);
  });
  it('cycle test 38: cycle([1,2,3], 41).length === 41', () => {
    expect(cycle([1, 2, 3], 41).length).toBe(41);
  });
  it('cycle test 39: cycle([1,2,3], 42).length === 42', () => {
    expect(cycle([1, 2, 3], 42).length).toBe(42);
  });
  it('cycle test 40: cycle([1,2,3], 43).length === 43', () => {
    expect(cycle([1, 2, 3], 43).length).toBe(43);
  });
  it('cycle test 41: cycle([1,2,3], 44).length === 44', () => {
    expect(cycle([1, 2, 3], 44).length).toBe(44);
  });
  it('cycle test 42: cycle([1,2,3], 45).length === 45', () => {
    expect(cycle([1, 2, 3], 45).length).toBe(45);
  });
  it('cycle test 43: cycle([1,2,3], 46).length === 46', () => {
    expect(cycle([1, 2, 3], 46).length).toBe(46);
  });
  it('cycle test 44: cycle([1,2,3], 47).length === 47', () => {
    expect(cycle([1, 2, 3], 47).length).toBe(47);
  });
  it('cycle test 45: cycle([1,2,3], 48).length === 48', () => {
    expect(cycle([1, 2, 3], 48).length).toBe(48);
  });
  it('cycle test 46: cycle([1,2,3], 49).length === 49', () => {
    expect(cycle([1, 2, 3], 49).length).toBe(49);
  });
  it('cycle test 47: cycle([1,2,3], 50).length === 50', () => {
    expect(cycle([1, 2, 3], 50).length).toBe(50);
  });
  it('cycle test 48: cycle([1,2,3], 51).length === 51', () => {
    expect(cycle([1, 2, 3], 51).length).toBe(51);
  });
  it('cycle test 49: cycle([1,2,3], 52).length === 52', () => {
    expect(cycle([1, 2, 3], 52).length).toBe(52);
  });
  it('cycle test 50: cycle([1,2,3], 53).length === 53', () => {
    expect(cycle([1, 2, 3], 53).length).toBe(53);
  });
  it('cycle test 51: cycle([1,2], 11) correct values', () => {
    expect(cycle([1, 2], 11)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 52: cycle([1,2], 12) correct values', () => {
    expect(cycle([1, 2], 12)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 53: cycle([1,2], 13) correct values', () => {
    expect(cycle([1, 2], 13)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 54: cycle([1,2], 14) correct values', () => {
    expect(cycle([1, 2], 14)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 55: cycle([1,2], 15) correct values', () => {
    expect(cycle([1, 2], 15)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 56: cycle([1,2], 16) correct values', () => {
    expect(cycle([1, 2], 16)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 57: cycle([1,2], 17) correct values', () => {
    expect(cycle([1, 2], 17)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 58: cycle([1,2], 18) correct values', () => {
    expect(cycle([1, 2], 18)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 59: cycle([1,2], 19) correct values', () => {
    expect(cycle([1, 2], 19)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 60: cycle([1,2], 20) correct values', () => {
    expect(cycle([1, 2], 20)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 61: cycle([1,2], 21) correct values', () => {
    expect(cycle([1, 2], 21)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 62: cycle([1,2], 22) correct values', () => {
    expect(cycle([1, 2], 22)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 63: cycle([1,2], 23) correct values', () => {
    expect(cycle([1, 2], 23)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 64: cycle([1,2], 24) correct values', () => {
    expect(cycle([1, 2], 24)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 65: cycle([1,2], 25) correct values', () => {
    expect(cycle([1, 2], 25)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 66: cycle([1,2], 26) correct values', () => {
    expect(cycle([1, 2], 26)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 67: cycle([1,2], 27) correct values', () => {
    expect(cycle([1, 2], 27)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 68: cycle([1,2], 28) correct values', () => {
    expect(cycle([1, 2], 28)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 69: cycle([1,2], 29) correct values', () => {
    expect(cycle([1, 2], 29)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 70: cycle([1,2], 30) correct values', () => {
    expect(cycle([1, 2], 30)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 71: cycle([1,2], 31) correct values', () => {
    expect(cycle([1, 2], 31)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 72: cycle([1,2], 32) correct values', () => {
    expect(cycle([1, 2], 32)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 73: cycle([1,2], 33) correct values', () => {
    expect(cycle([1, 2], 33)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 74: cycle([1,2], 34) correct values', () => {
    expect(cycle([1, 2], 34)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 75: cycle([1,2], 35) correct values', () => {
    expect(cycle([1, 2], 35)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 76: cycle([1,2], 36) correct values', () => {
    expect(cycle([1, 2], 36)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 77: cycle([1,2], 37) correct values', () => {
    expect(cycle([1, 2], 37)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 78: cycle([1,2], 38) correct values', () => {
    expect(cycle([1, 2], 38)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 79: cycle([1,2], 39) correct values', () => {
    expect(cycle([1, 2], 39)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 80: cycle([1,2], 40) correct values', () => {
    expect(cycle([1, 2], 40)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 81: cycle([1,2], 41) correct values', () => {
    expect(cycle([1, 2], 41)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 82: cycle([1,2], 42) correct values', () => {
    expect(cycle([1, 2], 42)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 83: cycle([1,2], 43) correct values', () => {
    expect(cycle([1, 2], 43)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 84: cycle([1,2], 44) correct values', () => {
    expect(cycle([1, 2], 44)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 85: cycle([1,2], 45) correct values', () => {
    expect(cycle([1, 2], 45)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 86: cycle([1,2], 46) correct values', () => {
    expect(cycle([1, 2], 46)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 87: cycle([1,2], 47) correct values', () => {
    expect(cycle([1, 2], 47)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 88: cycle([1,2], 48) correct values', () => {
    expect(cycle([1, 2], 48)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 89: cycle([1,2], 49) correct values', () => {
    expect(cycle([1, 2], 49)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 90: cycle([1,2], 50) correct values', () => {
    expect(cycle([1, 2], 50)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 91: cycle([1,2], 51) correct values', () => {
    expect(cycle([1, 2], 51)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 92: cycle([1,2], 52) correct values', () => {
    expect(cycle([1, 2], 52)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 93: cycle([1,2], 53) correct values', () => {
    expect(cycle([1, 2], 53)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 94: cycle([1,2], 54) correct values', () => {
    expect(cycle([1, 2], 54)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 95: cycle([1,2], 55) correct values', () => {
    expect(cycle([1, 2], 55)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 96: cycle([1,2], 56) correct values', () => {
    expect(cycle([1, 2], 56)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 97: cycle([1,2], 57) correct values', () => {
    expect(cycle([1, 2], 57)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 98: cycle([1,2], 58) correct values', () => {
    expect(cycle([1, 2], 58)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
  it('cycle test 99: cycle([1,2], 59) correct values', () => {
    expect(cycle([1, 2], 59)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
  });
  it('cycle test 100: cycle([1,2], 60) correct values', () => {
    expect(cycle([1, 2], 60)).toEqual([1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]);
  });
});

describe('flatten', () => {
  it('flatten test 1: flat array of length 2', () => {
    const result = flatten([0, 1]);
    expect(result.length).toBe(2);
    expect(result[0]).toBe(0);
  });
  it('flatten test 2: flat array of length 3', () => {
    const result = flatten([0, 1, 2]);
    expect(result.length).toBe(3);
    expect(result[0]).toBe(0);
  });
  it('flatten test 3: flat array of length 4', () => {
    const result = flatten([0, 1, 2, 3]);
    expect(result.length).toBe(4);
    expect(result[0]).toBe(0);
  });
  it('flatten test 4: flat array of length 5', () => {
    const result = flatten([0, 1, 2, 3, 4]);
    expect(result.length).toBe(5);
    expect(result[0]).toBe(0);
  });
  it('flatten test 5: flat array of length 6', () => {
    const result = flatten([0, 1, 2, 3, 4, 5]);
    expect(result.length).toBe(6);
    expect(result[0]).toBe(0);
  });
  it('flatten test 6: flat array of length 7', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6]);
    expect(result.length).toBe(7);
    expect(result[0]).toBe(0);
  });
  it('flatten test 7: flat array of length 8', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(result.length).toBe(8);
    expect(result[0]).toBe(0);
  });
  it('flatten test 8: flat array of length 9', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(result.length).toBe(9);
    expect(result[0]).toBe(0);
  });
  it('flatten test 9: flat array of length 10', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(result.length).toBe(10);
    expect(result[0]).toBe(0);
  });
  it('flatten test 10: flat array of length 11', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.length).toBe(11);
    expect(result[0]).toBe(0);
  });
  it('flatten test 11: flat array of length 12', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(result.length).toBe(12);
    expect(result[0]).toBe(0);
  });
  it('flatten test 12: flat array of length 13', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(result.length).toBe(13);
    expect(result[0]).toBe(0);
  });
  it('flatten test 13: flat array of length 14', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    expect(result.length).toBe(14);
    expect(result[0]).toBe(0);
  });
  it('flatten test 14: flat array of length 15', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    expect(result.length).toBe(15);
    expect(result[0]).toBe(0);
  });
  it('flatten test 15: flat array of length 16', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(result.length).toBe(16);
    expect(result[0]).toBe(0);
  });
  it('flatten test 16: flat array of length 17', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    expect(result.length).toBe(17);
    expect(result[0]).toBe(0);
  });
  it('flatten test 17: flat array of length 18', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
    expect(result.length).toBe(18);
    expect(result[0]).toBe(0);
  });
  it('flatten test 18: flat array of length 19', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
    expect(result.length).toBe(19);
    expect(result[0]).toBe(0);
  });
  it('flatten test 19: flat array of length 20', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    expect(result.length).toBe(20);
    expect(result[0]).toBe(0);
  });
  it('flatten test 20: flat array of length 21', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(result.length).toBe(21);
    expect(result[0]).toBe(0);
  });
  it('flatten test 21: flat array of length 22', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]);
    expect(result.length).toBe(22);
    expect(result[0]).toBe(0);
  });
  it('flatten test 22: flat array of length 23', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]);
    expect(result.length).toBe(23);
    expect(result[0]).toBe(0);
  });
  it('flatten test 23: flat array of length 24', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
    expect(result.length).toBe(24);
    expect(result[0]).toBe(0);
  });
  it('flatten test 24: flat array of length 25', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
    expect(result.length).toBe(25);
    expect(result[0]).toBe(0);
  });
  it('flatten test 25: flat array of length 26', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]);
    expect(result.length).toBe(26);
    expect(result[0]).toBe(0);
  });
  it('flatten test 26: flat array of length 27', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]);
    expect(result.length).toBe(27);
    expect(result[0]).toBe(0);
  });
  it('flatten test 27: flat array of length 28', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]);
    expect(result.length).toBe(28);
    expect(result[0]).toBe(0);
  });
  it('flatten test 28: flat array of length 29', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]);
    expect(result.length).toBe(29);
    expect(result[0]).toBe(0);
  });
  it('flatten test 29: flat array of length 30', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]);
    expect(result.length).toBe(30);
    expect(result[0]).toBe(0);
  });
  it('flatten test 30: flat array of length 31', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
    expect(result.length).toBe(31);
    expect(result[0]).toBe(0);
  });
  it('flatten test 31: flat array of length 32', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]);
    expect(result.length).toBe(32);
    expect(result[0]).toBe(0);
  });
  it('flatten test 32: flat array of length 33', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]);
    expect(result.length).toBe(33);
    expect(result[0]).toBe(0);
  });
  it('flatten test 33: flat array of length 34', () => {
    const result = flatten([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33]);
    expect(result.length).toBe(34);
    expect(result[0]).toBe(0);
  });
  it('flatten test 34: nested pairs total length 2', () => {
    const result = flatten([[0, 1]]);
    expect(result.length).toBe(2);
  });
  it('flatten test 35: nested pairs total length 4', () => {
    const result = flatten([[0, 1], [2, 3]]);
    expect(result.length).toBe(4);
  });
  it('flatten test 36: nested pairs total length 6', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5]]);
    expect(result.length).toBe(6);
  });
  it('flatten test 37: nested pairs total length 8', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7]]);
    expect(result.length).toBe(8);
  });
  it('flatten test 38: nested pairs total length 10', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]]);
    expect(result.length).toBe(10);
  });
  it('flatten test 39: nested pairs total length 12', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11]]);
    expect(result.length).toBe(12);
  });
  it('flatten test 40: nested pairs total length 14', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13]]);
    expect(result.length).toBe(14);
  });
  it('flatten test 41: nested pairs total length 16', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15]]);
    expect(result.length).toBe(16);
  });
  it('flatten test 42: nested pairs total length 18', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17]]);
    expect(result.length).toBe(18);
  });
  it('flatten test 43: nested pairs total length 20', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19]]);
    expect(result.length).toBe(20);
  });
  it('flatten test 44: nested pairs total length 22', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21]]);
    expect(result.length).toBe(22);
  });
  it('flatten test 45: nested pairs total length 24', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23]]);
    expect(result.length).toBe(24);
  });
  it('flatten test 46: nested pairs total length 26', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25]]);
    expect(result.length).toBe(26);
  });
  it('flatten test 47: nested pairs total length 28', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27]]);
    expect(result.length).toBe(28);
  });
  it('flatten test 48: nested pairs total length 30', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29]]);
    expect(result.length).toBe(30);
  });
  it('flatten test 49: nested pairs total length 32', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31]]);
    expect(result.length).toBe(32);
  });
  it('flatten test 50: nested pairs total length 34', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31], [32, 33]]);
    expect(result.length).toBe(34);
  });
  it('flatten test 51: nested pairs total length 36', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31], [32, 33], [34, 35]]);
    expect(result.length).toBe(36);
  });
  it('flatten test 52: nested pairs total length 38', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31], [32, 33], [34, 35], [36, 37]]);
    expect(result.length).toBe(38);
  });
  it('flatten test 53: nested pairs total length 40', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31], [32, 33], [34, 35], [36, 37], [38, 39]]);
    expect(result.length).toBe(40);
  });
  it('flatten test 54: nested pairs total length 42', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41]]);
    expect(result.length).toBe(42);
  });
  it('flatten test 55: nested pairs total length 44', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43]]);
    expect(result.length).toBe(44);
  });
  it('flatten test 56: nested pairs total length 46', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43], [44, 45]]);
    expect(result.length).toBe(46);
  });
  it('flatten test 57: nested pairs total length 48', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43], [44, 45], [46, 47]]);
    expect(result.length).toBe(48);
  });
  it('flatten test 58: nested pairs total length 50', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43], [44, 45], [46, 47], [48, 49]]);
    expect(result.length).toBe(50);
  });
  it('flatten test 59: nested pairs total length 52', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43], [44, 45], [46, 47], [48, 49], [50, 51]]);
    expect(result.length).toBe(52);
  });
  it('flatten test 60: nested pairs total length 54', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43], [44, 45], [46, 47], [48, 49], [50, 51], [52, 53]]);
    expect(result.length).toBe(54);
  });
  it('flatten test 61: nested pairs total length 56', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43], [44, 45], [46, 47], [48, 49], [50, 51], [52, 53], [54, 55]]);
    expect(result.length).toBe(56);
  });
  it('flatten test 62: nested pairs total length 58', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43], [44, 45], [46, 47], [48, 49], [50, 51], [52, 53], [54, 55], [56, 57]]);
    expect(result.length).toBe(58);
  });
  it('flatten test 63: nested pairs total length 60', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43], [44, 45], [46, 47], [48, 49], [50, 51], [52, 53], [54, 55], [56, 57], [58, 59]]);
    expect(result.length).toBe(60);
  });
  it('flatten test 64: nested pairs total length 62', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43], [44, 45], [46, 47], [48, 49], [50, 51], [52, 53], [54, 55], [56, 57], [58, 59], [60, 61]]);
    expect(result.length).toBe(62);
  });
  it('flatten test 65: nested pairs total length 64', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43], [44, 45], [46, 47], [48, 49], [50, 51], [52, 53], [54, 55], [56, 57], [58, 59], [60, 61], [62, 63]]);
    expect(result.length).toBe(64);
  });
  it('flatten test 66: nested pairs total length 66', () => {
    const result = flatten([[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43], [44, 45], [46, 47], [48, 49], [50, 51], [52, 53], [54, 55], [56, 57], [58, 59], [60, 61], [62, 63], [64, 65]]);
    expect(result.length).toBe(66);
  });
  it('flatten test 67: mixed flat+nested (n=1)', () => {
    const result = flatten([99, [0], 100]);
    expect(result.length).toBe(3);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 68: mixed flat+nested (n=2)', () => {
    const result = flatten([99, [0, 1], 100]);
    expect(result.length).toBe(4);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 69: mixed flat+nested (n=3)', () => {
    const result = flatten([99, [0, 1, 2], 100]);
    expect(result.length).toBe(5);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 70: mixed flat+nested (n=4)', () => {
    const result = flatten([99, [0, 1, 2, 3], 100]);
    expect(result.length).toBe(6);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 71: mixed flat+nested (n=5)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4], 100]);
    expect(result.length).toBe(7);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 72: mixed flat+nested (n=6)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5], 100]);
    expect(result.length).toBe(8);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 73: mixed flat+nested (n=7)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6], 100]);
    expect(result.length).toBe(9);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 74: mixed flat+nested (n=8)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7], 100]);
    expect(result.length).toBe(10);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 75: mixed flat+nested (n=9)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8], 100]);
    expect(result.length).toBe(11);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 76: mixed flat+nested (n=10)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 100]);
    expect(result.length).toBe(12);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 77: mixed flat+nested (n=11)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 100]);
    expect(result.length).toBe(13);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 78: mixed flat+nested (n=12)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 100]);
    expect(result.length).toBe(14);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 79: mixed flat+nested (n=13)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 100]);
    expect(result.length).toBe(15);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 80: mixed flat+nested (n=14)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 100]);
    expect(result.length).toBe(16);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 81: mixed flat+nested (n=15)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 100]);
    expect(result.length).toBe(17);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 82: mixed flat+nested (n=16)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 100]);
    expect(result.length).toBe(18);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 83: mixed flat+nested (n=17)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], 100]);
    expect(result.length).toBe(19);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 84: mixed flat+nested (n=18)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], 100]);
    expect(result.length).toBe(20);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 85: mixed flat+nested (n=19)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], 100]);
    expect(result.length).toBe(21);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 86: mixed flat+nested (n=20)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 100]);
    expect(result.length).toBe(22);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 87: mixed flat+nested (n=21)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 100]);
    expect(result.length).toBe(23);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 88: mixed flat+nested (n=22)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], 100]);
    expect(result.length).toBe(24);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 89: mixed flat+nested (n=23)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], 100]);
    expect(result.length).toBe(25);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 90: mixed flat+nested (n=24)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], 100]);
    expect(result.length).toBe(26);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 91: mixed flat+nested (n=25)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], 100]);
    expect(result.length).toBe(27);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 92: mixed flat+nested (n=26)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], 100]);
    expect(result.length).toBe(28);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 93: mixed flat+nested (n=27)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], 100]);
    expect(result.length).toBe(29);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 94: mixed flat+nested (n=28)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27], 100]);
    expect(result.length).toBe(30);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 95: mixed flat+nested (n=29)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28], 100]);
    expect(result.length).toBe(31);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 96: mixed flat+nested (n=30)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 100]);
    expect(result.length).toBe(32);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 97: mixed flat+nested (n=31)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30], 100]);
    expect(result.length).toBe(33);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 98: mixed flat+nested (n=32)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31], 100]);
    expect(result.length).toBe(34);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 99: mixed flat+nested (n=33)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32], 100]);
    expect(result.length).toBe(35);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
  it('flatten test 100: mixed flat+nested (n=34)', () => {
    const result = flatten([99, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33], 100]);
    expect(result.length).toBe(36);
    expect(result[0]).toBe(99);
    expect(result[result.length - 1]).toBe(100);
  });
});

describe('uniqueBy', () => {
  it('uniqueBy test 1: all unique (n=2)', () => {
    const r = uniqueBy([0, 1], x => x);
    expect(r.length).toBe(2);
  });
  it('uniqueBy test 2: all unique (n=3)', () => {
    const r = uniqueBy([0, 1, 2], x => x);
    expect(r.length).toBe(3);
  });
  it('uniqueBy test 3: all unique (n=4)', () => {
    const r = uniqueBy([0, 1, 2, 3], x => x);
    expect(r.length).toBe(4);
  });
  it('uniqueBy test 4: all unique (n=5)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4], x => x);
    expect(r.length).toBe(5);
  });
  it('uniqueBy test 5: all unique (n=6)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5], x => x);
    expect(r.length).toBe(6);
  });
  it('uniqueBy test 6: all unique (n=7)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6], x => x);
    expect(r.length).toBe(7);
  });
  it('uniqueBy test 7: all unique (n=8)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7], x => x);
    expect(r.length).toBe(8);
  });
  it('uniqueBy test 8: all unique (n=9)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7, 8], x => x);
    expect(r.length).toBe(9);
  });
  it('uniqueBy test 9: all unique (n=10)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], x => x);
    expect(r.length).toBe(10);
  });
  it('uniqueBy test 10: all unique (n=11)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], x => x);
    expect(r.length).toBe(11);
  });
  it('uniqueBy test 11: all unique (n=12)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], x => x);
    expect(r.length).toBe(12);
  });
  it('uniqueBy test 12: all unique (n=13)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], x => x);
    expect(r.length).toBe(13);
  });
  it('uniqueBy test 13: all unique (n=14)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], x => x);
    expect(r.length).toBe(14);
  });
  it('uniqueBy test 14: all unique (n=15)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], x => x);
    expect(r.length).toBe(15);
  });
  it('uniqueBy test 15: all unique (n=16)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], x => x);
    expect(r.length).toBe(16);
  });
  it('uniqueBy test 16: all unique (n=17)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], x => x);
    expect(r.length).toBe(17);
  });
  it('uniqueBy test 17: all unique (n=18)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], x => x);
    expect(r.length).toBe(18);
  });
  it('uniqueBy test 18: all unique (n=19)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], x => x);
    expect(r.length).toBe(19);
  });
  it('uniqueBy test 19: all unique (n=20)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], x => x);
    expect(r.length).toBe(20);
  });
  it('uniqueBy test 20: all unique (n=21)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], x => x);
    expect(r.length).toBe(21);
  });
  it('uniqueBy test 21: all unique (n=22)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], x => x);
    expect(r.length).toBe(22);
  });
  it('uniqueBy test 22: all unique (n=23)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], x => x);
    expect(r.length).toBe(23);
  });
  it('uniqueBy test 23: all unique (n=24)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], x => x);
    expect(r.length).toBe(24);
  });
  it('uniqueBy test 24: all unique (n=25)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], x => x);
    expect(r.length).toBe(25);
  });
  it('uniqueBy test 25: all unique (n=26)', () => {
    const r = uniqueBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], x => x);
    expect(r.length).toBe(26);
  });
  it('uniqueBy test 26: duplicates removed (n=1)', () => {
    const r = uniqueBy([0, 0], x => x);
    expect(r.length).toBe(1);
  });
  it('uniqueBy test 27: duplicates removed (n=2)', () => {
    const r = uniqueBy([0, 0, 1, 1], x => x);
    expect(r.length).toBe(2);
  });
  it('uniqueBy test 28: duplicates removed (n=3)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2], x => x);
    expect(r.length).toBe(3);
  });
  it('uniqueBy test 29: duplicates removed (n=4)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3], x => x);
    expect(r.length).toBe(4);
  });
  it('uniqueBy test 30: duplicates removed (n=5)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4], x => x);
    expect(r.length).toBe(5);
  });
  it('uniqueBy test 31: duplicates removed (n=6)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5], x => x);
    expect(r.length).toBe(6);
  });
  it('uniqueBy test 32: duplicates removed (n=7)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6], x => x);
    expect(r.length).toBe(7);
  });
  it('uniqueBy test 33: duplicates removed (n=8)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7], x => x);
    expect(r.length).toBe(8);
  });
  it('uniqueBy test 34: duplicates removed (n=9)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8], x => x);
    expect(r.length).toBe(9);
  });
  it('uniqueBy test 35: duplicates removed (n=10)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9], x => x);
    expect(r.length).toBe(10);
  });
  it('uniqueBy test 36: duplicates removed (n=11)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10], x => x);
    expect(r.length).toBe(11);
  });
  it('uniqueBy test 37: duplicates removed (n=12)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11], x => x);
    expect(r.length).toBe(12);
  });
  it('uniqueBy test 38: duplicates removed (n=13)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12], x => x);
    expect(r.length).toBe(13);
  });
  it('uniqueBy test 39: duplicates removed (n=14)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], x => x);
    expect(r.length).toBe(14);
  });
  it('uniqueBy test 40: duplicates removed (n=15)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14], x => x);
    expect(r.length).toBe(15);
  });
  it('uniqueBy test 41: duplicates removed (n=16)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15], x => x);
    expect(r.length).toBe(16);
  });
  it('uniqueBy test 42: duplicates removed (n=17)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16], x => x);
    expect(r.length).toBe(17);
  });
  it('uniqueBy test 43: duplicates removed (n=18)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17], x => x);
    expect(r.length).toBe(18);
  });
  it('uniqueBy test 44: duplicates removed (n=19)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18], x => x);
    expect(r.length).toBe(19);
  });
  it('uniqueBy test 45: duplicates removed (n=20)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19], x => x);
    expect(r.length).toBe(20);
  });
  it('uniqueBy test 46: duplicates removed (n=21)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20], x => x);
    expect(r.length).toBe(21);
  });
  it('uniqueBy test 47: duplicates removed (n=22)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21], x => x);
    expect(r.length).toBe(22);
  });
  it('uniqueBy test 48: duplicates removed (n=23)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22], x => x);
    expect(r.length).toBe(23);
  });
  it('uniqueBy test 49: duplicates removed (n=24)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23], x => x);
    expect(r.length).toBe(24);
  });
  it('uniqueBy test 50: duplicates removed (n=25)', () => {
    const r = uniqueBy([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24], x => x);
    expect(r.length).toBe(25);
  });
});

describe('once', () => {
  it('once test 1: returns value 6', () => {
    const fn = once(() => 6);
    expect(fn()).toBe(6);
  });
  it('once test 2: returns value 12', () => {
    const fn = once(() => 12);
    expect(fn()).toBe(12);
  });
  it('once test 3: returns value 18', () => {
    const fn = once(() => 18);
    expect(fn()).toBe(18);
  });
  it('once test 4: returns value 24', () => {
    const fn = once(() => 24);
    expect(fn()).toBe(24);
  });
  it('once test 5: returns value 30', () => {
    const fn = once(() => 30);
    expect(fn()).toBe(30);
  });
  it('once test 6: returns value 36', () => {
    const fn = once(() => 36);
    expect(fn()).toBe(36);
  });
  it('once test 7: returns value 42', () => {
    const fn = once(() => 42);
    expect(fn()).toBe(42);
  });
  it('once test 8: returns value 48', () => {
    const fn = once(() => 48);
    expect(fn()).toBe(48);
  });
  it('once test 9: returns value 54', () => {
    const fn = once(() => 54);
    expect(fn()).toBe(54);
  });
  it('once test 10: returns value 60', () => {
    const fn = once(() => 60);
    expect(fn()).toBe(60);
  });
  it('once test 11: returns value 66', () => {
    const fn = once(() => 66);
    expect(fn()).toBe(66);
  });
  it('once test 12: returns value 72', () => {
    const fn = once(() => 72);
    expect(fn()).toBe(72);
  });
  it('once test 13: returns value 78', () => {
    const fn = once(() => 78);
    expect(fn()).toBe(78);
  });
  it('once test 14: returns value 84', () => {
    const fn = once(() => 84);
    expect(fn()).toBe(84);
  });
  it('once test 15: returns value 90', () => {
    const fn = once(() => 90);
    expect(fn()).toBe(90);
  });
  it('once test 16: returns value 96', () => {
    const fn = once(() => 96);
    expect(fn()).toBe(96);
  });
  it('once test 17: returns value 102', () => {
    const fn = once(() => 102);
    expect(fn()).toBe(102);
  });
  it('once test 18: returns value 108', () => {
    const fn = once(() => 108);
    expect(fn()).toBe(108);
  });
  it('once test 19: returns value 114', () => {
    const fn = once(() => 114);
    expect(fn()).toBe(114);
  });
  it('once test 20: returns value 120', () => {
    const fn = once(() => 120);
    expect(fn()).toBe(120);
  });
  it('once test 21: returns value 126', () => {
    const fn = once(() => 126);
    expect(fn()).toBe(126);
  });
  it('once test 22: returns value 132', () => {
    const fn = once(() => 132);
    expect(fn()).toBe(132);
  });
  it('once test 23: returns value 138', () => {
    const fn = once(() => 138);
    expect(fn()).toBe(138);
  });
  it('once test 24: returns value 144', () => {
    const fn = once(() => 144);
    expect(fn()).toBe(144);
  });
  it('once test 25: returns value 150', () => {
    const fn = once(() => 150);
    expect(fn()).toBe(150);
  });
  it('once test 26: fn called exactly once (val=426)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 426; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 27: fn called exactly once (val=427)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 427; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 28: fn called exactly once (val=428)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 428; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 29: fn called exactly once (val=429)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 429; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 30: fn called exactly once (val=430)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 430; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 31: fn called exactly once (val=431)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 431; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 32: fn called exactly once (val=432)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 432; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 33: fn called exactly once (val=433)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 433; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 34: fn called exactly once (val=434)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 434; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 35: fn called exactly once (val=435)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 435; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 36: fn called exactly once (val=436)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 436; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 37: fn called exactly once (val=437)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 437; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 38: fn called exactly once (val=438)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 438; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 39: fn called exactly once (val=439)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 439; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 40: fn called exactly once (val=440)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 440; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 41: fn called exactly once (val=441)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 441; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 42: fn called exactly once (val=442)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 442; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 43: fn called exactly once (val=443)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 443; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 44: fn called exactly once (val=444)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 444; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 45: fn called exactly once (val=445)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 445; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 46: fn called exactly once (val=446)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 446; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 47: fn called exactly once (val=447)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 447; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 48: fn called exactly once (val=448)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 448; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 49: fn called exactly once (val=449)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 449; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
  it('once test 50: fn called exactly once (val=450)', () => {
    let calls = 0;
    const fn = once(() => { calls++; return 450; });
    fn(); fn(); fn();
    expect(calls).toBe(1);
  });
});

describe('nthCall', () => {
  it('nthCall test 1: returns undefined before call 2', () => {
    const fn = nthCall(() => 9, 2);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 2: returns undefined before call 3', () => {
    const fn = nthCall(() => 18, 3);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 3: returns undefined before call 4', () => {
    const fn = nthCall(() => 27, 4);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 4: returns undefined before call 5', () => {
    const fn = nthCall(() => 36, 5);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 5: returns undefined before call 6', () => {
    const fn = nthCall(() => 45, 6);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 6: returns undefined before call 7', () => {
    const fn = nthCall(() => 54, 7);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 7: returns undefined before call 8', () => {
    const fn = nthCall(() => 63, 8);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 8: returns undefined before call 9', () => {
    const fn = nthCall(() => 72, 9);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 9: returns undefined before call 10', () => {
    const fn = nthCall(() => 81, 10);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 10: returns undefined before call 11', () => {
    const fn = nthCall(() => 90, 11);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 11: returns undefined before call 12', () => {
    const fn = nthCall(() => 99, 12);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 12: returns undefined before call 13', () => {
    const fn = nthCall(() => 108, 13);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 13: returns undefined before call 14', () => {
    const fn = nthCall(() => 117, 14);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 14: returns undefined before call 15', () => {
    const fn = nthCall(() => 126, 15);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 15: returns undefined before call 16', () => {
    const fn = nthCall(() => 135, 16);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 16: returns undefined before call 17', () => {
    const fn = nthCall(() => 144, 17);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 17: returns undefined before call 18', () => {
    const fn = nthCall(() => 153, 18);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 18: returns undefined before call 19', () => {
    const fn = nthCall(() => 162, 19);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 19: returns undefined before call 20', () => {
    const fn = nthCall(() => 171, 20);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 20: returns undefined before call 21', () => {
    const fn = nthCall(() => 180, 21);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 21: returns undefined before call 22', () => {
    const fn = nthCall(() => 189, 22);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 22: returns undefined before call 23', () => {
    const fn = nthCall(() => 198, 23);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 23: returns undefined before call 24', () => {
    const fn = nthCall(() => 207, 24);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 24: returns undefined before call 25', () => {
    const fn = nthCall(() => 216, 25);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 25: returns undefined before call 26', () => {
    const fn = nthCall(() => 225, 26);
    expect(fn()).toBeUndefined();
  });
  it('nthCall test 26: returns 182 on call 2', () => {
    const fn = nthCall(() => 182, 2);
    fn();
    expect(fn()).toBe(182);
  });
  it('nthCall test 27: returns 189 on call 3', () => {
    const fn = nthCall(() => 189, 3);
    fn(), fn();
    expect(fn()).toBe(189);
  });
  it('nthCall test 28: returns 196 on call 4', () => {
    const fn = nthCall(() => 196, 4);
    fn(), fn(), fn();
    expect(fn()).toBe(196);
  });
  it('nthCall test 29: returns 203 on call 5', () => {
    const fn = nthCall(() => 203, 5);
    fn(), fn(), fn(), fn();
    expect(fn()).toBe(203);
  });
  it('nthCall test 30: returns 210 on call 6', () => {
    const fn = nthCall(() => 210, 6);
    fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(210);
  });
  it('nthCall test 31: returns 217 on call 7', () => {
    const fn = nthCall(() => 217, 7);
    fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(217);
  });
  it('nthCall test 32: returns 224 on call 8', () => {
    const fn = nthCall(() => 224, 8);
    fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(224);
  });
  it('nthCall test 33: returns 231 on call 9', () => {
    const fn = nthCall(() => 231, 9);
    fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(231);
  });
  it('nthCall test 34: returns 238 on call 10', () => {
    const fn = nthCall(() => 238, 10);
    fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(238);
  });
  it('nthCall test 35: returns 245 on call 11', () => {
    const fn = nthCall(() => 245, 11);
    fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(245);
  });
  it('nthCall test 36: returns 252 on call 12', () => {
    const fn = nthCall(() => 252, 12);
    fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(252);
  });
  it('nthCall test 37: returns 259 on call 13', () => {
    const fn = nthCall(() => 259, 13);
    fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(259);
  });
  it('nthCall test 38: returns 266 on call 14', () => {
    const fn = nthCall(() => 266, 14);
    fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(266);
  });
  it('nthCall test 39: returns 273 on call 15', () => {
    const fn = nthCall(() => 273, 15);
    fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(273);
  });
  it('nthCall test 40: returns 280 on call 16', () => {
    const fn = nthCall(() => 280, 16);
    fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(280);
  });
  it('nthCall test 41: returns 287 on call 17', () => {
    const fn = nthCall(() => 287, 17);
    fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(287);
  });
  it('nthCall test 42: returns 294 on call 18', () => {
    const fn = nthCall(() => 294, 18);
    fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(294);
  });
  it('nthCall test 43: returns 301 on call 19', () => {
    const fn = nthCall(() => 301, 19);
    fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(301);
  });
  it('nthCall test 44: returns 308 on call 20', () => {
    const fn = nthCall(() => 308, 20);
    fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(308);
  });
  it('nthCall test 45: returns 315 on call 21', () => {
    const fn = nthCall(() => 315, 21);
    fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(315);
  });
  it('nthCall test 46: returns 322 on call 22', () => {
    const fn = nthCall(() => 322, 22);
    fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(322);
  });
  it('nthCall test 47: returns 329 on call 23', () => {
    const fn = nthCall(() => 329, 23);
    fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(329);
  });
  it('nthCall test 48: returns 336 on call 24', () => {
    const fn = nthCall(() => 336, 24);
    fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(336);
  });
  it('nthCall test 49: returns 343 on call 25', () => {
    const fn = nthCall(() => 343, 25);
    fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(343);
  });
  it('nthCall test 50: returns 350 on call 26', () => {
    const fn = nthCall(() => 350, 26);
    fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn(), fn();
    expect(fn()).toBe(350);
  });
});

describe('defer', () => {
  it('defer test 1: resolves to 11', async () => {
    const result = await defer(() => 11, 0);
    expect(result).toBe(11);
  });
  it('defer test 2: resolves to 22', async () => {
    const result = await defer(() => 22, 0);
    expect(result).toBe(22);
  });
  it('defer test 3: resolves to 33', async () => {
    const result = await defer(() => 33, 0);
    expect(result).toBe(33);
  });
  it('defer test 4: resolves to 44', async () => {
    const result = await defer(() => 44, 0);
    expect(result).toBe(44);
  });
  it('defer test 5: resolves to 55', async () => {
    const result = await defer(() => 55, 0);
    expect(result).toBe(55);
  });
  it('defer test 6: resolves to 66', async () => {
    const result = await defer(() => 66, 0);
    expect(result).toBe(66);
  });
  it('defer test 7: resolves to 77', async () => {
    const result = await defer(() => 77, 0);
    expect(result).toBe(77);
  });
  it('defer test 8: resolves to 88', async () => {
    const result = await defer(() => 88, 0);
    expect(result).toBe(88);
  });
  it('defer test 9: resolves to 99', async () => {
    const result = await defer(() => 99, 0);
    expect(result).toBe(99);
  });
  it('defer test 10: resolves to 110', async () => {
    const result = await defer(() => 110, 0);
    expect(result).toBe(110);
  });
  it('defer test 11: resolves to 121', async () => {
    const result = await defer(() => 121, 0);
    expect(result).toBe(121);
  });
  it('defer test 12: resolves to 132', async () => {
    const result = await defer(() => 132, 0);
    expect(result).toBe(132);
  });
  it('defer test 13: resolves to 143', async () => {
    const result = await defer(() => 143, 0);
    expect(result).toBe(143);
  });
  it('defer test 14: resolves to 154', async () => {
    const result = await defer(() => 154, 0);
    expect(result).toBe(154);
  });
  it('defer test 15: resolves to 165', async () => {
    const result = await defer(() => 165, 0);
    expect(result).toBe(165);
  });
  it('defer test 16: resolves to 176', async () => {
    const result = await defer(() => 176, 0);
    expect(result).toBe(176);
  });
  it('defer test 17: resolves to 187', async () => {
    const result = await defer(() => 187, 0);
    expect(result).toBe(187);
  });
  it('defer test 18: resolves to 198', async () => {
    const result = await defer(() => 198, 0);
    expect(result).toBe(198);
  });
  it('defer test 19: resolves to 209', async () => {
    const result = await defer(() => 209, 0);
    expect(result).toBe(209);
  });
  it('defer test 20: resolves to 220', async () => {
    const result = await defer(() => 220, 0);
    expect(result).toBe(220);
  });
  it('defer test 21: resolves to 231', async () => {
    const result = await defer(() => 231, 0);
    expect(result).toBe(231);
  });
  it('defer test 22: resolves to 242', async () => {
    const result = await defer(() => 242, 0);
    expect(result).toBe(242);
  });
  it('defer test 23: resolves to 253', async () => {
    const result = await defer(() => 253, 0);
    expect(result).toBe(253);
  });
  it('defer test 24: resolves to 264', async () => {
    const result = await defer(() => 264, 0);
    expect(result).toBe(264);
  });
  it('defer test 25: resolves to 275', async () => {
    const result = await defer(() => 275, 0);
    expect(result).toBe(275);
  });
  it('defer test 26: resolves to 286', async () => {
    const result = await defer(() => 286, 0);
    expect(result).toBe(286);
  });
  it('defer test 27: resolves to 297', async () => {
    const result = await defer(() => 297, 0);
    expect(result).toBe(297);
  });
  it('defer test 28: resolves to 308', async () => {
    const result = await defer(() => 308, 0);
    expect(result).toBe(308);
  });
  it('defer test 29: resolves to 319', async () => {
    const result = await defer(() => 319, 0);
    expect(result).toBe(319);
  });
  it('defer test 30: resolves to 330', async () => {
    const result = await defer(() => 330, 0);
    expect(result).toBe(330);
  });
});

describe('deferred', () => {
  it('deferred test 1: manually resolves to 13', async () => {
    const d = deferred<number>();
    d.resolve(13);
    expect(await d.promise).toBe(13);
  });
  it('deferred test 2: manually resolves to 26', async () => {
    const d = deferred<number>();
    d.resolve(26);
    expect(await d.promise).toBe(26);
  });
  it('deferred test 3: manually resolves to 39', async () => {
    const d = deferred<number>();
    d.resolve(39);
    expect(await d.promise).toBe(39);
  });
  it('deferred test 4: manually resolves to 52', async () => {
    const d = deferred<number>();
    d.resolve(52);
    expect(await d.promise).toBe(52);
  });
  it('deferred test 5: manually resolves to 65', async () => {
    const d = deferred<number>();
    d.resolve(65);
    expect(await d.promise).toBe(65);
  });
  it('deferred test 6: manually resolves to 78', async () => {
    const d = deferred<number>();
    d.resolve(78);
    expect(await d.promise).toBe(78);
  });
  it('deferred test 7: manually resolves to 91', async () => {
    const d = deferred<number>();
    d.resolve(91);
    expect(await d.promise).toBe(91);
  });
  it('deferred test 8: manually resolves to 104', async () => {
    const d = deferred<number>();
    d.resolve(104);
    expect(await d.promise).toBe(104);
  });
  it('deferred test 9: manually resolves to 117', async () => {
    const d = deferred<number>();
    d.resolve(117);
    expect(await d.promise).toBe(117);
  });
  it('deferred test 10: manually resolves to 130', async () => {
    const d = deferred<number>();
    d.resolve(130);
    expect(await d.promise).toBe(130);
  });
  it('deferred test 11: manually resolves to 143', async () => {
    const d = deferred<number>();
    d.resolve(143);
    expect(await d.promise).toBe(143);
  });
  it('deferred test 12: manually resolves to 156', async () => {
    const d = deferred<number>();
    d.resolve(156);
    expect(await d.promise).toBe(156);
  });
  it('deferred test 13: manually resolves to 169', async () => {
    const d = deferred<number>();
    d.resolve(169);
    expect(await d.promise).toBe(169);
  });
  it('deferred test 14: manually resolves to 182', async () => {
    const d = deferred<number>();
    d.resolve(182);
    expect(await d.promise).toBe(182);
  });
  it('deferred test 15: manually resolves to 195', async () => {
    const d = deferred<number>();
    d.resolve(195);
    expect(await d.promise).toBe(195);
  });
  it('deferred test 16: manually resolves to 208', async () => {
    const d = deferred<number>();
    d.resolve(208);
    expect(await d.promise).toBe(208);
  });
  it('deferred test 17: manually resolves to 221', async () => {
    const d = deferred<number>();
    d.resolve(221);
    expect(await d.promise).toBe(221);
  });
  it('deferred test 18: manually resolves to 234', async () => {
    const d = deferred<number>();
    d.resolve(234);
    expect(await d.promise).toBe(234);
  });
  it('deferred test 19: manually resolves to 247', async () => {
    const d = deferred<number>();
    d.resolve(247);
    expect(await d.promise).toBe(247);
  });
  it('deferred test 20: manually resolves to 260', async () => {
    const d = deferred<number>();
    d.resolve(260);
    expect(await d.promise).toBe(260);
  });
  it('deferred test 21: manually resolves to 273', async () => {
    const d = deferred<number>();
    d.resolve(273);
    expect(await d.promise).toBe(273);
  });
  it('deferred test 22: manually resolves to 286', async () => {
    const d = deferred<number>();
    d.resolve(286);
    expect(await d.promise).toBe(286);
  });
  it('deferred test 23: manually resolves to 299', async () => {
    const d = deferred<number>();
    d.resolve(299);
    expect(await d.promise).toBe(299);
  });
  it('deferred test 24: manually resolves to 312', async () => {
    const d = deferred<number>();
    d.resolve(312);
    expect(await d.promise).toBe(312);
  });
  it('deferred test 25: manually resolves to 325', async () => {
    const d = deferred<number>();
    d.resolve(325);
    expect(await d.promise).toBe(325);
  });
  it('deferred test 26: manually resolves to 338', async () => {
    const d = deferred<number>();
    d.resolve(338);
    expect(await d.promise).toBe(338);
  });
  it('deferred test 27: manually resolves to 351', async () => {
    const d = deferred<number>();
    d.resolve(351);
    expect(await d.promise).toBe(351);
  });
  it('deferred test 28: manually resolves to 364', async () => {
    const d = deferred<number>();
    d.resolve(364);
    expect(await d.promise).toBe(364);
  });
  it('deferred test 29: manually resolves to 377', async () => {
    const d = deferred<number>();
    d.resolve(377);
    expect(await d.promise).toBe(377);
  });
  it('deferred test 30: manually resolves to 390', async () => {
    const d = deferred<number>();
    d.resolve(390);
    expect(await d.promise).toBe(390);
  });
});

describe('createWeakCache', () => {
  it('createWeakCache test 1: set and get value 8', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    cache.set(key, 8);
    expect(cache.get(key)).toBe(8);
  });
  it('createWeakCache test 2: set and get value 16', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    cache.set(key, 16);
    expect(cache.get(key)).toBe(16);
  });
  it('createWeakCache test 3: set and get value 24', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    cache.set(key, 24);
    expect(cache.get(key)).toBe(24);
  });
  it('createWeakCache test 4: set and get value 32', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    cache.set(key, 32);
    expect(cache.get(key)).toBe(32);
  });
  it('createWeakCache test 5: set and get value 40', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    cache.set(key, 40);
    expect(cache.get(key)).toBe(40);
  });
  it('createWeakCache test 6: set and get value 48', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    cache.set(key, 48);
    expect(cache.get(key)).toBe(48);
  });
  it('createWeakCache test 7: set and get value 56', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    cache.set(key, 56);
    expect(cache.get(key)).toBe(56);
  });
  it('createWeakCache test 8: set and get value 64', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    cache.set(key, 64);
    expect(cache.get(key)).toBe(64);
  });
  it('createWeakCache test 9: set and get value 72', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    cache.set(key, 72);
    expect(cache.get(key)).toBe(72);
  });
  it('createWeakCache test 10: set and get value 80', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    cache.set(key, 80);
    expect(cache.get(key)).toBe(80);
  });
  it('createWeakCache test 11: set and get value 88', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    cache.set(key, 88);
    expect(cache.get(key)).toBe(88);
  });
  it('createWeakCache test 12: set and get value 96', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    cache.set(key, 96);
    expect(cache.get(key)).toBe(96);
  });
  it('createWeakCache test 13: set and get value 104', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    cache.set(key, 104);
    expect(cache.get(key)).toBe(104);
  });
  it('createWeakCache test 14: set and get value 112', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    cache.set(key, 112);
    expect(cache.get(key)).toBe(112);
  });
  it('createWeakCache test 15: set and get value 120', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    cache.set(key, 120);
    expect(cache.get(key)).toBe(120);
  });
  it('createWeakCache test 16: has and delete (val=516)', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    expect(cache.has(key)).toBe(false);
    cache.set(key, 516);
    expect(cache.has(key)).toBe(true);
    expect(cache.delete(key)).toBe(true);
    expect(cache.has(key)).toBe(false);
  });
  it('createWeakCache test 17: has and delete (val=517)', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    expect(cache.has(key)).toBe(false);
    cache.set(key, 517);
    expect(cache.has(key)).toBe(true);
    expect(cache.delete(key)).toBe(true);
    expect(cache.has(key)).toBe(false);
  });
  it('createWeakCache test 18: has and delete (val=518)', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    expect(cache.has(key)).toBe(false);
    cache.set(key, 518);
    expect(cache.has(key)).toBe(true);
    expect(cache.delete(key)).toBe(true);
    expect(cache.has(key)).toBe(false);
  });
  it('createWeakCache test 19: has and delete (val=519)', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    expect(cache.has(key)).toBe(false);
    cache.set(key, 519);
    expect(cache.has(key)).toBe(true);
    expect(cache.delete(key)).toBe(true);
    expect(cache.has(key)).toBe(false);
  });
  it('createWeakCache test 20: has and delete (val=520)', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    expect(cache.has(key)).toBe(false);
    cache.set(key, 520);
    expect(cache.has(key)).toBe(true);
    expect(cache.delete(key)).toBe(true);
    expect(cache.has(key)).toBe(false);
  });
  it('createWeakCache test 21: has and delete (val=521)', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    expect(cache.has(key)).toBe(false);
    cache.set(key, 521);
    expect(cache.has(key)).toBe(true);
    expect(cache.delete(key)).toBe(true);
    expect(cache.has(key)).toBe(false);
  });
  it('createWeakCache test 22: has and delete (val=522)', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    expect(cache.has(key)).toBe(false);
    cache.set(key, 522);
    expect(cache.has(key)).toBe(true);
    expect(cache.delete(key)).toBe(true);
    expect(cache.has(key)).toBe(false);
  });
  it('createWeakCache test 23: has and delete (val=523)', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    expect(cache.has(key)).toBe(false);
    cache.set(key, 523);
    expect(cache.has(key)).toBe(true);
    expect(cache.delete(key)).toBe(true);
    expect(cache.has(key)).toBe(false);
  });
  it('createWeakCache test 24: has and delete (val=524)', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    expect(cache.has(key)).toBe(false);
    cache.set(key, 524);
    expect(cache.has(key)).toBe(true);
    expect(cache.delete(key)).toBe(true);
    expect(cache.has(key)).toBe(false);
  });
  it('createWeakCache test 25: has and delete (val=525)', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    expect(cache.has(key)).toBe(false);
    cache.set(key, 525);
    expect(cache.has(key)).toBe(true);
    expect(cache.delete(key)).toBe(true);
    expect(cache.has(key)).toBe(false);
  });
  it('createWeakCache test 26: has and delete (val=526)', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    expect(cache.has(key)).toBe(false);
    cache.set(key, 526);
    expect(cache.has(key)).toBe(true);
    expect(cache.delete(key)).toBe(true);
    expect(cache.has(key)).toBe(false);
  });
  it('createWeakCache test 27: has and delete (val=527)', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    expect(cache.has(key)).toBe(false);
    cache.set(key, 527);
    expect(cache.has(key)).toBe(true);
    expect(cache.delete(key)).toBe(true);
    expect(cache.has(key)).toBe(false);
  });
  it('createWeakCache test 28: has and delete (val=528)', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    expect(cache.has(key)).toBe(false);
    cache.set(key, 528);
    expect(cache.has(key)).toBe(true);
    expect(cache.delete(key)).toBe(true);
    expect(cache.has(key)).toBe(false);
  });
  it('createWeakCache test 29: has and delete (val=529)', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    expect(cache.has(key)).toBe(false);
    cache.set(key, 529);
    expect(cache.has(key)).toBe(true);
    expect(cache.delete(key)).toBe(true);
    expect(cache.has(key)).toBe(false);
  });
  it('createWeakCache test 30: has and delete (val=530)', () => {
    const cache = createWeakCache<object, number>();
    const key = {};
    expect(cache.has(key)).toBe(false);
    cache.set(key, 530);
    expect(cache.has(key)).toBe(true);
    expect(cache.delete(key)).toBe(true);
    expect(cache.has(key)).toBe(false);
  });
});

describe('batch', () => {
  it('batch test 1: flushes at batch size 2', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 2);
    push(1);
    push(2);
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(2);
  });
  it('batch test 2: flushes at batch size 3', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 3);
    push(1);
    push(2);
    push(3);
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(3);
  });
  it('batch test 3: flushes at batch size 4', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 4);
    push(1);
    push(2);
    push(3);
    push(4);
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(4);
  });
  it('batch test 4: flushes at batch size 5', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 5);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(5);
  });
  it('batch test 5: flushes at batch size 6', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 6);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(6);
  });
  it('batch test 6: flushes at batch size 7', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 7);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(7);
  });
  it('batch test 7: flushes at batch size 8', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 8);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(8);
  });
  it('batch test 8: flushes at batch size 9', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 9);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(9);
  });
  it('batch test 9: flushes at batch size 10', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 10);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    push(10);
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(10);
  });
  it('batch test 10: flushes at batch size 11', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 11);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    push(10);
    push(11);
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(11);
  });
  it('batch test 11: flushes at batch size 12', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 12);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    push(10);
    push(11);
    push(12);
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(12);
  });
  it('batch test 12: flushes at batch size 13', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 13);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    push(10);
    push(11);
    push(12);
    push(13);
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(13);
  });
  it('batch test 13: flushes at batch size 14', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 14);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    push(10);
    push(11);
    push(12);
    push(13);
    push(14);
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(14);
  });
  it('batch test 14: flushes at batch size 15', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 15);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    push(10);
    push(11);
    push(12);
    push(13);
    push(14);
    push(15);
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(15);
  });
  it('batch test 15: flushes at batch size 16', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 16);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    push(10);
    push(11);
    push(12);
    push(13);
    push(14);
    push(15);
    push(16);
    expect(results.length).toBe(1);
    expect(results[0].length).toBe(16);
  });
  it('batch test 16: partial batch (size=16, pushed=8) not flushed', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 16);
    push(0);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    expect(results.length).toBe(0);
  });
  it('batch test 17: partial batch (size=17, pushed=8) not flushed', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 17);
    push(0);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    expect(results.length).toBe(0);
  });
  it('batch test 18: partial batch (size=18, pushed=9) not flushed', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 18);
    push(0);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    expect(results.length).toBe(0);
  });
  it('batch test 19: partial batch (size=19, pushed=9) not flushed', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 19);
    push(0);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    expect(results.length).toBe(0);
  });
  it('batch test 20: partial batch (size=20, pushed=10) not flushed', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 20);
    push(0);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    expect(results.length).toBe(0);
  });
  it('batch test 21: partial batch (size=21, pushed=10) not flushed', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 21);
    push(0);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    expect(results.length).toBe(0);
  });
  it('batch test 22: partial batch (size=22, pushed=11) not flushed', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 22);
    push(0);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    push(10);
    expect(results.length).toBe(0);
  });
  it('batch test 23: partial batch (size=23, pushed=11) not flushed', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 23);
    push(0);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    push(10);
    expect(results.length).toBe(0);
  });
  it('batch test 24: partial batch (size=24, pushed=12) not flushed', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 24);
    push(0);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    push(10);
    push(11);
    expect(results.length).toBe(0);
  });
  it('batch test 25: partial batch (size=25, pushed=12) not flushed', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 25);
    push(0);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    push(10);
    push(11);
    expect(results.length).toBe(0);
  });
  it('batch test 26: partial batch (size=26, pushed=13) not flushed', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 26);
    push(0);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    push(10);
    push(11);
    push(12);
    expect(results.length).toBe(0);
  });
  it('batch test 27: partial batch (size=27, pushed=13) not flushed', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 27);
    push(0);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    push(10);
    push(11);
    push(12);
    expect(results.length).toBe(0);
  });
  it('batch test 28: partial batch (size=28, pushed=14) not flushed', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 28);
    push(0);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    push(10);
    push(11);
    push(12);
    push(13);
    expect(results.length).toBe(0);
  });
  it('batch test 29: partial batch (size=29, pushed=14) not flushed', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 29);
    push(0);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    push(10);
    push(11);
    push(12);
    push(13);
    expect(results.length).toBe(0);
  });
  it('batch test 30: partial batch (size=30, pushed=15) not flushed', () => {
    const results: number[][] = [];
    const push = batch<number>((items) => results.push(items), 30);
    push(0);
    push(1);
    push(2);
    push(3);
    push(4);
    push(5);
    push(6);
    push(7);
    push(8);
    push(9);
    push(10);
    push(11);
    push(12);
    push(13);
    push(14);
    expect(results.length).toBe(0);
  });
});

describe('primes', () => {
  it('primes test 1: first 2 primes', () => {
    expect(primes(2)).toEqual([2, 3]);
  });
  it('primes test 2: first 3 primes', () => {
    expect(primes(3)).toEqual([2, 3, 5]);
  });
  it('primes test 3: first 4 primes', () => {
    expect(primes(4)).toEqual([2, 3, 5, 7]);
  });
  it('primes test 4: first 5 primes', () => {
    expect(primes(5)).toEqual([2, 3, 5, 7, 11]);
  });
  it('primes test 5: first 6 primes', () => {
    expect(primes(6)).toEqual([2, 3, 5, 7, 11, 13]);
  });
  it('primes test 6: first 7 primes', () => {
    expect(primes(7)).toEqual([2, 3, 5, 7, 11, 13, 17]);
  });
  it('primes test 7: first 8 primes', () => {
    expect(primes(8)).toEqual([2, 3, 5, 7, 11, 13, 17, 19]);
  });
  it('primes test 8: first 9 primes', () => {
    expect(primes(9)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23]);
  });
  it('primes test 9: first 10 primes', () => {
    expect(primes(10)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
  });
  it('primes test 10: first 11 primes', () => {
    expect(primes(11)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31]);
  });
  it('primes test 11: first 12 primes', () => {
    expect(primes(12)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
  });
  it('primes test 12: first 13 primes', () => {
    expect(primes(13)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41]);
  });
  it('primes test 13: first 14 primes', () => {
    expect(primes(14)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43]);
  });
  it('primes test 14: first 15 primes', () => {
    expect(primes(15)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]);
  });
  it('primes test 15: first 16 primes', () => {
    expect(primes(16)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53]);
  });
  it('primes test 16: first 17 primes', () => {
    expect(primes(17)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59]);
  });
  it('primes test 17: first 18 primes', () => {
    expect(primes(18)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61]);
  });
  it('primes test 18: first 19 primes', () => {
    expect(primes(19)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67]);
  });
  it('primes test 19: first 20 primes', () => {
    expect(primes(20)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71]);
  });
  it('primes test 20: first 21 primes', () => {
    expect(primes(21)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73]);
  });
  it('primes test 21: first 22 primes', () => {
    expect(primes(22)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79]);
  });
  it('primes test 22: first 23 primes', () => {
    expect(primes(23)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83]);
  });
  it('primes test 23: first 24 primes', () => {
    expect(primes(24)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89]);
  });
  it('primes test 24: first 25 primes', () => {
    expect(primes(25)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]);
  });
  it('primes test 25: first 26 primes', () => {
    expect(primes(26)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101]);
  });
  it('primes test 26: first 27 primes', () => {
    expect(primes(27)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103]);
  });
  it('primes test 27: first 28 primes', () => {
    expect(primes(28)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107]);
  });
  it('primes test 28: first 29 primes', () => {
    expect(primes(29)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109]);
  });
  it('primes test 29: first 30 primes', () => {
    expect(primes(30)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113]);
  });
  it('primes test 30: first 31 primes', () => {
    expect(primes(31)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127]);
  });
});

describe('interleave', () => {
  it('interleave test 1: equal arrays length 2 each', () => {
    expect(interleave([0, 1], [2, 3])).toEqual([0, 2, 1, 3]);
  });
  it('interleave test 2: equal arrays length 3 each', () => {
    expect(interleave([0, 1, 2], [3, 4, 5])).toEqual([0, 3, 1, 4, 2, 5]);
  });
  it('interleave test 3: equal arrays length 4 each', () => {
    expect(interleave([0, 1, 2, 3], [4, 5, 6, 7])).toEqual([0, 4, 1, 5, 2, 6, 3, 7]);
  });
  it('interleave test 4: equal arrays length 5 each', () => {
    expect(interleave([0, 1, 2, 3, 4], [5, 6, 7, 8, 9])).toEqual([0, 5, 1, 6, 2, 7, 3, 8, 4, 9]);
  });
  it('interleave test 5: equal arrays length 6 each', () => {
    expect(interleave([0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11])).toEqual([0, 6, 1, 7, 2, 8, 3, 9, 4, 10, 5, 11]);
  });
  it('interleave test 6: equal arrays length 7 each', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12, 13])).toEqual([0, 7, 1, 8, 2, 9, 3, 10, 4, 11, 5, 12, 6, 13]);
  });
  it('interleave test 7: equal arrays length 8 each', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14, 15])).toEqual([0, 8, 1, 9, 2, 10, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15]);
  });
  it('interleave test 8: equal arrays length 9 each', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8], [9, 10, 11, 12, 13, 14, 15, 16, 17])).toEqual([0, 9, 1, 10, 2, 11, 3, 12, 4, 13, 5, 14, 6, 15, 7, 16, 8, 17]);
  });
  it('interleave test 9: equal arrays length 10 each', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [10, 11, 12, 13, 14, 15, 16, 17, 18, 19])).toEqual([0, 10, 1, 11, 2, 12, 3, 13, 4, 14, 5, 15, 6, 16, 7, 17, 8, 18, 9, 19]);
  });
  it('interleave test 10: equal arrays length 11 each', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21])).toEqual([0, 11, 1, 12, 2, 13, 3, 14, 4, 15, 5, 16, 6, 17, 7, 18, 8, 19, 9, 20, 10, 21]);
  });
  it('interleave test 11: equal arrays length 12 each', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23])).toEqual([0, 12, 1, 13, 2, 14, 3, 15, 4, 16, 5, 17, 6, 18, 7, 19, 8, 20, 9, 21, 10, 22, 11, 23]);
  });
  it('interleave test 12: equal arrays length 13 each', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25])).toEqual([0, 13, 1, 14, 2, 15, 3, 16, 4, 17, 5, 18, 6, 19, 7, 20, 8, 21, 9, 22, 10, 23, 11, 24, 12, 25]);
  });
  it('interleave test 13: equal arrays length 14 each', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27])).toEqual([0, 14, 1, 15, 2, 16, 3, 17, 4, 18, 5, 19, 6, 20, 7, 21, 8, 22, 9, 23, 10, 24, 11, 25, 12, 26, 13, 27]);
  });
  it('interleave test 14: equal arrays length 15 each', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29])).toEqual([0, 15, 1, 16, 2, 17, 3, 18, 4, 19, 5, 20, 6, 21, 7, 22, 8, 23, 9, 24, 10, 25, 11, 26, 12, 27, 13, 28, 14, 29]);
  });
  it('interleave test 15: equal arrays length 16 each', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31])).toEqual([0, 16, 1, 17, 2, 18, 3, 19, 4, 20, 5, 21, 6, 22, 7, 23, 8, 24, 9, 25, 10, 26, 11, 27, 12, 28, 13, 29, 14, 30, 15, 31]);
  });
  it('interleave test 16: unequal arrays (a=6, b=11)', () => {
    expect(interleave([0, 1, 2, 3, 4, 5], [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110])).toEqual([0, 100, 1, 101, 2, 102, 3, 103, 4, 104, 5, 105, 106, 107, 108, 109, 110]);
  });
  it('interleave test 17: unequal arrays (a=7, b=12)', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6], [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111])).toEqual([0, 100, 1, 101, 2, 102, 3, 103, 4, 104, 5, 105, 6, 106, 107, 108, 109, 110, 111]);
  });
  it('interleave test 18: unequal arrays (a=8, b=13)', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7], [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112])).toEqual([0, 100, 1, 101, 2, 102, 3, 103, 4, 104, 5, 105, 6, 106, 7, 107, 108, 109, 110, 111, 112]);
  });
  it('interleave test 19: unequal arrays (a=9, b=14)', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8], [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113])).toEqual([0, 100, 1, 101, 2, 102, 3, 103, 4, 104, 5, 105, 6, 106, 7, 107, 8, 108, 109, 110, 111, 112, 113]);
  });
  it('interleave test 20: unequal arrays (a=10, b=15)', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114])).toEqual([0, 100, 1, 101, 2, 102, 3, 103, 4, 104, 5, 105, 6, 106, 7, 107, 8, 108, 9, 109, 110, 111, 112, 113, 114]);
  });
  it('interleave test 21: unequal arrays (a=11, b=16)', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115])).toEqual([0, 100, 1, 101, 2, 102, 3, 103, 4, 104, 5, 105, 6, 106, 7, 107, 8, 108, 9, 109, 10, 110, 111, 112, 113, 114, 115]);
  });
  it('interleave test 22: unequal arrays (a=12, b=17)', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116])).toEqual([0, 100, 1, 101, 2, 102, 3, 103, 4, 104, 5, 105, 6, 106, 7, 107, 8, 108, 9, 109, 10, 110, 11, 111, 112, 113, 114, 115, 116]);
  });
  it('interleave test 23: unequal arrays (a=13, b=18)', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117])).toEqual([0, 100, 1, 101, 2, 102, 3, 103, 4, 104, 5, 105, 6, 106, 7, 107, 8, 108, 9, 109, 10, 110, 11, 111, 12, 112, 113, 114, 115, 116, 117]);
  });
  it('interleave test 24: unequal arrays (a=14, b=19)', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118])).toEqual([0, 100, 1, 101, 2, 102, 3, 103, 4, 104, 5, 105, 6, 106, 7, 107, 8, 108, 9, 109, 10, 110, 11, 111, 12, 112, 13, 113, 114, 115, 116, 117, 118]);
  });
  it('interleave test 25: unequal arrays (a=15, b=20)', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119])).toEqual([0, 100, 1, 101, 2, 102, 3, 103, 4, 104, 5, 105, 6, 106, 7, 107, 8, 108, 9, 109, 10, 110, 11, 111, 12, 112, 13, 113, 14, 114, 115, 116, 117, 118, 119]);
  });
  it('interleave test 26: unequal arrays (a=16, b=21)', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120])).toEqual([0, 100, 1, 101, 2, 102, 3, 103, 4, 104, 5, 105, 6, 106, 7, 107, 8, 108, 9, 109, 10, 110, 11, 111, 12, 112, 13, 113, 14, 114, 15, 115, 116, 117, 118, 119, 120]);
  });
  it('interleave test 27: unequal arrays (a=17, b=22)', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121])).toEqual([0, 100, 1, 101, 2, 102, 3, 103, 4, 104, 5, 105, 6, 106, 7, 107, 8, 108, 9, 109, 10, 110, 11, 111, 12, 112, 13, 113, 14, 114, 15, 115, 16, 116, 117, 118, 119, 120, 121]);
  });
  it('interleave test 28: unequal arrays (a=18, b=23)', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122])).toEqual([0, 100, 1, 101, 2, 102, 3, 103, 4, 104, 5, 105, 6, 106, 7, 107, 8, 108, 9, 109, 10, 110, 11, 111, 12, 112, 13, 113, 14, 114, 15, 115, 16, 116, 17, 117, 118, 119, 120, 121, 122]);
  });
  it('interleave test 29: unequal arrays (a=19, b=24)', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123])).toEqual([0, 100, 1, 101, 2, 102, 3, 103, 4, 104, 5, 105, 6, 106, 7, 107, 8, 108, 9, 109, 10, 110, 11, 111, 12, 112, 13, 113, 14, 114, 15, 115, 16, 116, 17, 117, 18, 118, 119, 120, 121, 122, 123]);
  });
  it('interleave test 30: unequal arrays (a=20, b=25)', () => {
    expect(interleave([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124])).toEqual([0, 100, 1, 101, 2, 102, 3, 103, 4, 104, 5, 105, 6, 106, 7, 107, 8, 108, 9, 109, 10, 110, 11, 111, 12, 112, 13, 113, 14, 114, 15, 115, 16, 116, 17, 117, 18, 118, 19, 119, 120, 121, 122, 123, 124]);
  });
});

describe('groupConsecutive', () => {
  it('groupConsecutive test 1: two groups of 2', () => {
    const r = groupConsecutive([0, 0, 1, 1], x => x);
    expect(r.length).toBe(2);
    expect(r[0].length).toBe(2);
    expect(r[1].length).toBe(2);
  });
  it('groupConsecutive test 2: two groups of 3', () => {
    const r = groupConsecutive([0, 0, 0, 1, 1, 1], x => x);
    expect(r.length).toBe(2);
    expect(r[0].length).toBe(3);
    expect(r[1].length).toBe(3);
  });
  it('groupConsecutive test 3: two groups of 4', () => {
    const r = groupConsecutive([0, 0, 0, 0, 1, 1, 1, 1], x => x);
    expect(r.length).toBe(2);
    expect(r[0].length).toBe(4);
    expect(r[1].length).toBe(4);
  });
  it('groupConsecutive test 4: two groups of 5', () => {
    const r = groupConsecutive([0, 0, 0, 0, 0, 1, 1, 1, 1, 1], x => x);
    expect(r.length).toBe(2);
    expect(r[0].length).toBe(5);
    expect(r[1].length).toBe(5);
  });
  it('groupConsecutive test 5: two groups of 6', () => {
    const r = groupConsecutive([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], x => x);
    expect(r.length).toBe(2);
    expect(r[0].length).toBe(6);
    expect(r[1].length).toBe(6);
  });
  it('groupConsecutive test 6: two groups of 7', () => {
    const r = groupConsecutive([0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1], x => x);
    expect(r.length).toBe(2);
    expect(r[0].length).toBe(7);
    expect(r[1].length).toBe(7);
  });
  it('groupConsecutive test 7: two groups of 8', () => {
    const r = groupConsecutive([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1], x => x);
    expect(r.length).toBe(2);
    expect(r[0].length).toBe(8);
    expect(r[1].length).toBe(8);
  });
  it('groupConsecutive test 8: two groups of 9', () => {
    const r = groupConsecutive([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1], x => x);
    expect(r.length).toBe(2);
    expect(r[0].length).toBe(9);
    expect(r[1].length).toBe(9);
  });
  it('groupConsecutive test 9: two groups of 10', () => {
    const r = groupConsecutive([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], x => x);
    expect(r.length).toBe(2);
    expect(r[0].length).toBe(10);
    expect(r[1].length).toBe(10);
  });
  it('groupConsecutive test 10: two groups of 11', () => {
    const r = groupConsecutive([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], x => x);
    expect(r.length).toBe(2);
    expect(r[0].length).toBe(11);
    expect(r[1].length).toBe(11);
  });
  it('groupConsecutive test 11: two groups of 12', () => {
    const r = groupConsecutive([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], x => x);
    expect(r.length).toBe(2);
    expect(r[0].length).toBe(12);
    expect(r[1].length).toBe(12);
  });
  it('groupConsecutive test 12: two groups of 13', () => {
    const r = groupConsecutive([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], x => x);
    expect(r.length).toBe(2);
    expect(r[0].length).toBe(13);
    expect(r[1].length).toBe(13);
  });
  it('groupConsecutive test 13: two groups of 14', () => {
    const r = groupConsecutive([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], x => x);
    expect(r.length).toBe(2);
    expect(r[0].length).toBe(14);
    expect(r[1].length).toBe(14);
  });
  it('groupConsecutive test 14: two groups of 15', () => {
    const r = groupConsecutive([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], x => x);
    expect(r.length).toBe(2);
    expect(r[0].length).toBe(15);
    expect(r[1].length).toBe(15);
  });
  it('groupConsecutive test 15: two groups of 16', () => {
    const r = groupConsecutive([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], x => x);
    expect(r.length).toBe(2);
    expect(r[0].length).toBe(16);
    expect(r[1].length).toBe(16);
  });
  it('groupConsecutive test 16: alternating 6 elements = 6 groups', () => {
    const r = groupConsecutive([0, 1, 2, 3, 4, 5], x => x);
    expect(r.length).toBe(6);
  });
  it('groupConsecutive test 17: alternating 7 elements = 7 groups', () => {
    const r = groupConsecutive([0, 1, 2, 3, 4, 5, 6], x => x);
    expect(r.length).toBe(7);
  });
  it('groupConsecutive test 18: alternating 8 elements = 8 groups', () => {
    const r = groupConsecutive([0, 1, 2, 3, 4, 5, 6, 7], x => x);
    expect(r.length).toBe(8);
  });
  it('groupConsecutive test 19: alternating 9 elements = 9 groups', () => {
    const r = groupConsecutive([0, 1, 2, 3, 4, 5, 6, 7, 8], x => x);
    expect(r.length).toBe(9);
  });
  it('groupConsecutive test 20: alternating 10 elements = 10 groups', () => {
    const r = groupConsecutive([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], x => x);
    expect(r.length).toBe(10);
  });
  it('groupConsecutive test 21: alternating 11 elements = 11 groups', () => {
    const r = groupConsecutive([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], x => x);
    expect(r.length).toBe(11);
  });
  it('groupConsecutive test 22: alternating 12 elements = 12 groups', () => {
    const r = groupConsecutive([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], x => x);
    expect(r.length).toBe(12);
  });
  it('groupConsecutive test 23: alternating 13 elements = 13 groups', () => {
    const r = groupConsecutive([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], x => x);
    expect(r.length).toBe(13);
  });
  it('groupConsecutive test 24: alternating 14 elements = 14 groups', () => {
    const r = groupConsecutive([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], x => x);
    expect(r.length).toBe(14);
  });
  it('groupConsecutive test 25: alternating 15 elements = 15 groups', () => {
    const r = groupConsecutive([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], x => x);
    expect(r.length).toBe(15);
  });
  it('groupConsecutive test 26: alternating 16 elements = 16 groups', () => {
    const r = groupConsecutive([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], x => x);
    expect(r.length).toBe(16);
  });
  it('groupConsecutive test 27: alternating 17 elements = 17 groups', () => {
    const r = groupConsecutive([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], x => x);
    expect(r.length).toBe(17);
  });
  it('groupConsecutive test 28: alternating 18 elements = 18 groups', () => {
    const r = groupConsecutive([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], x => x);
    expect(r.length).toBe(18);
  });
  it('groupConsecutive test 29: alternating 19 elements = 19 groups', () => {
    const r = groupConsecutive([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], x => x);
    expect(r.length).toBe(19);
  });
  it('groupConsecutive test 30: alternating 20 elements = 20 groups', () => {
    const r = groupConsecutive([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], x => x);
    expect(r.length).toBe(20);
  });
});

