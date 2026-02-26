// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

import { IntervalTree, SegmentTree, FenwickTree, SweepLine, createIntervalTree, fromIntervals, pointInAny, findIntervalsContaining, mergeIntervals, totalCoverage, intervalsOverlap, countOverlappingPairs, maxOverlap } from '../interval-tree';

describe('IntervalTree insert and size', () => {
  it("size 1 after 1 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 1; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(1);
  });
  it("size 2 after 2 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 2; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(2);
  });
  it("size 3 after 3 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 3; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(3);
  });
  it("size 4 after 4 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 4; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(4);
  });
  it("size 5 after 5 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 5; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(5);
  });
  it("size 6 after 6 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 6; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(6);
  });
  it("size 7 after 7 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 7; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(7);
  });
  it("size 8 after 8 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 8; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(8);
  });
  it("size 9 after 9 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 9; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(9);
  });
  it("size 10 after 10 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 10; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(10);
  });
  it("size 11 after 11 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 11; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(11);
  });
  it("size 12 after 12 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 12; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(12);
  });
  it("size 13 after 13 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 13; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(13);
  });
  it("size 14 after 14 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 14; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(14);
  });
  it("size 15 after 15 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 15; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(15);
  });
  it("size 16 after 16 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 16; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(16);
  });
  it("size 17 after 17 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 17; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(17);
  });
  it("size 18 after 18 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 18; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(18);
  });
  it("size 19 after 19 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 19; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(19);
  });
  it("size 20 after 20 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 20; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(20);
  });
  it("size 21 after 21 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 21; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(21);
  });
  it("size 22 after 22 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 22; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(22);
  });
  it("size 23 after 23 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 23; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(23);
  });
  it("size 24 after 24 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 24; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(24);
  });
  it("size 25 after 25 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 25; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(25);
  });
  it("size 26 after 26 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 26; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(26);
  });
  it("size 27 after 27 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 27; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(27);
  });
  it("size 28 after 28 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 28; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(28);
  });
  it("size 29 after 29 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 29; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(29);
  });
  it("size 30 after 30 inserts", () => {
    const t = new IntervalTree();
    for (let j = 0; j < 30; j++) t.insert({ lo: j, hi: j+5 });
    expect(t.size).toBe(30);
  });
  it("size 0 fresh tree 0", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 1", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 2", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 3", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 4", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 5", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 6", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 7", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 8", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 9", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 10", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 11", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 12", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 13", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 14", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 15", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 16", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 17", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 18", () => {
    expect(new IntervalTree().size).toBe(0);
  });
  it("size 0 fresh tree 19", () => {
    expect(new IntervalTree().size).toBe(0);
  });
});

describe('IntervalTree findOverlapping basic', () => {
  it("overlap [0,4] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 4 });
    const res = t.findOverlapping(0,4);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(0);
  });
  it("overlap [3,7] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 3, hi: 7 });
    const res = t.findOverlapping(3,7);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(3);
  });
  it("overlap [6,10] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 6, hi: 10 });
    const res = t.findOverlapping(6,10);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(6);
  });
  it("overlap [9,13] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 9, hi: 13 });
    const res = t.findOverlapping(9,13);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(9);
  });
  it("overlap [12,16] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 12, hi: 16 });
    const res = t.findOverlapping(12,16);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(12);
  });
  it("overlap [15,19] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 15, hi: 19 });
    const res = t.findOverlapping(15,19);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(15);
  });
  it("overlap [18,22] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 18, hi: 22 });
    const res = t.findOverlapping(18,22);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(18);
  });
  it("overlap [21,25] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 21, hi: 25 });
    const res = t.findOverlapping(21,25);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(21);
  });
  it("overlap [24,28] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 24, hi: 28 });
    const res = t.findOverlapping(24,28);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(24);
  });
  it("overlap [27,31] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 27, hi: 31 });
    const res = t.findOverlapping(27,31);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(27);
  });
  it("overlap [30,34] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 30, hi: 34 });
    const res = t.findOverlapping(30,34);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(30);
  });
  it("overlap [33,37] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 33, hi: 37 });
    const res = t.findOverlapping(33,37);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(33);
  });
  it("overlap [36,40] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 36, hi: 40 });
    const res = t.findOverlapping(36,40);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(36);
  });
  it("overlap [39,43] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 39, hi: 43 });
    const res = t.findOverlapping(39,43);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(39);
  });
  it("overlap [42,46] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 42, hi: 46 });
    const res = t.findOverlapping(42,46);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(42);
  });
  it("overlap [45,49] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 45, hi: 49 });
    const res = t.findOverlapping(45,49);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(45);
  });
  it("overlap [48,52] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 48, hi: 52 });
    const res = t.findOverlapping(48,52);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(48);
  });
  it("overlap [51,55] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 51, hi: 55 });
    const res = t.findOverlapping(51,55);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(51);
  });
  it("overlap [54,58] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 54, hi: 58 });
    const res = t.findOverlapping(54,58);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(54);
  });
  it("overlap [57,61] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 57, hi: 61 });
    const res = t.findOverlapping(57,61);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(57);
  });
  it("overlap [60,64] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 60, hi: 64 });
    const res = t.findOverlapping(60,64);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(60);
  });
  it("overlap [63,67] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 63, hi: 67 });
    const res = t.findOverlapping(63,67);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(63);
  });
  it("overlap [66,70] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 66, hi: 70 });
    const res = t.findOverlapping(66,70);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(66);
  });
  it("overlap [69,73] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 69, hi: 73 });
    const res = t.findOverlapping(69,73);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(69);
  });
  it("overlap [72,76] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 72, hi: 76 });
    const res = t.findOverlapping(72,76);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(72);
  });
  it("overlap [75,79] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 75, hi: 79 });
    const res = t.findOverlapping(75,79);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(75);
  });
  it("overlap [78,82] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 78, hi: 82 });
    const res = t.findOverlapping(78,82);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(78);
  });
  it("overlap [81,85] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 81, hi: 85 });
    const res = t.findOverlapping(81,85);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(81);
  });
  it("overlap [84,88] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 84, hi: 88 });
    const res = t.findOverlapping(84,88);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(84);
  });
  it("overlap [87,91] exact", () => {
    const t = new IntervalTree();
    t.insert({ lo: 87, hi: 91 });
    const res = t.findOverlapping(87,91);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(87);
  });
  it("no overlap [100,103] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(100,103)).toEqual([]);
  });
  it("no overlap [110,113] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(110,113)).toEqual([]);
  });
  it("no overlap [120,123] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(120,123)).toEqual([]);
  });
  it("no overlap [130,133] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(130,133)).toEqual([]);
  });
  it("no overlap [140,143] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(140,143)).toEqual([]);
  });
  it("no overlap [150,153] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(150,153)).toEqual([]);
  });
  it("no overlap [160,163] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(160,163)).toEqual([]);
  });
  it("no overlap [170,173] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(170,173)).toEqual([]);
  });
  it("no overlap [180,183] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(180,183)).toEqual([]);
  });
  it("no overlap [190,193] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(190,193)).toEqual([]);
  });
  it("no overlap [200,203] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(200,203)).toEqual([]);
  });
  it("no overlap [210,213] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(210,213)).toEqual([]);
  });
  it("no overlap [220,223] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(220,223)).toEqual([]);
  });
  it("no overlap [230,233] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(230,233)).toEqual([]);
  });
  it("no overlap [240,243] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(240,243)).toEqual([]);
  });
  it("no overlap [250,253] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(250,253)).toEqual([]);
  });
  it("no overlap [260,263] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(260,263)).toEqual([]);
  });
  it("no overlap [270,273] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(270,273)).toEqual([]);
  });
  it("no overlap [280,283] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(280,283)).toEqual([]);
  });
  it("no overlap [290,293] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(290,293)).toEqual([]);
  });
  it("no overlap [300,303] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(300,303)).toEqual([]);
  });
  it("no overlap [310,313] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(310,313)).toEqual([]);
  });
  it("no overlap [320,323] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(320,323)).toEqual([]);
  });
  it("no overlap [330,333] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(330,333)).toEqual([]);
  });
  it("no overlap [340,343] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(340,343)).toEqual([]);
  });
  it("no overlap [350,353] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(350,353)).toEqual([]);
  });
  it("no overlap [360,363] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(360,363)).toEqual([]);
  });
  it("no overlap [370,373] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(370,373)).toEqual([]);
  });
  it("no overlap [380,383] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(380,383)).toEqual([]);
  });
  it("no overlap [390,393] vs [0,5]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findOverlapping(390,393)).toEqual([]);
  });
});

describe('IntervalTree touching endpoints', () => {
  it("[0,4] overlaps at lo", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 4 });
    expect(t.findOverlapping(-2,0).length).toBe(1);
  });
  it("[5,9] overlaps at lo", () => {
    const t = new IntervalTree();
    t.insert({ lo: 5, hi: 9 });
    expect(t.findOverlapping(3,5).length).toBe(1);
  });
  it("[10,14] overlaps at lo", () => {
    const t = new IntervalTree();
    t.insert({ lo: 10, hi: 14 });
    expect(t.findOverlapping(8,10).length).toBe(1);
  });
  it("[15,19] overlaps at lo", () => {
    const t = new IntervalTree();
    t.insert({ lo: 15, hi: 19 });
    expect(t.findOverlapping(13,15).length).toBe(1);
  });
  it("[20,24] overlaps at lo", () => {
    const t = new IntervalTree();
    t.insert({ lo: 20, hi: 24 });
    expect(t.findOverlapping(18,20).length).toBe(1);
  });
  it("[25,29] overlaps at lo", () => {
    const t = new IntervalTree();
    t.insert({ lo: 25, hi: 29 });
    expect(t.findOverlapping(23,25).length).toBe(1);
  });
  it("[30,34] overlaps at lo", () => {
    const t = new IntervalTree();
    t.insert({ lo: 30, hi: 34 });
    expect(t.findOverlapping(28,30).length).toBe(1);
  });
  it("[35,39] overlaps at lo", () => {
    const t = new IntervalTree();
    t.insert({ lo: 35, hi: 39 });
    expect(t.findOverlapping(33,35).length).toBe(1);
  });
  it("[40,44] overlaps at lo", () => {
    const t = new IntervalTree();
    t.insert({ lo: 40, hi: 44 });
    expect(t.findOverlapping(38,40).length).toBe(1);
  });
  it("[45,49] overlaps at lo", () => {
    const t = new IntervalTree();
    t.insert({ lo: 45, hi: 49 });
    expect(t.findOverlapping(43,45).length).toBe(1);
  });
  it("[50,54] overlaps at lo", () => {
    const t = new IntervalTree();
    t.insert({ lo: 50, hi: 54 });
    expect(t.findOverlapping(48,50).length).toBe(1);
  });
  it("[55,59] overlaps at lo", () => {
    const t = new IntervalTree();
    t.insert({ lo: 55, hi: 59 });
    expect(t.findOverlapping(53,55).length).toBe(1);
  });
  it("[60,64] overlaps at lo", () => {
    const t = new IntervalTree();
    t.insert({ lo: 60, hi: 64 });
    expect(t.findOverlapping(58,60).length).toBe(1);
  });
  it("[65,69] overlaps at lo", () => {
    const t = new IntervalTree();
    t.insert({ lo: 65, hi: 69 });
    expect(t.findOverlapping(63,65).length).toBe(1);
  });
  it("[70,74] overlaps at lo", () => {
    const t = new IntervalTree();
    t.insert({ lo: 70, hi: 74 });
    expect(t.findOverlapping(68,70).length).toBe(1);
  });
  it("[1,5] overlaps at hi", () => {
    const t = new IntervalTree();
    t.insert({ lo: 1, hi: 5 });
    expect(t.findOverlapping(5,9).length).toBe(1);
  });
  it("[6,10] overlaps at hi", () => {
    const t = new IntervalTree();
    t.insert({ lo: 6, hi: 10 });
    expect(t.findOverlapping(10,14).length).toBe(1);
  });
  it("[11,15] overlaps at hi", () => {
    const t = new IntervalTree();
    t.insert({ lo: 11, hi: 15 });
    expect(t.findOverlapping(15,19).length).toBe(1);
  });
  it("[16,20] overlaps at hi", () => {
    const t = new IntervalTree();
    t.insert({ lo: 16, hi: 20 });
    expect(t.findOverlapping(20,24).length).toBe(1);
  });
  it("[21,25] overlaps at hi", () => {
    const t = new IntervalTree();
    t.insert({ lo: 21, hi: 25 });
    expect(t.findOverlapping(25,29).length).toBe(1);
  });
  it("[26,30] overlaps at hi", () => {
    const t = new IntervalTree();
    t.insert({ lo: 26, hi: 30 });
    expect(t.findOverlapping(30,34).length).toBe(1);
  });
  it("[31,35] overlaps at hi", () => {
    const t = new IntervalTree();
    t.insert({ lo: 31, hi: 35 });
    expect(t.findOverlapping(35,39).length).toBe(1);
  });
  it("[36,40] overlaps at hi", () => {
    const t = new IntervalTree();
    t.insert({ lo: 36, hi: 40 });
    expect(t.findOverlapping(40,44).length).toBe(1);
  });
  it("[41,45] overlaps at hi", () => {
    const t = new IntervalTree();
    t.insert({ lo: 41, hi: 45 });
    expect(t.findOverlapping(45,49).length).toBe(1);
  });
  it("[46,50] overlaps at hi", () => {
    const t = new IntervalTree();
    t.insert({ lo: 46, hi: 50 });
    expect(t.findOverlapping(50,54).length).toBe(1);
  });
  it("[51,55] overlaps at hi", () => {
    const t = new IntervalTree();
    t.insert({ lo: 51, hi: 55 });
    expect(t.findOverlapping(55,59).length).toBe(1);
  });
  it("[56,60] overlaps at hi", () => {
    const t = new IntervalTree();
    t.insert({ lo: 56, hi: 60 });
    expect(t.findOverlapping(60,64).length).toBe(1);
  });
  it("[61,65] overlaps at hi", () => {
    const t = new IntervalTree();
    t.insert({ lo: 61, hi: 65 });
    expect(t.findOverlapping(65,69).length).toBe(1);
  });
  it("[66,70] overlaps at hi", () => {
    const t = new IntervalTree();
    t.insert({ lo: 66, hi: 70 });
    expect(t.findOverlapping(70,74).length).toBe(1);
  });
  it("[71,75] overlaps at hi", () => {
    const t = new IntervalTree();
    t.insert({ lo: 71, hi: 75 });
    expect(t.findOverlapping(75,79).length).toBe(1);
  });
});

describe('IntervalTree findContaining', () => {
  it("findContaining(3) in [0,6]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 6 });
    const res = t.findContaining(3);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(0);
  });
  it("findContaining(7) in [4,10]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 4, hi: 10 });
    const res = t.findContaining(7);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(4);
  });
  it("findContaining(11) in [8,14]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 8, hi: 14 });
    const res = t.findContaining(11);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(8);
  });
  it("findContaining(15) in [12,18]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 12, hi: 18 });
    const res = t.findContaining(15);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(12);
  });
  it("findContaining(19) in [16,22]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 16, hi: 22 });
    const res = t.findContaining(19);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(16);
  });
  it("findContaining(23) in [20,26]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 20, hi: 26 });
    const res = t.findContaining(23);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(20);
  });
  it("findContaining(27) in [24,30]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 24, hi: 30 });
    const res = t.findContaining(27);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(24);
  });
  it("findContaining(31) in [28,34]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 28, hi: 34 });
    const res = t.findContaining(31);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(28);
  });
  it("findContaining(35) in [32,38]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 32, hi: 38 });
    const res = t.findContaining(35);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(32);
  });
  it("findContaining(39) in [36,42]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 36, hi: 42 });
    const res = t.findContaining(39);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(36);
  });
  it("findContaining(43) in [40,46]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 40, hi: 46 });
    const res = t.findContaining(43);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(40);
  });
  it("findContaining(47) in [44,50]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 44, hi: 50 });
    const res = t.findContaining(47);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(44);
  });
  it("findContaining(51) in [48,54]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 48, hi: 54 });
    const res = t.findContaining(51);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(48);
  });
  it("findContaining(55) in [52,58]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 52, hi: 58 });
    const res = t.findContaining(55);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(52);
  });
  it("findContaining(59) in [56,62]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 56, hi: 62 });
    const res = t.findContaining(59);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(56);
  });
  it("findContaining(63) in [60,66]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 60, hi: 66 });
    const res = t.findContaining(63);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(60);
  });
  it("findContaining(67) in [64,70]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 64, hi: 70 });
    const res = t.findContaining(67);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(64);
  });
  it("findContaining(71) in [68,74]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 68, hi: 74 });
    const res = t.findContaining(71);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(68);
  });
  it("findContaining(75) in [72,78]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 72, hi: 78 });
    const res = t.findContaining(75);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(72);
  });
  it("findContaining(79) in [76,82]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 76, hi: 82 });
    const res = t.findContaining(79);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(76);
  });
  it("findContaining(83) in [80,86]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 80, hi: 86 });
    const res = t.findContaining(83);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(80);
  });
  it("findContaining(87) in [84,90]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 84, hi: 90 });
    const res = t.findContaining(87);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(84);
  });
  it("findContaining(91) in [88,94]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 88, hi: 94 });
    const res = t.findContaining(91);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(88);
  });
  it("findContaining(95) in [92,98]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 92, hi: 98 });
    const res = t.findContaining(95);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(92);
  });
  it("findContaining(99) in [96,102]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 96, hi: 102 });
    const res = t.findContaining(99);
    expect(res.length).toBe(1);
    expect(res[0].lo).toBe(96);
  });
  it("findContaining(7) misses [0,6]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 6 });
    expect(t.findContaining(7)).toEqual([]);
  });
  it("findContaining(11) misses [4,10]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 4, hi: 10 });
    expect(t.findContaining(11)).toEqual([]);
  });
  it("findContaining(15) misses [8,14]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 8, hi: 14 });
    expect(t.findContaining(15)).toEqual([]);
  });
  it("findContaining(19) misses [12,18]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 12, hi: 18 });
    expect(t.findContaining(19)).toEqual([]);
  });
  it("findContaining(23) misses [16,22]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 16, hi: 22 });
    expect(t.findContaining(23)).toEqual([]);
  });
  it("findContaining(27) misses [20,26]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 20, hi: 26 });
    expect(t.findContaining(27)).toEqual([]);
  });
  it("findContaining(31) misses [24,30]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 24, hi: 30 });
    expect(t.findContaining(31)).toEqual([]);
  });
  it("findContaining(35) misses [28,34]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 28, hi: 34 });
    expect(t.findContaining(35)).toEqual([]);
  });
  it("findContaining(39) misses [32,38]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 32, hi: 38 });
    expect(t.findContaining(39)).toEqual([]);
  });
  it("findContaining(43) misses [36,42]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 36, hi: 42 });
    expect(t.findContaining(43)).toEqual([]);
  });
  it("findContaining(47) misses [40,46]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 40, hi: 46 });
    expect(t.findContaining(47)).toEqual([]);
  });
  it("findContaining(51) misses [44,50]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 44, hi: 50 });
    expect(t.findContaining(51)).toEqual([]);
  });
  it("findContaining(55) misses [48,54]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 48, hi: 54 });
    expect(t.findContaining(55)).toEqual([]);
  });
  it("findContaining(59) misses [52,58]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 52, hi: 58 });
    expect(t.findContaining(59)).toEqual([]);
  });
  it("findContaining(63) misses [56,62]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 56, hi: 62 });
    expect(t.findContaining(63)).toEqual([]);
  });
  it("findContaining(67) misses [60,66]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 60, hi: 66 });
    expect(t.findContaining(67)).toEqual([]);
  });
  it("findContaining(71) misses [64,70]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 64, hi: 70 });
    expect(t.findContaining(71)).toEqual([]);
  });
  it("findContaining(75) misses [68,74]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 68, hi: 74 });
    expect(t.findContaining(75)).toEqual([]);
  });
  it("findContaining(79) misses [72,78]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 72, hi: 78 });
    expect(t.findContaining(79)).toEqual([]);
  });
  it("findContaining(83) misses [76,82]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 76, hi: 82 });
    expect(t.findContaining(83)).toEqual([]);
  });
  it("findContaining(87) misses [80,86]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 80, hi: 86 });
    expect(t.findContaining(87)).toEqual([]);
  });
  it("findContaining(91) misses [84,90]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 84, hi: 90 });
    expect(t.findContaining(91)).toEqual([]);
  });
  it("findContaining(95) misses [88,94]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 88, hi: 94 });
    expect(t.findContaining(95)).toEqual([]);
  });
  it("findContaining(99) misses [92,98]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 92, hi: 98 });
    expect(t.findContaining(99)).toEqual([]);
  });
  it("findContaining(103) misses [96,102]", () => {
    const t = new IntervalTree();
    t.insert({ lo: 96, hi: 102 });
    expect(t.findContaining(103)).toEqual([]);
  });
});

