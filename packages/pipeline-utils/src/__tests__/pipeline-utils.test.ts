// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  pipe, compose, createPipeline, createMiddlewareChain,
  filterPipeline, mapPipeline, reducePipeline, tapPipeline,
  branchPipeline, cache, batch, validate, defaultValue, limit, skip, flatten, chunk
} from "../pipeline-utils";

describe("pipe", () => {
  it("single transform", () => { expect(pipe(5, (x:number) => x*2)).toBe(10); });
  it("two transforms", () => { expect(pipe(5, (x:number)=>x+1, (x:number)=>x*2)).toBe(12); });
  it("three transforms", () => { expect(pipe(1, (x:number)=>x+1, (x:number)=>x*2, (x:number)=>x+10)).toBe(14); });
  it("pipe adds 1", () => { expect(pipe(1, (x:number) => x + 1)).toBe(2); });
  it("pipe adds 2", () => { expect(pipe(2, (x:number) => x + 2)).toBe(4); });
  it("pipe adds 3", () => { expect(pipe(3, (x:number) => x + 3)).toBe(6); });
  it("pipe adds 4", () => { expect(pipe(4, (x:number) => x + 4)).toBe(8); });
  it("pipe adds 5", () => { expect(pipe(5, (x:number) => x + 5)).toBe(10); });
  it("pipe adds 6", () => { expect(pipe(6, (x:number) => x + 6)).toBe(12); });
  it("pipe adds 7", () => { expect(pipe(7, (x:number) => x + 7)).toBe(14); });
  it("pipe adds 8", () => { expect(pipe(8, (x:number) => x + 8)).toBe(16); });
  it("pipe adds 9", () => { expect(pipe(9, (x:number) => x + 9)).toBe(18); });
  it("pipe adds 10", () => { expect(pipe(10, (x:number) => x + 10)).toBe(20); });
  it("pipe adds 11", () => { expect(pipe(11, (x:number) => x + 11)).toBe(22); });
  it("pipe adds 12", () => { expect(pipe(12, (x:number) => x + 12)).toBe(24); });
  it("pipe adds 13", () => { expect(pipe(13, (x:number) => x + 13)).toBe(26); });
  it("pipe adds 14", () => { expect(pipe(14, (x:number) => x + 14)).toBe(28); });
  it("pipe adds 15", () => { expect(pipe(15, (x:number) => x + 15)).toBe(30); });
  it("pipe adds 16", () => { expect(pipe(16, (x:number) => x + 16)).toBe(32); });
  it("pipe adds 17", () => { expect(pipe(17, (x:number) => x + 17)).toBe(34); });
  it("pipe adds 18", () => { expect(pipe(18, (x:number) => x + 18)).toBe(36); });
  it("pipe adds 19", () => { expect(pipe(19, (x:number) => x + 19)).toBe(38); });
  it("pipe adds 20", () => { expect(pipe(20, (x:number) => x + 20)).toBe(40); });
  it("pipe adds 21", () => { expect(pipe(21, (x:number) => x + 21)).toBe(42); });
  it("pipe adds 22", () => { expect(pipe(22, (x:number) => x + 22)).toBe(44); });
  it("pipe adds 23", () => { expect(pipe(23, (x:number) => x + 23)).toBe(46); });
  it("pipe adds 24", () => { expect(pipe(24, (x:number) => x + 24)).toBe(48); });
  it("pipe adds 25", () => { expect(pipe(25, (x:number) => x + 25)).toBe(50); });
  it("pipe adds 26", () => { expect(pipe(26, (x:number) => x + 26)).toBe(52); });
  it("pipe adds 27", () => { expect(pipe(27, (x:number) => x + 27)).toBe(54); });
  it("pipe adds 28", () => { expect(pipe(28, (x:number) => x + 28)).toBe(56); });
  it("pipe adds 29", () => { expect(pipe(29, (x:number) => x + 29)).toBe(58); });
  it("pipe adds 30", () => { expect(pipe(30, (x:number) => x + 30)).toBe(60); });
  it("pipe adds 31", () => { expect(pipe(31, (x:number) => x + 31)).toBe(62); });
  it("pipe adds 32", () => { expect(pipe(32, (x:number) => x + 32)).toBe(64); });
  it("pipe adds 33", () => { expect(pipe(33, (x:number) => x + 33)).toBe(66); });
  it("pipe adds 34", () => { expect(pipe(34, (x:number) => x + 34)).toBe(68); });
  it("pipe adds 35", () => { expect(pipe(35, (x:number) => x + 35)).toBe(70); });
  it("pipe adds 36", () => { expect(pipe(36, (x:number) => x + 36)).toBe(72); });
  it("pipe adds 37", () => { expect(pipe(37, (x:number) => x + 37)).toBe(74); });
  it("pipe adds 38", () => { expect(pipe(38, (x:number) => x + 38)).toBe(76); });
  it("pipe adds 39", () => { expect(pipe(39, (x:number) => x + 39)).toBe(78); });
  it("pipe adds 40", () => { expect(pipe(40, (x:number) => x + 40)).toBe(80); });
  it("pipe adds 41", () => { expect(pipe(41, (x:number) => x + 41)).toBe(82); });
  it("pipe adds 42", () => { expect(pipe(42, (x:number) => x + 42)).toBe(84); });
  it("pipe adds 43", () => { expect(pipe(43, (x:number) => x + 43)).toBe(86); });
  it("pipe adds 44", () => { expect(pipe(44, (x:number) => x + 44)).toBe(88); });
  it("pipe adds 45", () => { expect(pipe(45, (x:number) => x + 45)).toBe(90); });
  it("pipe adds 46", () => { expect(pipe(46, (x:number) => x + 46)).toBe(92); });
  it("pipe adds 47", () => { expect(pipe(47, (x:number) => x + 47)).toBe(94); });
  it("pipe adds 48", () => { expect(pipe(48, (x:number) => x + 48)).toBe(96); });
  it("pipe adds 49", () => { expect(pipe(49, (x:number) => x + 49)).toBe(98); });
  it("pipe adds 50", () => { expect(pipe(50, (x:number) => x + 50)).toBe(100); });
  it("pipe adds 51", () => { expect(pipe(51, (x:number) => x + 51)).toBe(102); });
  it("pipe adds 52", () => { expect(pipe(52, (x:number) => x + 52)).toBe(104); });
  it("pipe adds 53", () => { expect(pipe(53, (x:number) => x + 53)).toBe(106); });
  it("pipe adds 54", () => { expect(pipe(54, (x:number) => x + 54)).toBe(108); });
  it("pipe adds 55", () => { expect(pipe(55, (x:number) => x + 55)).toBe(110); });
  it("pipe adds 56", () => { expect(pipe(56, (x:number) => x + 56)).toBe(112); });
  it("pipe adds 57", () => { expect(pipe(57, (x:number) => x + 57)).toBe(114); });
  it("pipe adds 58", () => { expect(pipe(58, (x:number) => x + 58)).toBe(116); });
  it("pipe adds 59", () => { expect(pipe(59, (x:number) => x + 59)).toBe(118); });
  it("pipe adds 60", () => { expect(pipe(60, (x:number) => x + 60)).toBe(120); });
  it("pipe adds 61", () => { expect(pipe(61, (x:number) => x + 61)).toBe(122); });
  it("pipe adds 62", () => { expect(pipe(62, (x:number) => x + 62)).toBe(124); });
  it("pipe adds 63", () => { expect(pipe(63, (x:number) => x + 63)).toBe(126); });
  it("pipe adds 64", () => { expect(pipe(64, (x:number) => x + 64)).toBe(128); });
  it("pipe adds 65", () => { expect(pipe(65, (x:number) => x + 65)).toBe(130); });
  it("pipe adds 66", () => { expect(pipe(66, (x:number) => x + 66)).toBe(132); });
  it("pipe adds 67", () => { expect(pipe(67, (x:number) => x + 67)).toBe(134); });
  it("pipe adds 68", () => { expect(pipe(68, (x:number) => x + 68)).toBe(136); });
  it("pipe adds 69", () => { expect(pipe(69, (x:number) => x + 69)).toBe(138); });
  it("pipe adds 70", () => { expect(pipe(70, (x:number) => x + 70)).toBe(140); });
  it("pipe adds 71", () => { expect(pipe(71, (x:number) => x + 71)).toBe(142); });
  it("pipe adds 72", () => { expect(pipe(72, (x:number) => x + 72)).toBe(144); });
  it("pipe adds 73", () => { expect(pipe(73, (x:number) => x + 73)).toBe(146); });
  it("pipe adds 74", () => { expect(pipe(74, (x:number) => x + 74)).toBe(148); });
  it("pipe adds 75", () => { expect(pipe(75, (x:number) => x + 75)).toBe(150); });
  it("pipe adds 76", () => { expect(pipe(76, (x:number) => x + 76)).toBe(152); });
  it("pipe adds 77", () => { expect(pipe(77, (x:number) => x + 77)).toBe(154); });
  it("pipe adds 78", () => { expect(pipe(78, (x:number) => x + 78)).toBe(156); });
  it("pipe adds 79", () => { expect(pipe(79, (x:number) => x + 79)).toBe(158); });
  it("pipe adds 80", () => { expect(pipe(80, (x:number) => x + 80)).toBe(160); });
  it("pipe adds 81", () => { expect(pipe(81, (x:number) => x + 81)).toBe(162); });
  it("pipe adds 82", () => { expect(pipe(82, (x:number) => x + 82)).toBe(164); });
  it("pipe adds 83", () => { expect(pipe(83, (x:number) => x + 83)).toBe(166); });
  it("pipe adds 84", () => { expect(pipe(84, (x:number) => x + 84)).toBe(168); });
  it("pipe adds 85", () => { expect(pipe(85, (x:number) => x + 85)).toBe(170); });
  it("pipe adds 86", () => { expect(pipe(86, (x:number) => x + 86)).toBe(172); });
  it("pipe adds 87", () => { expect(pipe(87, (x:number) => x + 87)).toBe(174); });
  it("pipe adds 88", () => { expect(pipe(88, (x:number) => x + 88)).toBe(176); });
  it("pipe adds 89", () => { expect(pipe(89, (x:number) => x + 89)).toBe(178); });
  it("pipe adds 90", () => { expect(pipe(90, (x:number) => x + 90)).toBe(180); });
  it("pipe adds 91", () => { expect(pipe(91, (x:number) => x + 91)).toBe(182); });
  it("pipe adds 92", () => { expect(pipe(92, (x:number) => x + 92)).toBe(184); });
  it("pipe adds 93", () => { expect(pipe(93, (x:number) => x + 93)).toBe(186); });
  it("pipe adds 94", () => { expect(pipe(94, (x:number) => x + 94)).toBe(188); });
  it("pipe adds 95", () => { expect(pipe(95, (x:number) => x + 95)).toBe(190); });
  it("pipe adds 96", () => { expect(pipe(96, (x:number) => x + 96)).toBe(192); });
  it("pipe adds 97", () => { expect(pipe(97, (x:number) => x + 97)).toBe(194); });
});

describe("createPipeline", () => {
  it("identity pipeline", () => { const p = createPipeline<number>(); expect(p(5)).toBe(5); });
  it("single step", () => { const p = createPipeline<number>((x) => x*2); expect(p(3)).toBe(6); });
  it("two steps", () => { const p = createPipeline<number>((x)=>x+1,(x)=>x*2); expect(p(3)).toBe(8); });
  it("pipeline multiply 1", () => {
    const p = createPipeline<number>((x) => x * 1); expect(p(1)).toBe(1); });
  it("pipeline multiply 2", () => {
    const p = createPipeline<number>((x) => x * 2); expect(p(1)).toBe(2); });
  it("pipeline multiply 3", () => {
    const p = createPipeline<number>((x) => x * 3); expect(p(1)).toBe(3); });
  it("pipeline multiply 4", () => {
    const p = createPipeline<number>((x) => x * 4); expect(p(1)).toBe(4); });
  it("pipeline multiply 5", () => {
    const p = createPipeline<number>((x) => x * 5); expect(p(1)).toBe(5); });
  it("pipeline multiply 6", () => {
    const p = createPipeline<number>((x) => x * 6); expect(p(1)).toBe(6); });
  it("pipeline multiply 7", () => {
    const p = createPipeline<number>((x) => x * 7); expect(p(1)).toBe(7); });
  it("pipeline multiply 8", () => {
    const p = createPipeline<number>((x) => x * 8); expect(p(1)).toBe(8); });
  it("pipeline multiply 9", () => {
    const p = createPipeline<number>((x) => x * 9); expect(p(1)).toBe(9); });
  it("pipeline multiply 10", () => {
    const p = createPipeline<number>((x) => x * 10); expect(p(1)).toBe(10); });
  it("pipeline multiply 11", () => {
    const p = createPipeline<number>((x) => x * 11); expect(p(1)).toBe(11); });
  it("pipeline multiply 12", () => {
    const p = createPipeline<number>((x) => x * 12); expect(p(1)).toBe(12); });
  it("pipeline multiply 13", () => {
    const p = createPipeline<number>((x) => x * 13); expect(p(1)).toBe(13); });
  it("pipeline multiply 14", () => {
    const p = createPipeline<number>((x) => x * 14); expect(p(1)).toBe(14); });
  it("pipeline multiply 15", () => {
    const p = createPipeline<number>((x) => x * 15); expect(p(1)).toBe(15); });
  it("pipeline multiply 16", () => {
    const p = createPipeline<number>((x) => x * 16); expect(p(1)).toBe(16); });
  it("pipeline multiply 17", () => {
    const p = createPipeline<number>((x) => x * 17); expect(p(1)).toBe(17); });
  it("pipeline multiply 18", () => {
    const p = createPipeline<number>((x) => x * 18); expect(p(1)).toBe(18); });
  it("pipeline multiply 19", () => {
    const p = createPipeline<number>((x) => x * 19); expect(p(1)).toBe(19); });
  it("pipeline multiply 20", () => {
    const p = createPipeline<number>((x) => x * 20); expect(p(1)).toBe(20); });
  it("pipeline multiply 21", () => {
    const p = createPipeline<number>((x) => x * 21); expect(p(1)).toBe(21); });
  it("pipeline multiply 22", () => {
    const p = createPipeline<number>((x) => x * 22); expect(p(1)).toBe(22); });
  it("pipeline multiply 23", () => {
    const p = createPipeline<number>((x) => x * 23); expect(p(1)).toBe(23); });
  it("pipeline multiply 24", () => {
    const p = createPipeline<number>((x) => x * 24); expect(p(1)).toBe(24); });
  it("pipeline multiply 25", () => {
    const p = createPipeline<number>((x) => x * 25); expect(p(1)).toBe(25); });
  it("pipeline multiply 26", () => {
    const p = createPipeline<number>((x) => x * 26); expect(p(1)).toBe(26); });
  it("pipeline multiply 27", () => {
    const p = createPipeline<number>((x) => x * 27); expect(p(1)).toBe(27); });
  it("pipeline multiply 28", () => {
    const p = createPipeline<number>((x) => x * 28); expect(p(1)).toBe(28); });
  it("pipeline multiply 29", () => {
    const p = createPipeline<number>((x) => x * 29); expect(p(1)).toBe(29); });
  it("pipeline multiply 30", () => {
    const p = createPipeline<number>((x) => x * 30); expect(p(1)).toBe(30); });
  it("pipeline multiply 31", () => {
    const p = createPipeline<number>((x) => x * 31); expect(p(1)).toBe(31); });
  it("pipeline multiply 32", () => {
    const p = createPipeline<number>((x) => x * 32); expect(p(1)).toBe(32); });
  it("pipeline multiply 33", () => {
    const p = createPipeline<number>((x) => x * 33); expect(p(1)).toBe(33); });
  it("pipeline multiply 34", () => {
    const p = createPipeline<number>((x) => x * 34); expect(p(1)).toBe(34); });
  it("pipeline multiply 35", () => {
    const p = createPipeline<number>((x) => x * 35); expect(p(1)).toBe(35); });
  it("pipeline multiply 36", () => {
    const p = createPipeline<number>((x) => x * 36); expect(p(1)).toBe(36); });
  it("pipeline multiply 37", () => {
    const p = createPipeline<number>((x) => x * 37); expect(p(1)).toBe(37); });
  it("pipeline multiply 38", () => {
    const p = createPipeline<number>((x) => x * 38); expect(p(1)).toBe(38); });
  it("pipeline multiply 39", () => {
    const p = createPipeline<number>((x) => x * 39); expect(p(1)).toBe(39); });
  it("pipeline multiply 40", () => {
    const p = createPipeline<number>((x) => x * 40); expect(p(1)).toBe(40); });
  it("pipeline multiply 41", () => {
    const p = createPipeline<number>((x) => x * 41); expect(p(1)).toBe(41); });
  it("pipeline multiply 42", () => {
    const p = createPipeline<number>((x) => x * 42); expect(p(1)).toBe(42); });
  it("pipeline multiply 43", () => {
    const p = createPipeline<number>((x) => x * 43); expect(p(1)).toBe(43); });
  it("pipeline multiply 44", () => {
    const p = createPipeline<number>((x) => x * 44); expect(p(1)).toBe(44); });
  it("pipeline multiply 45", () => {
    const p = createPipeline<number>((x) => x * 45); expect(p(1)).toBe(45); });
  it("pipeline multiply 46", () => {
    const p = createPipeline<number>((x) => x * 46); expect(p(1)).toBe(46); });
  it("pipeline multiply 47", () => {
    const p = createPipeline<number>((x) => x * 47); expect(p(1)).toBe(47); });
  it("pipeline multiply 48", () => {
    const p = createPipeline<number>((x) => x * 48); expect(p(1)).toBe(48); });
  it("pipeline multiply 49", () => {
    const p = createPipeline<number>((x) => x * 49); expect(p(1)).toBe(49); });
  it("pipeline multiply 50", () => {
    const p = createPipeline<number>((x) => x * 50); expect(p(1)).toBe(50); });
  it("pipeline multiply 51", () => {
    const p = createPipeline<number>((x) => x * 51); expect(p(1)).toBe(51); });
  it("pipeline multiply 52", () => {
    const p = createPipeline<number>((x) => x * 52); expect(p(1)).toBe(52); });
  it("pipeline multiply 53", () => {
    const p = createPipeline<number>((x) => x * 53); expect(p(1)).toBe(53); });
  it("pipeline multiply 54", () => {
    const p = createPipeline<number>((x) => x * 54); expect(p(1)).toBe(54); });
  it("pipeline multiply 55", () => {
    const p = createPipeline<number>((x) => x * 55); expect(p(1)).toBe(55); });
  it("pipeline multiply 56", () => {
    const p = createPipeline<number>((x) => x * 56); expect(p(1)).toBe(56); });
  it("pipeline multiply 57", () => {
    const p = createPipeline<number>((x) => x * 57); expect(p(1)).toBe(57); });
  it("pipeline multiply 58", () => {
    const p = createPipeline<number>((x) => x * 58); expect(p(1)).toBe(58); });
  it("pipeline multiply 59", () => {
    const p = createPipeline<number>((x) => x * 59); expect(p(1)).toBe(59); });
  it("pipeline multiply 60", () => {
    const p = createPipeline<number>((x) => x * 60); expect(p(1)).toBe(60); });
  it("pipeline multiply 61", () => {
    const p = createPipeline<number>((x) => x * 61); expect(p(1)).toBe(61); });
  it("pipeline multiply 62", () => {
    const p = createPipeline<number>((x) => x * 62); expect(p(1)).toBe(62); });
  it("pipeline multiply 63", () => {
    const p = createPipeline<number>((x) => x * 63); expect(p(1)).toBe(63); });
  it("pipeline multiply 64", () => {
    const p = createPipeline<number>((x) => x * 64); expect(p(1)).toBe(64); });
  it("pipeline multiply 65", () => {
    const p = createPipeline<number>((x) => x * 65); expect(p(1)).toBe(65); });
  it("pipeline multiply 66", () => {
    const p = createPipeline<number>((x) => x * 66); expect(p(1)).toBe(66); });
  it("pipeline multiply 67", () => {
    const p = createPipeline<number>((x) => x * 67); expect(p(1)).toBe(67); });
  it("pipeline multiply 68", () => {
    const p = createPipeline<number>((x) => x * 68); expect(p(1)).toBe(68); });
  it("pipeline multiply 69", () => {
    const p = createPipeline<number>((x) => x * 69); expect(p(1)).toBe(69); });
  it("pipeline multiply 70", () => {
    const p = createPipeline<number>((x) => x * 70); expect(p(1)).toBe(70); });
  it("pipeline multiply 71", () => {
    const p = createPipeline<number>((x) => x * 71); expect(p(1)).toBe(71); });
  it("pipeline multiply 72", () => {
    const p = createPipeline<number>((x) => x * 72); expect(p(1)).toBe(72); });
  it("pipeline multiply 73", () => {
    const p = createPipeline<number>((x) => x * 73); expect(p(1)).toBe(73); });
  it("pipeline multiply 74", () => {
    const p = createPipeline<number>((x) => x * 74); expect(p(1)).toBe(74); });
  it("pipeline multiply 75", () => {
    const p = createPipeline<number>((x) => x * 75); expect(p(1)).toBe(75); });
  it("pipeline multiply 76", () => {
    const p = createPipeline<number>((x) => x * 76); expect(p(1)).toBe(76); });
  it("pipeline multiply 77", () => {
    const p = createPipeline<number>((x) => x * 77); expect(p(1)).toBe(77); });
  it("pipeline multiply 78", () => {
    const p = createPipeline<number>((x) => x * 78); expect(p(1)).toBe(78); });
  it("pipeline multiply 79", () => {
    const p = createPipeline<number>((x) => x * 79); expect(p(1)).toBe(79); });
  it("pipeline multiply 80", () => {
    const p = createPipeline<number>((x) => x * 80); expect(p(1)).toBe(80); });
  it("pipeline multiply 81", () => {
    const p = createPipeline<number>((x) => x * 81); expect(p(1)).toBe(81); });
  it("pipeline multiply 82", () => {
    const p = createPipeline<number>((x) => x * 82); expect(p(1)).toBe(82); });
  it("pipeline multiply 83", () => {
    const p = createPipeline<number>((x) => x * 83); expect(p(1)).toBe(83); });
  it("pipeline multiply 84", () => {
    const p = createPipeline<number>((x) => x * 84); expect(p(1)).toBe(84); });
  it("pipeline multiply 85", () => {
    const p = createPipeline<number>((x) => x * 85); expect(p(1)).toBe(85); });
  it("pipeline multiply 86", () => {
    const p = createPipeline<number>((x) => x * 86); expect(p(1)).toBe(86); });
  it("pipeline multiply 87", () => {
    const p = createPipeline<number>((x) => x * 87); expect(p(1)).toBe(87); });
  it("pipeline multiply 88", () => {
    const p = createPipeline<number>((x) => x * 88); expect(p(1)).toBe(88); });
  it("pipeline multiply 89", () => {
    const p = createPipeline<number>((x) => x * 89); expect(p(1)).toBe(89); });
  it("pipeline multiply 90", () => {
    const p = createPipeline<number>((x) => x * 90); expect(p(1)).toBe(90); });
  it("pipeline multiply 91", () => {
    const p = createPipeline<number>((x) => x * 91); expect(p(1)).toBe(91); });
  it("pipeline multiply 92", () => {
    const p = createPipeline<number>((x) => x * 92); expect(p(1)).toBe(92); });
  it("pipeline multiply 93", () => {
    const p = createPipeline<number>((x) => x * 93); expect(p(1)).toBe(93); });
  it("pipeline multiply 94", () => {
    const p = createPipeline<number>((x) => x * 94); expect(p(1)).toBe(94); });
  it("pipeline multiply 95", () => {
    const p = createPipeline<number>((x) => x * 95); expect(p(1)).toBe(95); });
  it("pipeline multiply 96", () => {
    const p = createPipeline<number>((x) => x * 96); expect(p(1)).toBe(96); });
  it("pipeline multiply 97", () => {
    const p = createPipeline<number>((x) => x * 97); expect(p(1)).toBe(97); });
});