describe('IntervalTree findExact', () => {
  it("findExact(0,5) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    const r = t.findExact(0,5);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(0);
  });
  it("findExact(7,12) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 7, hi: 12 });
    const r = t.findExact(7,12);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(7);
  });
  it("findExact(14,19) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 14, hi: 19 });
    const r = t.findExact(14,19);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(14);
  });
  it("findExact(21,26) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 21, hi: 26 });
    const r = t.findExact(21,26);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(21);
  });
  it("findExact(28,33) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 28, hi: 33 });
    const r = t.findExact(28,33);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(28);
  });
  it("findExact(35,40) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 35, hi: 40 });
    const r = t.findExact(35,40);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(35);
  });
  it("findExact(42,47) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 42, hi: 47 });
    const r = t.findExact(42,47);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(42);
  });
  it("findExact(49,54) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 49, hi: 54 });
    const r = t.findExact(49,54);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(49);
  });
  it("findExact(56,61) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 56, hi: 61 });
    const r = t.findExact(56,61);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(56);
  });
  it("findExact(63,68) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 63, hi: 68 });
    const r = t.findExact(63,68);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(63);
  });
  it("findExact(70,75) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 70, hi: 75 });
    const r = t.findExact(70,75);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(70);
  });
  it("findExact(77,82) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 77, hi: 82 });
    const r = t.findExact(77,82);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(77);
  });
  it("findExact(84,89) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 84, hi: 89 });
    const r = t.findExact(84,89);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(84);
  });
  it("findExact(91,96) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 91, hi: 96 });
    const r = t.findExact(91,96);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(91);
  });
  it("findExact(98,103) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 98, hi: 103 });
    const r = t.findExact(98,103);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(98);
  });
  it("findExact(105,110) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 105, hi: 110 });
    const r = t.findExact(105,110);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(105);
  });
  it("findExact(112,117) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 112, hi: 117 });
    const r = t.findExact(112,117);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(112);
  });
  it("findExact(119,124) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 119, hi: 124 });
    const r = t.findExact(119,124);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(119);
  });
  it("findExact(126,131) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 126, hi: 131 });
    const r = t.findExact(126,131);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(126);
  });
  it("findExact(133,138) defined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 133, hi: 138 });
    const r = t.findExact(133,138);
    expect(r).toBeDefined();
    expect(r!.lo).toBe(133);
  });
  it("findExact(0,6) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findExact(0,6)).toBeUndefined();
  });
  it("findExact(7,13) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 7, hi: 12 });
    expect(t.findExact(7,13)).toBeUndefined();
  });
  it("findExact(14,20) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 14, hi: 19 });
    expect(t.findExact(14,20)).toBeUndefined();
  });
  it("findExact(21,27) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 21, hi: 26 });
    expect(t.findExact(21,27)).toBeUndefined();
  });
  it("findExact(28,34) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 28, hi: 33 });
    expect(t.findExact(28,34)).toBeUndefined();
  });
  it("findExact(35,41) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 35, hi: 40 });
    expect(t.findExact(35,41)).toBeUndefined();
  });
  it("findExact(42,48) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 42, hi: 47 });
    expect(t.findExact(42,48)).toBeUndefined();
  });
  it("findExact(49,55) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 49, hi: 54 });
    expect(t.findExact(49,55)).toBeUndefined();
  });
  it("findExact(56,62) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 56, hi: 61 });
    expect(t.findExact(56,62)).toBeUndefined();
  });
  it("findExact(63,69) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 63, hi: 68 });
    expect(t.findExact(63,69)).toBeUndefined();
  });
  it("findExact(70,76) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 70, hi: 75 });
    expect(t.findExact(70,76)).toBeUndefined();
  });
  it("findExact(77,83) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 77, hi: 82 });
    expect(t.findExact(77,83)).toBeUndefined();
  });
  it("findExact(84,90) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 84, hi: 89 });
    expect(t.findExact(84,90)).toBeUndefined();
  });
  it("findExact(91,97) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 91, hi: 96 });
    expect(t.findExact(91,97)).toBeUndefined();
  });
  it("findExact(98,104) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 98, hi: 103 });
    expect(t.findExact(98,104)).toBeUndefined();
  });
  it("findExact(105,111) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 105, hi: 110 });
    expect(t.findExact(105,111)).toBeUndefined();
  });
  it("findExact(112,118) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 112, hi: 117 });
    expect(t.findExact(112,118)).toBeUndefined();
  });
  it("findExact(119,125) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 119, hi: 124 });
    expect(t.findExact(119,125)).toBeUndefined();
  });
  it("findExact(126,132) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 126, hi: 131 });
    expect(t.findExact(126,132)).toBeUndefined();
  });
  it("findExact(133,139) undefined", () => {
    const t = new IntervalTree();
    t.insert({ lo: 133, hi: 138 });
    expect(t.findExact(133,139)).toBeUndefined();
  });
});

describe('IntervalTree remove', () => {
  it("remove(0,4) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 4 });
    expect(t.remove(0,4)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(6,10) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 6, hi: 10 });
    expect(t.remove(6,10)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(12,16) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 12, hi: 16 });
    expect(t.remove(12,16)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(18,22) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 18, hi: 22 });
    expect(t.remove(18,22)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(24,28) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 24, hi: 28 });
    expect(t.remove(24,28)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(30,34) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 30, hi: 34 });
    expect(t.remove(30,34)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(36,40) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 36, hi: 40 });
    expect(t.remove(36,40)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(42,46) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 42, hi: 46 });
    expect(t.remove(42,46)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(48,52) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 48, hi: 52 });
    expect(t.remove(48,52)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(54,58) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 54, hi: 58 });
    expect(t.remove(54,58)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(60,64) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 60, hi: 64 });
    expect(t.remove(60,64)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(66,70) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 66, hi: 70 });
    expect(t.remove(66,70)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(72,76) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 72, hi: 76 });
    expect(t.remove(72,76)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(78,82) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 78, hi: 82 });
    expect(t.remove(78,82)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(84,88) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 84, hi: 88 });
    expect(t.remove(84,88)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(90,94) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 90, hi: 94 });
    expect(t.remove(90,94)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(96,100) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 96, hi: 100 });
    expect(t.remove(96,100)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(102,106) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 102, hi: 106 });
    expect(t.remove(102,106)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(108,112) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 108, hi: 112 });
    expect(t.remove(108,112)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(114,118) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 114, hi: 118 });
    expect(t.remove(114,118)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(120,124) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 120, hi: 124 });
    expect(t.remove(120,124)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(126,130) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 126, hi: 130 });
    expect(t.remove(126,130)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(132,136) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 132, hi: 136 });
    expect(t.remove(132,136)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(138,142) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 138, hi: 142 });
    expect(t.remove(138,142)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(144,148) true", () => {
    const t = new IntervalTree();
    t.insert({ lo: 144, hi: 148 });
    expect(t.remove(144,148)).toBe(true);
    expect(t.size).toBe(0);
  });
  it("remove(1,4) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 4 });
    expect(t.remove(1,4)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(7,10) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 6, hi: 10 });
    expect(t.remove(7,10)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(13,16) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 12, hi: 16 });
    expect(t.remove(13,16)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(19,22) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 18, hi: 22 });
    expect(t.remove(19,22)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(25,28) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 24, hi: 28 });
    expect(t.remove(25,28)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(31,34) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 30, hi: 34 });
    expect(t.remove(31,34)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(37,40) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 36, hi: 40 });
    expect(t.remove(37,40)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(43,46) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 42, hi: 46 });
    expect(t.remove(43,46)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(49,52) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 48, hi: 52 });
    expect(t.remove(49,52)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(55,58) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 54, hi: 58 });
    expect(t.remove(55,58)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(61,64) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 60, hi: 64 });
    expect(t.remove(61,64)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(67,70) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 66, hi: 70 });
    expect(t.remove(67,70)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(73,76) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 72, hi: 76 });
    expect(t.remove(73,76)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(79,82) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 78, hi: 82 });
    expect(t.remove(79,82)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(85,88) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 84, hi: 88 });
    expect(t.remove(85,88)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(91,94) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 90, hi: 94 });
    expect(t.remove(91,94)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(97,100) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 96, hi: 100 });
    expect(t.remove(97,100)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(103,106) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 102, hi: 106 });
    expect(t.remove(103,106)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(109,112) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 108, hi: 112 });
    expect(t.remove(109,112)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(115,118) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 114, hi: 118 });
    expect(t.remove(115,118)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(121,124) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 120, hi: 124 });
    expect(t.remove(121,124)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(127,130) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 126, hi: 130 });
    expect(t.remove(127,130)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(133,136) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 132, hi: 136 });
    expect(t.remove(133,136)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(139,142) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 138, hi: 142 });
    expect(t.remove(139,142)).toBe(false);
    expect(t.size).toBe(1);
  });
  it("remove(145,148) false", () => {
    const t = new IntervalTree();
    t.insert({ lo: 144, hi: 148 });
    expect(t.remove(145,148)).toBe(false);
    expect(t.size).toBe(1);
  });
});

describe('IntervalTree clear and toArray', () => {
  it("clear resets size 1", () => {
    const t = new IntervalTree();
    for (let j=0;j<1;j++) t.insert({lo:j,hi:j+2});
    t.clear();
    expect(t.size).toBe(0);
    expect(t.toArray()).toEqual([]);
  });
  it("clear resets size 2", () => {
    const t = new IntervalTree();
    for (let j=0;j<2;j++) t.insert({lo:j,hi:j+2});
    t.clear();
    expect(t.size).toBe(0);
    expect(t.toArray()).toEqual([]);
  });
  it("clear resets size 3", () => {
    const t = new IntervalTree();
    for (let j=0;j<3;j++) t.insert({lo:j,hi:j+2});
    t.clear();
    expect(t.size).toBe(0);
    expect(t.toArray()).toEqual([]);
  });
  it("clear resets size 4", () => {
    const t = new IntervalTree();
    for (let j=0;j<4;j++) t.insert({lo:j,hi:j+2});
    t.clear();
    expect(t.size).toBe(0);
    expect(t.toArray()).toEqual([]);
  });
  it("clear resets size 5", () => {
    const t = new IntervalTree();
    for (let j=0;j<5;j++) t.insert({lo:j,hi:j+2});
    t.clear();
    expect(t.size).toBe(0);
    expect(t.toArray()).toEqual([]);
  });
  it("clear resets size 6", () => {
    const t = new IntervalTree();
    for (let j=0;j<6;j++) t.insert({lo:j,hi:j+2});
    t.clear();
    expect(t.size).toBe(0);
    expect(t.toArray()).toEqual([]);
  });
  it("clear resets size 7", () => {
    const t = new IntervalTree();
    for (let j=0;j<7;j++) t.insert({lo:j,hi:j+2});
    t.clear();
    expect(t.size).toBe(0);
    expect(t.toArray()).toEqual([]);
  });
  it("clear resets size 8", () => {
    const t = new IntervalTree();
    for (let j=0;j<8;j++) t.insert({lo:j,hi:j+2});
    t.clear();
    expect(t.size).toBe(0);
    expect(t.toArray()).toEqual([]);
  });
  it("clear resets size 9", () => {
    const t = new IntervalTree();
    for (let j=0;j<9;j++) t.insert({lo:j,hi:j+2});
    t.clear();
    expect(t.size).toBe(0);
    expect(t.toArray()).toEqual([]);
  });
  it("clear resets size 10", () => {
    const t = new IntervalTree();
    for (let j=0;j<10;j++) t.insert({lo:j,hi:j+2});
    t.clear();
    expect(t.size).toBe(0);
    expect(t.toArray()).toEqual([]);
  });
  it("clear resets size 11", () => {
    const t = new IntervalTree();
    for (let j=0;j<11;j++) t.insert({lo:j,hi:j+2});
    t.clear();
    expect(t.size).toBe(0);
    expect(t.toArray()).toEqual([]);
  });
  it("clear resets size 12", () => {
    const t = new IntervalTree();
    for (let j=0;j<12;j++) t.insert({lo:j,hi:j+2});
    t.clear();
    expect(t.size).toBe(0);
    expect(t.toArray()).toEqual([]);
  });
  it("clear resets size 13", () => {
    const t = new IntervalTree();
    for (let j=0;j<13;j++) t.insert({lo:j,hi:j+2});
    t.clear();
    expect(t.size).toBe(0);
    expect(t.toArray()).toEqual([]);
  });
  it("clear resets size 14", () => {
    const t = new IntervalTree();
    for (let j=0;j<14;j++) t.insert({lo:j,hi:j+2});
    t.clear();
    expect(t.size).toBe(0);
    expect(t.toArray()).toEqual([]);
  });
  it("clear resets size 15", () => {
    const t = new IntervalTree();
    for (let j=0;j<15;j++) t.insert({lo:j,hi:j+2});
    t.clear();
    expect(t.size).toBe(0);
    expect(t.toArray()).toEqual([]);
  });
  it("toArray returns 1 items", () => {
    const t = new IntervalTree();
    for (let j=0;j<1;j++) t.insert({lo:j*3,hi:j*3+2});
    expect(t.toArray().length).toBe(1);
  });
  it("toArray returns 2 items", () => {
    const t = new IntervalTree();
    for (let j=0;j<2;j++) t.insert({lo:j*3,hi:j*3+2});
    expect(t.toArray().length).toBe(2);
  });
  it("toArray returns 3 items", () => {
    const t = new IntervalTree();
    for (let j=0;j<3;j++) t.insert({lo:j*3,hi:j*3+2});
    expect(t.toArray().length).toBe(3);
  });
  it("toArray returns 4 items", () => {
    const t = new IntervalTree();
    for (let j=0;j<4;j++) t.insert({lo:j*3,hi:j*3+2});
    expect(t.toArray().length).toBe(4);
  });
  it("toArray returns 5 items", () => {
    const t = new IntervalTree();
    for (let j=0;j<5;j++) t.insert({lo:j*3,hi:j*3+2});
    expect(t.toArray().length).toBe(5);
  });
  it("toArray returns 6 items", () => {
    const t = new IntervalTree();
    for (let j=0;j<6;j++) t.insert({lo:j*3,hi:j*3+2});
    expect(t.toArray().length).toBe(6);
  });
  it("toArray returns 7 items", () => {
    const t = new IntervalTree();
    for (let j=0;j<7;j++) t.insert({lo:j*3,hi:j*3+2});
    expect(t.toArray().length).toBe(7);
  });
  it("toArray returns 8 items", () => {
    const t = new IntervalTree();
    for (let j=0;j<8;j++) t.insert({lo:j*3,hi:j*3+2});
    expect(t.toArray().length).toBe(8);
  });
  it("toArray returns 9 items", () => {
    const t = new IntervalTree();
    for (let j=0;j<9;j++) t.insert({lo:j*3,hi:j*3+2});
    expect(t.toArray().length).toBe(9);
  });
  it("toArray returns 10 items", () => {
    const t = new IntervalTree();
    for (let j=0;j<10;j++) t.insert({lo:j*3,hi:j*3+2});
    expect(t.toArray().length).toBe(10);
  });
  it("toArray returns 11 items", () => {
    const t = new IntervalTree();
    for (let j=0;j<11;j++) t.insert({lo:j*3,hi:j*3+2});
    expect(t.toArray().length).toBe(11);
  });
  it("toArray returns 12 items", () => {
    const t = new IntervalTree();
    for (let j=0;j<12;j++) t.insert({lo:j*3,hi:j*3+2});
    expect(t.toArray().length).toBe(12);
  });
  it("toArray returns 13 items", () => {
    const t = new IntervalTree();
    for (let j=0;j<13;j++) t.insert({lo:j*3,hi:j*3+2});
    expect(t.toArray().length).toBe(13);
  });
  it("toArray returns 14 items", () => {
    const t = new IntervalTree();
    for (let j=0;j<14;j++) t.insert({lo:j*3,hi:j*3+2});
    expect(t.toArray().length).toBe(14);
  });
  it("toArray returns 15 items", () => {
    const t = new IntervalTree();
    for (let j=0;j<15;j++) t.insert({lo:j*3,hi:j*3+2});
    expect(t.toArray().length).toBe(15);
  });
});

describe('IntervalTree nested and identical', () => {
  it("nested both at 4", () => {
    const t = new IntervalTree();
    t.insert({lo:0,hi:10});
    t.insert({lo:2,hi:7});
    expect(t.findContaining(4).length).toBe(2);
  });
  it("nested both at 14", () => {
    const t = new IntervalTree();
    t.insert({lo:10,hi:20});
    t.insert({lo:12,hi:17});
    expect(t.findContaining(14).length).toBe(2);
  });
  it("nested both at 24", () => {
    const t = new IntervalTree();
    t.insert({lo:20,hi:30});
    t.insert({lo:22,hi:27});
    expect(t.findContaining(24).length).toBe(2);
  });
  it("nested both at 34", () => {
    const t = new IntervalTree();
    t.insert({lo:30,hi:40});
    t.insert({lo:32,hi:37});
    expect(t.findContaining(34).length).toBe(2);
  });
  it("nested both at 44", () => {
    const t = new IntervalTree();
    t.insert({lo:40,hi:50});
    t.insert({lo:42,hi:47});
    expect(t.findContaining(44).length).toBe(2);
  });
  it("nested both at 54", () => {
    const t = new IntervalTree();
    t.insert({lo:50,hi:60});
    t.insert({lo:52,hi:57});
    expect(t.findContaining(54).length).toBe(2);
  });
  it("nested both at 64", () => {
    const t = new IntervalTree();
    t.insert({lo:60,hi:70});
    t.insert({lo:62,hi:67});
    expect(t.findContaining(64).length).toBe(2);
  });
  it("nested both at 74", () => {
    const t = new IntervalTree();
    t.insert({lo:70,hi:80});
    t.insert({lo:72,hi:77});
    expect(t.findContaining(74).length).toBe(2);
  });
  it("nested both at 84", () => {
    const t = new IntervalTree();
    t.insert({lo:80,hi:90});
    t.insert({lo:82,hi:87});
    expect(t.findContaining(84).length).toBe(2);
  });
  it("nested both at 94", () => {
    const t = new IntervalTree();
    t.insert({lo:90,hi:100});
    t.insert({lo:92,hi:97});
    expect(t.findContaining(94).length).toBe(2);
  });
  it("nested both at 104", () => {
    const t = new IntervalTree();
    t.insert({lo:100,hi:110});
    t.insert({lo:102,hi:107});
    expect(t.findContaining(104).length).toBe(2);
  });
  it("nested both at 114", () => {
    const t = new IntervalTree();
    t.insert({lo:110,hi:120});
    t.insert({lo:112,hi:117});
    expect(t.findContaining(114).length).toBe(2);
  });
  it("nested both at 124", () => {
    const t = new IntervalTree();
    t.insert({lo:120,hi:130});
    t.insert({lo:122,hi:127});
    expect(t.findContaining(124).length).toBe(2);
  });
  it("nested both at 134", () => {
    const t = new IntervalTree();
    t.insert({lo:130,hi:140});
    t.insert({lo:132,hi:137});
    expect(t.findContaining(134).length).toBe(2);
  });
  it("nested both at 144", () => {
    const t = new IntervalTree();
    t.insert({lo:140,hi:150});
    t.insert({lo:142,hi:147});
    expect(t.findContaining(144).length).toBe(2);
  });
  it("identical [0,3] x2", () => {
    const t = new IntervalTree();
    t.insert({lo:0,hi:3});
    t.insert({lo:0,hi:3});
    expect(t.findOverlapping(0,3).length).toBe(2);
  });
  it("identical [1,4] x2", () => {
    const t = new IntervalTree();
    t.insert({lo:1,hi:4});
    t.insert({lo:1,hi:4});
    expect(t.findOverlapping(1,4).length).toBe(2);
  });
  it("identical [2,5] x2", () => {
    const t = new IntervalTree();
    t.insert({lo:2,hi:5});
    t.insert({lo:2,hi:5});
    expect(t.findOverlapping(2,5).length).toBe(2);
  });
  it("identical [3,6] x2", () => {
    const t = new IntervalTree();
    t.insert({lo:3,hi:6});
    t.insert({lo:3,hi:6});
    expect(t.findOverlapping(3,6).length).toBe(2);
  });
  it("identical [4,7] x2", () => {
    const t = new IntervalTree();
    t.insert({lo:4,hi:7});
    t.insert({lo:4,hi:7});
    expect(t.findOverlapping(4,7).length).toBe(2);
  });
  it("identical [5,8] x2", () => {
    const t = new IntervalTree();
    t.insert({lo:5,hi:8});
    t.insert({lo:5,hi:8});
    expect(t.findOverlapping(5,8).length).toBe(2);
  });
  it("identical [6,9] x2", () => {
    const t = new IntervalTree();
    t.insert({lo:6,hi:9});
    t.insert({lo:6,hi:9});
    expect(t.findOverlapping(6,9).length).toBe(2);
  });
  it("identical [7,10] x2", () => {
    const t = new IntervalTree();
    t.insert({lo:7,hi:10});
    t.insert({lo:7,hi:10});
    expect(t.findOverlapping(7,10).length).toBe(2);
  });
  it("identical [8,11] x2", () => {
    const t = new IntervalTree();
    t.insert({lo:8,hi:11});
    t.insert({lo:8,hi:11});
    expect(t.findOverlapping(8,11).length).toBe(2);
  });
  it("identical [9,12] x2", () => {
    const t = new IntervalTree();
    t.insert({lo:9,hi:12});
    t.insert({lo:9,hi:12});
    expect(t.findOverlapping(9,12).length).toBe(2);
  });
  it("identical [10,13] x2", () => {
    const t = new IntervalTree();
    t.insert({lo:10,hi:13});
    t.insert({lo:10,hi:13});
    expect(t.findOverlapping(10,13).length).toBe(2);
  });
  it("identical [11,14] x2", () => {
    const t = new IntervalTree();
    t.insert({lo:11,hi:14});
    t.insert({lo:11,hi:14});
    expect(t.findOverlapping(11,14).length).toBe(2);
  });
  it("identical [12,15] x2", () => {
    const t = new IntervalTree();
    t.insert({lo:12,hi:15});
    t.insert({lo:12,hi:15});
    expect(t.findOverlapping(12,15).length).toBe(2);
  });
  it("identical [13,16] x2", () => {
    const t = new IntervalTree();
    t.insert({lo:13,hi:16});
    t.insert({lo:13,hi:16});
    expect(t.findOverlapping(13,16).length).toBe(2);
  });
  it("identical [14,17] x2", () => {
    const t = new IntervalTree();
    t.insert({lo:14,hi:17});
    t.insert({lo:14,hi:17});
    expect(t.findOverlapping(14,17).length).toBe(2);
  });
});