describe("filterPipeline", () => {
  it("filters odd numbers", () => { expect(filterPipeline((x:number)=>x%2===0)([1,2,3,4])).toEqual([2,4]); });
  it("empty result when none match", () => { expect(filterPipeline((_:number)=>false)([1,2,3])).toEqual([]); });
  it("all pass when all match", () => { expect(filterPipeline((_:number)=>true)([1,2])).toEqual([1,2]); });
  it("filter keepGreater1", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 1)(arr);
    expect(r.every(x => x > 1)).toBe(true); });
  it("filter keepGreater2", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 2)(arr);
    expect(r.every(x => x > 2)).toBe(true); });
  it("filter keepGreater3", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 3)(arr);
    expect(r.every(x => x > 3)).toBe(true); });
  it("filter keepGreater4", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 4)(arr);
    expect(r.every(x => x > 4)).toBe(true); });
  it("filter keepGreater5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 5)(arr);
    expect(r.every(x => x > 5)).toBe(true); });
  it("filter keepGreater6", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 6)(arr);
    expect(r.every(x => x > 6)).toBe(true); });
  it("filter keepGreater7", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 7)(arr);
    expect(r.every(x => x > 7)).toBe(true); });
  it("filter keepGreater8", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 8)(arr);
    expect(r.every(x => x > 8)).toBe(true); });
  it("filter keepGreater9", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 9)(arr);
    expect(r.every(x => x > 9)).toBe(true); });
  it("filter keepGreater10", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 10)(arr);
    expect(r.every(x => x > 10)).toBe(true); });
  it("filter keepGreater11", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 11)(arr);
    expect(r.every(x => x > 11)).toBe(true); });
  it("filter keepGreater12", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 12)(arr);
    expect(r.every(x => x > 12)).toBe(true); });
  it("filter keepGreater13", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 13)(arr);
    expect(r.every(x => x > 13)).toBe(true); });
  it("filter keepGreater14", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 14)(arr);
    expect(r.every(x => x > 14)).toBe(true); });
  it("filter keepGreater15", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 0)(arr);
    expect(r.every(x => x > 0)).toBe(true); });
  it("filter keepGreater16", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 1)(arr);
    expect(r.every(x => x > 1)).toBe(true); });
  it("filter keepGreater17", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 2)(arr);
    expect(r.every(x => x > 2)).toBe(true); });
  it("filter keepGreater18", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 3)(arr);
    expect(r.every(x => x > 3)).toBe(true); });
  it("filter keepGreater19", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 4)(arr);
    expect(r.every(x => x > 4)).toBe(true); });
  it("filter keepGreater20", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 5)(arr);
    expect(r.every(x => x > 5)).toBe(true); });
  it("filter keepGreater21", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 6)(arr);
    expect(r.every(x => x > 6)).toBe(true); });
  it("filter keepGreater22", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 7)(arr);
    expect(r.every(x => x > 7)).toBe(true); });
  it("filter keepGreater23", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 8)(arr);
    expect(r.every(x => x > 8)).toBe(true); });
  it("filter keepGreater24", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 9)(arr);
    expect(r.every(x => x > 9)).toBe(true); });
  it("filter keepGreater25", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 10)(arr);
    expect(r.every(x => x > 10)).toBe(true); });
  it("filter keepGreater26", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 11)(arr);
    expect(r.every(x => x > 11)).toBe(true); });
  it("filter keepGreater27", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 12)(arr);
    expect(r.every(x => x > 12)).toBe(true); });
  it("filter keepGreater28", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 13)(arr);
    expect(r.every(x => x > 13)).toBe(true); });
  it("filter keepGreater29", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 14)(arr);
    expect(r.every(x => x > 14)).toBe(true); });
  it("filter keepGreater30", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 0)(arr);
    expect(r.every(x => x > 0)).toBe(true); });
  it("filter keepGreater31", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 1)(arr);
    expect(r.every(x => x > 1)).toBe(true); });
  it("filter keepGreater32", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 2)(arr);
    expect(r.every(x => x > 2)).toBe(true); });
  it("filter keepGreater33", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 3)(arr);
    expect(r.every(x => x > 3)).toBe(true); });
  it("filter keepGreater34", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 4)(arr);
    expect(r.every(x => x > 4)).toBe(true); });
  it("filter keepGreater35", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 5)(arr);
    expect(r.every(x => x > 5)).toBe(true); });
  it("filter keepGreater36", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 6)(arr);
    expect(r.every(x => x > 6)).toBe(true); });
  it("filter keepGreater37", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 7)(arr);
    expect(r.every(x => x > 7)).toBe(true); });
  it("filter keepGreater38", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 8)(arr);
    expect(r.every(x => x > 8)).toBe(true); });
  it("filter keepGreater39", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 9)(arr);
    expect(r.every(x => x > 9)).toBe(true); });
  it("filter keepGreater40", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 10)(arr);
    expect(r.every(x => x > 10)).toBe(true); });
  it("filter keepGreater41", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 11)(arr);
    expect(r.every(x => x > 11)).toBe(true); });
  it("filter keepGreater42", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 12)(arr);
    expect(r.every(x => x > 12)).toBe(true); });
  it("filter keepGreater43", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 13)(arr);
    expect(r.every(x => x > 13)).toBe(true); });
  it("filter keepGreater44", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 14)(arr);
    expect(r.every(x => x > 14)).toBe(true); });
  it("filter keepGreater45", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 0)(arr);
    expect(r.every(x => x > 0)).toBe(true); });
  it("filter keepGreater46", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 1)(arr);
    expect(r.every(x => x > 1)).toBe(true); });
  it("filter keepGreater47", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 2)(arr);
    expect(r.every(x => x > 2)).toBe(true); });
  it("filter keepGreater48", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 3)(arr);
    expect(r.every(x => x > 3)).toBe(true); });
  it("filter keepGreater49", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 4)(arr);
    expect(r.every(x => x > 4)).toBe(true); });
  it("filter keepGreater50", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 5)(arr);
    expect(r.every(x => x > 5)).toBe(true); });
  it("filter keepGreater51", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 6)(arr);
    expect(r.every(x => x > 6)).toBe(true); });
  it("filter keepGreater52", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 7)(arr);
    expect(r.every(x => x > 7)).toBe(true); });
  it("filter keepGreater53", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 8)(arr);
    expect(r.every(x => x > 8)).toBe(true); });
  it("filter keepGreater54", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 9)(arr);
    expect(r.every(x => x > 9)).toBe(true); });
  it("filter keepGreater55", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 10)(arr);
    expect(r.every(x => x > 10)).toBe(true); });
  it("filter keepGreater56", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 11)(arr);
    expect(r.every(x => x > 11)).toBe(true); });
  it("filter keepGreater57", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 12)(arr);
    expect(r.every(x => x > 12)).toBe(true); });
  it("filter keepGreater58", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 13)(arr);
    expect(r.every(x => x > 13)).toBe(true); });
  it("filter keepGreater59", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 14)(arr);
    expect(r.every(x => x > 14)).toBe(true); });
  it("filter keepGreater60", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 0)(arr);
    expect(r.every(x => x > 0)).toBe(true); });
  it("filter keepGreater61", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 1)(arr);
    expect(r.every(x => x > 1)).toBe(true); });
  it("filter keepGreater62", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 2)(arr);
    expect(r.every(x => x > 2)).toBe(true); });
  it("filter keepGreater63", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 3)(arr);
    expect(r.every(x => x > 3)).toBe(true); });
  it("filter keepGreater64", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 4)(arr);
    expect(r.every(x => x > 4)).toBe(true); });
  it("filter keepGreater65", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 5)(arr);
    expect(r.every(x => x > 5)).toBe(true); });
  it("filter keepGreater66", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 6)(arr);
    expect(r.every(x => x > 6)).toBe(true); });
  it("filter keepGreater67", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 7)(arr);
    expect(r.every(x => x > 7)).toBe(true); });
  it("filter keepGreater68", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 8)(arr);
    expect(r.every(x => x > 8)).toBe(true); });
  it("filter keepGreater69", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 9)(arr);
    expect(r.every(x => x > 9)).toBe(true); });
  it("filter keepGreater70", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 10)(arr);
    expect(r.every(x => x > 10)).toBe(true); });
  it("filter keepGreater71", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 11)(arr);
    expect(r.every(x => x > 11)).toBe(true); });
  it("filter keepGreater72", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 12)(arr);
    expect(r.every(x => x > 12)).toBe(true); });
  it("filter keepGreater73", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 13)(arr);
    expect(r.every(x => x > 13)).toBe(true); });
  it("filter keepGreater74", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 14)(arr);
    expect(r.every(x => x > 14)).toBe(true); });
  it("filter keepGreater75", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 0)(arr);
    expect(r.every(x => x > 0)).toBe(true); });
  it("filter keepGreater76", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 1)(arr);
    expect(r.every(x => x > 1)).toBe(true); });
  it("filter keepGreater77", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 2)(arr);
    expect(r.every(x => x > 2)).toBe(true); });
  it("filter keepGreater78", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 3)(arr);
    expect(r.every(x => x > 3)).toBe(true); });
  it("filter keepGreater79", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 4)(arr);
    expect(r.every(x => x > 4)).toBe(true); });
  it("filter keepGreater80", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 5)(arr);
    expect(r.every(x => x > 5)).toBe(true); });
  it("filter keepGreater81", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 6)(arr);
    expect(r.every(x => x > 6)).toBe(true); });
  it("filter keepGreater82", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 7)(arr);
    expect(r.every(x => x > 7)).toBe(true); });
  it("filter keepGreater83", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 8)(arr);
    expect(r.every(x => x > 8)).toBe(true); });
  it("filter keepGreater84", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 9)(arr);
    expect(r.every(x => x > 9)).toBe(true); });
  it("filter keepGreater85", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 10)(arr);
    expect(r.every(x => x > 10)).toBe(true); });
  it("filter keepGreater86", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 11)(arr);
    expect(r.every(x => x > 11)).toBe(true); });
  it("filter keepGreater87", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 12)(arr);
    expect(r.every(x => x > 12)).toBe(true); });
  it("filter keepGreater88", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 13)(arr);
    expect(r.every(x => x > 13)).toBe(true); });
  it("filter keepGreater89", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 14)(arr);
    expect(r.every(x => x > 14)).toBe(true); });
  it("filter keepGreater90", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 0)(arr);
    expect(r.every(x => x > 0)).toBe(true); });
  it("filter keepGreater91", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 1)(arr);
    expect(r.every(x => x > 1)).toBe(true); });
  it("filter keepGreater92", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 2)(arr);
    expect(r.every(x => x > 2)).toBe(true); });
  it("filter keepGreater93", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 3)(arr);
    expect(r.every(x => x > 3)).toBe(true); });
  it("filter keepGreater94", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 4)(arr);
    expect(r.every(x => x > 4)).toBe(true); });
  it("filter keepGreater95", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 5)(arr);
    expect(r.every(x => x > 5)).toBe(true); });
  it("filter keepGreater96", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 6)(arr);
    expect(r.every(x => x > 6)).toBe(true); });
  it("filter keepGreater97", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = filterPipeline((x:number) => x > 7)(arr);
    expect(r.every(x => x > 7)).toBe(true); });
});

describe("mapPipeline", () => {
  it("doubles each", () => { expect(mapPipeline((x:number)=>x*2)([1,2,3])).toEqual([2,4,6]); });
  it("empty array stays empty", () => { expect(mapPipeline((x:number)=>x*2)([])).toEqual([]); });
  it("mapPipeline add 1", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 1)(arr);
    expect(r[0]).toBe(1 + 1); });
  it("mapPipeline add 2", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 2)(arr);
    expect(r[0]).toBe(1 + 2); });
  it("mapPipeline add 3", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 3)(arr);
    expect(r[0]).toBe(1 + 3); });
  it("mapPipeline add 4", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 4)(arr);
    expect(r[0]).toBe(1 + 4); });
  it("mapPipeline add 5", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 5)(arr);
    expect(r[0]).toBe(1 + 5); });
  it("mapPipeline add 6", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 6)(arr);
    expect(r[0]).toBe(1 + 6); });
  it("mapPipeline add 7", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 7)(arr);
    expect(r[0]).toBe(1 + 7); });
  it("mapPipeline add 8", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 8)(arr);
    expect(r[0]).toBe(1 + 8); });
  it("mapPipeline add 9", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 9)(arr);
    expect(r[0]).toBe(1 + 9); });
  it("mapPipeline add 10", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 10)(arr);
    expect(r[0]).toBe(1 + 10); });
  it("mapPipeline add 11", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 11)(arr);
    expect(r[0]).toBe(1 + 11); });
  it("mapPipeline add 12", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 12)(arr);
    expect(r[0]).toBe(1 + 12); });
  it("mapPipeline add 13", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 13)(arr);
    expect(r[0]).toBe(1 + 13); });
  it("mapPipeline add 14", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 14)(arr);
    expect(r[0]).toBe(1 + 14); });
  it("mapPipeline add 15", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 15)(arr);
    expect(r[0]).toBe(1 + 15); });
  it("mapPipeline add 16", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 16)(arr);
    expect(r[0]).toBe(1 + 16); });
  it("mapPipeline add 17", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 17)(arr);
    expect(r[0]).toBe(1 + 17); });
  it("mapPipeline add 18", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 18)(arr);
    expect(r[0]).toBe(1 + 18); });
  it("mapPipeline add 19", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 19)(arr);
    expect(r[0]).toBe(1 + 19); });
  it("mapPipeline add 20", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 20)(arr);
    expect(r[0]).toBe(1 + 20); });
  it("mapPipeline add 21", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 21)(arr);
    expect(r[0]).toBe(1 + 21); });
  it("mapPipeline add 22", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 22)(arr);
    expect(r[0]).toBe(1 + 22); });
  it("mapPipeline add 23", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 23)(arr);
    expect(r[0]).toBe(1 + 23); });
  it("mapPipeline add 24", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 24)(arr);
    expect(r[0]).toBe(1 + 24); });
  it("mapPipeline add 25", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 25)(arr);
    expect(r[0]).toBe(1 + 25); });
  it("mapPipeline add 26", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 26)(arr);
    expect(r[0]).toBe(1 + 26); });
  it("mapPipeline add 27", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 27)(arr);
    expect(r[0]).toBe(1 + 27); });
  it("mapPipeline add 28", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 28)(arr);
    expect(r[0]).toBe(1 + 28); });
  it("mapPipeline add 29", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 29)(arr);
    expect(r[0]).toBe(1 + 29); });
  it("mapPipeline add 30", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 30)(arr);
    expect(r[0]).toBe(1 + 30); });
  it("mapPipeline add 31", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 31)(arr);
    expect(r[0]).toBe(1 + 31); });
  it("mapPipeline add 32", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 32)(arr);
    expect(r[0]).toBe(1 + 32); });
  it("mapPipeline add 33", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 33)(arr);
    expect(r[0]).toBe(1 + 33); });
  it("mapPipeline add 34", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 34)(arr);
    expect(r[0]).toBe(1 + 34); });
  it("mapPipeline add 35", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 35)(arr);
    expect(r[0]).toBe(1 + 35); });
  it("mapPipeline add 36", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 36)(arr);
    expect(r[0]).toBe(1 + 36); });
  it("mapPipeline add 37", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 37)(arr);
    expect(r[0]).toBe(1 + 37); });
  it("mapPipeline add 38", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 38)(arr);
    expect(r[0]).toBe(1 + 38); });
  it("mapPipeline add 39", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 39)(arr);
    expect(r[0]).toBe(1 + 39); });
  it("mapPipeline add 40", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 40)(arr);
    expect(r[0]).toBe(1 + 40); });
  it("mapPipeline add 41", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 41)(arr);
    expect(r[0]).toBe(1 + 41); });
  it("mapPipeline add 42", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 42)(arr);
    expect(r[0]).toBe(1 + 42); });
  it("mapPipeline add 43", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 43)(arr);
    expect(r[0]).toBe(1 + 43); });
  it("mapPipeline add 44", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 44)(arr);
    expect(r[0]).toBe(1 + 44); });
  it("mapPipeline add 45", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 45)(arr);
    expect(r[0]).toBe(1 + 45); });
  it("mapPipeline add 46", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 46)(arr);
    expect(r[0]).toBe(1 + 46); });
  it("mapPipeline add 47", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 47)(arr);
    expect(r[0]).toBe(1 + 47); });
  it("mapPipeline add 48", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 48)(arr);
    expect(r[0]).toBe(1 + 48); });
  it("mapPipeline add 49", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 49)(arr);
    expect(r[0]).toBe(1 + 49); });
  it("mapPipeline add 50", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 50)(arr);
    expect(r[0]).toBe(1 + 50); });
  it("mapPipeline add 51", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 51)(arr);
    expect(r[0]).toBe(1 + 51); });
  it("mapPipeline add 52", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 52)(arr);
    expect(r[0]).toBe(1 + 52); });
  it("mapPipeline add 53", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 53)(arr);
    expect(r[0]).toBe(1 + 53); });
  it("mapPipeline add 54", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 54)(arr);
    expect(r[0]).toBe(1 + 54); });
  it("mapPipeline add 55", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 55)(arr);
    expect(r[0]).toBe(1 + 55); });
  it("mapPipeline add 56", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 56)(arr);
    expect(r[0]).toBe(1 + 56); });
  it("mapPipeline add 57", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 57)(arr);
    expect(r[0]).toBe(1 + 57); });
  it("mapPipeline add 58", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 58)(arr);
    expect(r[0]).toBe(1 + 58); });
  it("mapPipeline add 59", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 59)(arr);
    expect(r[0]).toBe(1 + 59); });
  it("mapPipeline add 60", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 60)(arr);
    expect(r[0]).toBe(1 + 60); });
  it("mapPipeline add 61", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 61)(arr);
    expect(r[0]).toBe(1 + 61); });
  it("mapPipeline add 62", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 62)(arr);
    expect(r[0]).toBe(1 + 62); });
  it("mapPipeline add 63", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 63)(arr);
    expect(r[0]).toBe(1 + 63); });
  it("mapPipeline add 64", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 64)(arr);
    expect(r[0]).toBe(1 + 64); });
  it("mapPipeline add 65", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 65)(arr);
    expect(r[0]).toBe(1 + 65); });
  it("mapPipeline add 66", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 66)(arr);
    expect(r[0]).toBe(1 + 66); });
  it("mapPipeline add 67", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 67)(arr);
    expect(r[0]).toBe(1 + 67); });
  it("mapPipeline add 68", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 68)(arr);
    expect(r[0]).toBe(1 + 68); });
  it("mapPipeline add 69", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 69)(arr);
    expect(r[0]).toBe(1 + 69); });
  it("mapPipeline add 70", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 70)(arr);
    expect(r[0]).toBe(1 + 70); });
  it("mapPipeline add 71", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 71)(arr);
    expect(r[0]).toBe(1 + 71); });
  it("mapPipeline add 72", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 72)(arr);
    expect(r[0]).toBe(1 + 72); });
  it("mapPipeline add 73", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 73)(arr);
    expect(r[0]).toBe(1 + 73); });
  it("mapPipeline add 74", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 74)(arr);
    expect(r[0]).toBe(1 + 74); });
  it("mapPipeline add 75", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 75)(arr);
    expect(r[0]).toBe(1 + 75); });
  it("mapPipeline add 76", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 76)(arr);
    expect(r[0]).toBe(1 + 76); });
  it("mapPipeline add 77", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 77)(arr);
    expect(r[0]).toBe(1 + 77); });
  it("mapPipeline add 78", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 78)(arr);
    expect(r[0]).toBe(1 + 78); });
  it("mapPipeline add 79", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 79)(arr);
    expect(r[0]).toBe(1 + 79); });
  it("mapPipeline add 80", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 80)(arr);
    expect(r[0]).toBe(1 + 80); });
  it("mapPipeline add 81", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 81)(arr);
    expect(r[0]).toBe(1 + 81); });
  it("mapPipeline add 82", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 82)(arr);
    expect(r[0]).toBe(1 + 82); });
  it("mapPipeline add 83", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 83)(arr);
    expect(r[0]).toBe(1 + 83); });
  it("mapPipeline add 84", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 84)(arr);
    expect(r[0]).toBe(1 + 84); });
  it("mapPipeline add 85", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 85)(arr);
    expect(r[0]).toBe(1 + 85); });
  it("mapPipeline add 86", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 86)(arr);
    expect(r[0]).toBe(1 + 86); });
  it("mapPipeline add 87", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 87)(arr);
    expect(r[0]).toBe(1 + 87); });
  it("mapPipeline add 88", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 88)(arr);
    expect(r[0]).toBe(1 + 88); });
  it("mapPipeline add 89", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 89)(arr);
    expect(r[0]).toBe(1 + 89); });
  it("mapPipeline add 90", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 90)(arr);
    expect(r[0]).toBe(1 + 90); });
  it("mapPipeline add 91", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 91)(arr);
    expect(r[0]).toBe(1 + 91); });
  it("mapPipeline add 92", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 92)(arr);
    expect(r[0]).toBe(1 + 92); });
  it("mapPipeline add 93", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 93)(arr);
    expect(r[0]).toBe(1 + 93); });
  it("mapPipeline add 94", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 94)(arr);
    expect(r[0]).toBe(1 + 94); });
  it("mapPipeline add 95", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 95)(arr);
    expect(r[0]).toBe(1 + 95); });
  it("mapPipeline add 96", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 96)(arr);
    expect(r[0]).toBe(1 + 96); });
  it("mapPipeline add 97", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 97)(arr);
    expect(r[0]).toBe(1 + 97); });
  it("mapPipeline add 98", () => {
    const arr = [1,2,3]; const r = mapPipeline((x:number) => x + 98)(arr);
    expect(r[0]).toBe(1 + 98); });
});

describe("tapPipeline", () => {
  it("passes value through unchanged", () => { expect(tapPipeline<number>(()=>{})(42)).toBe(42); });
  it("calls side effect", () => { let x=0; tapPipeline<number>(v=>{x=v;})(99); expect(x).toBe(99); });
  it("tap passes through 1", () => { expect(tapPipeline<number>(()=>{})(1)).toBe(1); });
  it("tap passes through 2", () => { expect(tapPipeline<number>(()=>{})(2)).toBe(2); });
  it("tap passes through 3", () => { expect(tapPipeline<number>(()=>{})(3)).toBe(3); });
  it("tap passes through 4", () => { expect(tapPipeline<number>(()=>{})(4)).toBe(4); });
  it("tap passes through 5", () => { expect(tapPipeline<number>(()=>{})(5)).toBe(5); });
  it("tap passes through 6", () => { expect(tapPipeline<number>(()=>{})(6)).toBe(6); });
  it("tap passes through 7", () => { expect(tapPipeline<number>(()=>{})(7)).toBe(7); });
  it("tap passes through 8", () => { expect(tapPipeline<number>(()=>{})(8)).toBe(8); });
  it("tap passes through 9", () => { expect(tapPipeline<number>(()=>{})(9)).toBe(9); });
  it("tap passes through 10", () => { expect(tapPipeline<number>(()=>{})(10)).toBe(10); });
  it("tap passes through 11", () => { expect(tapPipeline<number>(()=>{})(11)).toBe(11); });
  it("tap passes through 12", () => { expect(tapPipeline<number>(()=>{})(12)).toBe(12); });
  it("tap passes through 13", () => { expect(tapPipeline<number>(()=>{})(13)).toBe(13); });
  it("tap passes through 14", () => { expect(tapPipeline<number>(()=>{})(14)).toBe(14); });
  it("tap passes through 15", () => { expect(tapPipeline<number>(()=>{})(15)).toBe(15); });
  it("tap passes through 16", () => { expect(tapPipeline<number>(()=>{})(16)).toBe(16); });
  it("tap passes through 17", () => { expect(tapPipeline<number>(()=>{})(17)).toBe(17); });
  it("tap passes through 18", () => { expect(tapPipeline<number>(()=>{})(18)).toBe(18); });
  it("tap passes through 19", () => { expect(tapPipeline<number>(()=>{})(19)).toBe(19); });
  it("tap passes through 20", () => { expect(tapPipeline<number>(()=>{})(20)).toBe(20); });
  it("tap passes through 21", () => { expect(tapPipeline<number>(()=>{})(21)).toBe(21); });
  it("tap passes through 22", () => { expect(tapPipeline<number>(()=>{})(22)).toBe(22); });
  it("tap passes through 23", () => { expect(tapPipeline<number>(()=>{})(23)).toBe(23); });
  it("tap passes through 24", () => { expect(tapPipeline<number>(()=>{})(24)).toBe(24); });
  it("tap passes through 25", () => { expect(tapPipeline<number>(()=>{})(25)).toBe(25); });
  it("tap passes through 26", () => { expect(tapPipeline<number>(()=>{})(26)).toBe(26); });
  it("tap passes through 27", () => { expect(tapPipeline<number>(()=>{})(27)).toBe(27); });
  it("tap passes through 28", () => { expect(tapPipeline<number>(()=>{})(28)).toBe(28); });
  it("tap passes through 29", () => { expect(tapPipeline<number>(()=>{})(29)).toBe(29); });
  it("tap passes through 30", () => { expect(tapPipeline<number>(()=>{})(30)).toBe(30); });
  it("tap passes through 31", () => { expect(tapPipeline<number>(()=>{})(31)).toBe(31); });
  it("tap passes through 32", () => { expect(tapPipeline<number>(()=>{})(32)).toBe(32); });
  it("tap passes through 33", () => { expect(tapPipeline<number>(()=>{})(33)).toBe(33); });
  it("tap passes through 34", () => { expect(tapPipeline<number>(()=>{})(34)).toBe(34); });
  it("tap passes through 35", () => { expect(tapPipeline<number>(()=>{})(35)).toBe(35); });
  it("tap passes through 36", () => { expect(tapPipeline<number>(()=>{})(36)).toBe(36); });
  it("tap passes through 37", () => { expect(tapPipeline<number>(()=>{})(37)).toBe(37); });
  it("tap passes through 38", () => { expect(tapPipeline<number>(()=>{})(38)).toBe(38); });
  it("tap passes through 39", () => { expect(tapPipeline<number>(()=>{})(39)).toBe(39); });
  it("tap passes through 40", () => { expect(tapPipeline<number>(()=>{})(40)).toBe(40); });
  it("tap passes through 41", () => { expect(tapPipeline<number>(()=>{})(41)).toBe(41); });
  it("tap passes through 42", () => { expect(tapPipeline<number>(()=>{})(42)).toBe(42); });
  it("tap passes through 43", () => { expect(tapPipeline<number>(()=>{})(43)).toBe(43); });
  it("tap passes through 44", () => { expect(tapPipeline<number>(()=>{})(44)).toBe(44); });
  it("tap passes through 45", () => { expect(tapPipeline<number>(()=>{})(45)).toBe(45); });
  it("tap passes through 46", () => { expect(tapPipeline<number>(()=>{})(46)).toBe(46); });
  it("tap passes through 47", () => { expect(tapPipeline<number>(()=>{})(47)).toBe(47); });
  it("tap passes through 48", () => { expect(tapPipeline<number>(()=>{})(48)).toBe(48); });
  it("tap passes through 49", () => { expect(tapPipeline<number>(()=>{})(49)).toBe(49); });
  it("tap passes through 50", () => { expect(tapPipeline<number>(()=>{})(50)).toBe(50); });
  it("tap passes through 51", () => { expect(tapPipeline<number>(()=>{})(51)).toBe(51); });
  it("tap passes through 52", () => { expect(tapPipeline<number>(()=>{})(52)).toBe(52); });
  it("tap passes through 53", () => { expect(tapPipeline<number>(()=>{})(53)).toBe(53); });
  it("tap passes through 54", () => { expect(tapPipeline<number>(()=>{})(54)).toBe(54); });
  it("tap passes through 55", () => { expect(tapPipeline<number>(()=>{})(55)).toBe(55); });
  it("tap passes through 56", () => { expect(tapPipeline<number>(()=>{})(56)).toBe(56); });
  it("tap passes through 57", () => { expect(tapPipeline<number>(()=>{})(57)).toBe(57); });
  it("tap passes through 58", () => { expect(tapPipeline<number>(()=>{})(58)).toBe(58); });
  it("tap passes through 59", () => { expect(tapPipeline<number>(()=>{})(59)).toBe(59); });
  it("tap passes through 60", () => { expect(tapPipeline<number>(()=>{})(60)).toBe(60); });
  it("tap passes through 61", () => { expect(tapPipeline<number>(()=>{})(61)).toBe(61); });
  it("tap passes through 62", () => { expect(tapPipeline<number>(()=>{})(62)).toBe(62); });
  it("tap passes through 63", () => { expect(tapPipeline<number>(()=>{})(63)).toBe(63); });
  it("tap passes through 64", () => { expect(tapPipeline<number>(()=>{})(64)).toBe(64); });
  it("tap passes through 65", () => { expect(tapPipeline<number>(()=>{})(65)).toBe(65); });
  it("tap passes through 66", () => { expect(tapPipeline<number>(()=>{})(66)).toBe(66); });
  it("tap passes through 67", () => { expect(tapPipeline<number>(()=>{})(67)).toBe(67); });
  it("tap passes through 68", () => { expect(tapPipeline<number>(()=>{})(68)).toBe(68); });
  it("tap passes through 69", () => { expect(tapPipeline<number>(()=>{})(69)).toBe(69); });
  it("tap passes through 70", () => { expect(tapPipeline<number>(()=>{})(70)).toBe(70); });
  it("tap passes through 71", () => { expect(tapPipeline<number>(()=>{})(71)).toBe(71); });
  it("tap passes through 72", () => { expect(tapPipeline<number>(()=>{})(72)).toBe(72); });
  it("tap passes through 73", () => { expect(tapPipeline<number>(()=>{})(73)).toBe(73); });
  it("tap passes through 74", () => { expect(tapPipeline<number>(()=>{})(74)).toBe(74); });
  it("tap passes through 75", () => { expect(tapPipeline<number>(()=>{})(75)).toBe(75); });
  it("tap passes through 76", () => { expect(tapPipeline<number>(()=>{})(76)).toBe(76); });
  it("tap passes through 77", () => { expect(tapPipeline<number>(()=>{})(77)).toBe(77); });
  it("tap passes through 78", () => { expect(tapPipeline<number>(()=>{})(78)).toBe(78); });
  it("tap passes through 79", () => { expect(tapPipeline<number>(()=>{})(79)).toBe(79); });
  it("tap passes through 80", () => { expect(tapPipeline<number>(()=>{})(80)).toBe(80); });
  it("tap passes through 81", () => { expect(tapPipeline<number>(()=>{})(81)).toBe(81); });
  it("tap passes through 82", () => { expect(tapPipeline<number>(()=>{})(82)).toBe(82); });
  it("tap passes through 83", () => { expect(tapPipeline<number>(()=>{})(83)).toBe(83); });
  it("tap passes through 84", () => { expect(tapPipeline<number>(()=>{})(84)).toBe(84); });
  it("tap passes through 85", () => { expect(tapPipeline<number>(()=>{})(85)).toBe(85); });
  it("tap passes through 86", () => { expect(tapPipeline<number>(()=>{})(86)).toBe(86); });
  it("tap passes through 87", () => { expect(tapPipeline<number>(()=>{})(87)).toBe(87); });
  it("tap passes through 88", () => { expect(tapPipeline<number>(()=>{})(88)).toBe(88); });
  it("tap passes through 89", () => { expect(tapPipeline<number>(()=>{})(89)).toBe(89); });
  it("tap passes through 90", () => { expect(tapPipeline<number>(()=>{})(90)).toBe(90); });
  it("tap passes through 91", () => { expect(tapPipeline<number>(()=>{})(91)).toBe(91); });
  it("tap passes through 92", () => { expect(tapPipeline<number>(()=>{})(92)).toBe(92); });
  it("tap passes through 93", () => { expect(tapPipeline<number>(()=>{})(93)).toBe(93); });
  it("tap passes through 94", () => { expect(tapPipeline<number>(()=>{})(94)).toBe(94); });
  it("tap passes through 95", () => { expect(tapPipeline<number>(()=>{})(95)).toBe(95); });
  it("tap passes through 96", () => { expect(tapPipeline<number>(()=>{})(96)).toBe(96); });
  it("tap passes through 97", () => { expect(tapPipeline<number>(()=>{})(97)).toBe(97); });
  it("tap passes through 98", () => { expect(tapPipeline<number>(()=>{})(98)).toBe(98); });
});