describe('IntervalTree large dataset', () => {
  it("large [0,4] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(0,4);
    expect(res.some(r=>r.lo===0&&r.hi===4)).toBe(true);
  });
  it("large [3,7] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(3,7);
    expect(res.some(r=>r.lo===3&&r.hi===7)).toBe(true);
  });
  it("large [6,10] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(6,10);
    expect(res.some(r=>r.lo===6&&r.hi===10)).toBe(true);
  });
  it("large [9,13] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(9,13);
    expect(res.some(r=>r.lo===9&&r.hi===13)).toBe(true);
  });
  it("large [12,16] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(12,16);
    expect(res.some(r=>r.lo===12&&r.hi===16)).toBe(true);
  });
  it("large [15,19] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(15,19);
    expect(res.some(r=>r.lo===15&&r.hi===19)).toBe(true);
  });
  it("large [18,22] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(18,22);
    expect(res.some(r=>r.lo===18&&r.hi===22)).toBe(true);
  });
  it("large [21,25] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(21,25);
    expect(res.some(r=>r.lo===21&&r.hi===25)).toBe(true);
  });
  it("large [24,28] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(24,28);
    expect(res.some(r=>r.lo===24&&r.hi===28)).toBe(true);
  });
  it("large [27,31] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(27,31);
    expect(res.some(r=>r.lo===27&&r.hi===31)).toBe(true);
  });
  it("large [30,34] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(30,34);
    expect(res.some(r=>r.lo===30&&r.hi===34)).toBe(true);
  });
  it("large [33,37] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(33,37);
    expect(res.some(r=>r.lo===33&&r.hi===37)).toBe(true);
  });
  it("large [36,40] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(36,40);
    expect(res.some(r=>r.lo===36&&r.hi===40)).toBe(true);
  });
  it("large [39,43] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(39,43);
    expect(res.some(r=>r.lo===39&&r.hi===43)).toBe(true);
  });
  it("large [42,46] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(42,46);
    expect(res.some(r=>r.lo===42&&r.hi===46)).toBe(true);
  });
  it("large [45,49] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(45,49);
    expect(res.some(r=>r.lo===45&&r.hi===49)).toBe(true);
  });
  it("large [48,52] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(48,52);
    expect(res.some(r=>r.lo===48&&r.hi===52)).toBe(true);
  });
  it("large [51,55] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(51,55);
    expect(res.some(r=>r.lo===51&&r.hi===55)).toBe(true);
  });
  it("large [54,58] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(54,58);
    expect(res.some(r=>r.lo===54&&r.hi===58)).toBe(true);
  });
  it("large [57,61] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(57,61);
    expect(res.some(r=>r.lo===57&&r.hi===61)).toBe(true);
  });
  it("large [60,64] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(60,64);
    expect(res.some(r=>r.lo===60&&r.hi===64)).toBe(true);
  });
  it("large [63,67] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(63,67);
    expect(res.some(r=>r.lo===63&&r.hi===67)).toBe(true);
  });
  it("large [66,70] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(66,70);
    expect(res.some(r=>r.lo===66&&r.hi===70)).toBe(true);
  });
  it("large [69,73] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(69,73);
    expect(res.some(r=>r.lo===69&&r.hi===73)).toBe(true);
  });
  it("large [72,76] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(72,76);
    expect(res.some(r=>r.lo===72&&r.hi===76)).toBe(true);
  });
  it("large [75,79] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(75,79);
    expect(res.some(r=>r.lo===75&&r.hi===79)).toBe(true);
  });
  it("large [78,82] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(78,82);
    expect(res.some(r=>r.lo===78&&r.hi===82)).toBe(true);
  });
  it("large [81,85] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(81,85);
    expect(res.some(r=>r.lo===81&&r.hi===85)).toBe(true);
  });
  it("large [84,88] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(84,88);
    expect(res.some(r=>r.lo===84&&r.hi===88)).toBe(true);
  });
  it("large [87,91] in result", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    const res = t.findOverlapping(87,91);
    expect(res.some(r=>r.lo===87&&r.hi===91)).toBe(true);
  });
  it("large findContaining(2)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(2).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(5)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(5).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(8)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(8).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(11)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(11).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(14)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(14).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(17)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(17).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(20)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(20).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(23)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(23).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(26)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(26).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(29)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(29).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(32)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(32).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(35)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(35).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(38)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(38).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(41)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(41).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(44)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(44).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(47)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(47).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(50)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(50).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(53)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(53).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(56)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(56).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(59)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(59).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(62)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(62).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(65)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(65).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(68)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(68).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(71)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(71).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(74)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(74).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(77)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(77).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(80)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(80).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(83)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(83).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(86)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(86).length).toBeGreaterThanOrEqual(1);
  });
  it("large findContaining(89)>=1", () => {
    const t = new IntervalTree();
    for (let k=0;k<30;k++) t.insert({lo:k*3,hi:k*3+4});
    expect(t.findContaining(89).length).toBeGreaterThanOrEqual(1);
  });
});

describe('SegmentTree sum queries', () => {
  it("sum [1..1]=1", () => {
    const vals=Array.from({length:1},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,0)).toBe(1);
  });
  it("sum [1..2]=3", () => {
    const vals=Array.from({length:2},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,1)).toBe(3);
  });
  it("sum [1..3]=6", () => {
    const vals=Array.from({length:3},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,2)).toBe(6);
  });
  it("sum [1..4]=10", () => {
    const vals=Array.from({length:4},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,3)).toBe(10);
  });
  it("sum [1..5]=15", () => {
    const vals=Array.from({length:5},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,4)).toBe(15);
  });
  it("sum [1..6]=21", () => {
    const vals=Array.from({length:6},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,5)).toBe(21);
  });
  it("sum [1..7]=28", () => {
    const vals=Array.from({length:7},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,6)).toBe(28);
  });
  it("sum [1..8]=36", () => {
    const vals=Array.from({length:8},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,7)).toBe(36);
  });
  it("sum [1..9]=45", () => {
    const vals=Array.from({length:9},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,8)).toBe(45);
  });
  it("sum [1..10]=55", () => {
    const vals=Array.from({length:10},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,9)).toBe(55);
  });
  it("sum [1..11]=66", () => {
    const vals=Array.from({length:11},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,10)).toBe(66);
  });
  it("sum [1..12]=78", () => {
    const vals=Array.from({length:12},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,11)).toBe(78);
  });
  it("sum [1..13]=91", () => {
    const vals=Array.from({length:13},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,12)).toBe(91);
  });
  it("sum [1..14]=105", () => {
    const vals=Array.from({length:14},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,13)).toBe(105);
  });
  it("sum [1..15]=120", () => {
    const vals=Array.from({length:15},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,14)).toBe(120);
  });
  it("sum [1..16]=136", () => {
    const vals=Array.from({length:16},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,15)).toBe(136);
  });
  it("sum [1..17]=153", () => {
    const vals=Array.from({length:17},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,16)).toBe(153);
  });
  it("sum [1..18]=171", () => {
    const vals=Array.from({length:18},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,17)).toBe(171);
  });
  it("sum [1..19]=190", () => {
    const vals=Array.from({length:19},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,18)).toBe(190);
  });
  it("sum [1..20]=210", () => {
    const vals=Array.from({length:20},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,19)).toBe(210);
  });
  it("sum [1..21]=231", () => {
    const vals=Array.from({length:21},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,20)).toBe(231);
  });
  it("sum [1..22]=253", () => {
    const vals=Array.from({length:22},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,21)).toBe(253);
  });
  it("sum [1..23]=276", () => {
    const vals=Array.from({length:23},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,22)).toBe(276);
  });
  it("sum [1..24]=300", () => {
    const vals=Array.from({length:24},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,23)).toBe(300);
  });
  it("sum [1..25]=325", () => {
    const vals=Array.from({length:25},(_,i)=>i+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,24)).toBe(325);
  });
  it("single idx 0=1", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,0)).toBe(1);
  });
  it("single idx 1=2", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(1,1)).toBe(2);
  });
  it("single idx 2=3", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(2,2)).toBe(3);
  });
  it("single idx 3=4", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(3,3)).toBe(4);
  });
  it("single idx 4=5", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(4,4)).toBe(5);
  });
  it("single idx 5=6", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(5,5)).toBe(6);
  });
  it("single idx 6=7", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(6,6)).toBe(7);
  });
  it("single idx 7=8", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(7,7)).toBe(8);
  });
  it("single idx 8=9", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(8,8)).toBe(9);
  });
  it("single idx 9=10", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(9,9)).toBe(10);
  });
  it("single idx 10=11", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(10,10)).toBe(11);
  });
  it("single idx 11=12", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(11,11)).toBe(12);
  });
  it("single idx 12=13", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(12,12)).toBe(13);
  });
  it("single idx 13=14", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(13,13)).toBe(14);
  });
  it("single idx 14=15", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(14,14)).toBe(15);
  });
  it("single idx 15=16", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(15,15)).toBe(16);
  });
  it("single idx 16=17", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(16,16)).toBe(17);
  });
  it("single idx 17=18", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(17,17)).toBe(18);
  });
  it("single idx 18=19", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(18,18)).toBe(19);
  });
  it("single idx 19=20", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(19,19)).toBe(20);
  });
  it("single idx 20=21", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(20,20)).toBe(21);
  });
  it("single idx 21=22", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(21,21)).toBe(22);
  });
  it("single idx 22=23", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(22,22)).toBe(23);
  });
  it("single idx 23=24", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(23,23)).toBe(24);
  });
  it("single idx 24=25", () => {
    const vals=Array.from({length:30},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(24,24)).toBe(25);
  });
});

describe('SegmentTree min max', () => {
  it("queryMin first 1 desc=10", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,0)).toBe(10);
  });
  it("queryMin first 2 desc=9", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,1)).toBe(9);
  });
  it("queryMin first 3 desc=8", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,2)).toBe(8);
  });
  it("queryMin first 4 desc=7", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,3)).toBe(7);
  });
  it("queryMin first 5 desc=6", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,4)).toBe(6);
  });
  it("queryMin first 6 desc=5", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,5)).toBe(5);
  });
  it("queryMin first 7 desc=4", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,6)).toBe(4);
  });
  it("queryMin first 8 desc=3", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,7)).toBe(3);
  });
  it("queryMin first 9 desc=2", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,8)).toBe(2);
  });
  it("queryMin first 10 desc=1", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,9)).toBe(1);
  });
  it("queryMin first 11 desc=0", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,10)).toBe(0);
  });
  it("queryMin first 12 desc=-1", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,11)).toBe(-1);
  });
  it("queryMin first 13 desc=-2", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,12)).toBe(-2);
  });
  it("queryMin first 14 desc=-3", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,13)).toBe(-3);
  });
  it("queryMin first 15 desc=-4", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,14)).toBe(-4);
  });
  it("queryMin first 16 desc=-5", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,15)).toBe(-5);
  });
  it("queryMin first 17 desc=-6", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,16)).toBe(-6);
  });
  it("queryMin first 18 desc=-7", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,17)).toBe(-7);
  });
  it("queryMin first 19 desc=-8", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,18)).toBe(-8);
  });
  it("queryMin first 20 desc=-9", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,19)).toBe(-9);
  });
  it("queryMin first 21 desc=-10", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,20)).toBe(-10);
  });
  it("queryMin first 22 desc=-11", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,21)).toBe(-11);
  });
  it("queryMin first 23 desc=-12", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,22)).toBe(-12);
  });
  it("queryMin first 24 desc=-13", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,23)).toBe(-13);
  });
  it("queryMin first 25 desc=-14", () => {
    const vals=Array.from({length:25},(_,j)=>10-j);
    const st=new SegmentTree(vals);
    expect(st.queryMin(0,24)).toBe(-14);
  });
  it("queryMax [0,0] asc=1", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,0)).toBe(1);
  });
  it("queryMax [0,1] asc=2", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,1)).toBe(2);
  });
  it("queryMax [0,2] asc=3", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,2)).toBe(3);
  });
  it("queryMax [0,3] asc=4", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,3)).toBe(4);
  });
  it("queryMax [0,4] asc=5", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,4)).toBe(5);
  });
  it("queryMax [0,5] asc=6", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,5)).toBe(6);
  });
  it("queryMax [0,6] asc=7", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,6)).toBe(7);
  });
  it("queryMax [0,7] asc=8", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,7)).toBe(8);
  });
  it("queryMax [0,8] asc=9", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,8)).toBe(9);
  });
  it("queryMax [0,9] asc=10", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,9)).toBe(10);
  });
  it("queryMax [0,10] asc=11", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,10)).toBe(11);
  });
  it("queryMax [0,11] asc=12", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,11)).toBe(12);
  });
  it("queryMax [0,12] asc=13", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,12)).toBe(13);
  });
  it("queryMax [0,13] asc=14", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,13)).toBe(14);
  });
  it("queryMax [0,14] asc=15", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,14)).toBe(15);
  });
  it("queryMax [0,15] asc=16", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,15)).toBe(16);
  });
  it("queryMax [0,16] asc=17", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,16)).toBe(17);
  });
  it("queryMax [0,17] asc=18", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,17)).toBe(18);
  });
  it("queryMax [0,18] asc=19", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,18)).toBe(19);
  });
  it("queryMax [0,19] asc=20", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,19)).toBe(20);
  });
  it("queryMax [0,20] asc=21", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,20)).toBe(21);
  });
  it("queryMax [0,21] asc=22", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,21)).toBe(22);
  });
  it("queryMax [0,22] asc=23", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,22)).toBe(23);
  });
  it("queryMax [0,23] asc=24", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,23)).toBe(24);
  });
  it("queryMax [0,24] asc=25", () => {
    const vals=Array.from({length:25},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.queryMax(0,24)).toBe(25);
  });
});

describe('SegmentTree point update', () => {
  it("update idx 0 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(0,999);
    expect(st.query(0,0)).toBe(999);
  });
  it("update idx 1 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(1,999);
    expect(st.query(1,1)).toBe(999);
  });
  it("update idx 2 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(2,999);
    expect(st.query(2,2)).toBe(999);
  });
  it("update idx 3 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(3,999);
    expect(st.query(3,3)).toBe(999);
  });
  it("update idx 4 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(4,999);
    expect(st.query(4,4)).toBe(999);
  });
  it("update idx 5 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(5,999);
    expect(st.query(5,5)).toBe(999);
  });
  it("update idx 6 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(6,999);
    expect(st.query(6,6)).toBe(999);
  });
  it("update idx 7 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(7,999);
    expect(st.query(7,7)).toBe(999);
  });
  it("update idx 8 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(8,999);
    expect(st.query(8,8)).toBe(999);
  });
  it("update idx 9 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(9,999);
    expect(st.query(9,9)).toBe(999);
  });
  it("update idx 10 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(10,999);
    expect(st.query(10,10)).toBe(999);
  });
  it("update idx 11 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(11,999);
    expect(st.query(11,11)).toBe(999);
  });
  it("update idx 12 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(12,999);
    expect(st.query(12,12)).toBe(999);
  });
  it("update idx 13 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(13,999);
    expect(st.query(13,13)).toBe(999);
  });
  it("update idx 14 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(14,999);
    expect(st.query(14,14)).toBe(999);
  });
  it("update idx 15 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(15,999);
    expect(st.query(15,15)).toBe(999);
  });
  it("update idx 16 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(16,999);
    expect(st.query(16,16)).toBe(999);
  });
  it("update idx 17 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(17,999);
    expect(st.query(17,17)).toBe(999);
  });
  it("update idx 18 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(18,999);
    expect(st.query(18,18)).toBe(999);
  });
  it("update idx 19 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(19,999);
    expect(st.query(19,19)).toBe(999);
  });
  it("update idx 20 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(20,999);
    expect(st.query(20,20)).toBe(999);
  });
  it("update idx 21 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(21,999);
    expect(st.query(21,21)).toBe(999);
  });
  it("update idx 22 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(22,999);
    expect(st.query(22,22)).toBe(999);
  });
  it("update idx 23 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(23,999);
    expect(st.query(23,23)).toBe(999);
  });
  it("update idx 24 to 999", () => {
    const vals=Array.from({length:25},()=>1);
    const st=new SegmentTree(vals);
    st.update(24,999);
    expect(st.query(24,24)).toBe(999);
  });
  it("update idx 0 total=109 (i=0)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(0,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 1 total=109 (i=1)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(1,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 2 total=109 (i=2)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(2,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 3 total=109 (i=3)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(3,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 4 total=109 (i=4)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(4,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 5 total=109 (i=5)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(5,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 6 total=109 (i=6)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(6,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 7 total=109 (i=7)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(7,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 8 total=109 (i=8)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(8,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 9 total=109 (i=9)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(9,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 0 total=109 (i=10)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(0,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 1 total=109 (i=11)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(1,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 2 total=109 (i=12)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(2,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 3 total=109 (i=13)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(3,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 4 total=109 (i=14)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(4,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 5 total=109 (i=15)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(5,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 6 total=109 (i=16)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(6,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 7 total=109 (i=17)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(7,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 8 total=109 (i=18)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(8,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 9 total=109 (i=19)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(9,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 0 total=109 (i=20)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(0,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 1 total=109 (i=21)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(1,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 2 total=109 (i=22)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(2,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 3 total=109 (i=23)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(3,100);
    expect(st.query(0,9)).toBe(109);
  });
  it("update idx 4 total=109 (i=24)", () => {
    const st=new SegmentTree(new Array(10).fill(1));
    st.update(4,100);
    expect(st.query(0,9)).toBe(109);
  });
});