describe("cache", () => {
  it("returns correct result", () => { const fn = cache((x:number)=>x*2); expect(fn(5)).toBe(10); });
  it("memoizes calls", () => { let c=0; const fn=cache((x:number)=>{c++;return x;}); fn(1); fn(1); expect(c).toBe(1); });
  it("different inputs call fn separately", () => { let c=0; const fn=cache((x:number)=>{c++;return x;}); fn(1); fn(2); expect(c).toBe(2); });
  it("cache memoizes 1", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+1;});
    fn(1); fn(1); expect(c).toBe(1); expect(fn(1)).toBe(2); });
  it("cache memoizes 2", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+2;});
    fn(2); fn(2); expect(c).toBe(1); expect(fn(2)).toBe(4); });
  it("cache memoizes 3", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+3;});
    fn(3); fn(3); expect(c).toBe(1); expect(fn(3)).toBe(6); });
  it("cache memoizes 4", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+4;});
    fn(4); fn(4); expect(c).toBe(1); expect(fn(4)).toBe(8); });
  it("cache memoizes 5", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+5;});
    fn(5); fn(5); expect(c).toBe(1); expect(fn(5)).toBe(10); });
  it("cache memoizes 6", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+6;});
    fn(6); fn(6); expect(c).toBe(1); expect(fn(6)).toBe(12); });
  it("cache memoizes 7", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+7;});
    fn(7); fn(7); expect(c).toBe(1); expect(fn(7)).toBe(14); });
  it("cache memoizes 8", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+8;});
    fn(8); fn(8); expect(c).toBe(1); expect(fn(8)).toBe(16); });
  it("cache memoizes 9", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+9;});
    fn(9); fn(9); expect(c).toBe(1); expect(fn(9)).toBe(18); });
  it("cache memoizes 10", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+10;});
    fn(10); fn(10); expect(c).toBe(1); expect(fn(10)).toBe(20); });
  it("cache memoizes 11", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+11;});
    fn(11); fn(11); expect(c).toBe(1); expect(fn(11)).toBe(22); });
  it("cache memoizes 12", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+12;});
    fn(12); fn(12); expect(c).toBe(1); expect(fn(12)).toBe(24); });
  it("cache memoizes 13", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+13;});
    fn(13); fn(13); expect(c).toBe(1); expect(fn(13)).toBe(26); });
  it("cache memoizes 14", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+14;});
    fn(14); fn(14); expect(c).toBe(1); expect(fn(14)).toBe(28); });
  it("cache memoizes 15", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+15;});
    fn(15); fn(15); expect(c).toBe(1); expect(fn(15)).toBe(30); });
  it("cache memoizes 16", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+16;});
    fn(16); fn(16); expect(c).toBe(1); expect(fn(16)).toBe(32); });
  it("cache memoizes 17", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+17;});
    fn(17); fn(17); expect(c).toBe(1); expect(fn(17)).toBe(34); });
  it("cache memoizes 18", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+18;});
    fn(18); fn(18); expect(c).toBe(1); expect(fn(18)).toBe(36); });
  it("cache memoizes 19", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+19;});
    fn(19); fn(19); expect(c).toBe(1); expect(fn(19)).toBe(38); });
  it("cache memoizes 20", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+20;});
    fn(20); fn(20); expect(c).toBe(1); expect(fn(20)).toBe(40); });
  it("cache memoizes 21", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+21;});
    fn(21); fn(21); expect(c).toBe(1); expect(fn(21)).toBe(42); });
  it("cache memoizes 22", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+22;});
    fn(22); fn(22); expect(c).toBe(1); expect(fn(22)).toBe(44); });
  it("cache memoizes 23", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+23;});
    fn(23); fn(23); expect(c).toBe(1); expect(fn(23)).toBe(46); });
  it("cache memoizes 24", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+24;});
    fn(24); fn(24); expect(c).toBe(1); expect(fn(24)).toBe(48); });
  it("cache memoizes 25", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+25;});
    fn(25); fn(25); expect(c).toBe(1); expect(fn(25)).toBe(50); });
  it("cache memoizes 26", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+26;});
    fn(26); fn(26); expect(c).toBe(1); expect(fn(26)).toBe(52); });
  it("cache memoizes 27", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+27;});
    fn(27); fn(27); expect(c).toBe(1); expect(fn(27)).toBe(54); });
  it("cache memoizes 28", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+28;});
    fn(28); fn(28); expect(c).toBe(1); expect(fn(28)).toBe(56); });
  it("cache memoizes 29", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+29;});
    fn(29); fn(29); expect(c).toBe(1); expect(fn(29)).toBe(58); });
  it("cache memoizes 30", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+30;});
    fn(30); fn(30); expect(c).toBe(1); expect(fn(30)).toBe(60); });
  it("cache memoizes 31", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+31;});
    fn(31); fn(31); expect(c).toBe(1); expect(fn(31)).toBe(62); });
  it("cache memoizes 32", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+32;});
    fn(32); fn(32); expect(c).toBe(1); expect(fn(32)).toBe(64); });
  it("cache memoizes 33", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+33;});
    fn(33); fn(33); expect(c).toBe(1); expect(fn(33)).toBe(66); });
  it("cache memoizes 34", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+34;});
    fn(34); fn(34); expect(c).toBe(1); expect(fn(34)).toBe(68); });
  it("cache memoizes 35", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+35;});
    fn(35); fn(35); expect(c).toBe(1); expect(fn(35)).toBe(70); });
  it("cache memoizes 36", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+36;});
    fn(36); fn(36); expect(c).toBe(1); expect(fn(36)).toBe(72); });
  it("cache memoizes 37", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+37;});
    fn(37); fn(37); expect(c).toBe(1); expect(fn(37)).toBe(74); });
  it("cache memoizes 38", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+38;});
    fn(38); fn(38); expect(c).toBe(1); expect(fn(38)).toBe(76); });
  it("cache memoizes 39", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+39;});
    fn(39); fn(39); expect(c).toBe(1); expect(fn(39)).toBe(78); });
  it("cache memoizes 40", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+40;});
    fn(40); fn(40); expect(c).toBe(1); expect(fn(40)).toBe(80); });
  it("cache memoizes 41", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+41;});
    fn(41); fn(41); expect(c).toBe(1); expect(fn(41)).toBe(82); });
  it("cache memoizes 42", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+42;});
    fn(42); fn(42); expect(c).toBe(1); expect(fn(42)).toBe(84); });
  it("cache memoizes 43", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+43;});
    fn(43); fn(43); expect(c).toBe(1); expect(fn(43)).toBe(86); });
  it("cache memoizes 44", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+44;});
    fn(44); fn(44); expect(c).toBe(1); expect(fn(44)).toBe(88); });
  it("cache memoizes 45", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+45;});
    fn(45); fn(45); expect(c).toBe(1); expect(fn(45)).toBe(90); });
  it("cache memoizes 46", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+46;});
    fn(46); fn(46); expect(c).toBe(1); expect(fn(46)).toBe(92); });
  it("cache memoizes 47", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+47;});
    fn(47); fn(47); expect(c).toBe(1); expect(fn(47)).toBe(94); });
  it("cache memoizes 48", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+48;});
    fn(48); fn(48); expect(c).toBe(1); expect(fn(48)).toBe(96); });
  it("cache memoizes 49", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+49;});
    fn(49); fn(49); expect(c).toBe(1); expect(fn(49)).toBe(98); });
  it("cache memoizes 50", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+50;});
    fn(50); fn(50); expect(c).toBe(1); expect(fn(50)).toBe(100); });
  it("cache memoizes 51", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+51;});
    fn(51); fn(51); expect(c).toBe(1); expect(fn(51)).toBe(102); });
  it("cache memoizes 52", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+52;});
    fn(52); fn(52); expect(c).toBe(1); expect(fn(52)).toBe(104); });
  it("cache memoizes 53", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+53;});
    fn(53); fn(53); expect(c).toBe(1); expect(fn(53)).toBe(106); });
  it("cache memoizes 54", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+54;});
    fn(54); fn(54); expect(c).toBe(1); expect(fn(54)).toBe(108); });
  it("cache memoizes 55", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+55;});
    fn(55); fn(55); expect(c).toBe(1); expect(fn(55)).toBe(110); });
  it("cache memoizes 56", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+56;});
    fn(56); fn(56); expect(c).toBe(1); expect(fn(56)).toBe(112); });
  it("cache memoizes 57", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+57;});
    fn(57); fn(57); expect(c).toBe(1); expect(fn(57)).toBe(114); });
  it("cache memoizes 58", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+58;});
    fn(58); fn(58); expect(c).toBe(1); expect(fn(58)).toBe(116); });
  it("cache memoizes 59", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+59;});
    fn(59); fn(59); expect(c).toBe(1); expect(fn(59)).toBe(118); });
  it("cache memoizes 60", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+60;});
    fn(60); fn(60); expect(c).toBe(1); expect(fn(60)).toBe(120); });
  it("cache memoizes 61", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+61;});
    fn(61); fn(61); expect(c).toBe(1); expect(fn(61)).toBe(122); });
  it("cache memoizes 62", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+62;});
    fn(62); fn(62); expect(c).toBe(1); expect(fn(62)).toBe(124); });
  it("cache memoizes 63", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+63;});
    fn(63); fn(63); expect(c).toBe(1); expect(fn(63)).toBe(126); });
  it("cache memoizes 64", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+64;});
    fn(64); fn(64); expect(c).toBe(1); expect(fn(64)).toBe(128); });
  it("cache memoizes 65", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+65;});
    fn(65); fn(65); expect(c).toBe(1); expect(fn(65)).toBe(130); });
  it("cache memoizes 66", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+66;});
    fn(66); fn(66); expect(c).toBe(1); expect(fn(66)).toBe(132); });
  it("cache memoizes 67", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+67;});
    fn(67); fn(67); expect(c).toBe(1); expect(fn(67)).toBe(134); });
  it("cache memoizes 68", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+68;});
    fn(68); fn(68); expect(c).toBe(1); expect(fn(68)).toBe(136); });
  it("cache memoizes 69", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+69;});
    fn(69); fn(69); expect(c).toBe(1); expect(fn(69)).toBe(138); });
  it("cache memoizes 70", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+70;});
    fn(70); fn(70); expect(c).toBe(1); expect(fn(70)).toBe(140); });
  it("cache memoizes 71", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+71;});
    fn(71); fn(71); expect(c).toBe(1); expect(fn(71)).toBe(142); });
  it("cache memoizes 72", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+72;});
    fn(72); fn(72); expect(c).toBe(1); expect(fn(72)).toBe(144); });
  it("cache memoizes 73", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+73;});
    fn(73); fn(73); expect(c).toBe(1); expect(fn(73)).toBe(146); });
  it("cache memoizes 74", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+74;});
    fn(74); fn(74); expect(c).toBe(1); expect(fn(74)).toBe(148); });
  it("cache memoizes 75", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+75;});
    fn(75); fn(75); expect(c).toBe(1); expect(fn(75)).toBe(150); });
  it("cache memoizes 76", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+76;});
    fn(76); fn(76); expect(c).toBe(1); expect(fn(76)).toBe(152); });
  it("cache memoizes 77", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+77;});
    fn(77); fn(77); expect(c).toBe(1); expect(fn(77)).toBe(154); });
  it("cache memoizes 78", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+78;});
    fn(78); fn(78); expect(c).toBe(1); expect(fn(78)).toBe(156); });
  it("cache memoizes 79", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+79;});
    fn(79); fn(79); expect(c).toBe(1); expect(fn(79)).toBe(158); });
  it("cache memoizes 80", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+80;});
    fn(80); fn(80); expect(c).toBe(1); expect(fn(80)).toBe(160); });
  it("cache memoizes 81", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+81;});
    fn(81); fn(81); expect(c).toBe(1); expect(fn(81)).toBe(162); });
  it("cache memoizes 82", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+82;});
    fn(82); fn(82); expect(c).toBe(1); expect(fn(82)).toBe(164); });
  it("cache memoizes 83", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+83;});
    fn(83); fn(83); expect(c).toBe(1); expect(fn(83)).toBe(166); });
  it("cache memoizes 84", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+84;});
    fn(84); fn(84); expect(c).toBe(1); expect(fn(84)).toBe(168); });
  it("cache memoizes 85", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+85;});
    fn(85); fn(85); expect(c).toBe(1); expect(fn(85)).toBe(170); });
  it("cache memoizes 86", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+86;});
    fn(86); fn(86); expect(c).toBe(1); expect(fn(86)).toBe(172); });
  it("cache memoizes 87", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+87;});
    fn(87); fn(87); expect(c).toBe(1); expect(fn(87)).toBe(174); });
  it("cache memoizes 88", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+88;});
    fn(88); fn(88); expect(c).toBe(1); expect(fn(88)).toBe(176); });
  it("cache memoizes 89", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+89;});
    fn(89); fn(89); expect(c).toBe(1); expect(fn(89)).toBe(178); });
  it("cache memoizes 90", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+90;});
    fn(90); fn(90); expect(c).toBe(1); expect(fn(90)).toBe(180); });
  it("cache memoizes 91", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+91;});
    fn(91); fn(91); expect(c).toBe(1); expect(fn(91)).toBe(182); });
  it("cache memoizes 92", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+92;});
    fn(92); fn(92); expect(c).toBe(1); expect(fn(92)).toBe(184); });
  it("cache memoizes 93", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+93;});
    fn(93); fn(93); expect(c).toBe(1); expect(fn(93)).toBe(186); });
  it("cache memoizes 94", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+94;});
    fn(94); fn(94); expect(c).toBe(1); expect(fn(94)).toBe(188); });
  it("cache memoizes 95", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+95;});
    fn(95); fn(95); expect(c).toBe(1); expect(fn(95)).toBe(190); });
  it("cache memoizes 96", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+96;});
    fn(96); fn(96); expect(c).toBe(1); expect(fn(96)).toBe(192); });
  it("cache memoizes 97", () => {
    let c=0; const fn=cache((x:number)=>{c++;return x+97;});
    fn(97); fn(97); expect(c).toBe(1); expect(fn(97)).toBe(194); });
});

describe("limit and skip", () => {
  it("limit 3 of 5", () => { expect(limit<number>(3)([1,2,3,4,5])).toEqual([1,2,3]); });
  it("skip 2 of 5", () => { expect(skip<number>(2)([1,2,3,4,5])).toEqual([3,4,5]); });
  it("limit 0 returns empty", () => { expect(limit<number>(0)([1,2,3])).toEqual([]); });
  it("skip 0 returns all", () => { expect(skip<number>(0)([1,2,3])).toEqual([1,2,3]); });
  it("limit 1 of 6", () => {
    const arr = Array.from({length:6}, (_,k)=>k);
    expect(limit<number>(1)(arr).length).toBe(1); });
  it("limit 2 of 7", () => {
    const arr = Array.from({length:7}, (_,k)=>k);
    expect(limit<number>(2)(arr).length).toBe(2); });
  it("limit 3 of 8", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    expect(limit<number>(3)(arr).length).toBe(3); });
  it("limit 4 of 9", () => {
    const arr = Array.from({length:9}, (_,k)=>k);
    expect(limit<number>(4)(arr).length).toBe(4); });
  it("limit 5 of 10", () => {
    const arr = Array.from({length:10}, (_,k)=>k);
    expect(limit<number>(5)(arr).length).toBe(5); });
  it("limit 6 of 11", () => {
    const arr = Array.from({length:11}, (_,k)=>k);
    expect(limit<number>(6)(arr).length).toBe(6); });
  it("limit 7 of 12", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    expect(limit<number>(7)(arr).length).toBe(7); });
  it("limit 8 of 13", () => {
    const arr = Array.from({length:13}, (_,k)=>k);
    expect(limit<number>(8)(arr).length).toBe(8); });
  it("limit 9 of 14", () => {
    const arr = Array.from({length:14}, (_,k)=>k);
    expect(limit<number>(9)(arr).length).toBe(9); });
  it("limit 10 of 15", () => {
    const arr = Array.from({length:15}, (_,k)=>k);
    expect(limit<number>(10)(arr).length).toBe(10); });
  it("limit 11 of 16", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    expect(limit<number>(11)(arr).length).toBe(11); });
  it("limit 12 of 17", () => {
    const arr = Array.from({length:17}, (_,k)=>k);
    expect(limit<number>(12)(arr).length).toBe(12); });
  it("limit 13 of 18", () => {
    const arr = Array.from({length:18}, (_,k)=>k);
    expect(limit<number>(13)(arr).length).toBe(13); });
  it("limit 14 of 19", () => {
    const arr = Array.from({length:19}, (_,k)=>k);
    expect(limit<number>(14)(arr).length).toBe(14); });
  it("limit 15 of 20", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    expect(limit<number>(15)(arr).length).toBe(15); });
  it("limit 16 of 21", () => {
    const arr = Array.from({length:21}, (_,k)=>k);
    expect(limit<number>(16)(arr).length).toBe(16); });
  it("limit 17 of 22", () => {
    const arr = Array.from({length:22}, (_,k)=>k);
    expect(limit<number>(17)(arr).length).toBe(17); });
  it("limit 18 of 23", () => {
    const arr = Array.from({length:23}, (_,k)=>k);
    expect(limit<number>(18)(arr).length).toBe(18); });
  it("limit 19 of 24", () => {
    const arr = Array.from({length:24}, (_,k)=>k);
    expect(limit<number>(19)(arr).length).toBe(19); });
  it("limit 20 of 25", () => {
    const arr = Array.from({length:25}, (_,k)=>k);
    expect(limit<number>(20)(arr).length).toBe(20); });
  it("limit 21 of 26", () => {
    const arr = Array.from({length:26}, (_,k)=>k);
    expect(limit<number>(21)(arr).length).toBe(21); });
  it("limit 22 of 27", () => {
    const arr = Array.from({length:27}, (_,k)=>k);
    expect(limit<number>(22)(arr).length).toBe(22); });
  it("limit 23 of 28", () => {
    const arr = Array.from({length:28}, (_,k)=>k);
    expect(limit<number>(23)(arr).length).toBe(23); });
  it("limit 24 of 29", () => {
    const arr = Array.from({length:29}, (_,k)=>k);
    expect(limit<number>(24)(arr).length).toBe(24); });
  it("limit 25 of 30", () => {
    const arr = Array.from({length:30}, (_,k)=>k);
    expect(limit<number>(25)(arr).length).toBe(25); });
  it("limit 26 of 31", () => {
    const arr = Array.from({length:31}, (_,k)=>k);
    expect(limit<number>(26)(arr).length).toBe(26); });
  it("limit 27 of 32", () => {
    const arr = Array.from({length:32}, (_,k)=>k);
    expect(limit<number>(27)(arr).length).toBe(27); });
  it("limit 28 of 33", () => {
    const arr = Array.from({length:33}, (_,k)=>k);
    expect(limit<number>(28)(arr).length).toBe(28); });
  it("limit 29 of 34", () => {
    const arr = Array.from({length:34}, (_,k)=>k);
    expect(limit<number>(29)(arr).length).toBe(29); });
  it("limit 30 of 35", () => {
    const arr = Array.from({length:35}, (_,k)=>k);
    expect(limit<number>(30)(arr).length).toBe(30); });
  it("limit 31 of 36", () => {
    const arr = Array.from({length:36}, (_,k)=>k);
    expect(limit<number>(31)(arr).length).toBe(31); });
  it("limit 32 of 37", () => {
    const arr = Array.from({length:37}, (_,k)=>k);
    expect(limit<number>(32)(arr).length).toBe(32); });
  it("limit 33 of 38", () => {
    const arr = Array.from({length:38}, (_,k)=>k);
    expect(limit<number>(33)(arr).length).toBe(33); });
  it("limit 34 of 39", () => {
    const arr = Array.from({length:39}, (_,k)=>k);
    expect(limit<number>(34)(arr).length).toBe(34); });
  it("limit 35 of 40", () => {
    const arr = Array.from({length:40}, (_,k)=>k);
    expect(limit<number>(35)(arr).length).toBe(35); });
  it("limit 36 of 41", () => {
    const arr = Array.from({length:41}, (_,k)=>k);
    expect(limit<number>(36)(arr).length).toBe(36); });
  it("limit 37 of 42", () => {
    const arr = Array.from({length:42}, (_,k)=>k);
    expect(limit<number>(37)(arr).length).toBe(37); });
  it("limit 38 of 43", () => {
    const arr = Array.from({length:43}, (_,k)=>k);
    expect(limit<number>(38)(arr).length).toBe(38); });
  it("limit 39 of 44", () => {
    const arr = Array.from({length:44}, (_,k)=>k);
    expect(limit<number>(39)(arr).length).toBe(39); });
  it("limit 40 of 45", () => {
    const arr = Array.from({length:45}, (_,k)=>k);
    expect(limit<number>(40)(arr).length).toBe(40); });
  it("limit 41 of 46", () => {
    const arr = Array.from({length:46}, (_,k)=>k);
    expect(limit<number>(41)(arr).length).toBe(41); });
  it("limit 42 of 47", () => {
    const arr = Array.from({length:47}, (_,k)=>k);
    expect(limit<number>(42)(arr).length).toBe(42); });
  it("limit 43 of 48", () => {
    const arr = Array.from({length:48}, (_,k)=>k);
    expect(limit<number>(43)(arr).length).toBe(43); });
  it("limit 44 of 49", () => {
    const arr = Array.from({length:49}, (_,k)=>k);
    expect(limit<number>(44)(arr).length).toBe(44); });
  it("limit 45 of 50", () => {
    const arr = Array.from({length:50}, (_,k)=>k);
    expect(limit<number>(45)(arr).length).toBe(45); });
  it("limit 46 of 51", () => {
    const arr = Array.from({length:51}, (_,k)=>k);
    expect(limit<number>(46)(arr).length).toBe(46); });
  it("limit 47 of 52", () => {
    const arr = Array.from({length:52}, (_,k)=>k);
    expect(limit<number>(47)(arr).length).toBe(47); });
  it("limit 48 of 53", () => {
    const arr = Array.from({length:53}, (_,k)=>k);
    expect(limit<number>(48)(arr).length).toBe(48); });
  it("limit 49 of 54", () => {
    const arr = Array.from({length:54}, (_,k)=>k);
    expect(limit<number>(49)(arr).length).toBe(49); });
  it("limit 50 of 55", () => {
    const arr = Array.from({length:55}, (_,k)=>k);
    expect(limit<number>(50)(arr).length).toBe(50); });
  it("limit 51 of 56", () => {
    const arr = Array.from({length:56}, (_,k)=>k);
    expect(limit<number>(51)(arr).length).toBe(51); });
  it("limit 52 of 57", () => {
    const arr = Array.from({length:57}, (_,k)=>k);
    expect(limit<number>(52)(arr).length).toBe(52); });
  it("limit 53 of 58", () => {
    const arr = Array.from({length:58}, (_,k)=>k);
    expect(limit<number>(53)(arr).length).toBe(53); });
  it("limit 54 of 59", () => {
    const arr = Array.from({length:59}, (_,k)=>k);
    expect(limit<number>(54)(arr).length).toBe(54); });
  it("limit 55 of 60", () => {
    const arr = Array.from({length:60}, (_,k)=>k);
    expect(limit<number>(55)(arr).length).toBe(55); });
  it("limit 56 of 61", () => {
    const arr = Array.from({length:61}, (_,k)=>k);
    expect(limit<number>(56)(arr).length).toBe(56); });
  it("limit 57 of 62", () => {
    const arr = Array.from({length:62}, (_,k)=>k);
    expect(limit<number>(57)(arr).length).toBe(57); });
  it("limit 58 of 63", () => {
    const arr = Array.from({length:63}, (_,k)=>k);
    expect(limit<number>(58)(arr).length).toBe(58); });
  it("limit 59 of 64", () => {
    const arr = Array.from({length:64}, (_,k)=>k);
    expect(limit<number>(59)(arr).length).toBe(59); });
  it("limit 60 of 65", () => {
    const arr = Array.from({length:65}, (_,k)=>k);
    expect(limit<number>(60)(arr).length).toBe(60); });
  it("limit 61 of 66", () => {
    const arr = Array.from({length:66}, (_,k)=>k);
    expect(limit<number>(61)(arr).length).toBe(61); });
  it("limit 62 of 67", () => {
    const arr = Array.from({length:67}, (_,k)=>k);
    expect(limit<number>(62)(arr).length).toBe(62); });
  it("limit 63 of 68", () => {
    const arr = Array.from({length:68}, (_,k)=>k);
    expect(limit<number>(63)(arr).length).toBe(63); });
  it("limit 64 of 69", () => {
    const arr = Array.from({length:69}, (_,k)=>k);
    expect(limit<number>(64)(arr).length).toBe(64); });
  it("limit 65 of 70", () => {
    const arr = Array.from({length:70}, (_,k)=>k);
    expect(limit<number>(65)(arr).length).toBe(65); });
  it("limit 66 of 71", () => {
    const arr = Array.from({length:71}, (_,k)=>k);
    expect(limit<number>(66)(arr).length).toBe(66); });
  it("limit 67 of 72", () => {
    const arr = Array.from({length:72}, (_,k)=>k);
    expect(limit<number>(67)(arr).length).toBe(67); });
  it("limit 68 of 73", () => {
    const arr = Array.from({length:73}, (_,k)=>k);
    expect(limit<number>(68)(arr).length).toBe(68); });
  it("limit 69 of 74", () => {
    const arr = Array.from({length:74}, (_,k)=>k);
    expect(limit<number>(69)(arr).length).toBe(69); });
  it("limit 70 of 75", () => {
    const arr = Array.from({length:75}, (_,k)=>k);
    expect(limit<number>(70)(arr).length).toBe(70); });
  it("limit 71 of 76", () => {
    const arr = Array.from({length:76}, (_,k)=>k);
    expect(limit<number>(71)(arr).length).toBe(71); });
  it("limit 72 of 77", () => {
    const arr = Array.from({length:77}, (_,k)=>k);
    expect(limit<number>(72)(arr).length).toBe(72); });
  it("limit 73 of 78", () => {
    const arr = Array.from({length:78}, (_,k)=>k);
    expect(limit<number>(73)(arr).length).toBe(73); });
  it("limit 74 of 79", () => {
    const arr = Array.from({length:79}, (_,k)=>k);
    expect(limit<number>(74)(arr).length).toBe(74); });
  it("limit 75 of 80", () => {
    const arr = Array.from({length:80}, (_,k)=>k);
    expect(limit<number>(75)(arr).length).toBe(75); });
  it("limit 76 of 81", () => {
    const arr = Array.from({length:81}, (_,k)=>k);
    expect(limit<number>(76)(arr).length).toBe(76); });
  it("limit 77 of 82", () => {
    const arr = Array.from({length:82}, (_,k)=>k);
    expect(limit<number>(77)(arr).length).toBe(77); });
  it("limit 78 of 83", () => {
    const arr = Array.from({length:83}, (_,k)=>k);
    expect(limit<number>(78)(arr).length).toBe(78); });
  it("limit 79 of 84", () => {
    const arr = Array.from({length:84}, (_,k)=>k);
    expect(limit<number>(79)(arr).length).toBe(79); });
  it("limit 80 of 85", () => {
    const arr = Array.from({length:85}, (_,k)=>k);
    expect(limit<number>(80)(arr).length).toBe(80); });
  it("limit 81 of 86", () => {
    const arr = Array.from({length:86}, (_,k)=>k);
    expect(limit<number>(81)(arr).length).toBe(81); });
  it("limit 82 of 87", () => {
    const arr = Array.from({length:87}, (_,k)=>k);
    expect(limit<number>(82)(arr).length).toBe(82); });
  it("limit 83 of 88", () => {
    const arr = Array.from({length:88}, (_,k)=>k);
    expect(limit<number>(83)(arr).length).toBe(83); });
  it("limit 84 of 89", () => {
    const arr = Array.from({length:89}, (_,k)=>k);
    expect(limit<number>(84)(arr).length).toBe(84); });
  it("limit 85 of 90", () => {
    const arr = Array.from({length:90}, (_,k)=>k);
    expect(limit<number>(85)(arr).length).toBe(85); });
  it("limit 86 of 91", () => {
    const arr = Array.from({length:91}, (_,k)=>k);
    expect(limit<number>(86)(arr).length).toBe(86); });
  it("limit 87 of 92", () => {
    const arr = Array.from({length:92}, (_,k)=>k);
    expect(limit<number>(87)(arr).length).toBe(87); });
  it("limit 88 of 93", () => {
    const arr = Array.from({length:93}, (_,k)=>k);
    expect(limit<number>(88)(arr).length).toBe(88); });
  it("limit 89 of 94", () => {
    const arr = Array.from({length:94}, (_,k)=>k);
    expect(limit<number>(89)(arr).length).toBe(89); });
  it("limit 90 of 95", () => {
    const arr = Array.from({length:95}, (_,k)=>k);
    expect(limit<number>(90)(arr).length).toBe(90); });
  it("limit 91 of 96", () => {
    const arr = Array.from({length:96}, (_,k)=>k);
    expect(limit<number>(91)(arr).length).toBe(91); });
  it("limit 92 of 97", () => {
    const arr = Array.from({length:97}, (_,k)=>k);
    expect(limit<number>(92)(arr).length).toBe(92); });
  it("limit 93 of 98", () => {
    const arr = Array.from({length:98}, (_,k)=>k);
    expect(limit<number>(93)(arr).length).toBe(93); });
  it("limit 94 of 99", () => {
    const arr = Array.from({length:99}, (_,k)=>k);
    expect(limit<number>(94)(arr).length).toBe(94); });
  it("limit 95 of 100", () => {
    const arr = Array.from({length:100}, (_,k)=>k);
    expect(limit<number>(95)(arr).length).toBe(95); });
  it("limit 96 of 101", () => {
    const arr = Array.from({length:101}, (_,k)=>k);
    expect(limit<number>(96)(arr).length).toBe(96); });
});