describe('SegmentTree misc', () => {
  it("ST length 1", () => {
    expect(new SegmentTree(Array.from({length:1},(_,i)=>i)).length).toBe(1);
  });
  it("ST length 2", () => {
    expect(new SegmentTree(Array.from({length:2},(_,i)=>i)).length).toBe(2);
  });
  it("ST length 3", () => {
    expect(new SegmentTree(Array.from({length:3},(_,i)=>i)).length).toBe(3);
  });
  it("ST length 4", () => {
    expect(new SegmentTree(Array.from({length:4},(_,i)=>i)).length).toBe(4);
  });
  it("ST length 5", () => {
    expect(new SegmentTree(Array.from({length:5},(_,i)=>i)).length).toBe(5);
  });
  it("ST length 6", () => {
    expect(new SegmentTree(Array.from({length:6},(_,i)=>i)).length).toBe(6);
  });
  it("ST length 7", () => {
    expect(new SegmentTree(Array.from({length:7},(_,i)=>i)).length).toBe(7);
  });
  it("ST length 8", () => {
    expect(new SegmentTree(Array.from({length:8},(_,i)=>i)).length).toBe(8);
  });
  it("ST length 9", () => {
    expect(new SegmentTree(Array.from({length:9},(_,i)=>i)).length).toBe(9);
  });
  it("ST length 10", () => {
    expect(new SegmentTree(Array.from({length:10},(_,i)=>i)).length).toBe(10);
  });
  it("ST length 11", () => {
    expect(new SegmentTree(Array.from({length:11},(_,i)=>i)).length).toBe(11);
  });
  it("ST length 12", () => {
    expect(new SegmentTree(Array.from({length:12},(_,i)=>i)).length).toBe(12);
  });
  it("ST length 13", () => {
    expect(new SegmentTree(Array.from({length:13},(_,i)=>i)).length).toBe(13);
  });
  it("ST length 14", () => {
    expect(new SegmentTree(Array.from({length:14},(_,i)=>i)).length).toBe(14);
  });
  it("ST length 15", () => {
    expect(new SegmentTree(Array.from({length:15},(_,i)=>i)).length).toBe(15);
  });
  it("ST length 16", () => {
    expect(new SegmentTree(Array.from({length:16},(_,i)=>i)).length).toBe(16);
  });
  it("ST length 17", () => {
    expect(new SegmentTree(Array.from({length:17},(_,i)=>i)).length).toBe(17);
  });
  it("ST length 18", () => {
    expect(new SegmentTree(Array.from({length:18},(_,i)=>i)).length).toBe(18);
  });
  it("ST length 19", () => {
    expect(new SegmentTree(Array.from({length:19},(_,i)=>i)).length).toBe(19);
  });
  it("ST length 20", () => {
    expect(new SegmentTree(Array.from({length:20},(_,i)=>i)).length).toBe(20);
  });
  it("empty query 0", () => {
    expect(new SegmentTree([]).query(0,0)).toBe(0);
  });
  it("empty min Inf", () => {
    expect(new SegmentTree([]).queryMin(0,0)).toBe(Infinity);
  });
  it("empty max -Inf", () => {
    expect(new SegmentTree([]).queryMax(0,0)).toBe(-Infinity);
  });
  it("toArray matches", () => {
    const vals=[3,1,4,1,5,9];
    expect(new SegmentTree(vals).toArray()).toEqual([3,1,4,1,5,9]);
  });
  it("toArray is copy", () => {
    const st=new SegmentTree([1,2,3]);
    const arr=st.toArray(); arr[0]=999;
    expect(st.query(0,0)).toBe(1);
  });
  it("ST length 0 empty", () => {
    expect(new SegmentTree([]).length).toBe(0);
  });
  it("single [42]", () => {
    expect(new SegmentTree([42]).query(0,0)).toBe(42);
  });
});

describe('FenwickTree prefixSum', () => {
  it("FW prefixSum 1..1=1", () => {
    const ft=new FenwickTree(1);
    for (let i=0;i<1;i++) ft.update(i,i+1);
    expect(ft.prefixSum(0)).toBe(1);
  });
  it("FW prefixSum 1..2=3", () => {
    const ft=new FenwickTree(2);
    for (let i=0;i<2;i++) ft.update(i,i+1);
    expect(ft.prefixSum(1)).toBe(3);
  });
  it("FW prefixSum 1..3=6", () => {
    const ft=new FenwickTree(3);
    for (let i=0;i<3;i++) ft.update(i,i+1);
    expect(ft.prefixSum(2)).toBe(6);
  });
  it("FW prefixSum 1..4=10", () => {
    const ft=new FenwickTree(4);
    for (let i=0;i<4;i++) ft.update(i,i+1);
    expect(ft.prefixSum(3)).toBe(10);
  });
  it("FW prefixSum 1..5=15", () => {
    const ft=new FenwickTree(5);
    for (let i=0;i<5;i++) ft.update(i,i+1);
    expect(ft.prefixSum(4)).toBe(15);
  });
  it("FW prefixSum 1..6=21", () => {
    const ft=new FenwickTree(6);
    for (let i=0;i<6;i++) ft.update(i,i+1);
    expect(ft.prefixSum(5)).toBe(21);
  });
  it("FW prefixSum 1..7=28", () => {
    const ft=new FenwickTree(7);
    for (let i=0;i<7;i++) ft.update(i,i+1);
    expect(ft.prefixSum(6)).toBe(28);
  });
  it("FW prefixSum 1..8=36", () => {
    const ft=new FenwickTree(8);
    for (let i=0;i<8;i++) ft.update(i,i+1);
    expect(ft.prefixSum(7)).toBe(36);
  });
  it("FW prefixSum 1..9=45", () => {
    const ft=new FenwickTree(9);
    for (let i=0;i<9;i++) ft.update(i,i+1);
    expect(ft.prefixSum(8)).toBe(45);
  });
  it("FW prefixSum 1..10=55", () => {
    const ft=new FenwickTree(10);
    for (let i=0;i<10;i++) ft.update(i,i+1);
    expect(ft.prefixSum(9)).toBe(55);
  });
  it("FW prefixSum 1..11=66", () => {
    const ft=new FenwickTree(11);
    for (let i=0;i<11;i++) ft.update(i,i+1);
    expect(ft.prefixSum(10)).toBe(66);
  });
  it("FW prefixSum 1..12=78", () => {
    const ft=new FenwickTree(12);
    for (let i=0;i<12;i++) ft.update(i,i+1);
    expect(ft.prefixSum(11)).toBe(78);
  });
  it("FW prefixSum 1..13=91", () => {
    const ft=new FenwickTree(13);
    for (let i=0;i<13;i++) ft.update(i,i+1);
    expect(ft.prefixSum(12)).toBe(91);
  });
  it("FW prefixSum 1..14=105", () => {
    const ft=new FenwickTree(14);
    for (let i=0;i<14;i++) ft.update(i,i+1);
    expect(ft.prefixSum(13)).toBe(105);
  });
  it("FW prefixSum 1..15=120", () => {
    const ft=new FenwickTree(15);
    for (let i=0;i<15;i++) ft.update(i,i+1);
    expect(ft.prefixSum(14)).toBe(120);
  });
  it("FW prefixSum 1..16=136", () => {
    const ft=new FenwickTree(16);
    for (let i=0;i<16;i++) ft.update(i,i+1);
    expect(ft.prefixSum(15)).toBe(136);
  });
  it("FW prefixSum 1..17=153", () => {
    const ft=new FenwickTree(17);
    for (let i=0;i<17;i++) ft.update(i,i+1);
    expect(ft.prefixSum(16)).toBe(153);
  });
  it("FW prefixSum 1..18=171", () => {
    const ft=new FenwickTree(18);
    for (let i=0;i<18;i++) ft.update(i,i+1);
    expect(ft.prefixSum(17)).toBe(171);
  });
  it("FW prefixSum 1..19=190", () => {
    const ft=new FenwickTree(19);
    for (let i=0;i<19;i++) ft.update(i,i+1);
    expect(ft.prefixSum(18)).toBe(190);
  });
  it("FW prefixSum 1..20=210", () => {
    const ft=new FenwickTree(20);
    for (let i=0;i<20;i++) ft.update(i,i+1);
    expect(ft.prefixSum(19)).toBe(210);
  });
  it("FW prefixSum 1..21=231", () => {
    const ft=new FenwickTree(21);
    for (let i=0;i<21;i++) ft.update(i,i+1);
    expect(ft.prefixSum(20)).toBe(231);
  });
  it("FW prefixSum 1..22=253", () => {
    const ft=new FenwickTree(22);
    for (let i=0;i<22;i++) ft.update(i,i+1);
    expect(ft.prefixSum(21)).toBe(253);
  });
  it("FW prefixSum 1..23=276", () => {
    const ft=new FenwickTree(23);
    for (let i=0;i<23;i++) ft.update(i,i+1);
    expect(ft.prefixSum(22)).toBe(276);
  });
  it("FW prefixSum 1..24=300", () => {
    const ft=new FenwickTree(24);
    for (let i=0;i<24;i++) ft.update(i,i+1);
    expect(ft.prefixSum(23)).toBe(300);
  });
  it("FW prefixSum 1..25=325", () => {
    const ft=new FenwickTree(25);
    for (let i=0;i<25;i++) ft.update(i,i+1);
    expect(ft.prefixSum(24)).toBe(325);
  });
  it("FW prefixSum(0)=1", () => {
    const ft=new FenwickTree(30);
    ft.update(0,1);
    expect(ft.prefixSum(0)).toBe(1);
  });
  it("FW prefixSum(0)=2", () => {
    const ft=new FenwickTree(30);
    ft.update(0,2);
    expect(ft.prefixSum(0)).toBe(2);
  });
  it("FW prefixSum(0)=3", () => {
    const ft=new FenwickTree(30);
    ft.update(0,3);
    expect(ft.prefixSum(0)).toBe(3);
  });
  it("FW prefixSum(0)=4", () => {
    const ft=new FenwickTree(30);
    ft.update(0,4);
    expect(ft.prefixSum(0)).toBe(4);
  });
  it("FW prefixSum(0)=5", () => {
    const ft=new FenwickTree(30);
    ft.update(0,5);
    expect(ft.prefixSum(0)).toBe(5);
  });
  it("FW prefixSum(0)=6", () => {
    const ft=new FenwickTree(30);
    ft.update(0,6);
    expect(ft.prefixSum(0)).toBe(6);
  });
  it("FW prefixSum(0)=7", () => {
    const ft=new FenwickTree(30);
    ft.update(0,7);
    expect(ft.prefixSum(0)).toBe(7);
  });
  it("FW prefixSum(0)=8", () => {
    const ft=new FenwickTree(30);
    ft.update(0,8);
    expect(ft.prefixSum(0)).toBe(8);
  });
  it("FW prefixSum(0)=9", () => {
    const ft=new FenwickTree(30);
    ft.update(0,9);
    expect(ft.prefixSum(0)).toBe(9);
  });
  it("FW prefixSum(0)=10", () => {
    const ft=new FenwickTree(30);
    ft.update(0,10);
    expect(ft.prefixSum(0)).toBe(10);
  });
  it("FW prefixSum(0)=11", () => {
    const ft=new FenwickTree(30);
    ft.update(0,11);
    expect(ft.prefixSum(0)).toBe(11);
  });
  it("FW prefixSum(0)=12", () => {
    const ft=new FenwickTree(30);
    ft.update(0,12);
    expect(ft.prefixSum(0)).toBe(12);
  });
  it("FW prefixSum(0)=13", () => {
    const ft=new FenwickTree(30);
    ft.update(0,13);
    expect(ft.prefixSum(0)).toBe(13);
  });
  it("FW prefixSum(0)=14", () => {
    const ft=new FenwickTree(30);
    ft.update(0,14);
    expect(ft.prefixSum(0)).toBe(14);
  });
  it("FW prefixSum(0)=15", () => {
    const ft=new FenwickTree(30);
    ft.update(0,15);
    expect(ft.prefixSum(0)).toBe(15);
  });
  it("FW prefixSum(0)=16", () => {
    const ft=new FenwickTree(30);
    ft.update(0,16);
    expect(ft.prefixSum(0)).toBe(16);
  });
  it("FW prefixSum(0)=17", () => {
    const ft=new FenwickTree(30);
    ft.update(0,17);
    expect(ft.prefixSum(0)).toBe(17);
  });
  it("FW prefixSum(0)=18", () => {
    const ft=new FenwickTree(30);
    ft.update(0,18);
    expect(ft.prefixSum(0)).toBe(18);
  });
  it("FW prefixSum(0)=19", () => {
    const ft=new FenwickTree(30);
    ft.update(0,19);
    expect(ft.prefixSum(0)).toBe(19);
  });
  it("FW prefixSum(0)=20", () => {
    const ft=new FenwickTree(30);
    ft.update(0,20);
    expect(ft.prefixSum(0)).toBe(20);
  });
  it("FW prefixSum(0)=21", () => {
    const ft=new FenwickTree(30);
    ft.update(0,21);
    expect(ft.prefixSum(0)).toBe(21);
  });
  it("FW prefixSum(0)=22", () => {
    const ft=new FenwickTree(30);
    ft.update(0,22);
    expect(ft.prefixSum(0)).toBe(22);
  });
  it("FW prefixSum(0)=23", () => {
    const ft=new FenwickTree(30);
    ft.update(0,23);
    expect(ft.prefixSum(0)).toBe(23);
  });
  it("FW prefixSum(0)=24", () => {
    const ft=new FenwickTree(30);
    ft.update(0,24);
    expect(ft.prefixSum(0)).toBe(24);
  });
  it("FW prefixSum(0)=25", () => {
    const ft=new FenwickTree(30);
    ft.update(0,25);
    expect(ft.prefixSum(0)).toBe(25);
  });
});

describe('FenwickTree rangeSum', () => {
  it("FW rangeSum [0,4]=15", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(0,4)).toBe(15);
  });
  it("FW rangeSum [1,5]=20", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(1,5)).toBe(20);
  });
  it("FW rangeSum [2,6]=25", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(2,6)).toBe(25);
  });
  it("FW rangeSum [3,7]=30", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(3,7)).toBe(30);
  });
  it("FW rangeSum [4,8]=35", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(4,8)).toBe(35);
  });
  it("FW rangeSum [5,9]=40", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(5,9)).toBe(40);
  });
  it("FW rangeSum [6,10]=45", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(6,10)).toBe(45);
  });
  it("FW rangeSum [7,11]=50", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(7,11)).toBe(50);
  });
  it("FW rangeSum [8,12]=55", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(8,12)).toBe(55);
  });
  it("FW rangeSum [9,13]=60", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(9,13)).toBe(60);
  });
  it("FW rangeSum [10,14]=65", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(10,14)).toBe(65);
  });
  it("FW rangeSum [11,15]=70", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(11,15)).toBe(70);
  });
  it("FW rangeSum [12,16]=75", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(12,16)).toBe(75);
  });
  it("FW rangeSum [13,17]=80", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(13,17)).toBe(80);
  });
  it("FW rangeSum [14,18]=85", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(14,18)).toBe(85);
  });
  it("FW rangeSum [15,19]=90", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(15,19)).toBe(90);
  });
  it("FW rangeSum [16,20]=95", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(16,20)).toBe(95);
  });
  it("FW rangeSum [17,21]=100", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(17,21)).toBe(100);
  });
  it("FW rangeSum [18,22]=105", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(18,22)).toBe(105);
  });
  it("FW rangeSum [19,23]=110", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(19,23)).toBe(110);
  });
  it("FW rangeSum [20,24]=115", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(20,24)).toBe(115);
  });
  it("FW rangeSum [21,25]=120", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(21,25)).toBe(120);
  });
  it("FW rangeSum [22,26]=125", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(22,26)).toBe(125);
  });
  it("FW rangeSum [23,27]=130", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(23,27)).toBe(130);
  });
  it("FW rangeSum [24,28]=135", () => {
    const ft=new FenwickTree(30);
    for (let j=0;j<30;j++) ft.update(j,j+1);
    expect(ft.rangeSum(24,28)).toBe(135);
  });
  it("FW single rangeSum idx 0=10", () => {
    const ft=new FenwickTree(30);
    ft.update(0,10);
    expect(ft.rangeSum(0,0)).toBe(10);
  });
  it("FW single rangeSum idx 1=11", () => {
    const ft=new FenwickTree(30);
    ft.update(1,11);
    expect(ft.rangeSum(1,1)).toBe(11);
  });
  it("FW single rangeSum idx 2=12", () => {
    const ft=new FenwickTree(30);
    ft.update(2,12);
    expect(ft.rangeSum(2,2)).toBe(12);
  });
  it("FW single rangeSum idx 3=13", () => {
    const ft=new FenwickTree(30);
    ft.update(3,13);
    expect(ft.rangeSum(3,3)).toBe(13);
  });
  it("FW single rangeSum idx 4=14", () => {
    const ft=new FenwickTree(30);
    ft.update(4,14);
    expect(ft.rangeSum(4,4)).toBe(14);
  });
  it("FW single rangeSum idx 5=15", () => {
    const ft=new FenwickTree(30);
    ft.update(5,15);
    expect(ft.rangeSum(5,5)).toBe(15);
  });
  it("FW single rangeSum idx 6=16", () => {
    const ft=new FenwickTree(30);
    ft.update(6,16);
    expect(ft.rangeSum(6,6)).toBe(16);
  });
  it("FW single rangeSum idx 7=17", () => {
    const ft=new FenwickTree(30);
    ft.update(7,17);
    expect(ft.rangeSum(7,7)).toBe(17);
  });
  it("FW single rangeSum idx 8=18", () => {
    const ft=new FenwickTree(30);
    ft.update(8,18);
    expect(ft.rangeSum(8,8)).toBe(18);
  });
  it("FW single rangeSum idx 9=19", () => {
    const ft=new FenwickTree(30);
    ft.update(9,19);
    expect(ft.rangeSum(9,9)).toBe(19);
  });
  it("FW single rangeSum idx 10=20", () => {
    const ft=new FenwickTree(30);
    ft.update(10,20);
    expect(ft.rangeSum(10,10)).toBe(20);
  });
  it("FW single rangeSum idx 11=21", () => {
    const ft=new FenwickTree(30);
    ft.update(11,21);
    expect(ft.rangeSum(11,11)).toBe(21);
  });
  it("FW single rangeSum idx 12=22", () => {
    const ft=new FenwickTree(30);
    ft.update(12,22);
    expect(ft.rangeSum(12,12)).toBe(22);
  });
  it("FW single rangeSum idx 13=23", () => {
    const ft=new FenwickTree(30);
    ft.update(13,23);
    expect(ft.rangeSum(13,13)).toBe(23);
  });
  it("FW single rangeSum idx 14=24", () => {
    const ft=new FenwickTree(30);
    ft.update(14,24);
    expect(ft.rangeSum(14,14)).toBe(24);
  });
  it("FW single rangeSum idx 15=25", () => {
    const ft=new FenwickTree(30);
    ft.update(15,25);
    expect(ft.rangeSum(15,15)).toBe(25);
  });
  it("FW single rangeSum idx 16=26", () => {
    const ft=new FenwickTree(30);
    ft.update(16,26);
    expect(ft.rangeSum(16,16)).toBe(26);
  });
  it("FW single rangeSum idx 17=27", () => {
    const ft=new FenwickTree(30);
    ft.update(17,27);
    expect(ft.rangeSum(17,17)).toBe(27);
  });
  it("FW single rangeSum idx 18=28", () => {
    const ft=new FenwickTree(30);
    ft.update(18,28);
    expect(ft.rangeSum(18,18)).toBe(28);
  });
  it("FW single rangeSum idx 19=29", () => {
    const ft=new FenwickTree(30);
    ft.update(19,29);
    expect(ft.rangeSum(19,19)).toBe(29);
  });
  it("FW single rangeSum idx 20=30", () => {
    const ft=new FenwickTree(30);
    ft.update(20,30);
    expect(ft.rangeSum(20,20)).toBe(30);
  });
  it("FW single rangeSum idx 21=31", () => {
    const ft=new FenwickTree(30);
    ft.update(21,31);
    expect(ft.rangeSum(21,21)).toBe(31);
  });
  it("FW single rangeSum idx 22=32", () => {
    const ft=new FenwickTree(30);
    ft.update(22,32);
    expect(ft.rangeSum(22,22)).toBe(32);
  });
  it("FW single rangeSum idx 23=33", () => {
    const ft=new FenwickTree(30);
    ft.update(23,33);
    expect(ft.rangeSum(23,23)).toBe(33);
  });
  it("FW single rangeSum idx 24=34", () => {
    const ft=new FenwickTree(30);
    ft.update(24,34);
    expect(ft.rangeSum(24,24)).toBe(34);
  });
});

describe('FenwickTree length', () => {
  it("FW length 1", () => {
    expect(new FenwickTree(1).length).toBe(1);
  });
  it("FW length 2", () => {
    expect(new FenwickTree(2).length).toBe(2);
  });
  it("FW length 3", () => {
    expect(new FenwickTree(3).length).toBe(3);
  });
  it("FW length 4", () => {
    expect(new FenwickTree(4).length).toBe(4);
  });
  it("FW length 5", () => {
    expect(new FenwickTree(5).length).toBe(5);
  });
  it("FW length 6", () => {
    expect(new FenwickTree(6).length).toBe(6);
  });
  it("FW length 7", () => {
    expect(new FenwickTree(7).length).toBe(7);
  });
  it("FW length 8", () => {
    expect(new FenwickTree(8).length).toBe(8);
  });
  it("FW length 9", () => {
    expect(new FenwickTree(9).length).toBe(9);
  });
  it("FW length 10", () => {
    expect(new FenwickTree(10).length).toBe(10);
  });
  it("FW length 11", () => {
    expect(new FenwickTree(11).length).toBe(11);
  });
  it("FW length 12", () => {
    expect(new FenwickTree(12).length).toBe(12);
  });
  it("FW length 13", () => {
    expect(new FenwickTree(13).length).toBe(13);
  });
  it("FW length 14", () => {
    expect(new FenwickTree(14).length).toBe(14);
  });
  it("FW length 15", () => {
    expect(new FenwickTree(15).length).toBe(15);
  });
  it("FW length 16", () => {
    expect(new FenwickTree(16).length).toBe(16);
  });
  it("FW length 17", () => {
    expect(new FenwickTree(17).length).toBe(17);
  });
  it("FW length 18", () => {
    expect(new FenwickTree(18).length).toBe(18);
  });
  it("FW length 19", () => {
    expect(new FenwickTree(19).length).toBe(19);
  });
  it("FW length 20", () => {
    expect(new FenwickTree(20).length).toBe(20);
  });
});