describe("chunk", () => {
  it("chunk [1..6] by 2", () => { expect(chunk<number>(2)([1,2,3,4,5,6])).toEqual([[1,2],[3,4],[5,6]]); });
  it("empty array", () => { expect(chunk<number>(3)([])).toEqual([]); });
  it("size larger than array", () => { expect(chunk<number>(10)([1,2,3])).toEqual([[1,2,3]]); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
  it("chunk 16 by 4", () => {
    const arr = Array.from({length:16}, (_,k)=>k);
    const r = chunk<number>(4)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(16); });
  it("chunk 20 by 5", () => {
    const arr = Array.from({length:20}, (_,k)=>k);
    const r = chunk<number>(5)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(20); });
  it("chunk 4 by 1", () => {
    const arr = Array.from({length:4}, (_,k)=>k);
    const r = chunk<number>(1)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(4); });
  it("chunk 8 by 2", () => {
    const arr = Array.from({length:8}, (_,k)=>k);
    const r = chunk<number>(2)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(8); });
  it("chunk 12 by 3", () => {
    const arr = Array.from({length:12}, (_,k)=>k);
    const r = chunk<number>(3)(arr);
    expect(r.length).toBe(4);
    expect(r.flat().length).toBe(12); });
});

describe("reducePipeline", () => {
  it("sums array", () => { expect(reducePipeline<number,number>((a,b)=>a+b, 0)([1,2,3,4])).toBe(10); });
  it("empty array returns initial", () => { expect(reducePipeline<number,number>((a,b)=>a+b, 42)([])).toBe(42); });
  it("product of array", () => { expect(reducePipeline<number,number>((a,b)=>a*b, 1)([1,2,3,4])).toBe(24); });
  it("reducePipeline sum with initial 1", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 1)([1,2,3])).toBe(7); });
  it("reducePipeline sum with initial 2", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 2)([1,2,3,4])).toBe(12); });
  it("reducePipeline sum with initial 3", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 3)([1,2,3,4,5])).toBe(18); });
  it("reducePipeline sum with initial 4", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 4)([1,2,3,4,5,6])).toBe(25); });
  it("reducePipeline sum with initial 5", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 5)([1,2])).toBe(8); });
  it("reducePipeline sum with initial 6", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 6)([1,2,3])).toBe(12); });
  it("reducePipeline sum with initial 7", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 7)([1,2,3,4])).toBe(17); });
  it("reducePipeline sum with initial 8", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 8)([1,2,3,4,5])).toBe(23); });
  it("reducePipeline sum with initial 9", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 9)([1,2,3,4,5,6])).toBe(30); });
  it("reducePipeline sum with initial 10", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 10)([1,2])).toBe(13); });
  it("reducePipeline sum with initial 11", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 11)([1,2,3])).toBe(17); });
  it("reducePipeline sum with initial 12", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 12)([1,2,3,4])).toBe(22); });
  it("reducePipeline sum with initial 13", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 13)([1,2,3,4,5])).toBe(28); });
  it("reducePipeline sum with initial 14", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 14)([1,2,3,4,5,6])).toBe(35); });
  it("reducePipeline sum with initial 15", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 15)([1,2])).toBe(18); });
  it("reducePipeline sum with initial 16", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 16)([1,2,3])).toBe(22); });
  it("reducePipeline sum with initial 17", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 17)([1,2,3,4])).toBe(27); });
  it("reducePipeline sum with initial 18", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 18)([1,2,3,4,5])).toBe(33); });
  it("reducePipeline sum with initial 19", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 19)([1,2,3,4,5,6])).toBe(40); });
  it("reducePipeline sum with initial 20", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 20)([1,2])).toBe(23); });
  it("reducePipeline sum with initial 21", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 21)([1,2,3])).toBe(27); });
  it("reducePipeline sum with initial 22", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 22)([1,2,3,4])).toBe(32); });
  it("reducePipeline sum with initial 23", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 23)([1,2,3,4,5])).toBe(38); });
  it("reducePipeline sum with initial 24", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 24)([1,2,3,4,5,6])).toBe(45); });
  it("reducePipeline sum with initial 25", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 25)([1,2])).toBe(28); });
  it("reducePipeline sum with initial 26", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 26)([1,2,3])).toBe(32); });
  it("reducePipeline sum with initial 27", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 27)([1,2,3,4])).toBe(37); });
  it("reducePipeline sum with initial 28", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 28)([1,2,3,4,5])).toBe(43); });
  it("reducePipeline sum with initial 29", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 29)([1,2,3,4,5,6])).toBe(50); });
  it("reducePipeline sum with initial 30", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 30)([1,2])).toBe(33); });
  it("reducePipeline sum with initial 31", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 31)([1,2,3])).toBe(37); });
  it("reducePipeline sum with initial 32", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 32)([1,2,3,4])).toBe(42); });
  it("reducePipeline sum with initial 33", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 33)([1,2,3,4,5])).toBe(48); });
  it("reducePipeline sum with initial 34", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 34)([1,2,3,4,5,6])).toBe(55); });
  it("reducePipeline sum with initial 35", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 35)([1,2])).toBe(38); });
  it("reducePipeline sum with initial 36", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 36)([1,2,3])).toBe(42); });
  it("reducePipeline sum with initial 37", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 37)([1,2,3,4])).toBe(47); });
  it("reducePipeline sum with initial 38", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 38)([1,2,3,4,5])).toBe(53); });
  it("reducePipeline sum with initial 39", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 39)([1,2,3,4,5,6])).toBe(60); });
  it("reducePipeline sum with initial 40", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 40)([1,2])).toBe(43); });
  it("reducePipeline sum with initial 41", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 41)([1,2,3])).toBe(47); });
  it("reducePipeline sum with initial 42", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 42)([1,2,3,4])).toBe(52); });
  it("reducePipeline sum with initial 43", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 43)([1,2,3,4,5])).toBe(58); });
  it("reducePipeline sum with initial 44", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 44)([1,2,3,4,5,6])).toBe(65); });
  it("reducePipeline sum with initial 45", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 45)([1,2])).toBe(48); });
  it("reducePipeline sum with initial 46", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 46)([1,2,3])).toBe(52); });
  it("reducePipeline sum with initial 47", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 47)([1,2,3,4])).toBe(57); });
  it("reducePipeline sum with initial 48", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 48)([1,2,3,4,5])).toBe(63); });
  it("reducePipeline sum with initial 49", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 49)([1,2,3,4,5,6])).toBe(70); });
  it("reducePipeline sum with initial 50", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 50)([1,2])).toBe(53); });
  it("reducePipeline sum with initial 51", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 51)([1,2,3])).toBe(57); });
  it("reducePipeline sum with initial 52", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 52)([1,2,3,4])).toBe(62); });
  it("reducePipeline sum with initial 53", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 53)([1,2,3,4,5])).toBe(68); });
  it("reducePipeline sum with initial 54", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 54)([1,2,3,4,5,6])).toBe(75); });
  it("reducePipeline sum with initial 55", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 55)([1,2])).toBe(58); });
  it("reducePipeline sum with initial 56", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 56)([1,2,3])).toBe(62); });
  it("reducePipeline sum with initial 57", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 57)([1,2,3,4])).toBe(67); });
  it("reducePipeline sum with initial 58", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 58)([1,2,3,4,5])).toBe(73); });
  it("reducePipeline sum with initial 59", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 59)([1,2,3,4,5,6])).toBe(80); });
  it("reducePipeline sum with initial 60", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 60)([1,2])).toBe(63); });
  it("reducePipeline sum with initial 61", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 61)([1,2,3])).toBe(67); });
  it("reducePipeline sum with initial 62", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 62)([1,2,3,4])).toBe(72); });
  it("reducePipeline sum with initial 63", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 63)([1,2,3,4,5])).toBe(78); });
  it("reducePipeline sum with initial 64", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 64)([1,2,3,4,5,6])).toBe(85); });
  it("reducePipeline sum with initial 65", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 65)([1,2])).toBe(68); });
  it("reducePipeline sum with initial 66", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 66)([1,2,3])).toBe(72); });
  it("reducePipeline sum with initial 67", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 67)([1,2,3,4])).toBe(77); });
  it("reducePipeline sum with initial 68", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 68)([1,2,3,4,5])).toBe(83); });
  it("reducePipeline sum with initial 69", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 69)([1,2,3,4,5,6])).toBe(90); });
  it("reducePipeline sum with initial 70", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 70)([1,2])).toBe(73); });
  it("reducePipeline sum with initial 71", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 71)([1,2,3])).toBe(77); });
  it("reducePipeline sum with initial 72", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 72)([1,2,3,4])).toBe(82); });
  it("reducePipeline sum with initial 73", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 73)([1,2,3,4,5])).toBe(88); });
  it("reducePipeline sum with initial 74", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 74)([1,2,3,4,5,6])).toBe(95); });
  it("reducePipeline sum with initial 75", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 75)([1,2])).toBe(78); });
  it("reducePipeline sum with initial 76", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 76)([1,2,3])).toBe(82); });
  it("reducePipeline sum with initial 77", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 77)([1,2,3,4])).toBe(87); });
  it("reducePipeline sum with initial 78", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 78)([1,2,3,4,5])).toBe(93); });
  it("reducePipeline sum with initial 79", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 79)([1,2,3,4,5,6])).toBe(100); });
  it("reducePipeline sum with initial 80", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 80)([1,2])).toBe(83); });
  it("reducePipeline sum with initial 81", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 81)([1,2,3])).toBe(87); });
  it("reducePipeline sum with initial 82", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 82)([1,2,3,4])).toBe(92); });
  it("reducePipeline sum with initial 83", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 83)([1,2,3,4,5])).toBe(98); });
  it("reducePipeline sum with initial 84", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 84)([1,2,3,4,5,6])).toBe(105); });
  it("reducePipeline sum with initial 85", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 85)([1,2])).toBe(88); });
  it("reducePipeline sum with initial 86", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 86)([1,2,3])).toBe(92); });
  it("reducePipeline sum with initial 87", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 87)([1,2,3,4])).toBe(97); });
  it("reducePipeline sum with initial 88", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 88)([1,2,3,4,5])).toBe(103); });
  it("reducePipeline sum with initial 89", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 89)([1,2,3,4,5,6])).toBe(110); });
  it("reducePipeline sum with initial 90", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 90)([1,2])).toBe(93); });
  it("reducePipeline sum with initial 91", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 91)([1,2,3])).toBe(97); });
  it("reducePipeline sum with initial 92", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 92)([1,2,3,4])).toBe(102); });
  it("reducePipeline sum with initial 93", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 93)([1,2,3,4,5])).toBe(108); });
  it("reducePipeline sum with initial 94", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 94)([1,2,3,4,5,6])).toBe(115); });
  it("reducePipeline sum with initial 95", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 95)([1,2])).toBe(98); });
  it("reducePipeline sum with initial 96", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 96)([1,2,3])).toBe(102); });
  it("reducePipeline sum with initial 97", () => {
    expect(reducePipeline<number,number>((a,b)=>a+b, 97)([1,2,3,4])).toBe(107); });
});

describe("branchPipeline", () => {
  it("takes true branch", () => { const b=branchPipeline<number>(x=>x>0,x=>x*2,x=>x*3); expect(b(5)).toBe(10); });
  it("takes false branch", () => { const b=branchPipeline<number>(x=>x>0,x=>x*2,x=>x*3); expect(b(-1)).toBe(-3); });
  it("passes through true branch identity", () => { const b=branchPipeline<number>(()=>true,x=>x,x=>x+1); expect(b(7)).toBe(7); });
  it("branch threshold 1 test 1", () => {
    const b=branchPipeline<number>(x=>x>1,x=>x+100,x=>x-100);
    expect(b(2)).toBe(102); });
  it("branch threshold 2 test 2", () => {
    const b=branchPipeline<number>(x=>x>2,x=>x+100,x=>x-100);
    expect(b(3)).toBe(103); });
  it("branch threshold 3 test 3", () => {
    const b=branchPipeline<number>(x=>x>3,x=>x+100,x=>x-100);
    expect(b(4)).toBe(104); });
  it("branch threshold 4 test 4", () => {
    const b=branchPipeline<number>(x=>x>4,x=>x+100,x=>x-100);
    expect(b(5)).toBe(105); });
  it("branch threshold 5 test 5", () => {
    const b=branchPipeline<number>(x=>x>5,x=>x+100,x=>x-100);
    expect(b(6)).toBe(106); });
  it("branch threshold 6 test 6", () => {
    const b=branchPipeline<number>(x=>x>6,x=>x+100,x=>x-100);
    expect(b(7)).toBe(107); });
  it("branch threshold 7 test 7", () => {
    const b=branchPipeline<number>(x=>x>7,x=>x+100,x=>x-100);
    expect(b(8)).toBe(108); });
  it("branch threshold 8 test 8", () => {
    const b=branchPipeline<number>(x=>x>8,x=>x+100,x=>x-100);
    expect(b(9)).toBe(109); });
  it("branch threshold 9 test 9", () => {
    const b=branchPipeline<number>(x=>x>9,x=>x+100,x=>x-100);
    expect(b(10)).toBe(110); });
  it("branch threshold 10 test 10", () => {
    const b=branchPipeline<number>(x=>x>10,x=>x+100,x=>x-100);
    expect(b(11)).toBe(111); });
  it("branch threshold 11 test 11", () => {
    const b=branchPipeline<number>(x=>x>11,x=>x+100,x=>x-100);
    expect(b(12)).toBe(112); });
  it("branch threshold 12 test 12", () => {
    const b=branchPipeline<number>(x=>x>12,x=>x+100,x=>x-100);
    expect(b(13)).toBe(113); });
  it("branch threshold 13 test 13", () => {
    const b=branchPipeline<number>(x=>x>13,x=>x+100,x=>x-100);
    expect(b(14)).toBe(114); });
  it("branch threshold 14 test 14", () => {
    const b=branchPipeline<number>(x=>x>14,x=>x+100,x=>x-100);
    expect(b(15)).toBe(115); });
  it("branch threshold 15 test 15", () => {
    const b=branchPipeline<number>(x=>x>15,x=>x+100,x=>x-100);
    expect(b(16)).toBe(116); });
  it("branch threshold 16 test 16", () => {
    const b=branchPipeline<number>(x=>x>16,x=>x+100,x=>x-100);
    expect(b(17)).toBe(117); });
  it("branch threshold 17 test 17", () => {
    const b=branchPipeline<number>(x=>x>17,x=>x+100,x=>x-100);
    expect(b(18)).toBe(118); });
  it("branch threshold 18 test 18", () => {
    const b=branchPipeline<number>(x=>x>18,x=>x+100,x=>x-100);
    expect(b(19)).toBe(119); });
  it("branch threshold 19 test 19", () => {
    const b=branchPipeline<number>(x=>x>19,x=>x+100,x=>x-100);
    expect(b(20)).toBe(120); });
  it("branch threshold 0 test 20", () => {
    const b=branchPipeline<number>(x=>x>0,x=>x+100,x=>x-100);
    expect(b(1)).toBe(101); });
  it("branch threshold 1 test 21", () => {
    const b=branchPipeline<number>(x=>x>1,x=>x+100,x=>x-100);
    expect(b(2)).toBe(102); });
  it("branch threshold 2 test 22", () => {
    const b=branchPipeline<number>(x=>x>2,x=>x+100,x=>x-100);
    expect(b(3)).toBe(103); });
  it("branch threshold 3 test 23", () => {
    const b=branchPipeline<number>(x=>x>3,x=>x+100,x=>x-100);
    expect(b(4)).toBe(104); });
  it("branch threshold 4 test 24", () => {
    const b=branchPipeline<number>(x=>x>4,x=>x+100,x=>x-100);
    expect(b(5)).toBe(105); });
  it("branch threshold 5 test 25", () => {
    const b=branchPipeline<number>(x=>x>5,x=>x+100,x=>x-100);
    expect(b(6)).toBe(106); });
  it("branch threshold 6 test 26", () => {
    const b=branchPipeline<number>(x=>x>6,x=>x+100,x=>x-100);
    expect(b(7)).toBe(107); });
  it("branch threshold 7 test 27", () => {
    const b=branchPipeline<number>(x=>x>7,x=>x+100,x=>x-100);
    expect(b(8)).toBe(108); });
  it("branch threshold 8 test 28", () => {
    const b=branchPipeline<number>(x=>x>8,x=>x+100,x=>x-100);
    expect(b(9)).toBe(109); });
  it("branch threshold 9 test 29", () => {
    const b=branchPipeline<number>(x=>x>9,x=>x+100,x=>x-100);
    expect(b(10)).toBe(110); });
  it("branch threshold 10 test 30", () => {
    const b=branchPipeline<number>(x=>x>10,x=>x+100,x=>x-100);
    expect(b(11)).toBe(111); });
  it("branch threshold 11 test 31", () => {
    const b=branchPipeline<number>(x=>x>11,x=>x+100,x=>x-100);
    expect(b(12)).toBe(112); });
  it("branch threshold 12 test 32", () => {
    const b=branchPipeline<number>(x=>x>12,x=>x+100,x=>x-100);
    expect(b(13)).toBe(113); });
  it("branch threshold 13 test 33", () => {
    const b=branchPipeline<number>(x=>x>13,x=>x+100,x=>x-100);
    expect(b(14)).toBe(114); });
  it("branch threshold 14 test 34", () => {
    const b=branchPipeline<number>(x=>x>14,x=>x+100,x=>x-100);
    expect(b(15)).toBe(115); });
  it("branch threshold 15 test 35", () => {
    const b=branchPipeline<number>(x=>x>15,x=>x+100,x=>x-100);
    expect(b(16)).toBe(116); });
  it("branch threshold 16 test 36", () => {
    const b=branchPipeline<number>(x=>x>16,x=>x+100,x=>x-100);
    expect(b(17)).toBe(117); });
  it("branch threshold 17 test 37", () => {
    const b=branchPipeline<number>(x=>x>17,x=>x+100,x=>x-100);
    expect(b(18)).toBe(118); });
  it("branch threshold 18 test 38", () => {
    const b=branchPipeline<number>(x=>x>18,x=>x+100,x=>x-100);
    expect(b(19)).toBe(119); });
  it("branch threshold 19 test 39", () => {
    const b=branchPipeline<number>(x=>x>19,x=>x+100,x=>x-100);
    expect(b(20)).toBe(120); });
  it("branch threshold 0 test 40", () => {
    const b=branchPipeline<number>(x=>x>0,x=>x+100,x=>x-100);
    expect(b(1)).toBe(101); });
  it("branch threshold 1 test 41", () => {
    const b=branchPipeline<number>(x=>x>1,x=>x+100,x=>x-100);
    expect(b(2)).toBe(102); });
  it("branch threshold 2 test 42", () => {
    const b=branchPipeline<number>(x=>x>2,x=>x+100,x=>x-100);
    expect(b(3)).toBe(103); });
  it("branch threshold 3 test 43", () => {
    const b=branchPipeline<number>(x=>x>3,x=>x+100,x=>x-100);
    expect(b(4)).toBe(104); });
  it("branch threshold 4 test 44", () => {
    const b=branchPipeline<number>(x=>x>4,x=>x+100,x=>x-100);
    expect(b(5)).toBe(105); });
  it("branch threshold 5 test 45", () => {
    const b=branchPipeline<number>(x=>x>5,x=>x+100,x=>x-100);
    expect(b(6)).toBe(106); });
  it("branch threshold 6 test 46", () => {
    const b=branchPipeline<number>(x=>x>6,x=>x+100,x=>x-100);
    expect(b(7)).toBe(107); });
  it("branch threshold 7 test 47", () => {
    const b=branchPipeline<number>(x=>x>7,x=>x+100,x=>x-100);
    expect(b(8)).toBe(108); });
  it("branch threshold 8 test 48", () => {
    const b=branchPipeline<number>(x=>x>8,x=>x+100,x=>x-100);
    expect(b(9)).toBe(109); });
  it("branch threshold 9 test 49", () => {
    const b=branchPipeline<number>(x=>x>9,x=>x+100,x=>x-100);
    expect(b(10)).toBe(110); });
  it("branch threshold 10 test 50", () => {
    const b=branchPipeline<number>(x=>x>10,x=>x+100,x=>x-100);
    expect(b(11)).toBe(111); });
  it("branch threshold 11 test 51", () => {
    const b=branchPipeline<number>(x=>x>11,x=>x+100,x=>x-100);
    expect(b(12)).toBe(112); });
  it("branch threshold 12 test 52", () => {
    const b=branchPipeline<number>(x=>x>12,x=>x+100,x=>x-100);
    expect(b(13)).toBe(113); });
  it("branch threshold 13 test 53", () => {
    const b=branchPipeline<number>(x=>x>13,x=>x+100,x=>x-100);
    expect(b(14)).toBe(114); });
  it("branch threshold 14 test 54", () => {
    const b=branchPipeline<number>(x=>x>14,x=>x+100,x=>x-100);
    expect(b(15)).toBe(115); });
  it("branch threshold 15 test 55", () => {
    const b=branchPipeline<number>(x=>x>15,x=>x+100,x=>x-100);
    expect(b(16)).toBe(116); });
  it("branch threshold 16 test 56", () => {
    const b=branchPipeline<number>(x=>x>16,x=>x+100,x=>x-100);
    expect(b(17)).toBe(117); });
  it("branch threshold 17 test 57", () => {
    const b=branchPipeline<number>(x=>x>17,x=>x+100,x=>x-100);
    expect(b(18)).toBe(118); });
  it("branch threshold 18 test 58", () => {
    const b=branchPipeline<number>(x=>x>18,x=>x+100,x=>x-100);
    expect(b(19)).toBe(119); });
  it("branch threshold 19 test 59", () => {
    const b=branchPipeline<number>(x=>x>19,x=>x+100,x=>x-100);
    expect(b(20)).toBe(120); });
  it("branch threshold 0 test 60", () => {
    const b=branchPipeline<number>(x=>x>0,x=>x+100,x=>x-100);
    expect(b(1)).toBe(101); });
  it("branch threshold 1 test 61", () => {
    const b=branchPipeline<number>(x=>x>1,x=>x+100,x=>x-100);
    expect(b(2)).toBe(102); });
  it("branch threshold 2 test 62", () => {
    const b=branchPipeline<number>(x=>x>2,x=>x+100,x=>x-100);
    expect(b(3)).toBe(103); });
  it("branch threshold 3 test 63", () => {
    const b=branchPipeline<number>(x=>x>3,x=>x+100,x=>x-100);
    expect(b(4)).toBe(104); });
  it("branch threshold 4 test 64", () => {
    const b=branchPipeline<number>(x=>x>4,x=>x+100,x=>x-100);
    expect(b(5)).toBe(105); });
  it("branch threshold 5 test 65", () => {
    const b=branchPipeline<number>(x=>x>5,x=>x+100,x=>x-100);
    expect(b(6)).toBe(106); });
  it("branch threshold 6 test 66", () => {
    const b=branchPipeline<number>(x=>x>6,x=>x+100,x=>x-100);
    expect(b(7)).toBe(107); });
  it("branch threshold 7 test 67", () => {
    const b=branchPipeline<number>(x=>x>7,x=>x+100,x=>x-100);
    expect(b(8)).toBe(108); });
  it("branch threshold 8 test 68", () => {
    const b=branchPipeline<number>(x=>x>8,x=>x+100,x=>x-100);
    expect(b(9)).toBe(109); });
  it("branch threshold 9 test 69", () => {
    const b=branchPipeline<number>(x=>x>9,x=>x+100,x=>x-100);
    expect(b(10)).toBe(110); });
  it("branch threshold 10 test 70", () => {
    const b=branchPipeline<number>(x=>x>10,x=>x+100,x=>x-100);
    expect(b(11)).toBe(111); });
  it("branch threshold 11 test 71", () => {
    const b=branchPipeline<number>(x=>x>11,x=>x+100,x=>x-100);
    expect(b(12)).toBe(112); });
  it("branch threshold 12 test 72", () => {
    const b=branchPipeline<number>(x=>x>12,x=>x+100,x=>x-100);
    expect(b(13)).toBe(113); });
  it("branch threshold 13 test 73", () => {
    const b=branchPipeline<number>(x=>x>13,x=>x+100,x=>x-100);
    expect(b(14)).toBe(114); });
  it("branch threshold 14 test 74", () => {
    const b=branchPipeline<number>(x=>x>14,x=>x+100,x=>x-100);
    expect(b(15)).toBe(115); });
  it("branch threshold 15 test 75", () => {
    const b=branchPipeline<number>(x=>x>15,x=>x+100,x=>x-100);
    expect(b(16)).toBe(116); });
  it("branch threshold 16 test 76", () => {
    const b=branchPipeline<number>(x=>x>16,x=>x+100,x=>x-100);
    expect(b(17)).toBe(117); });
  it("branch threshold 17 test 77", () => {
    const b=branchPipeline<number>(x=>x>17,x=>x+100,x=>x-100);
    expect(b(18)).toBe(118); });
  it("branch threshold 18 test 78", () => {
    const b=branchPipeline<number>(x=>x>18,x=>x+100,x=>x-100);
    expect(b(19)).toBe(119); });
  it("branch threshold 19 test 79", () => {
    const b=branchPipeline<number>(x=>x>19,x=>x+100,x=>x-100);
    expect(b(20)).toBe(120); });
  it("branch threshold 0 test 80", () => {
    const b=branchPipeline<number>(x=>x>0,x=>x+100,x=>x-100);
    expect(b(1)).toBe(101); });
  it("branch threshold 1 test 81", () => {
    const b=branchPipeline<number>(x=>x>1,x=>x+100,x=>x-100);
    expect(b(2)).toBe(102); });
  it("branch threshold 2 test 82", () => {
    const b=branchPipeline<number>(x=>x>2,x=>x+100,x=>x-100);
    expect(b(3)).toBe(103); });
  it("branch threshold 3 test 83", () => {
    const b=branchPipeline<number>(x=>x>3,x=>x+100,x=>x-100);
    expect(b(4)).toBe(104); });
  it("branch threshold 4 test 84", () => {
    const b=branchPipeline<number>(x=>x>4,x=>x+100,x=>x-100);
    expect(b(5)).toBe(105); });
  it("branch threshold 5 test 85", () => {
    const b=branchPipeline<number>(x=>x>5,x=>x+100,x=>x-100);
    expect(b(6)).toBe(106); });
  it("branch threshold 6 test 86", () => {
    const b=branchPipeline<number>(x=>x>6,x=>x+100,x=>x-100);
    expect(b(7)).toBe(107); });
  it("branch threshold 7 test 87", () => {
    const b=branchPipeline<number>(x=>x>7,x=>x+100,x=>x-100);
    expect(b(8)).toBe(108); });
  it("branch threshold 8 test 88", () => {
    const b=branchPipeline<number>(x=>x>8,x=>x+100,x=>x-100);
    expect(b(9)).toBe(109); });
  it("branch threshold 9 test 89", () => {
    const b=branchPipeline<number>(x=>x>9,x=>x+100,x=>x-100);
    expect(b(10)).toBe(110); });
  it("branch threshold 10 test 90", () => {
    const b=branchPipeline<number>(x=>x>10,x=>x+100,x=>x-100);
    expect(b(11)).toBe(111); });
  it("branch threshold 11 test 91", () => {
    const b=branchPipeline<number>(x=>x>11,x=>x+100,x=>x-100);
    expect(b(12)).toBe(112); });
  it("branch threshold 12 test 92", () => {
    const b=branchPipeline<number>(x=>x>12,x=>x+100,x=>x-100);
    expect(b(13)).toBe(113); });
  it("branch threshold 13 test 93", () => {
    const b=branchPipeline<number>(x=>x>13,x=>x+100,x=>x-100);
    expect(b(14)).toBe(114); });
  it("branch threshold 14 test 94", () => {
    const b=branchPipeline<number>(x=>x>14,x=>x+100,x=>x-100);
    expect(b(15)).toBe(115); });
  it("branch threshold 15 test 95", () => {
    const b=branchPipeline<number>(x=>x>15,x=>x+100,x=>x-100);
    expect(b(16)).toBe(116); });
  it("branch threshold 16 test 96", () => {
    const b=branchPipeline<number>(x=>x>16,x=>x+100,x=>x-100);
    expect(b(17)).toBe(117); });
  it("branch threshold 17 test 97", () => {
    const b=branchPipeline<number>(x=>x>17,x=>x+100,x=>x-100);
    expect(b(18)).toBe(118); });
});