describe('SweepLine coveredLength', () => {
  it("covered empty=0", () => {
    expect(SweepLine.coveredLength([])).toBe(0);
  });
  it("single [0,1]=1", () => {
    expect(SweepLine.coveredLength([[0,1]])).toBe(1);
  });
  it("single [0,2]=2", () => {
    expect(SweepLine.coveredLength([[0,2]])).toBe(2);
  });
  it("single [0,3]=3", () => {
    expect(SweepLine.coveredLength([[0,3]])).toBe(3);
  });
  it("single [0,4]=4", () => {
    expect(SweepLine.coveredLength([[0,4]])).toBe(4);
  });
  it("single [0,5]=5", () => {
    expect(SweepLine.coveredLength([[0,5]])).toBe(5);
  });
  it("single [0,6]=6", () => {
    expect(SweepLine.coveredLength([[0,6]])).toBe(6);
  });
  it("single [0,7]=7", () => {
    expect(SweepLine.coveredLength([[0,7]])).toBe(7);
  });
  it("single [0,8]=8", () => {
    expect(SweepLine.coveredLength([[0,8]])).toBe(8);
  });
  it("single [0,9]=9", () => {
    expect(SweepLine.coveredLength([[0,9]])).toBe(9);
  });
  it("single [0,10]=10", () => {
    expect(SweepLine.coveredLength([[0,10]])).toBe(10);
  });
  it("single [0,11]=11", () => {
    expect(SweepLine.coveredLength([[0,11]])).toBe(11);
  });
  it("single [0,12]=12", () => {
    expect(SweepLine.coveredLength([[0,12]])).toBe(12);
  });
  it("single [0,13]=13", () => {
    expect(SweepLine.coveredLength([[0,13]])).toBe(13);
  });
  it("single [0,14]=14", () => {
    expect(SweepLine.coveredLength([[0,14]])).toBe(14);
  });
  it("single [0,15]=15", () => {
    expect(SweepLine.coveredLength([[0,15]])).toBe(15);
  });
  it("single [0,16]=16", () => {
    expect(SweepLine.coveredLength([[0,16]])).toBe(16);
  });
  it("single [0,17]=17", () => {
    expect(SweepLine.coveredLength([[0,17]])).toBe(17);
  });
  it("single [0,18]=18", () => {
    expect(SweepLine.coveredLength([[0,18]])).toBe(18);
  });
  it("single [0,19]=19", () => {
    expect(SweepLine.coveredLength([[0,19]])).toBe(19);
  });
  it("single [0,20]=20", () => {
    expect(SweepLine.coveredLength([[0,20]])).toBe(20);
  });
  it("overlapping [0,5],[3,9]=9", () => {
    expect(SweepLine.coveredLength([[0,5],[3,9]])).toBe(9);
  });
  it("overlapping [1,6],[4,10]=9", () => {
    expect(SweepLine.coveredLength([[1,6],[4,10]])).toBe(9);
  });
  it("overlapping [2,7],[5,11]=9", () => {
    expect(SweepLine.coveredLength([[2,7],[5,11]])).toBe(9);
  });
  it("overlapping [3,8],[6,12]=9", () => {
    expect(SweepLine.coveredLength([[3,8],[6,12]])).toBe(9);
  });
  it("overlapping [4,9],[7,13]=9", () => {
    expect(SweepLine.coveredLength([[4,9],[7,13]])).toBe(9);
  });
  it("overlapping [5,10],[8,14]=9", () => {
    expect(SweepLine.coveredLength([[5,10],[8,14]])).toBe(9);
  });
  it("overlapping [6,11],[9,15]=9", () => {
    expect(SweepLine.coveredLength([[6,11],[9,15]])).toBe(9);
  });
  it("overlapping [7,12],[10,16]=9", () => {
    expect(SweepLine.coveredLength([[7,12],[10,16]])).toBe(9);
  });
  it("overlapping [8,13],[11,17]=9", () => {
    expect(SweepLine.coveredLength([[8,13],[11,17]])).toBe(9);
  });
  it("overlapping [9,14],[12,18]=9", () => {
    expect(SweepLine.coveredLength([[9,14],[12,18]])).toBe(9);
  });
  it("overlapping [10,15],[13,19]=9", () => {
    expect(SweepLine.coveredLength([[10,15],[13,19]])).toBe(9);
  });
  it("overlapping [11,16],[14,20]=9", () => {
    expect(SweepLine.coveredLength([[11,16],[14,20]])).toBe(9);
  });
  it("overlapping [12,17],[15,21]=9", () => {
    expect(SweepLine.coveredLength([[12,17],[15,21]])).toBe(9);
  });
  it("overlapping [13,18],[16,22]=9", () => {
    expect(SweepLine.coveredLength([[13,18],[16,22]])).toBe(9);
  });
  it("overlapping [14,19],[17,23]=9", () => {
    expect(SweepLine.coveredLength([[14,19],[17,23]])).toBe(9);
  });
  it("overlapping [15,20],[18,24]=9", () => {
    expect(SweepLine.coveredLength([[15,20],[18,24]])).toBe(9);
  });
  it("overlapping [16,21],[19,25]=9", () => {
    expect(SweepLine.coveredLength([[16,21],[19,25]])).toBe(9);
  });
  it("overlapping [17,22],[20,26]=9", () => {
    expect(SweepLine.coveredLength([[17,22],[20,26]])).toBe(9);
  });
  it("overlapping [18,23],[21,27]=9", () => {
    expect(SweepLine.coveredLength([[18,23],[21,27]])).toBe(9);
  });
  it("overlapping [19,24],[22,28]=9", () => {
    expect(SweepLine.coveredLength([[19,24],[22,28]])).toBe(9);
  });
  it("disjoint [0,0],[2,5]=3", () => {
    expect(SweepLine.coveredLength([[0,0],[2,5]])).toBe(3);
  });
  it("disjoint [0,1],[3,6]=4", () => {
    expect(SweepLine.coveredLength([[0,1],[3,6]])).toBe(4);
  });
  it("disjoint [0,2],[4,7]=5", () => {
    expect(SweepLine.coveredLength([[0,2],[4,7]])).toBe(5);
  });
  it("disjoint [0,3],[5,8]=6", () => {
    expect(SweepLine.coveredLength([[0,3],[5,8]])).toBe(6);
  });
  it("disjoint [0,4],[6,9]=7", () => {
    expect(SweepLine.coveredLength([[0,4],[6,9]])).toBe(7);
  });
  it("disjoint [0,5],[7,10]=8", () => {
    expect(SweepLine.coveredLength([[0,5],[7,10]])).toBe(8);
  });
  it("disjoint [0,6],[8,11]=9", () => {
    expect(SweepLine.coveredLength([[0,6],[8,11]])).toBe(9);
  });
  it("disjoint [0,7],[9,12]=10", () => {
    expect(SweepLine.coveredLength([[0,7],[9,12]])).toBe(10);
  });
  it("disjoint [0,8],[10,13]=11", () => {
    expect(SweepLine.coveredLength([[0,8],[10,13]])).toBe(11);
  });
  it("disjoint [0,9],[11,14]=12", () => {
    expect(SweepLine.coveredLength([[0,9],[11,14]])).toBe(12);
  });
  it("disjoint [0,10],[12,15]=13", () => {
    expect(SweepLine.coveredLength([[0,10],[12,15]])).toBe(13);
  });
  it("disjoint [0,11],[13,16]=14", () => {
    expect(SweepLine.coveredLength([[0,11],[13,16]])).toBe(14);
  });
  it("disjoint [0,12],[14,17]=15", () => {
    expect(SweepLine.coveredLength([[0,12],[14,17]])).toBe(15);
  });
  it("disjoint [0,13],[15,18]=16", () => {
    expect(SweepLine.coveredLength([[0,13],[15,18]])).toBe(16);
  });
  it("disjoint [0,14],[16,19]=17", () => {
    expect(SweepLine.coveredLength([[0,14],[16,19]])).toBe(17);
  });
  it("disjoint [0,15],[17,20]=18", () => {
    expect(SweepLine.coveredLength([[0,15],[17,20]])).toBe(18);
  });
  it("disjoint [0,16],[18,21]=19", () => {
    expect(SweepLine.coveredLength([[0,16],[18,21]])).toBe(19);
  });
  it("disjoint [0,17],[19,22]=20", () => {
    expect(SweepLine.coveredLength([[0,17],[19,22]])).toBe(20);
  });
  it("disjoint [0,18],[20,23]=21", () => {
    expect(SweepLine.coveredLength([[0,18],[20,23]])).toBe(21);
  });
});

describe('SweepLine merge', () => {
  it("merge empty", () => {
    expect(SweepLine.merge([])).toEqual([]);
  });
  it("merge single [0,4]", () => {
    expect(SweepLine.merge([[0,4]])).toEqual([[0,4]]);
  });
  it("merge single [1,5]", () => {
    expect(SweepLine.merge([[1,5]])).toEqual([[1,5]]);
  });
  it("merge single [2,6]", () => {
    expect(SweepLine.merge([[2,6]])).toEqual([[2,6]]);
  });
  it("merge single [3,7]", () => {
    expect(SweepLine.merge([[3,7]])).toEqual([[3,7]]);
  });
  it("merge single [4,8]", () => {
    expect(SweepLine.merge([[4,8]])).toEqual([[4,8]]);
  });
  it("merge single [5,9]", () => {
    expect(SweepLine.merge([[5,9]])).toEqual([[5,9]]);
  });
  it("merge single [6,10]", () => {
    expect(SweepLine.merge([[6,10]])).toEqual([[6,10]]);
  });
  it("merge single [7,11]", () => {
    expect(SweepLine.merge([[7,11]])).toEqual([[7,11]]);
  });
  it("merge single [8,12]", () => {
    expect(SweepLine.merge([[8,12]])).toEqual([[8,12]]);
  });
  it("merge single [9,13]", () => {
    expect(SweepLine.merge([[9,13]])).toEqual([[9,13]]);
  });
  it("merge single [10,14]", () => {
    expect(SweepLine.merge([[10,14]])).toEqual([[10,14]]);
  });
  it("merge single [11,15]", () => {
    expect(SweepLine.merge([[11,15]])).toEqual([[11,15]]);
  });
  it("merge single [12,16]", () => {
    expect(SweepLine.merge([[12,16]])).toEqual([[12,16]]);
  });
  it("merge single [13,17]", () => {
    expect(SweepLine.merge([[13,17]])).toEqual([[13,17]]);
  });
  it("merge single [14,18]", () => {
    expect(SweepLine.merge([[14,18]])).toEqual([[14,18]]);
  });
  it("merge single [15,19]", () => {
    expect(SweepLine.merge([[15,19]])).toEqual([[15,19]]);
  });
  it("merge single [16,20]", () => {
    expect(SweepLine.merge([[16,20]])).toEqual([[16,20]]);
  });
  it("merge single [17,21]", () => {
    expect(SweepLine.merge([[17,21]])).toEqual([[17,21]]);
  });
  it("merge single [18,22]", () => {
    expect(SweepLine.merge([[18,22]])).toEqual([[18,22]]);
  });
  it("merge single [19,23]", () => {
    expect(SweepLine.merge([[19,23]])).toEqual([[19,23]]);
  });
  it("merge [0,3],[2,6]=[0,6]", () => {
    expect(SweepLine.merge([[0,3],[2,6]])).toEqual([[0,6]]);
  });
  it("merge [2,5],[4,8]=[2,8]", () => {
    expect(SweepLine.merge([[2,5],[4,8]])).toEqual([[2,8]]);
  });
  it("merge [4,7],[6,10]=[4,10]", () => {
    expect(SweepLine.merge([[4,7],[6,10]])).toEqual([[4,10]]);
  });
  it("merge [6,9],[8,12]=[6,12]", () => {
    expect(SweepLine.merge([[6,9],[8,12]])).toEqual([[6,12]]);
  });
  it("merge [8,11],[10,14]=[8,14]", () => {
    expect(SweepLine.merge([[8,11],[10,14]])).toEqual([[8,14]]);
  });
  it("merge [10,13],[12,16]=[10,16]", () => {
    expect(SweepLine.merge([[10,13],[12,16]])).toEqual([[10,16]]);
  });
  it("merge [12,15],[14,18]=[12,18]", () => {
    expect(SweepLine.merge([[12,15],[14,18]])).toEqual([[12,18]]);
  });
  it("merge [14,17],[16,20]=[14,20]", () => {
    expect(SweepLine.merge([[14,17],[16,20]])).toEqual([[14,20]]);
  });
  it("merge [16,19],[18,22]=[16,22]", () => {
    expect(SweepLine.merge([[16,19],[18,22]])).toEqual([[16,22]]);
  });
  it("merge [18,21],[20,24]=[18,24]", () => {
    expect(SweepLine.merge([[18,21],[20,24]])).toEqual([[18,24]]);
  });
  it("merge [20,23],[22,26]=[20,26]", () => {
    expect(SweepLine.merge([[20,23],[22,26]])).toEqual([[20,26]]);
  });
  it("merge [22,25],[24,28]=[22,28]", () => {
    expect(SweepLine.merge([[22,25],[24,28]])).toEqual([[22,28]]);
  });
  it("merge [24,27],[26,30]=[24,30]", () => {
    expect(SweepLine.merge([[24,27],[26,30]])).toEqual([[24,30]]);
  });
  it("merge [26,29],[28,32]=[26,32]", () => {
    expect(SweepLine.merge([[26,29],[28,32]])).toEqual([[26,32]]);
  });
  it("merge [28,31],[30,34]=[28,34]", () => {
    expect(SweepLine.merge([[28,31],[30,34]])).toEqual([[28,34]]);
  });
  it("merge [30,33],[32,36]=[30,36]", () => {
    expect(SweepLine.merge([[30,33],[32,36]])).toEqual([[30,36]]);
  });
  it("merge [32,35],[34,38]=[32,38]", () => {
    expect(SweepLine.merge([[32,35],[34,38]])).toEqual([[32,38]]);
  });
  it("merge [34,37],[36,40]=[34,40]", () => {
    expect(SweepLine.merge([[34,37],[36,40]])).toEqual([[34,40]]);
  });
  it("merge [36,39],[38,42]=[36,42]", () => {
    expect(SweepLine.merge([[36,39],[38,42]])).toEqual([[36,42]]);
  });
  it("merge [38,41],[40,44]=[38,44]", () => {
    expect(SweepLine.merge([[38,41],[40,44]])).toEqual([[38,44]]);
  });
  it("merge disjoint 2 (i=0)", () => {
    expect(SweepLine.merge([[0,1],[3,5]]).length).toBe(2);
  });
  it("merge disjoint 2 (i=1)", () => {
    expect(SweepLine.merge([[0,1],[4,6]]).length).toBe(2);
  });
  it("merge disjoint 2 (i=2)", () => {
    expect(SweepLine.merge([[0,1],[5,7]]).length).toBe(2);
  });
  it("merge disjoint 2 (i=3)", () => {
    expect(SweepLine.merge([[0,1],[6,8]]).length).toBe(2);
  });
  it("merge disjoint 2 (i=4)", () => {
    expect(SweepLine.merge([[0,1],[7,9]]).length).toBe(2);
  });
  it("merge disjoint 2 (i=5)", () => {
    expect(SweepLine.merge([[0,1],[8,10]]).length).toBe(2);
  });
  it("merge disjoint 2 (i=6)", () => {
    expect(SweepLine.merge([[0,1],[9,11]]).length).toBe(2);
  });
  it("merge disjoint 2 (i=7)", () => {
    expect(SweepLine.merge([[0,1],[10,12]]).length).toBe(2);
  });
  it("merge disjoint 2 (i=8)", () => {
    expect(SweepLine.merge([[0,1],[11,13]]).length).toBe(2);
  });
  it("merge disjoint 2 (i=9)", () => {
    expect(SweepLine.merge([[0,1],[12,14]]).length).toBe(2);
  });
  it("merge disjoint 2 (i=10)", () => {
    expect(SweepLine.merge([[0,1],[13,15]]).length).toBe(2);
  });
  it("merge disjoint 2 (i=11)", () => {
    expect(SweepLine.merge([[0,1],[14,16]]).length).toBe(2);
  });
  it("merge disjoint 2 (i=12)", () => {
    expect(SweepLine.merge([[0,1],[15,17]]).length).toBe(2);
  });
  it("merge disjoint 2 (i=13)", () => {
    expect(SweepLine.merge([[0,1],[16,18]]).length).toBe(2);
  });
  it("merge disjoint 2 (i=14)", () => {
    expect(SweepLine.merge([[0,1],[17,19]]).length).toBe(2);
  });
  it("merge disjoint 2 (i=15)", () => {
    expect(SweepLine.merge([[0,1],[18,20]]).length).toBe(2);
  });
  it("merge disjoint 2 (i=16)", () => {
    expect(SweepLine.merge([[0,1],[19,21]]).length).toBe(2);
  });
  it("merge disjoint 2 (i=17)", () => {
    expect(SweepLine.merge([[0,1],[20,22]]).length).toBe(2);
  });
  it("merge disjoint 2 (i=18)", () => {
    expect(SweepLine.merge([[0,1],[21,23]]).length).toBe(2);
  });
});

describe('SweepLine countOverlaps', () => {
  it("countOverlaps empty", () => {
    expect(SweepLine.countOverlaps([])).toEqual([]);
  });
  it("single [0,3] 2 events", () => {
    expect(SweepLine.countOverlaps([[0,3]]).length).toBe(2);
  });
  it("single [1,4] 2 events", () => {
    expect(SweepLine.countOverlaps([[1,4]]).length).toBe(2);
  });
  it("single [2,5] 2 events", () => {
    expect(SweepLine.countOverlaps([[2,5]]).length).toBe(2);
  });
  it("single [3,6] 2 events", () => {
    expect(SweepLine.countOverlaps([[3,6]]).length).toBe(2);
  });
  it("single [4,7] 2 events", () => {
    expect(SweepLine.countOverlaps([[4,7]]).length).toBe(2);
  });
  it("single [5,8] 2 events", () => {
    expect(SweepLine.countOverlaps([[5,8]]).length).toBe(2);
  });
  it("single [6,9] 2 events", () => {
    expect(SweepLine.countOverlaps([[6,9]]).length).toBe(2);
  });
  it("single [7,10] 2 events", () => {
    expect(SweepLine.countOverlaps([[7,10]]).length).toBe(2);
  });
  it("single [8,11] 2 events", () => {
    expect(SweepLine.countOverlaps([[8,11]]).length).toBe(2);
  });
  it("single [9,12] 2 events", () => {
    expect(SweepLine.countOverlaps([[9,12]]).length).toBe(2);
  });
  it("single [10,13] 2 events", () => {
    expect(SweepLine.countOverlaps([[10,13]]).length).toBe(2);
  });
  it("single [11,14] 2 events", () => {
    expect(SweepLine.countOverlaps([[11,14]]).length).toBe(2);
  });
  it("single [12,15] 2 events", () => {
    expect(SweepLine.countOverlaps([[12,15]]).length).toBe(2);
  });
  it("single [13,16] 2 events", () => {
    expect(SweepLine.countOverlaps([[13,16]]).length).toBe(2);
  });
  it("single [14,17] 2 events", () => {
    expect(SweepLine.countOverlaps([[14,17]]).length).toBe(2);
  });
  it("single [15,18] 2 events", () => {
    expect(SweepLine.countOverlaps([[15,18]]).length).toBe(2);
  });
  it("single [16,19] 2 events", () => {
    expect(SweepLine.countOverlaps([[16,19]]).length).toBe(2);
  });
  it("single [17,20] 2 events", () => {
    expect(SweepLine.countOverlaps([[17,20]]).length).toBe(2);
  });
  it("single [18,21] 2 events", () => {
    expect(SweepLine.countOverlaps([[18,21]]).length).toBe(2);
  });
  it("single [19,22] 2 events", () => {
    expect(SweepLine.countOverlaps([[19,22]]).length).toBe(2);
  });
  it("two overlapping 4 events (i=0)", () => {
    expect(SweepLine.countOverlaps([[0,4],[2,6]]).length).toBe(4);
  });
  it("two overlapping 4 events (i=1)", () => {
    expect(SweepLine.countOverlaps([[1,5],[3,7]]).length).toBe(4);
  });
  it("two overlapping 4 events (i=2)", () => {
    expect(SweepLine.countOverlaps([[2,6],[4,8]]).length).toBe(4);
  });
  it("two overlapping 4 events (i=3)", () => {
    expect(SweepLine.countOverlaps([[3,7],[5,9]]).length).toBe(4);
  });
  it("two overlapping 4 events (i=4)", () => {
    expect(SweepLine.countOverlaps([[4,8],[6,10]]).length).toBe(4);
  });
  it("two overlapping 4 events (i=5)", () => {
    expect(SweepLine.countOverlaps([[5,9],[7,11]]).length).toBe(4);
  });
  it("two overlapping 4 events (i=6)", () => {
    expect(SweepLine.countOverlaps([[6,10],[8,12]]).length).toBe(4);
  });
  it("two overlapping 4 events (i=7)", () => {
    expect(SweepLine.countOverlaps([[7,11],[9,13]]).length).toBe(4);
  });
  it("two overlapping 4 events (i=8)", () => {
    expect(SweepLine.countOverlaps([[8,12],[10,14]]).length).toBe(4);
  });
  it("two overlapping 4 events (i=9)", () => {
    expect(SweepLine.countOverlaps([[9,13],[11,15]]).length).toBe(4);
  });
  it("two overlapping 4 events (i=10)", () => {
    expect(SweepLine.countOverlaps([[10,14],[12,16]]).length).toBe(4);
  });
  it("two overlapping 4 events (i=11)", () => {
    expect(SweepLine.countOverlaps([[11,15],[13,17]]).length).toBe(4);
  });
  it("two overlapping 4 events (i=12)", () => {
    expect(SweepLine.countOverlaps([[12,16],[14,18]]).length).toBe(4);
  });
  it("two overlapping 4 events (i=13)", () => {
    expect(SweepLine.countOverlaps([[13,17],[15,19]]).length).toBe(4);
  });
  it("two overlapping 4 events (i=14)", () => {
    expect(SweepLine.countOverlaps([[14,18],[16,20]]).length).toBe(4);
  });
  it("two overlapping 4 events (i=15)", () => {
    expect(SweepLine.countOverlaps([[15,19],[17,21]]).length).toBe(4);
  });
  it("two overlapping 4 events (i=16)", () => {
    expect(SweepLine.countOverlaps([[16,20],[18,22]]).length).toBe(4);
  });
  it("two overlapping 4 events (i=17)", () => {
    expect(SweepLine.countOverlaps([[17,21],[19,23]]).length).toBe(4);
  });
  it("two overlapping 4 events (i=18)", () => {
    expect(SweepLine.countOverlaps([[18,22],[20,24]]).length).toBe(4);
  });
});

describe('IntervalTree generic data', () => {
  it("data A stored (i=0)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:0,hi:5,data:'A'});
    const r=t.findExact(0,5);
    expect(r).toBeDefined();
    expect(r!.data).toBe('A');
  });
  it("data B stored (i=1)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:1,hi:6,data:'B'});
    const r=t.findExact(1,6);
    expect(r).toBeDefined();
    expect(r!.data).toBe('B');
  });
  it("data C stored (i=2)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:2,hi:7,data:'C'});
    const r=t.findExact(2,7);
    expect(r).toBeDefined();
    expect(r!.data).toBe('C');
  });
  it("data D stored (i=3)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:3,hi:8,data:'D'});
    const r=t.findExact(3,8);
    expect(r).toBeDefined();
    expect(r!.data).toBe('D');
  });
  it("data E stored (i=4)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:4,hi:9,data:'E'});
    const r=t.findExact(4,9);
    expect(r).toBeDefined();
    expect(r!.data).toBe('E');
  });
  it("data F stored (i=5)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:5,hi:10,data:'F'});
    const r=t.findExact(5,10);
    expect(r).toBeDefined();
    expect(r!.data).toBe('F');
  });
  it("data G stored (i=6)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:6,hi:11,data:'G'});
    const r=t.findExact(6,11);
    expect(r).toBeDefined();
    expect(r!.data).toBe('G');
  });
  it("data H stored (i=7)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:7,hi:12,data:'H'});
    const r=t.findExact(7,12);
    expect(r).toBeDefined();
    expect(r!.data).toBe('H');
  });
  it("data I stored (i=8)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:8,hi:13,data:'I'});
    const r=t.findExact(8,13);
    expect(r).toBeDefined();
    expect(r!.data).toBe('I');
  });
  it("data J stored (i=9)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:9,hi:14,data:'J'});
    const r=t.findExact(9,14);
    expect(r).toBeDefined();
    expect(r!.data).toBe('J');
  });
  it("data K stored (i=10)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:10,hi:15,data:'K'});
    const r=t.findExact(10,15);
    expect(r).toBeDefined();
    expect(r!.data).toBe('K');
  });
  it("data L stored (i=11)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:11,hi:16,data:'L'});
    const r=t.findExact(11,16);
    expect(r).toBeDefined();
    expect(r!.data).toBe('L');
  });
  it("data M stored (i=12)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:12,hi:17,data:'M'});
    const r=t.findExact(12,17);
    expect(r).toBeDefined();
    expect(r!.data).toBe('M');
  });
  it("data N stored (i=13)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:13,hi:18,data:'N'});
    const r=t.findExact(13,18);
    expect(r).toBeDefined();
    expect(r!.data).toBe('N');
  });
  it("data O stored (i=14)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:14,hi:19,data:'O'});
    const r=t.findExact(14,19);
    expect(r).toBeDefined();
    expect(r!.data).toBe('O');
  });
  it("data P stored (i=15)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:15,hi:20,data:'P'});
    const r=t.findExact(15,20);
    expect(r).toBeDefined();
    expect(r!.data).toBe('P');
  });
  it("data Q stored (i=16)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:16,hi:21,data:'Q'});
    const r=t.findExact(16,21);
    expect(r).toBeDefined();
    expect(r!.data).toBe('Q');
  });
  it("data R stored (i=17)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:17,hi:22,data:'R'});
    const r=t.findExact(17,22);
    expect(r).toBeDefined();
    expect(r!.data).toBe('R');
  });
  it("data S stored (i=18)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:18,hi:23,data:'S'});
    const r=t.findExact(18,23);
    expect(r).toBeDefined();
    expect(r!.data).toBe('S');
  });
  it("data T stored (i=19)", () => {
    const t = new IntervalTree<string>();
    t.insert({lo:19,hi:24,data:'T'});
    const r=t.findExact(19,24);
    expect(r).toBeDefined();
    expect(r!.data).toBe('T');
  });
  it("data 0 in findOverlapping (i=0)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:0,hi:4,data:0});
    const res=t.findOverlapping(0,4);
    expect(res[0].data).toBe(0);
  });
  it("data 100 in findOverlapping (i=1)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:2,hi:6,data:100});
    const res=t.findOverlapping(2,6);
    expect(res[0].data).toBe(100);
  });
  it("data 200 in findOverlapping (i=2)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:4,hi:8,data:200});
    const res=t.findOverlapping(4,8);
    expect(res[0].data).toBe(200);
  });
  it("data 300 in findOverlapping (i=3)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:6,hi:10,data:300});
    const res=t.findOverlapping(6,10);
    expect(res[0].data).toBe(300);
  });
  it("data 400 in findOverlapping (i=4)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:8,hi:12,data:400});
    const res=t.findOverlapping(8,12);
    expect(res[0].data).toBe(400);
  });
  it("data 500 in findOverlapping (i=5)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:10,hi:14,data:500});
    const res=t.findOverlapping(10,14);
    expect(res[0].data).toBe(500);
  });
  it("data 600 in findOverlapping (i=6)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:12,hi:16,data:600});
    const res=t.findOverlapping(12,16);
    expect(res[0].data).toBe(600);
  });
  it("data 700 in findOverlapping (i=7)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:14,hi:18,data:700});
    const res=t.findOverlapping(14,18);
    expect(res[0].data).toBe(700);
  });
  it("data 800 in findOverlapping (i=8)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:16,hi:20,data:800});
    const res=t.findOverlapping(16,20);
    expect(res[0].data).toBe(800);
  });
  it("data 900 in findOverlapping (i=9)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:18,hi:22,data:900});
    const res=t.findOverlapping(18,22);
    expect(res[0].data).toBe(900);
  });
  it("data 1000 in findOverlapping (i=10)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:20,hi:24,data:1000});
    const res=t.findOverlapping(20,24);
    expect(res[0].data).toBe(1000);
  });
  it("data 1100 in findOverlapping (i=11)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:22,hi:26,data:1100});
    const res=t.findOverlapping(22,26);
    expect(res[0].data).toBe(1100);
  });
  it("data 1200 in findOverlapping (i=12)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:24,hi:28,data:1200});
    const res=t.findOverlapping(24,28);
    expect(res[0].data).toBe(1200);
  });
  it("data 1300 in findOverlapping (i=13)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:26,hi:30,data:1300});
    const res=t.findOverlapping(26,30);
    expect(res[0].data).toBe(1300);
  });
  it("data 1400 in findOverlapping (i=14)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:28,hi:32,data:1400});
    const res=t.findOverlapping(28,32);
    expect(res[0].data).toBe(1400);
  });
  it("data 1500 in findOverlapping (i=15)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:30,hi:34,data:1500});
    const res=t.findOverlapping(30,34);
    expect(res[0].data).toBe(1500);
  });
  it("data 1600 in findOverlapping (i=16)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:32,hi:36,data:1600});
    const res=t.findOverlapping(32,36);
    expect(res[0].data).toBe(1600);
  });
  it("data 1700 in findOverlapping (i=17)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:34,hi:38,data:1700});
    const res=t.findOverlapping(34,38);
    expect(res[0].data).toBe(1700);
  });
  it("data 1800 in findOverlapping (i=18)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:36,hi:40,data:1800});
    const res=t.findOverlapping(36,40);
    expect(res[0].data).toBe(1800);
  });
  it("data 1900 in findOverlapping (i=19)", () => {
    const t = new IntervalTree<number>();
    t.insert({lo:38,hi:42,data:1900});
    const res=t.findOverlapping(38,42);
    expect(res[0].data).toBe(1900);
  });
});

describe('SegmentTree sequential updates', () => {
  it("ST multi-update 1 sum=1", () => {
    const st=new SegmentTree(new Array(1).fill(0));
    for (let j=0;j<1;j++) st.update(j,j+1);
    expect(st.query(0,0)).toBe(1);
  });
  it("ST multi-update 2 sum=3", () => {
    const st=new SegmentTree(new Array(2).fill(0));
    for (let j=0;j<2;j++) st.update(j,j+1);
    expect(st.query(0,1)).toBe(3);
  });
  it("ST multi-update 3 sum=6", () => {
    const st=new SegmentTree(new Array(3).fill(0));
    for (let j=0;j<3;j++) st.update(j,j+1);
    expect(st.query(0,2)).toBe(6);
  });
  it("ST multi-update 4 sum=10", () => {
    const st=new SegmentTree(new Array(4).fill(0));
    for (let j=0;j<4;j++) st.update(j,j+1);
    expect(st.query(0,3)).toBe(10);
  });
  it("ST multi-update 5 sum=15", () => {
    const st=new SegmentTree(new Array(5).fill(0));
    for (let j=0;j<5;j++) st.update(j,j+1);
    expect(st.query(0,4)).toBe(15);
  });
  it("ST multi-update 6 sum=21", () => {
    const st=new SegmentTree(new Array(6).fill(0));
    for (let j=0;j<6;j++) st.update(j,j+1);
    expect(st.query(0,5)).toBe(21);
  });
  it("ST multi-update 7 sum=28", () => {
    const st=new SegmentTree(new Array(7).fill(0));
    for (let j=0;j<7;j++) st.update(j,j+1);
    expect(st.query(0,6)).toBe(28);
  });
  it("ST multi-update 8 sum=36", () => {
    const st=new SegmentTree(new Array(8).fill(0));
    for (let j=0;j<8;j++) st.update(j,j+1);
    expect(st.query(0,7)).toBe(36);
  });
  it("ST multi-update 9 sum=45", () => {
    const st=new SegmentTree(new Array(9).fill(0));
    for (let j=0;j<9;j++) st.update(j,j+1);
    expect(st.query(0,8)).toBe(45);
  });
  it("ST multi-update 10 sum=55", () => {
    const st=new SegmentTree(new Array(10).fill(0));
    for (let j=0;j<10;j++) st.update(j,j+1);
    expect(st.query(0,9)).toBe(55);
  });
  it("ST multi-update 11 sum=66", () => {
    const st=new SegmentTree(new Array(11).fill(0));
    for (let j=0;j<11;j++) st.update(j,j+1);
    expect(st.query(0,10)).toBe(66);
  });
  it("ST multi-update 12 sum=78", () => {
    const st=new SegmentTree(new Array(12).fill(0));
    for (let j=0;j<12;j++) st.update(j,j+1);
    expect(st.query(0,11)).toBe(78);
  });
  it("ST multi-update 13 sum=91", () => {
    const st=new SegmentTree(new Array(13).fill(0));
    for (let j=0;j<13;j++) st.update(j,j+1);
    expect(st.query(0,12)).toBe(91);
  });
  it("ST multi-update 14 sum=105", () => {
    const st=new SegmentTree(new Array(14).fill(0));
    for (let j=0;j<14;j++) st.update(j,j+1);
    expect(st.query(0,13)).toBe(105);
  });
  it("ST multi-update 15 sum=120", () => {
    const st=new SegmentTree(new Array(15).fill(0));
    for (let j=0;j<15;j++) st.update(j,j+1);
    expect(st.query(0,14)).toBe(120);
  });
  it("ST multi-update 16 sum=136", () => {
    const st=new SegmentTree(new Array(16).fill(0));
    for (let j=0;j<16;j++) st.update(j,j+1);
    expect(st.query(0,15)).toBe(136);
  });
  it("ST multi-update 17 sum=153", () => {
    const st=new SegmentTree(new Array(17).fill(0));
    for (let j=0;j<17;j++) st.update(j,j+1);
    expect(st.query(0,16)).toBe(153);
  });
  it("ST multi-update 18 sum=171", () => {
    const st=new SegmentTree(new Array(18).fill(0));
    for (let j=0;j<18;j++) st.update(j,j+1);
    expect(st.query(0,17)).toBe(171);
  });
  it("ST multi-update 19 sum=190", () => {
    const st=new SegmentTree(new Array(19).fill(0));
    for (let j=0;j<19;j++) st.update(j,j+1);
    expect(st.query(0,18)).toBe(190);
  });
  it("ST multi-update 20 sum=210", () => {
    const st=new SegmentTree(new Array(20).fill(0));
    for (let j=0;j<20;j++) st.update(j,j+1);
    expect(st.query(0,19)).toBe(210);
  });
  it("ST multi-update 21 sum=231", () => {
    const st=new SegmentTree(new Array(21).fill(0));
    for (let j=0;j<21;j++) st.update(j,j+1);
    expect(st.query(0,20)).toBe(231);
  });
  it("ST multi-update 22 sum=253", () => {
    const st=new SegmentTree(new Array(22).fill(0));
    for (let j=0;j<22;j++) st.update(j,j+1);
    expect(st.query(0,21)).toBe(253);
  });
  it("ST multi-update 23 sum=276", () => {
    const st=new SegmentTree(new Array(23).fill(0));
    for (let j=0;j<23;j++) st.update(j,j+1);
    expect(st.query(0,22)).toBe(276);
  });
  it("ST multi-update 24 sum=300", () => {
    const st=new SegmentTree(new Array(24).fill(0));
    for (let j=0;j<24;j++) st.update(j,j+1);
    expect(st.query(0,23)).toBe(300);
  });
  it("ST multi-update 25 sum=325", () => {
    const st=new SegmentTree(new Array(25).fill(0));
    for (let j=0;j<25;j++) st.update(j,j+1);
    expect(st.query(0,24)).toBe(325);
  });
  it("ST multi-update 26 sum=351", () => {
    const st=new SegmentTree(new Array(26).fill(0));
    for (let j=0;j<26;j++) st.update(j,j+1);
    expect(st.query(0,25)).toBe(351);
  });
  it("ST multi-update 27 sum=378", () => {
    const st=new SegmentTree(new Array(27).fill(0));
    for (let j=0;j<27;j++) st.update(j,j+1);
    expect(st.query(0,26)).toBe(378);
  });
  it("ST multi-update 28 sum=406", () => {
    const st=new SegmentTree(new Array(28).fill(0));
    for (let j=0;j<28;j++) st.update(j,j+1);
    expect(st.query(0,27)).toBe(406);
  });
  it("ST multi-update 29 sum=435", () => {
    const st=new SegmentTree(new Array(29).fill(0));
    for (let j=0;j<29;j++) st.update(j,j+1);
    expect(st.query(0,28)).toBe(435);
  });
  it("ST multi-update 30 sum=465", () => {
    const st=new SegmentTree(new Array(30).fill(0));
    for (let j=0;j<30;j++) st.update(j,j+1);
    expect(st.query(0,29)).toBe(465);
  });
});

describe('FenwickTree accumulation', () => {
  it("FW +1 twice=2", () => {
    const ft=new FenwickTree(10);
    ft.update(0,1);ft.update(0,1);
    expect(ft.prefixSum(0)).toBe(2);
  });
  it("FW +2 twice=4", () => {
    const ft=new FenwickTree(10);
    ft.update(0,2);ft.update(0,2);
    expect(ft.prefixSum(0)).toBe(4);
  });
  it("FW +3 twice=6", () => {
    const ft=new FenwickTree(10);
    ft.update(0,3);ft.update(0,3);
    expect(ft.prefixSum(0)).toBe(6);
  });
  it("FW +4 twice=8", () => {
    const ft=new FenwickTree(10);
    ft.update(0,4);ft.update(0,4);
    expect(ft.prefixSum(0)).toBe(8);
  });
  it("FW +5 twice=10", () => {
    const ft=new FenwickTree(10);
    ft.update(0,5);ft.update(0,5);
    expect(ft.prefixSum(0)).toBe(10);
  });
  it("FW +6 twice=12", () => {
    const ft=new FenwickTree(10);
    ft.update(0,6);ft.update(0,6);
    expect(ft.prefixSum(0)).toBe(12);
  });
  it("FW +7 twice=14", () => {
    const ft=new FenwickTree(10);
    ft.update(0,7);ft.update(0,7);
    expect(ft.prefixSum(0)).toBe(14);
  });
  it("FW +8 twice=16", () => {
    const ft=new FenwickTree(10);
    ft.update(0,8);ft.update(0,8);
    expect(ft.prefixSum(0)).toBe(16);
  });
  it("FW +9 twice=18", () => {
    const ft=new FenwickTree(10);
    ft.update(0,9);ft.update(0,9);
    expect(ft.prefixSum(0)).toBe(18);
  });
  it("FW +10 twice=20", () => {
    const ft=new FenwickTree(10);
    ft.update(0,10);ft.update(0,10);
    expect(ft.prefixSum(0)).toBe(20);
  });
  it("FW +11 twice=22", () => {
    const ft=new FenwickTree(10);
    ft.update(0,11);ft.update(0,11);
    expect(ft.prefixSum(0)).toBe(22);
  });
  it("FW +12 twice=24", () => {
    const ft=new FenwickTree(10);
    ft.update(0,12);ft.update(0,12);
    expect(ft.prefixSum(0)).toBe(24);
  });
  it("FW +13 twice=26", () => {
    const ft=new FenwickTree(10);
    ft.update(0,13);ft.update(0,13);
    expect(ft.prefixSum(0)).toBe(26);
  });
  it("FW +14 twice=28", () => {
    const ft=new FenwickTree(10);
    ft.update(0,14);ft.update(0,14);
    expect(ft.prefixSum(0)).toBe(28);
  });
  it("FW +15 twice=30", () => {
    const ft=new FenwickTree(10);
    ft.update(0,15);ft.update(0,15);
    expect(ft.prefixSum(0)).toBe(30);
  });
  it("FW +16 twice=32", () => {
    const ft=new FenwickTree(10);
    ft.update(0,16);ft.update(0,16);
    expect(ft.prefixSum(0)).toBe(32);
  });
  it("FW +17 twice=34", () => {
    const ft=new FenwickTree(10);
    ft.update(0,17);ft.update(0,17);
    expect(ft.prefixSum(0)).toBe(34);
  });
  it("FW +18 twice=36", () => {
    const ft=new FenwickTree(10);
    ft.update(0,18);ft.update(0,18);
    expect(ft.prefixSum(0)).toBe(36);
  });
  it("FW +19 twice=38", () => {
    const ft=new FenwickTree(10);
    ft.update(0,19);ft.update(0,19);
    expect(ft.prefixSum(0)).toBe(38);
  });
  it("FW +20 twice=40", () => {
    const ft=new FenwickTree(10);
    ft.update(0,20);ft.update(0,20);
    expect(ft.prefixSum(0)).toBe(40);
  });
  it("FW +21 twice=42", () => {
    const ft=new FenwickTree(10);
    ft.update(0,21);ft.update(0,21);
    expect(ft.prefixSum(0)).toBe(42);
  });
  it("FW +22 twice=44", () => {
    const ft=new FenwickTree(10);
    ft.update(0,22);ft.update(0,22);
    expect(ft.prefixSum(0)).toBe(44);
  });
  it("FW +23 twice=46", () => {
    const ft=new FenwickTree(10);
    ft.update(0,23);ft.update(0,23);
    expect(ft.prefixSum(0)).toBe(46);
  });
  it("FW +24 twice=48", () => {
    const ft=new FenwickTree(10);
    ft.update(0,24);ft.update(0,24);
    expect(ft.prefixSum(0)).toBe(48);
  });
  it("FW +25 twice=50", () => {
    const ft=new FenwickTree(10);
    ft.update(0,25);ft.update(0,25);
    expect(ft.prefixSum(0)).toBe(50);
  });
  it("FW +26 twice=52", () => {
    const ft=new FenwickTree(10);
    ft.update(0,26);ft.update(0,26);
    expect(ft.prefixSum(0)).toBe(52);
  });
  it("FW +27 twice=54", () => {
    const ft=new FenwickTree(10);
    ft.update(0,27);ft.update(0,27);
    expect(ft.prefixSum(0)).toBe(54);
  });
  it("FW +28 twice=56", () => {
    const ft=new FenwickTree(10);
    ft.update(0,28);ft.update(0,28);
    expect(ft.prefixSum(0)).toBe(56);
  });
  it("FW +29 twice=58", () => {
    const ft=new FenwickTree(10);
    ft.update(0,29);ft.update(0,29);
    expect(ft.prefixSum(0)).toBe(58);
  });
  it("FW +30 twice=60", () => {
    const ft=new FenwickTree(10);
    ft.update(0,30);ft.update(0,30);
    expect(ft.prefixSum(0)).toBe(60);
  });
});

describe('IntervalTree remove re-query', () => {
  it("remove [0,3] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:3});
    t.remove(0,3);
    expect(t.findExact(0,3)).toBeUndefined();
  });
  it("remove [5,8] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:5,hi:8});
    t.remove(5,8);
    expect(t.findExact(5,8)).toBeUndefined();
  });
  it("remove [10,13] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:10,hi:13});
    t.remove(10,13);
    expect(t.findExact(10,13)).toBeUndefined();
  });
  it("remove [15,18] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:15,hi:18});
    t.remove(15,18);
    expect(t.findExact(15,18)).toBeUndefined();
  });
  it("remove [20,23] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:20,hi:23});
    t.remove(20,23);
    expect(t.findExact(20,23)).toBeUndefined();
  });
  it("remove [25,28] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:25,hi:28});
    t.remove(25,28);
    expect(t.findExact(25,28)).toBeUndefined();
  });
  it("remove [30,33] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:30,hi:33});
    t.remove(30,33);
    expect(t.findExact(30,33)).toBeUndefined();
  });
  it("remove [35,38] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:35,hi:38});
    t.remove(35,38);
    expect(t.findExact(35,38)).toBeUndefined();
  });
  it("remove [40,43] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:40,hi:43});
    t.remove(40,43);
    expect(t.findExact(40,43)).toBeUndefined();
  });
  it("remove [45,48] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:45,hi:48});
    t.remove(45,48);
    expect(t.findExact(45,48)).toBeUndefined();
  });
  it("remove [50,53] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:50,hi:53});
    t.remove(50,53);
    expect(t.findExact(50,53)).toBeUndefined();
  });
  it("remove [55,58] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:55,hi:58});
    t.remove(55,58);
    expect(t.findExact(55,58)).toBeUndefined();
  });
  it("remove [60,63] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:60,hi:63});
    t.remove(60,63);
    expect(t.findExact(60,63)).toBeUndefined();
  });
  it("remove [65,68] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:65,hi:68});
    t.remove(65,68);
    expect(t.findExact(65,68)).toBeUndefined();
  });
  it("remove [70,73] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:70,hi:73});
    t.remove(70,73);
    expect(t.findExact(70,73)).toBeUndefined();
  });
  it("remove [75,78] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:75,hi:78});
    t.remove(75,78);
    expect(t.findExact(75,78)).toBeUndefined();
  });
  it("remove [80,83] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:80,hi:83});
    t.remove(80,83);
    expect(t.findExact(80,83)).toBeUndefined();
  });
  it("remove [85,88] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:85,hi:88});
    t.remove(85,88);
    expect(t.findExact(85,88)).toBeUndefined();
  });
  it("remove [90,93] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:90,hi:93});
    t.remove(90,93);
    expect(t.findExact(90,93)).toBeUndefined();
  });
  it("remove [95,98] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:95,hi:98});
    t.remove(95,98);
    expect(t.findExact(95,98)).toBeUndefined();
  });
  it("remove [100,103] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:100,hi:103});
    t.remove(100,103);
    expect(t.findExact(100,103)).toBeUndefined();
  });
  it("remove [105,108] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:105,hi:108});
    t.remove(105,108);
    expect(t.findExact(105,108)).toBeUndefined();
  });
  it("remove [110,113] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:110,hi:113});
    t.remove(110,113);
    expect(t.findExact(110,113)).toBeUndefined();
  });
  it("remove [115,118] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:115,hi:118});
    t.remove(115,118);
    expect(t.findExact(115,118)).toBeUndefined();
  });
  it("remove [120,123] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:120,hi:123});
    t.remove(120,123);
    expect(t.findExact(120,123)).toBeUndefined();
  });
  it("remove [125,128] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:125,hi:128});
    t.remove(125,128);
    expect(t.findExact(125,128)).toBeUndefined();
  });
  it("remove [130,133] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:130,hi:133});
    t.remove(130,133);
    expect(t.findExact(130,133)).toBeUndefined();
  });
  it("remove [135,138] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:135,hi:138});
    t.remove(135,138);
    expect(t.findExact(135,138)).toBeUndefined();
  });
  it("remove [140,143] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:140,hi:143});
    t.remove(140,143);
    expect(t.findExact(140,143)).toBeUndefined();
  });
  it("remove [145,148] findExact undef", () => {
    const t=new IntervalTree();
    t.insert({lo:145,hi:148});
    t.remove(145,148);
    expect(t.findExact(145,148)).toBeUndefined();
  });
});

describe('SegmentTree partial queries', () => {
  it("ST first 1 asc sum=1", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,0)).toBe(1);
  });
  it("ST first 2 asc sum=3", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,1)).toBe(3);
  });
  it("ST first 3 asc sum=6", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,2)).toBe(6);
  });
  it("ST first 4 asc sum=10", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,3)).toBe(10);
  });
  it("ST first 5 asc sum=15", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,4)).toBe(15);
  });
  it("ST first 6 asc sum=21", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,5)).toBe(21);
  });
  it("ST first 7 asc sum=28", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,6)).toBe(28);
  });
  it("ST first 8 asc sum=36", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,7)).toBe(36);
  });
  it("ST first 9 asc sum=45", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,8)).toBe(45);
  });
  it("ST first 10 asc sum=55", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,9)).toBe(55);
  });
  it("ST first 11 asc sum=66", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,10)).toBe(66);
  });
  it("ST first 12 asc sum=78", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,11)).toBe(78);
  });
  it("ST first 13 asc sum=91", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,12)).toBe(91);
  });
  it("ST first 14 asc sum=105", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,13)).toBe(105);
  });
  it("ST first 15 asc sum=120", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,14)).toBe(120);
  });
  it("ST first 16 asc sum=136", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,15)).toBe(136);
  });
  it("ST first 17 asc sum=153", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,16)).toBe(153);
  });
  it("ST first 18 asc sum=171", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,17)).toBe(171);
  });
  it("ST first 19 asc sum=190", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,18)).toBe(190);
  });
  it("ST first 20 asc sum=210", () => {
    const vals=Array.from({length:20},(_,j)=>j+1);
    const st=new SegmentTree(vals);
    expect(st.query(0,19)).toBe(210);
  });
  it("ST suffix [0,19] all-1=20", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(0,19)).toBe(20);
  });
  it("ST suffix [1,19] all-1=19", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(1,19)).toBe(19);
  });
  it("ST suffix [2,19] all-1=18", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(2,19)).toBe(18);
  });
  it("ST suffix [3,19] all-1=17", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(3,19)).toBe(17);
  });
  it("ST suffix [4,19] all-1=16", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(4,19)).toBe(16);
  });
  it("ST suffix [5,19] all-1=15", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(5,19)).toBe(15);
  });
  it("ST suffix [6,19] all-1=14", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(6,19)).toBe(14);
  });
  it("ST suffix [7,19] all-1=13", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(7,19)).toBe(13);
  });
  it("ST suffix [8,19] all-1=12", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(8,19)).toBe(12);
  });
  it("ST suffix [9,19] all-1=11", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(9,19)).toBe(11);
  });
  it("ST suffix [10,19] all-1=10", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(10,19)).toBe(10);
  });
  it("ST suffix [11,19] all-1=9", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(11,19)).toBe(9);
  });
  it("ST suffix [12,19] all-1=8", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(12,19)).toBe(8);
  });
  it("ST suffix [13,19] all-1=7", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(13,19)).toBe(7);
  });
  it("ST suffix [14,19] all-1=6", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(14,19)).toBe(6);
  });
  it("ST suffix [15,19] all-1=5", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(15,19)).toBe(5);
  });
  it("ST suffix [16,19] all-1=4", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(16,19)).toBe(4);
  });
  it("ST suffix [17,19] all-1=3", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(17,19)).toBe(3);
  });
  it("ST suffix [18,19] all-1=2", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(18,19)).toBe(2);
  });
  it("ST suffix [19,19] all-1=1", () => {
    const st=new SegmentTree(new Array(20).fill(1));
    expect(st.query(19,19)).toBe(1);
  });
});

describe('IntervalTree empty', () => {
  it("empty findOverlapping (0)", () => {
    expect(new IntervalTree().findOverlapping(0,3)).toEqual([]);
  });
  it("empty findOverlapping (1)", () => {
    expect(new IntervalTree().findOverlapping(1,4)).toEqual([]);
  });
  it("empty findOverlapping (2)", () => {
    expect(new IntervalTree().findOverlapping(2,5)).toEqual([]);
  });
  it("empty findOverlapping (3)", () => {
    expect(new IntervalTree().findOverlapping(3,6)).toEqual([]);
  });
  it("empty findOverlapping (4)", () => {
    expect(new IntervalTree().findOverlapping(4,7)).toEqual([]);
  });
  it("empty findOverlapping (5)", () => {
    expect(new IntervalTree().findOverlapping(5,8)).toEqual([]);
  });
  it("empty findOverlapping (6)", () => {
    expect(new IntervalTree().findOverlapping(6,9)).toEqual([]);
  });
  it("empty findOverlapping (7)", () => {
    expect(new IntervalTree().findOverlapping(7,10)).toEqual([]);
  });
  it("empty findOverlapping (8)", () => {
    expect(new IntervalTree().findOverlapping(8,11)).toEqual([]);
  });
  it("empty findOverlapping (9)", () => {
    expect(new IntervalTree().findOverlapping(9,12)).toEqual([]);
  });
  it("empty findContaining (0)", () => {
    expect(new IntervalTree().findContaining(0)).toEqual([]);
  });
  it("empty findContaining (1)", () => {
    expect(new IntervalTree().findContaining(1)).toEqual([]);
  });
  it("empty findContaining (2)", () => {
    expect(new IntervalTree().findContaining(2)).toEqual([]);
  });
  it("empty findContaining (3)", () => {
    expect(new IntervalTree().findContaining(3)).toEqual([]);
  });
  it("empty findContaining (4)", () => {
    expect(new IntervalTree().findContaining(4)).toEqual([]);
  });
  it("empty findContaining (5)", () => {
    expect(new IntervalTree().findContaining(5)).toEqual([]);
  });
  it("empty findContaining (6)", () => {
    expect(new IntervalTree().findContaining(6)).toEqual([]);
  });
  it("empty findContaining (7)", () => {
    expect(new IntervalTree().findContaining(7)).toEqual([]);
  });
  it("empty findContaining (8)", () => {
    expect(new IntervalTree().findContaining(8)).toEqual([]);
  });
  it("empty findContaining (9)", () => {
    expect(new IntervalTree().findContaining(9)).toEqual([]);
  });
});

describe('SweepLine merge idempotent', () => {
  it("5 disjoint merge unchanged (i=0)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+0,j*10+0+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=1)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+1,j*10+1+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=2)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+2,j*10+2+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=3)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+3,j*10+3+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=4)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+4,j*10+4+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=5)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+5,j*10+5+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=6)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+6,j*10+6+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=7)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+7,j*10+7+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=8)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+8,j*10+8+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=9)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+9,j*10+9+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=10)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+10,j*10+10+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=11)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+11,j*10+11+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=12)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+12,j*10+12+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=13)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+13,j*10+13+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=14)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+14,j*10+14+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=15)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+15,j*10+15+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=16)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+16,j*10+16+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=17)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+17,j*10+17+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=18)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+18,j*10+18+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
  it("5 disjoint merge unchanged (i=19)", () => {
    const pairs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) pairs.push([j*10+19,j*10+19+3]);
    expect(SweepLine.merge(pairs).length).toBe(5);
  });
});

describe('IntervalTree disjoint gap', () => {
  it("gap [11,19]=0 (i=0)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=1)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=2)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=3)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=4)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=5)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=6)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=7)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=8)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=9)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=10)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=11)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=12)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=13)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=14)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=15)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=16)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=17)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=18)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=19)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=20)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=21)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=22)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=23)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=24)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=25)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=26)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=27)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=28)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
  it("gap [11,19]=0 (i=29)", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:10});t.insert({lo:20,hi:30});
    expect(t.findOverlapping(11,19).length).toBe(0);
  });
});

describe('FenwickTree negative', () => {
  it("FW +1 -1 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,1);ft.update(5,-1);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +2 -2 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,2);ft.update(5,-2);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +3 -3 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,3);ft.update(5,-3);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +4 -4 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,4);ft.update(5,-4);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +5 -5 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,5);ft.update(5,-5);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +6 -6 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,6);ft.update(5,-6);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +7 -7 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,7);ft.update(5,-7);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +8 -8 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,8);ft.update(5,-8);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +9 -9 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,9);ft.update(5,-9);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +10 -10 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,10);ft.update(5,-10);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +11 -11 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,11);ft.update(5,-11);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +12 -12 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,12);ft.update(5,-12);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +13 -13 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,13);ft.update(5,-13);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +14 -14 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,14);ft.update(5,-14);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +15 -15 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,15);ft.update(5,-15);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +16 -16 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,16);ft.update(5,-16);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +17 -17 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,17);ft.update(5,-17);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +18 -18 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,18);ft.update(5,-18);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +19 -19 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,19);ft.update(5,-19);
    expect(ft.prefixSum(5)).toBe(0);
  });
  it("FW +20 -20 at idx5=0", () => {
    const ft=new FenwickTree(15);
    ft.update(5,20);ft.update(5,-20);
    expect(ft.prefixSum(5)).toBe(0);
  });
});

describe('SweepLine merge contained', () => {
  it("inner [1,3] in [0,5]", () => {
    const m=SweepLine.merge([[0,5],[1,3]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([0,5]);
  });
  it("inner [2,4] in [1,6]", () => {
    const m=SweepLine.merge([[1,6],[2,4]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([1,6]);
  });
  it("inner [3,5] in [2,7]", () => {
    const m=SweepLine.merge([[2,7],[3,5]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([2,7]);
  });
  it("inner [4,6] in [3,8]", () => {
    const m=SweepLine.merge([[3,8],[4,6]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([3,8]);
  });
  it("inner [5,7] in [4,9]", () => {
    const m=SweepLine.merge([[4,9],[5,7]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([4,9]);
  });
  it("inner [6,8] in [5,10]", () => {
    const m=SweepLine.merge([[5,10],[6,8]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([5,10]);
  });
  it("inner [7,9] in [6,11]", () => {
    const m=SweepLine.merge([[6,11],[7,9]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([6,11]);
  });
  it("inner [8,10] in [7,12]", () => {
    const m=SweepLine.merge([[7,12],[8,10]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([7,12]);
  });
  it("inner [9,11] in [8,13]", () => {
    const m=SweepLine.merge([[8,13],[9,11]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([8,13]);
  });
  it("inner [10,12] in [9,14]", () => {
    const m=SweepLine.merge([[9,14],[10,12]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([9,14]);
  });
  it("inner [11,13] in [10,15]", () => {
    const m=SweepLine.merge([[10,15],[11,13]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([10,15]);
  });
  it("inner [12,14] in [11,16]", () => {
    const m=SweepLine.merge([[11,16],[12,14]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([11,16]);
  });
  it("inner [13,15] in [12,17]", () => {
    const m=SweepLine.merge([[12,17],[13,15]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([12,17]);
  });
  it("inner [14,16] in [13,18]", () => {
    const m=SweepLine.merge([[13,18],[14,16]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([13,18]);
  });
  it("inner [15,17] in [14,19]", () => {
    const m=SweepLine.merge([[14,19],[15,17]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([14,19]);
  });
  it("inner [16,18] in [15,20]", () => {
    const m=SweepLine.merge([[15,20],[16,18]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([15,20]);
  });
  it("inner [17,19] in [16,21]", () => {
    const m=SweepLine.merge([[16,21],[17,19]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([16,21]);
  });
  it("inner [18,20] in [17,22]", () => {
    const m=SweepLine.merge([[17,22],[18,20]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([17,22]);
  });
  it("inner [19,21] in [18,23]", () => {
    const m=SweepLine.merge([[18,23],[19,21]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([18,23]);
  });
  it("inner [20,22] in [19,24]", () => {
    const m=SweepLine.merge([[19,24],[20,22]]);
    expect(m.length).toBe(1);
    expect(m[0]).toEqual([19,24]);
  });
});

describe('SegmentTree queryMin update', () => {
  it("ST queryMin idx 0=-1", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(0,-1);
    expect(st.queryMin(0,9)).toBe(-1);
  });
  it("ST queryMin idx 1=-2", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(1,-2);
    expect(st.queryMin(0,9)).toBe(-2);
  });
  it("ST queryMin idx 2=-3", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(2,-3);
    expect(st.queryMin(0,9)).toBe(-3);
  });
  it("ST queryMin idx 3=-4", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(3,-4);
    expect(st.queryMin(0,9)).toBe(-4);
  });
  it("ST queryMin idx 4=-5", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(4,-5);
    expect(st.queryMin(0,9)).toBe(-5);
  });
  it("ST queryMin idx 5=-6", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(5,-6);
    expect(st.queryMin(0,9)).toBe(-6);
  });
  it("ST queryMin idx 6=-7", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(6,-7);
    expect(st.queryMin(0,9)).toBe(-7);
  });
  it("ST queryMin idx 7=-8", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(7,-8);
    expect(st.queryMin(0,9)).toBe(-8);
  });
  it("ST queryMin idx 8=-9", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(8,-9);
    expect(st.queryMin(0,9)).toBe(-9);
  });
  it("ST queryMin idx 9=-10", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(9,-10);
    expect(st.queryMin(0,9)).toBe(-10);
  });
  it("ST queryMin idx 0=-11", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(0,-11);
    expect(st.queryMin(0,9)).toBe(-11);
  });
  it("ST queryMin idx 1=-12", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(1,-12);
    expect(st.queryMin(0,9)).toBe(-12);
  });
  it("ST queryMin idx 2=-13", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(2,-13);
    expect(st.queryMin(0,9)).toBe(-13);
  });
  it("ST queryMin idx 3=-14", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(3,-14);
    expect(st.queryMin(0,9)).toBe(-14);
  });
  it("ST queryMin idx 4=-15", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(4,-15);
    expect(st.queryMin(0,9)).toBe(-15);
  });
  it("ST queryMin idx 5=-16", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(5,-16);
    expect(st.queryMin(0,9)).toBe(-16);
  });
  it("ST queryMin idx 6=-17", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(6,-17);
    expect(st.queryMin(0,9)).toBe(-17);
  });
  it("ST queryMin idx 7=-18", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(7,-18);
    expect(st.queryMin(0,9)).toBe(-18);
  });
  it("ST queryMin idx 8=-19", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(8,-19);
    expect(st.queryMin(0,9)).toBe(-19);
  });
  it("ST queryMin idx 9=-20", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(9,-20);
    expect(st.queryMin(0,9)).toBe(-20);
  });
  it("ST queryMin idx 0=-21", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(0,-21);
    expect(st.queryMin(0,9)).toBe(-21);
  });
  it("ST queryMin idx 1=-22", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(1,-22);
    expect(st.queryMin(0,9)).toBe(-22);
  });
  it("ST queryMin idx 2=-23", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(2,-23);
    expect(st.queryMin(0,9)).toBe(-23);
  });
  it("ST queryMin idx 3=-24", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(3,-24);
    expect(st.queryMin(0,9)).toBe(-24);
  });
  it("ST queryMin idx 4=-25", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(4,-25);
    expect(st.queryMin(0,9)).toBe(-25);
  });
  it("ST queryMin idx 5=-26", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(5,-26);
    expect(st.queryMin(0,9)).toBe(-26);
  });
  it("ST queryMin idx 6=-27", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(6,-27);
    expect(st.queryMin(0,9)).toBe(-27);
  });
  it("ST queryMin idx 7=-28", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(7,-28);
    expect(st.queryMin(0,9)).toBe(-28);
  });
  it("ST queryMin idx 8=-29", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(8,-29);
    expect(st.queryMin(0,9)).toBe(-29);
  });
  it("ST queryMin idx 9=-30", () => {
    const st=new SegmentTree(new Array(10).fill(100));
    st.update(9,-30);
    expect(st.queryMin(0,9)).toBe(-30);
  });
});

describe('IntervalTree boundary', () => {
  it("point at lo 0", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:6});
    expect(t.findContaining(0).length).toBe(1);
  });
  it("point at lo 7", () => {
    const t=new IntervalTree();
    t.insert({lo:7,hi:13});
    expect(t.findContaining(7).length).toBe(1);
  });
  it("point at lo 14", () => {
    const t=new IntervalTree();
    t.insert({lo:14,hi:20});
    expect(t.findContaining(14).length).toBe(1);
  });
  it("point at lo 21", () => {
    const t=new IntervalTree();
    t.insert({lo:21,hi:27});
    expect(t.findContaining(21).length).toBe(1);
  });
  it("point at lo 28", () => {
    const t=new IntervalTree();
    t.insert({lo:28,hi:34});
    expect(t.findContaining(28).length).toBe(1);
  });
  it("point at lo 35", () => {
    const t=new IntervalTree();
    t.insert({lo:35,hi:41});
    expect(t.findContaining(35).length).toBe(1);
  });
  it("point at lo 42", () => {
    const t=new IntervalTree();
    t.insert({lo:42,hi:48});
    expect(t.findContaining(42).length).toBe(1);
  });
  it("point at lo 49", () => {
    const t=new IntervalTree();
    t.insert({lo:49,hi:55});
    expect(t.findContaining(49).length).toBe(1);
  });
  it("point at lo 56", () => {
    const t=new IntervalTree();
    t.insert({lo:56,hi:62});
    expect(t.findContaining(56).length).toBe(1);
  });
  it("point at lo 63", () => {
    const t=new IntervalTree();
    t.insert({lo:63,hi:69});
    expect(t.findContaining(63).length).toBe(1);
  });
  it("point at hi 6", () => {
    const t=new IntervalTree();
    t.insert({lo:0,hi:6});
    expect(t.findContaining(6).length).toBe(1);
  });
  it("point at hi 13", () => {
    const t=new IntervalTree();
    t.insert({lo:7,hi:13});
    expect(t.findContaining(13).length).toBe(1);
  });
  it("point at hi 20", () => {
    const t=new IntervalTree();
    t.insert({lo:14,hi:20});
    expect(t.findContaining(20).length).toBe(1);
  });
  it("point at hi 27", () => {
    const t=new IntervalTree();
    t.insert({lo:21,hi:27});
    expect(t.findContaining(27).length).toBe(1);
  });
  it("point at hi 34", () => {
    const t=new IntervalTree();
    t.insert({lo:28,hi:34});
    expect(t.findContaining(34).length).toBe(1);
  });
  it("point at hi 41", () => {
    const t=new IntervalTree();
    t.insert({lo:35,hi:41});
    expect(t.findContaining(41).length).toBe(1);
  });
  it("point at hi 48", () => {
    const t=new IntervalTree();
    t.insert({lo:42,hi:48});
    expect(t.findContaining(48).length).toBe(1);
  });
  it("point at hi 55", () => {
    const t=new IntervalTree();
    t.insert({lo:49,hi:55});
    expect(t.findContaining(55).length).toBe(1);
  });
  it("point at hi 62", () => {
    const t=new IntervalTree();
    t.insert({lo:56,hi:62});
    expect(t.findContaining(62).length).toBe(1);
  });
  it("point at hi 69", () => {
    const t=new IntervalTree();
    t.insert({lo:63,hi:69});
    expect(t.findContaining(69).length).toBe(1);
  });
});

describe('SweepLine covered large', () => {
  it("1 adjacent covered=1", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<1;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(1);
  });
  it("2 adjacent covered=2", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<2;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(2);
  });
  it("3 adjacent covered=3", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<3;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(3);
  });
  it("4 adjacent covered=4", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<4;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(4);
  });
  it("5 adjacent covered=5", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<5;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(5);
  });
  it("6 adjacent covered=6", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<6;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(6);
  });
  it("7 adjacent covered=7", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<7;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(7);
  });
  it("8 adjacent covered=8", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<8;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(8);
  });
  it("9 adjacent covered=9", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<9;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(9);
  });
  it("10 adjacent covered=10", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<10;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(10);
  });
  it("11 adjacent covered=11", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<11;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(11);
  });
  it("12 adjacent covered=12", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<12;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(12);
  });
  it("13 adjacent covered=13", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<13;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(13);
  });
  it("14 adjacent covered=14", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<14;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(14);
  });
  it("15 adjacent covered=15", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<15;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(15);
  });
  it("16 adjacent covered=16", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<16;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(16);
  });
  it("17 adjacent covered=17", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<17;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(17);
  });
  it("18 adjacent covered=18", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<18;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(18);
  });
  it("19 adjacent covered=19", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<19;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(19);
  });
  it("20 adjacent covered=20", () => {
    const ivs: Array<[number,number]>=[];
    for (let j=0;j<20;j++) ivs.push([j,j+1]);
    expect(SweepLine.coveredLength(ivs)).toBe(20);
  });
});

describe('IntervalTree size after remove', () => {
  it("insert 2 remove 1 =>1", () => {
    const t=new IntervalTree();
    for (let j=0;j<2;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(1);
  });
  it("insert 3 remove 1 =>2", () => {
    const t=new IntervalTree();
    for (let j=0;j<3;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(2);
  });
  it("insert 4 remove 1 =>3", () => {
    const t=new IntervalTree();
    for (let j=0;j<4;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(3);
  });
  it("insert 5 remove 1 =>4", () => {
    const t=new IntervalTree();
    for (let j=0;j<5;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(4);
  });
  it("insert 6 remove 1 =>5", () => {
    const t=new IntervalTree();
    for (let j=0;j<6;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(5);
  });
  it("insert 7 remove 1 =>6", () => {
    const t=new IntervalTree();
    for (let j=0;j<7;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(6);
  });
  it("insert 8 remove 1 =>7", () => {
    const t=new IntervalTree();
    for (let j=0;j<8;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(7);
  });
  it("insert 9 remove 1 =>8", () => {
    const t=new IntervalTree();
    for (let j=0;j<9;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(8);
  });
  it("insert 10 remove 1 =>9", () => {
    const t=new IntervalTree();
    for (let j=0;j<10;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(9);
  });
  it("insert 11 remove 1 =>10", () => {
    const t=new IntervalTree();
    for (let j=0;j<11;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(10);
  });
  it("insert 12 remove 1 =>11", () => {
    const t=new IntervalTree();
    for (let j=0;j<12;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(11);
  });
  it("insert 13 remove 1 =>12", () => {
    const t=new IntervalTree();
    for (let j=0;j<13;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(12);
  });
  it("insert 14 remove 1 =>13", () => {
    const t=new IntervalTree();
    for (let j=0;j<14;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(13);
  });
  it("insert 15 remove 1 =>14", () => {
    const t=new IntervalTree();
    for (let j=0;j<15;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(14);
  });
  it("insert 16 remove 1 =>15", () => {
    const t=new IntervalTree();
    for (let j=0;j<16;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(15);
  });
  it("insert 17 remove 1 =>16", () => {
    const t=new IntervalTree();
    for (let j=0;j<17;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(16);
  });
  it("insert 18 remove 1 =>17", () => {
    const t=new IntervalTree();
    for (let j=0;j<18;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(17);
  });
  it("insert 19 remove 1 =>18", () => {
    const t=new IntervalTree();
    for (let j=0;j<19;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(18);
  });
  it("insert 20 remove 1 =>19", () => {
    const t=new IntervalTree();
    for (let j=0;j<20;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(19);
  });
  it("insert 21 remove 1 =>20", () => {
    const t=new IntervalTree();
    for (let j=0;j<21;j++) t.insert({lo:j*3,hi:j*3+2});
    t.remove(0,2);
    expect(t.size).toBe(20);
  });
});

// ─── New API tests ────────────────────────────────────────────────────────────

describe('IntervalTree isEmpty', () => {
  it('isEmpty true on new tree', () => { expect(new IntervalTree().isEmpty).toBe(true); });
  it('isEmpty false after insert', () => { const t = new IntervalTree(); t.insert({ lo: 0, hi: 1 }); expect(t.isEmpty).toBe(false); });
  it('isEmpty true after clear', () => { const t = new IntervalTree(); t.insert({ lo: 0, hi: 1 }); t.clear(); expect(t.isEmpty).toBe(true); });
  it('isEmpty false with 2 inserts', () => { const t = new IntervalTree(); t.insert({ lo: 0, hi: 1 }); t.insert({ lo: 2, hi: 3 }); expect(t.isEmpty).toBe(false); });
  it('isEmpty true on second clear', () => { const t = new IntervalTree(); t.insert({ lo: 5, hi: 10 }); t.clear(); t.clear(); expect(t.isEmpty).toBe(true); });
  for (let i = 1; i <= 50; i++) {
    it(`isEmpty false after ${i} inserts`, () => {
      const t = new IntervalTree();
      for (let j = 0; j < i; j++) t.insert({ lo: j, hi: j + 2 });
      expect(t.isEmpty).toBe(false);
    });
  }
});

describe('IntervalTree findAny overlap', () => {
  for (let i = 0; i < 100; i++) {
    it(`findAny returns hit for overlapping query ${i}`, () => {
      const t = new IntervalTree();
      t.insert({ lo: i * 2, hi: i * 2 + 5 });
      const found = t.findAny(i * 2 + 1, i * 2 + 3);
      expect(found).not.toBeNull();
      expect(found!.lo).toBe(i * 2);
      expect(found!.hi).toBe(i * 2 + 5);
    });
  }
});

describe('IntervalTree findAny no overlap', () => {
  for (let i = 0; i < 100; i++) {
    it(`findAny returns null for non-overlapping query ${i}`, () => {
      const t = new IntervalTree();
      t.insert({ lo: i * 10, hi: i * 10 + 3 });
      const found = t.findAny(i * 10 + 5, i * 10 + 8);
      expect(found).toBeNull();
    });
  }
});

describe('IntervalTree findAll', () => {
  it('findAll returns empty for no overlaps', () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.findAll(10, 20)).toHaveLength(0);
  });
  it('findAll returns all overlapping intervals', () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 10 });
    t.insert({ lo: 5, hi: 15 });
    t.insert({ lo: 20, hi: 30 });
    expect(t.findAll(4, 11)).toHaveLength(2);
  });
  for (let n = 1; n <= 50; n++) {
    it(`findAll finds ${n} overlapping intervals`, () => {
      const t = new IntervalTree();
      for (let i = 0; i < n; i++) t.insert({ lo: 0, hi: 100 });
      expect(t.findAll(0, 100)).toHaveLength(n);
    });
  }
});

describe('IntervalTree overlaps method', () => {
  it('overlaps true when interval exists in range', () => {
    const t = new IntervalTree();
    t.insert({ lo: 5, hi: 15 });
    expect(t.overlaps(10, 20)).toBe(true);
  });
  it('overlaps false when no interval in range', () => {
    const t = new IntervalTree();
    t.insert({ lo: 0, hi: 5 });
    expect(t.overlaps(10, 20)).toBe(false);
  });
  for (let i = 0; i < 50; i++) {
    it(`overlaps true for touching boundary ${i}`, () => {
      const t = new IntervalTree();
      t.insert({ lo: i, hi: i + 10 });
      expect(t.overlaps(i + 10, i + 20)).toBe(true);
    });
  }
});

describe('createIntervalTree factory', () => {
  it('returns an IntervalTree instance', () => {
    expect(createIntervalTree()).toBeInstanceOf(IntervalTree);
  });
  it('returns isEmpty=true', () => {
    expect(createIntervalTree().isEmpty).toBe(true);
  });
  it('returns size=0', () => {
    expect(createIntervalTree().size).toBe(0);
  });
  for (let i = 0; i < 30; i++) {
    it(`createIntervalTree insert ${i+1} intervals`, () => {
      const t = createIntervalTree();
      for (let j = 0; j <= i; j++) t.insert({ lo: j, hi: j + 5 });
      expect(t.size).toBe(i + 1);
    });
  }
});

describe('fromIntervals factory', () => {
  it('builds tree from empty array', () => {
    const t = fromIntervals([]);
    expect(t.size).toBe(0);
    expect(t.isEmpty).toBe(true);
  });
  it('builds tree from single interval', () => {
    const t = fromIntervals([{ lo: 1, hi: 5 }]);
    expect(t.size).toBe(1);
  });
  for (let n = 1; n <= 50; n++) {
    it(`fromIntervals builds tree of size ${n}`, () => {
      const ivs = Array.from({ length: n }, (_, i) => ({ lo: i, hi: i + 3 }));
      expect(fromIntervals(ivs).size).toBe(n);
    });
  }
  it('fromIntervals tree can findOverlapping', () => {
    const t = fromIntervals([{ lo: 0, hi: 10 }, { lo: 5, hi: 15 }]);
    expect(t.findAll(6, 8)).toHaveLength(2);
  });
});

describe('pointInAny utility', () => {
  for (let p = 0; p < 100; p++) {
    it(`point ${p} in [0,200] = true`, () => {
      expect(pointInAny([{ lo: 0, hi: 200 }], p)).toBe(true);
    });
  }
  it('point outside returns false', () => {
    expect(pointInAny([{ lo: 0, hi: 5 }], 10)).toBe(false);
  });
  it('empty list returns false', () => {
    expect(pointInAny([], 5)).toBe(false);
  });
  it('point at lo boundary', () => {
    expect(pointInAny([{ lo: 3, hi: 7 }], 3)).toBe(true);
  });
  it('point at hi boundary', () => {
    expect(pointInAny([{ lo: 3, hi: 7 }], 7)).toBe(true);
  });
});

describe('findIntervalsContaining utility', () => {
  it('returns empty for no containing intervals', () => {
    expect(findIntervalsContaining([{ lo: 0, hi: 5 }], 10)).toHaveLength(0);
  });
  it('returns all intervals containing point', () => {
    const ivs = [{ lo: 0, hi: 10 }, { lo: 5, hi: 15 }, { lo: 20, hi: 30 }];
    expect(findIntervalsContaining(ivs, 7)).toHaveLength(2);
  });
  for (let p = 0; p < 50; p++) {
    it(`findIntervalsContaining point ${p} in [0,100]`, () => {
      expect(findIntervalsContaining([{ lo: 0, hi: 100 }], p)).toHaveLength(1);
    });
  }
  it('returns empty list for empty input', () => {
    expect(findIntervalsContaining([], 5)).toHaveLength(0);
  });
  it('point at exact lo', () => {
    const ivs = [{ lo: 5, hi: 10 }];
    expect(findIntervalsContaining(ivs, 5)).toHaveLength(1);
  });
  it('point at exact hi', () => {
    const ivs = [{ lo: 5, hi: 10 }];
    expect(findIntervalsContaining(ivs, 10)).toHaveLength(1);
  });
});

describe('mergeIntervals utility', () => {
  it('empty input returns empty', () => {
    expect(mergeIntervals([])).toHaveLength(0);
  });
  it('single interval unchanged', () => {
    expect(mergeIntervals([{ lo: 1, hi: 5 }])).toEqual([{ lo: 1, hi: 5 }]);
  });
  it('two non-overlapping stay two', () => {
    expect(mergeIntervals([{ lo: 0, hi: 3 }, { lo: 5, hi: 8 }])).toHaveLength(2);
  });
  it('two overlapping merge to one', () => {
    expect(mergeIntervals([{ lo: 0, hi: 5 }, { lo: 3, hi: 8 }])).toHaveLength(1);
  });
  it('touching intervals merge', () => {
    expect(mergeIntervals([{ lo: 0, hi: 5 }, { lo: 5, hi: 10 }])).toHaveLength(1);
  });
  it('three into one', () => {
    expect(mergeIntervals([{ lo: 0, hi: 10 }, { lo: 2, hi: 6 }, { lo: 5, hi: 12 }])).toHaveLength(1);
  });
  for (let n = 1; n <= 100; n++) {
    it(`mergeIntervals ${n} non-overlapping => ${n} merged`, () => {
      const ivs = Array.from({ length: n }, (_, i) => ({ lo: i * 10, hi: i * 10 + 3 }));
      expect(mergeIntervals(ivs)).toHaveLength(n);
    });
  }
});

describe('totalCoverage utility', () => {
  it('empty returns 0', () => {
    expect(totalCoverage([])).toBe(0);
  });
  it('single interval coverage', () => {
    expect(totalCoverage([{ lo: 0, hi: 10 }])).toBe(10);
  });
  it('two non-overlapping', () => {
    expect(totalCoverage([{ lo: 0, hi: 5 }, { lo: 10, hi: 15 }])).toBe(10);
  });
  it('two overlapping coverage deduplicates', () => {
    expect(totalCoverage([{ lo: 0, hi: 10 }, { lo: 5, hi: 15 }])).toBe(15);
  });
  for (let n = 1; n <= 50; n++) {
    it(`totalCoverage ${n} unit-width non-overlapping = ${n * 5}`, () => {
      const ivs = Array.from({ length: n }, (_, i) => ({ lo: i * 10, hi: i * 10 + 5 }));
      expect(totalCoverage(ivs)).toBe(n * 5);
    });
  }
});

describe('intervalsOverlap utility', () => {
  for (let i = 0; i < 100; i++) {
    it(`intervalsOverlap [${i},${i+5}] and [${i+2},${i+8}] = true`, () => {
      expect(intervalsOverlap({ lo: i, hi: i + 5 }, { lo: i + 2, hi: i + 8 })).toBe(true);
    });
  }
  it('touching at lo/hi overlaps', () => {
    expect(intervalsOverlap({ lo: 0, hi: 5 }, { lo: 5, hi: 10 })).toBe(true);
  });
  it('gap does not overlap', () => {
    expect(intervalsOverlap({ lo: 0, hi: 3 }, { lo: 5, hi: 8 })).toBe(false);
  });
  it('contained interval overlaps', () => {
    expect(intervalsOverlap({ lo: 0, hi: 10 }, { lo: 2, hi: 8 })).toBe(true);
  });
  it('identical intervals overlap', () => {
    expect(intervalsOverlap({ lo: 3, hi: 7 }, { lo: 3, hi: 7 })).toBe(true);
  });
});

describe('countOverlappingPairs utility', () => {
  it('empty = 0', () => { expect(countOverlappingPairs([])).toBe(0); });
  it('single = 0', () => { expect(countOverlappingPairs([{ lo: 0, hi: 5 }])).toBe(0); });
  it('two non-overlapping = 0', () => {
    expect(countOverlappingPairs([{ lo: 0, hi: 3 }, { lo: 5, hi: 8 }])).toBe(0);
  });
  it('two overlapping = 1', () => {
    expect(countOverlappingPairs([{ lo: 0, hi: 5 }, { lo: 3, hi: 8 }])).toBe(1);
  });
  it('three all overlapping = 3', () => {
    expect(countOverlappingPairs([{ lo: 0, hi: 10 }, { lo: 2, hi: 8 }, { lo: 5, hi: 15 }])).toBe(3);
  });
  for (let n = 1; n <= 50; n++) {
    it(`countOverlappingPairs ${n} identical intervals = ${n*(n-1)/2}`, () => {
      const ivs = Array.from({ length: n }, () => ({ lo: 0, hi: 10 }));
      expect(countOverlappingPairs(ivs)).toBe((n * (n - 1)) / 2);
    });
  }
});

describe('maxOverlap utility', () => {
  it('empty = 0', () => { expect(maxOverlap([])).toBe(0); });
  it('single = 1', () => { expect(maxOverlap([{ lo: 0, hi: 5 }])).toBe(1); });
  it('two non-overlapping = 1', () => {
    expect(maxOverlap([{ lo: 0, hi: 3 }, { lo: 5, hi: 8 }])).toBe(1);
  });
  it('two overlapping = 2', () => {
    expect(maxOverlap([{ lo: 0, hi: 5 }, { lo: 3, hi: 8 }])).toBe(2);
  });
  for (let n = 1; n <= 100; n++) {
    it(`maxOverlap ${n} identical intervals = ${n}`, () => {
      const ivs = Array.from({ length: n }, () => ({ lo: 0, hi: 10 }));
      expect(maxOverlap(ivs)).toBe(n);
    });
  }
});

