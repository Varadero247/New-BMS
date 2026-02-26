// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  mean, variance, stdDev, normalize, movingAverage,
  exponentialMovingAverage, peakDetect, zeroCrossings, rms,
  downsample, upsample, hammingWindow, hannWindow, applyWindow,
  magnitude, dotProduct, clamp, quantize
} from "../signal-processing";

describe("mean", () => {
  it("empty is 0", () => { expect(mean([])).toBe(0); });
  it("single value", () => { expect(mean([5])).toBe(5); });
  it("[1,2,3] is 2", () => { expect(mean([1,2,3])).toBe(2); });
  it("mean 1 values", () => {
    const d = Array.from({length:1}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 2 values", () => {
    const d = Array.from({length:2}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 3 values", () => {
    const d = Array.from({length:3}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 4 values", () => {
    const d = Array.from({length:4}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 5 values", () => {
    const d = Array.from({length:5}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 6 values", () => {
    const d = Array.from({length:6}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 7 values", () => {
    const d = Array.from({length:7}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 8 values", () => {
    const d = Array.from({length:8}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 9 values", () => {
    const d = Array.from({length:9}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 10 values", () => {
    const d = Array.from({length:10}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 11 values", () => {
    const d = Array.from({length:11}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 12 values", () => {
    const d = Array.from({length:12}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 13 values", () => {
    const d = Array.from({length:13}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 14 values", () => {
    const d = Array.from({length:14}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 15 values", () => {
    const d = Array.from({length:15}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 16 values", () => {
    const d = Array.from({length:16}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 17 values", () => {
    const d = Array.from({length:17}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 18 values", () => {
    const d = Array.from({length:18}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 19 values", () => {
    const d = Array.from({length:19}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 20 values", () => {
    const d = Array.from({length:20}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 21 values", () => {
    const d = Array.from({length:21}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 22 values", () => {
    const d = Array.from({length:22}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 23 values", () => {
    const d = Array.from({length:23}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 24 values", () => {
    const d = Array.from({length:24}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 25 values", () => {
    const d = Array.from({length:25}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 26 values", () => {
    const d = Array.from({length:26}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 27 values", () => {
    const d = Array.from({length:27}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 28 values", () => {
    const d = Array.from({length:28}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 29 values", () => {
    const d = Array.from({length:29}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 30 values", () => {
    const d = Array.from({length:30}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 31 values", () => {
    const d = Array.from({length:31}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 32 values", () => {
    const d = Array.from({length:32}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 33 values", () => {
    const d = Array.from({length:33}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 34 values", () => {
    const d = Array.from({length:34}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 35 values", () => {
    const d = Array.from({length:35}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 36 values", () => {
    const d = Array.from({length:36}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 37 values", () => {
    const d = Array.from({length:37}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 38 values", () => {
    const d = Array.from({length:38}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 39 values", () => {
    const d = Array.from({length:39}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 40 values", () => {
    const d = Array.from({length:40}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 41 values", () => {
    const d = Array.from({length:41}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 42 values", () => {
    const d = Array.from({length:42}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 43 values", () => {
    const d = Array.from({length:43}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 44 values", () => {
    const d = Array.from({length:44}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 45 values", () => {
    const d = Array.from({length:45}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 46 values", () => {
    const d = Array.from({length:46}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 47 values", () => {
    const d = Array.from({length:47}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 48 values", () => {
    const d = Array.from({length:48}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 49 values", () => {
    const d = Array.from({length:49}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 50 values", () => {
    const d = Array.from({length:50}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 51 values", () => {
    const d = Array.from({length:51}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 52 values", () => {
    const d = Array.from({length:52}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 53 values", () => {
    const d = Array.from({length:53}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 54 values", () => {
    const d = Array.from({length:54}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 55 values", () => {
    const d = Array.from({length:55}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 56 values", () => {
    const d = Array.from({length:56}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 57 values", () => {
    const d = Array.from({length:57}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 58 values", () => {
    const d = Array.from({length:58}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 59 values", () => {
    const d = Array.from({length:59}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 60 values", () => {
    const d = Array.from({length:60}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 61 values", () => {
    const d = Array.from({length:61}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 62 values", () => {
    const d = Array.from({length:62}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 63 values", () => {
    const d = Array.from({length:63}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 64 values", () => {
    const d = Array.from({length:64}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 65 values", () => {
    const d = Array.from({length:65}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 66 values", () => {
    const d = Array.from({length:66}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 67 values", () => {
    const d = Array.from({length:67}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 68 values", () => {
    const d = Array.from({length:68}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 69 values", () => {
    const d = Array.from({length:69}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 70 values", () => {
    const d = Array.from({length:70}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 71 values", () => {
    const d = Array.from({length:71}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 72 values", () => {
    const d = Array.from({length:72}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 73 values", () => {
    const d = Array.from({length:73}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 74 values", () => {
    const d = Array.from({length:74}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 75 values", () => {
    const d = Array.from({length:75}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 76 values", () => {
    const d = Array.from({length:76}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 77 values", () => {
    const d = Array.from({length:77}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 78 values", () => {
    const d = Array.from({length:78}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 79 values", () => {
    const d = Array.from({length:79}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 80 values", () => {
    const d = Array.from({length:80}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 81 values", () => {
    const d = Array.from({length:81}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 82 values", () => {
    const d = Array.from({length:82}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 83 values", () => {
    const d = Array.from({length:83}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 84 values", () => {
    const d = Array.from({length:84}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 85 values", () => {
    const d = Array.from({length:85}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 86 values", () => {
    const d = Array.from({length:86}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 87 values", () => {
    const d = Array.from({length:87}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 88 values", () => {
    const d = Array.from({length:88}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 89 values", () => {
    const d = Array.from({length:89}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 90 values", () => {
    const d = Array.from({length:90}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 91 values", () => {
    const d = Array.from({length:91}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 92 values", () => {
    const d = Array.from({length:92}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 93 values", () => {
    const d = Array.from({length:93}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 94 values", () => {
    const d = Array.from({length:94}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 95 values", () => {
    const d = Array.from({length:95}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 96 values", () => {
    const d = Array.from({length:96}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 97 values", () => {
    const d = Array.from({length:97}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 98 values", () => {
    const d = Array.from({length:98}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 99 values", () => {
    const d = Array.from({length:99}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
  it("mean 100 values", () => {
    const d = Array.from({length:100}, (_,k) => k+1);
    expect(mean(d)).toBeGreaterThan(0); });
});

describe("variance", () => {
  it("empty is 0", () => { expect(variance([])).toBe(0); });
  it("single is 0", () => { expect(variance([5])).toBe(0); });
  it("[1,2,3] variance is 2/3", () => { expect(variance([1,2,3])).toBeCloseTo(0.667, 2); });
  it("variance 2 values >=0", () => {
    const d = Array.from({length:2}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 3 values >=0", () => {
    const d = Array.from({length:3}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 4 values >=0", () => {
    const d = Array.from({length:4}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 5 values >=0", () => {
    const d = Array.from({length:5}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 6 values >=0", () => {
    const d = Array.from({length:6}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 7 values >=0", () => {
    const d = Array.from({length:7}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 8 values >=0", () => {
    const d = Array.from({length:8}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 9 values >=0", () => {
    const d = Array.from({length:9}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 10 values >=0", () => {
    const d = Array.from({length:10}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 11 values >=0", () => {
    const d = Array.from({length:11}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 12 values >=0", () => {
    const d = Array.from({length:12}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 13 values >=0", () => {
    const d = Array.from({length:13}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 14 values >=0", () => {
    const d = Array.from({length:14}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 15 values >=0", () => {
    const d = Array.from({length:15}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 16 values >=0", () => {
    const d = Array.from({length:16}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 17 values >=0", () => {
    const d = Array.from({length:17}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 18 values >=0", () => {
    const d = Array.from({length:18}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 19 values >=0", () => {
    const d = Array.from({length:19}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 20 values >=0", () => {
    const d = Array.from({length:20}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 21 values >=0", () => {
    const d = Array.from({length:21}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 22 values >=0", () => {
    const d = Array.from({length:22}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 23 values >=0", () => {
    const d = Array.from({length:23}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 24 values >=0", () => {
    const d = Array.from({length:24}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 25 values >=0", () => {
    const d = Array.from({length:25}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 26 values >=0", () => {
    const d = Array.from({length:26}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 27 values >=0", () => {
    const d = Array.from({length:27}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 28 values >=0", () => {
    const d = Array.from({length:28}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 29 values >=0", () => {
    const d = Array.from({length:29}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 30 values >=0", () => {
    const d = Array.from({length:30}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 31 values >=0", () => {
    const d = Array.from({length:31}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 32 values >=0", () => {
    const d = Array.from({length:32}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 33 values >=0", () => {
    const d = Array.from({length:33}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 34 values >=0", () => {
    const d = Array.from({length:34}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 35 values >=0", () => {
    const d = Array.from({length:35}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 36 values >=0", () => {
    const d = Array.from({length:36}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 37 values >=0", () => {
    const d = Array.from({length:37}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 38 values >=0", () => {
    const d = Array.from({length:38}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 39 values >=0", () => {
    const d = Array.from({length:39}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 40 values >=0", () => {
    const d = Array.from({length:40}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 41 values >=0", () => {
    const d = Array.from({length:41}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 42 values >=0", () => {
    const d = Array.from({length:42}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 43 values >=0", () => {
    const d = Array.from({length:43}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 44 values >=0", () => {
    const d = Array.from({length:44}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 45 values >=0", () => {
    const d = Array.from({length:45}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 46 values >=0", () => {
    const d = Array.from({length:46}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 47 values >=0", () => {
    const d = Array.from({length:47}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 48 values >=0", () => {
    const d = Array.from({length:48}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 49 values >=0", () => {
    const d = Array.from({length:49}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 50 values >=0", () => {
    const d = Array.from({length:50}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 51 values >=0", () => {
    const d = Array.from({length:51}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 52 values >=0", () => {
    const d = Array.from({length:52}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 53 values >=0", () => {
    const d = Array.from({length:53}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 54 values >=0", () => {
    const d = Array.from({length:54}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 55 values >=0", () => {
    const d = Array.from({length:55}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 56 values >=0", () => {
    const d = Array.from({length:56}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 57 values >=0", () => {
    const d = Array.from({length:57}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 58 values >=0", () => {
    const d = Array.from({length:58}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 59 values >=0", () => {
    const d = Array.from({length:59}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 60 values >=0", () => {
    const d = Array.from({length:60}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 61 values >=0", () => {
    const d = Array.from({length:61}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 62 values >=0", () => {
    const d = Array.from({length:62}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 63 values >=0", () => {
    const d = Array.from({length:63}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 64 values >=0", () => {
    const d = Array.from({length:64}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 65 values >=0", () => {
    const d = Array.from({length:65}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 66 values >=0", () => {
    const d = Array.from({length:66}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 67 values >=0", () => {
    const d = Array.from({length:67}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 68 values >=0", () => {
    const d = Array.from({length:68}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 69 values >=0", () => {
    const d = Array.from({length:69}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 70 values >=0", () => {
    const d = Array.from({length:70}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 71 values >=0", () => {
    const d = Array.from({length:71}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 72 values >=0", () => {
    const d = Array.from({length:72}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 73 values >=0", () => {
    const d = Array.from({length:73}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 74 values >=0", () => {
    const d = Array.from({length:74}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 75 values >=0", () => {
    const d = Array.from({length:75}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 76 values >=0", () => {
    const d = Array.from({length:76}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 77 values >=0", () => {
    const d = Array.from({length:77}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 78 values >=0", () => {
    const d = Array.from({length:78}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 79 values >=0", () => {
    const d = Array.from({length:79}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
  it("variance 80 values >=0", () => {
    const d = Array.from({length:80}, (_,k) => k);
    expect(variance(d)).toBeGreaterThanOrEqual(0); });
});

describe("normalize", () => {
  it("[0,1] stays [0,1]", () => { expect(normalize([0,1])).toEqual([0,1]); });
  it("constant returns zeros", () => { expect(normalize([5,5,5])).toEqual([0,0,0]); });
  it("normalize 2 values in [0,1]", () => {
    const d = Array.from({length:2}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 3 values in [0,1]", () => {
    const d = Array.from({length:3}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 4 values in [0,1]", () => {
    const d = Array.from({length:4}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 5 values in [0,1]", () => {
    const d = Array.from({length:5}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 6 values in [0,1]", () => {
    const d = Array.from({length:6}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 7 values in [0,1]", () => {
    const d = Array.from({length:7}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 8 values in [0,1]", () => {
    const d = Array.from({length:8}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 9 values in [0,1]", () => {
    const d = Array.from({length:9}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 10 values in [0,1]", () => {
    const d = Array.from({length:10}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 11 values in [0,1]", () => {
    const d = Array.from({length:11}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 12 values in [0,1]", () => {
    const d = Array.from({length:12}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 13 values in [0,1]", () => {
    const d = Array.from({length:13}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 14 values in [0,1]", () => {
    const d = Array.from({length:14}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 15 values in [0,1]", () => {
    const d = Array.from({length:15}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 16 values in [0,1]", () => {
    const d = Array.from({length:16}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 17 values in [0,1]", () => {
    const d = Array.from({length:17}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 18 values in [0,1]", () => {
    const d = Array.from({length:18}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 19 values in [0,1]", () => {
    const d = Array.from({length:19}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 20 values in [0,1]", () => {
    const d = Array.from({length:20}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 21 values in [0,1]", () => {
    const d = Array.from({length:21}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 22 values in [0,1]", () => {
    const d = Array.from({length:22}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 23 values in [0,1]", () => {
    const d = Array.from({length:23}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 24 values in [0,1]", () => {
    const d = Array.from({length:24}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 25 values in [0,1]", () => {
    const d = Array.from({length:25}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 26 values in [0,1]", () => {
    const d = Array.from({length:26}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 27 values in [0,1]", () => {
    const d = Array.from({length:27}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 28 values in [0,1]", () => {
    const d = Array.from({length:28}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 29 values in [0,1]", () => {
    const d = Array.from({length:29}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 30 values in [0,1]", () => {
    const d = Array.from({length:30}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 31 values in [0,1]", () => {
    const d = Array.from({length:31}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 32 values in [0,1]", () => {
    const d = Array.from({length:32}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 33 values in [0,1]", () => {
    const d = Array.from({length:33}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 34 values in [0,1]", () => {
    const d = Array.from({length:34}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 35 values in [0,1]", () => {
    const d = Array.from({length:35}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 36 values in [0,1]", () => {
    const d = Array.from({length:36}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 37 values in [0,1]", () => {
    const d = Array.from({length:37}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 38 values in [0,1]", () => {
    const d = Array.from({length:38}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 39 values in [0,1]", () => {
    const d = Array.from({length:39}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 40 values in [0,1]", () => {
    const d = Array.from({length:40}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 41 values in [0,1]", () => {
    const d = Array.from({length:41}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 42 values in [0,1]", () => {
    const d = Array.from({length:42}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 43 values in [0,1]", () => {
    const d = Array.from({length:43}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 44 values in [0,1]", () => {
    const d = Array.from({length:44}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 45 values in [0,1]", () => {
    const d = Array.from({length:45}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 46 values in [0,1]", () => {
    const d = Array.from({length:46}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 47 values in [0,1]", () => {
    const d = Array.from({length:47}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 48 values in [0,1]", () => {
    const d = Array.from({length:48}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 49 values in [0,1]", () => {
    const d = Array.from({length:49}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 50 values in [0,1]", () => {
    const d = Array.from({length:50}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 51 values in [0,1]", () => {
    const d = Array.from({length:51}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 52 values in [0,1]", () => {
    const d = Array.from({length:52}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 53 values in [0,1]", () => {
    const d = Array.from({length:53}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 54 values in [0,1]", () => {
    const d = Array.from({length:54}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 55 values in [0,1]", () => {
    const d = Array.from({length:55}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 56 values in [0,1]", () => {
    const d = Array.from({length:56}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 57 values in [0,1]", () => {
    const d = Array.from({length:57}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 58 values in [0,1]", () => {
    const d = Array.from({length:58}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 59 values in [0,1]", () => {
    const d = Array.from({length:59}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 60 values in [0,1]", () => {
    const d = Array.from({length:60}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 61 values in [0,1]", () => {
    const d = Array.from({length:61}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 62 values in [0,1]", () => {
    const d = Array.from({length:62}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 63 values in [0,1]", () => {
    const d = Array.from({length:63}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 64 values in [0,1]", () => {
    const d = Array.from({length:64}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 65 values in [0,1]", () => {
    const d = Array.from({length:65}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 66 values in [0,1]", () => {
    const d = Array.from({length:66}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 67 values in [0,1]", () => {
    const d = Array.from({length:67}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 68 values in [0,1]", () => {
    const d = Array.from({length:68}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 69 values in [0,1]", () => {
    const d = Array.from({length:69}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 70 values in [0,1]", () => {
    const d = Array.from({length:70}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 71 values in [0,1]", () => {
    const d = Array.from({length:71}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 72 values in [0,1]", () => {
    const d = Array.from({length:72}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 73 values in [0,1]", () => {
    const d = Array.from({length:73}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 74 values in [0,1]", () => {
    const d = Array.from({length:74}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 75 values in [0,1]", () => {
    const d = Array.from({length:75}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 76 values in [0,1]", () => {
    const d = Array.from({length:76}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 77 values in [0,1]", () => {
    const d = Array.from({length:77}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 78 values in [0,1]", () => {
    const d = Array.from({length:78}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 79 values in [0,1]", () => {
    const d = Array.from({length:79}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
  it("normalize 80 values in [0,1]", () => {
    const d = Array.from({length:80}, (_,k) => k);
    const n = normalize(d);
    n.forEach(v => expect(v >= 0 && v <= 1).toBe(true)); });
});

describe("movingAverage", () => {
  it("window 1 is identity", () => { expect(movingAverage([1,2,3], 1)).toEqual([1,2,3]); });
  it("window larger than data is empty", () => { expect(movingAverage([1], 5)).toEqual([]); });
  it("movingAverage 1 len 3 win 2", () => {
    const d = Array.from({length:3}, (_,k) => k+1);
    const r = movingAverage(d, 2);
    expect(r.length).toBe(3 - 2 + 1); });
  it("movingAverage 2 len 5 win 3", () => {
    const d = Array.from({length:5}, (_,k) => k+1);
    const r = movingAverage(d, 3);
    expect(r.length).toBe(5 - 3 + 1); });
  it("movingAverage 3 len 7 win 4", () => {
    const d = Array.from({length:7}, (_,k) => k+1);
    const r = movingAverage(d, 4);
    expect(r.length).toBe(7 - 4 + 1); });
  it("movingAverage 4 len 9 win 5", () => {
    const d = Array.from({length:9}, (_,k) => k+1);
    const r = movingAverage(d, 5);
    expect(r.length).toBe(9 - 5 + 1); });
  it("movingAverage 5 len 6 win 1", () => {
    const d = Array.from({length:6}, (_,k) => k+1);
    const r = movingAverage(d, 1);
    expect(r.length).toBe(6 - 1 + 1); });
  it("movingAverage 6 len 8 win 2", () => {
    const d = Array.from({length:8}, (_,k) => k+1);
    const r = movingAverage(d, 2);
    expect(r.length).toBe(8 - 2 + 1); });
  it("movingAverage 7 len 10 win 3", () => {
    const d = Array.from({length:10}, (_,k) => k+1);
    const r = movingAverage(d, 3);
    expect(r.length).toBe(10 - 3 + 1); });
  it("movingAverage 8 len 12 win 4", () => {
    const d = Array.from({length:12}, (_,k) => k+1);
    const r = movingAverage(d, 4);
    expect(r.length).toBe(12 - 4 + 1); });
  it("movingAverage 9 len 14 win 5", () => {
    const d = Array.from({length:14}, (_,k) => k+1);
    const r = movingAverage(d, 5);
    expect(r.length).toBe(14 - 5 + 1); });
  it("movingAverage 10 len 11 win 1", () => {
    const d = Array.from({length:11}, (_,k) => k+1);
    const r = movingAverage(d, 1);
    expect(r.length).toBe(11 - 1 + 1); });
  it("movingAverage 11 len 13 win 2", () => {
    const d = Array.from({length:13}, (_,k) => k+1);
    const r = movingAverage(d, 2);
    expect(r.length).toBe(13 - 2 + 1); });
  it("movingAverage 12 len 15 win 3", () => {
    const d = Array.from({length:15}, (_,k) => k+1);
    const r = movingAverage(d, 3);
    expect(r.length).toBe(15 - 3 + 1); });
  it("movingAverage 13 len 17 win 4", () => {
    const d = Array.from({length:17}, (_,k) => k+1);
    const r = movingAverage(d, 4);
    expect(r.length).toBe(17 - 4 + 1); });
  it("movingAverage 14 len 19 win 5", () => {
    const d = Array.from({length:19}, (_,k) => k+1);
    const r = movingAverage(d, 5);
    expect(r.length).toBe(19 - 5 + 1); });
  it("movingAverage 15 len 16 win 1", () => {
    const d = Array.from({length:16}, (_,k) => k+1);
    const r = movingAverage(d, 1);
    expect(r.length).toBe(16 - 1 + 1); });
  it("movingAverage 16 len 18 win 2", () => {
    const d = Array.from({length:18}, (_,k) => k+1);
    const r = movingAverage(d, 2);
    expect(r.length).toBe(18 - 2 + 1); });
  it("movingAverage 17 len 20 win 3", () => {
    const d = Array.from({length:20}, (_,k) => k+1);
    const r = movingAverage(d, 3);
    expect(r.length).toBe(20 - 3 + 1); });
  it("movingAverage 18 len 22 win 4", () => {
    const d = Array.from({length:22}, (_,k) => k+1);
    const r = movingAverage(d, 4);
    expect(r.length).toBe(22 - 4 + 1); });
  it("movingAverage 19 len 24 win 5", () => {
    const d = Array.from({length:24}, (_,k) => k+1);
    const r = movingAverage(d, 5);
    expect(r.length).toBe(24 - 5 + 1); });
  it("movingAverage 20 len 21 win 1", () => {
    const d = Array.from({length:21}, (_,k) => k+1);
    const r = movingAverage(d, 1);
    expect(r.length).toBe(21 - 1 + 1); });
  it("movingAverage 21 len 23 win 2", () => {
    const d = Array.from({length:23}, (_,k) => k+1);
    const r = movingAverage(d, 2);
    expect(r.length).toBe(23 - 2 + 1); });
  it("movingAverage 22 len 25 win 3", () => {
    const d = Array.from({length:25}, (_,k) => k+1);
    const r = movingAverage(d, 3);
    expect(r.length).toBe(25 - 3 + 1); });
  it("movingAverage 23 len 27 win 4", () => {
    const d = Array.from({length:27}, (_,k) => k+1);
    const r = movingAverage(d, 4);
    expect(r.length).toBe(27 - 4 + 1); });
  it("movingAverage 24 len 29 win 5", () => {
    const d = Array.from({length:29}, (_,k) => k+1);
    const r = movingAverage(d, 5);
    expect(r.length).toBe(29 - 5 + 1); });
  it("movingAverage 25 len 26 win 1", () => {
    const d = Array.from({length:26}, (_,k) => k+1);
    const r = movingAverage(d, 1);
    expect(r.length).toBe(26 - 1 + 1); });
  it("movingAverage 26 len 28 win 2", () => {
    const d = Array.from({length:28}, (_,k) => k+1);
    const r = movingAverage(d, 2);
    expect(r.length).toBe(28 - 2 + 1); });
  it("movingAverage 27 len 30 win 3", () => {
    const d = Array.from({length:30}, (_,k) => k+1);
    const r = movingAverage(d, 3);
    expect(r.length).toBe(30 - 3 + 1); });
  it("movingAverage 28 len 32 win 4", () => {
    const d = Array.from({length:32}, (_,k) => k+1);
    const r = movingAverage(d, 4);
    expect(r.length).toBe(32 - 4 + 1); });
  it("movingAverage 29 len 34 win 5", () => {
    const d = Array.from({length:34}, (_,k) => k+1);
    const r = movingAverage(d, 5);
    expect(r.length).toBe(34 - 5 + 1); });
  it("movingAverage 30 len 31 win 1", () => {
    const d = Array.from({length:31}, (_,k) => k+1);
    const r = movingAverage(d, 1);
    expect(r.length).toBe(31 - 1 + 1); });
  it("movingAverage 31 len 33 win 2", () => {
    const d = Array.from({length:33}, (_,k) => k+1);
    const r = movingAverage(d, 2);
    expect(r.length).toBe(33 - 2 + 1); });
  it("movingAverage 32 len 35 win 3", () => {
    const d = Array.from({length:35}, (_,k) => k+1);
    const r = movingAverage(d, 3);
    expect(r.length).toBe(35 - 3 + 1); });
  it("movingAverage 33 len 37 win 4", () => {
    const d = Array.from({length:37}, (_,k) => k+1);
    const r = movingAverage(d, 4);
    expect(r.length).toBe(37 - 4 + 1); });
  it("movingAverage 34 len 39 win 5", () => {
    const d = Array.from({length:39}, (_,k) => k+1);
    const r = movingAverage(d, 5);
    expect(r.length).toBe(39 - 5 + 1); });
  it("movingAverage 35 len 36 win 1", () => {
    const d = Array.from({length:36}, (_,k) => k+1);
    const r = movingAverage(d, 1);
    expect(r.length).toBe(36 - 1 + 1); });
  it("movingAverage 36 len 38 win 2", () => {
    const d = Array.from({length:38}, (_,k) => k+1);
    const r = movingAverage(d, 2);
    expect(r.length).toBe(38 - 2 + 1); });
  it("movingAverage 37 len 40 win 3", () => {
    const d = Array.from({length:40}, (_,k) => k+1);
    const r = movingAverage(d, 3);
    expect(r.length).toBe(40 - 3 + 1); });
  it("movingAverage 38 len 42 win 4", () => {
    const d = Array.from({length:42}, (_,k) => k+1);
    const r = movingAverage(d, 4);
    expect(r.length).toBe(42 - 4 + 1); });
  it("movingAverage 39 len 44 win 5", () => {
    const d = Array.from({length:44}, (_,k) => k+1);
    const r = movingAverage(d, 5);
    expect(r.length).toBe(44 - 5 + 1); });
  it("movingAverage 40 len 41 win 1", () => {
    const d = Array.from({length:41}, (_,k) => k+1);
    const r = movingAverage(d, 1);
    expect(r.length).toBe(41 - 1 + 1); });
  it("movingAverage 41 len 43 win 2", () => {
    const d = Array.from({length:43}, (_,k) => k+1);
    const r = movingAverage(d, 2);
    expect(r.length).toBe(43 - 2 + 1); });
  it("movingAverage 42 len 45 win 3", () => {
    const d = Array.from({length:45}, (_,k) => k+1);
    const r = movingAverage(d, 3);
    expect(r.length).toBe(45 - 3 + 1); });
  it("movingAverage 43 len 47 win 4", () => {
    const d = Array.from({length:47}, (_,k) => k+1);
    const r = movingAverage(d, 4);
    expect(r.length).toBe(47 - 4 + 1); });
  it("movingAverage 44 len 49 win 5", () => {
    const d = Array.from({length:49}, (_,k) => k+1);
    const r = movingAverage(d, 5);
    expect(r.length).toBe(49 - 5 + 1); });
  it("movingAverage 45 len 46 win 1", () => {
    const d = Array.from({length:46}, (_,k) => k+1);
    const r = movingAverage(d, 1);
    expect(r.length).toBe(46 - 1 + 1); });
  it("movingAverage 46 len 48 win 2", () => {
    const d = Array.from({length:48}, (_,k) => k+1);
    const r = movingAverage(d, 2);
    expect(r.length).toBe(48 - 2 + 1); });
  it("movingAverage 47 len 50 win 3", () => {
    const d = Array.from({length:50}, (_,k) => k+1);
    const r = movingAverage(d, 3);
    expect(r.length).toBe(50 - 3 + 1); });
  it("movingAverage 48 len 52 win 4", () => {
    const d = Array.from({length:52}, (_,k) => k+1);
    const r = movingAverage(d, 4);
    expect(r.length).toBe(52 - 4 + 1); });
  it("movingAverage 49 len 54 win 5", () => {
    const d = Array.from({length:54}, (_,k) => k+1);
    const r = movingAverage(d, 5);
    expect(r.length).toBe(54 - 5 + 1); });
  it("movingAverage 50 len 51 win 1", () => {
    const d = Array.from({length:51}, (_,k) => k+1);
    const r = movingAverage(d, 1);
    expect(r.length).toBe(51 - 1 + 1); });
  it("movingAverage 51 len 53 win 2", () => {
    const d = Array.from({length:53}, (_,k) => k+1);
    const r = movingAverage(d, 2);
    expect(r.length).toBe(53 - 2 + 1); });
  it("movingAverage 52 len 55 win 3", () => {
    const d = Array.from({length:55}, (_,k) => k+1);
    const r = movingAverage(d, 3);
    expect(r.length).toBe(55 - 3 + 1); });
  it("movingAverage 53 len 57 win 4", () => {
    const d = Array.from({length:57}, (_,k) => k+1);
    const r = movingAverage(d, 4);
    expect(r.length).toBe(57 - 4 + 1); });
  it("movingAverage 54 len 59 win 5", () => {
    const d = Array.from({length:59}, (_,k) => k+1);
    const r = movingAverage(d, 5);
    expect(r.length).toBe(59 - 5 + 1); });
  it("movingAverage 55 len 56 win 1", () => {
    const d = Array.from({length:56}, (_,k) => k+1);
    const r = movingAverage(d, 1);
    expect(r.length).toBe(56 - 1 + 1); });
  it("movingAverage 56 len 58 win 2", () => {
    const d = Array.from({length:58}, (_,k) => k+1);
    const r = movingAverage(d, 2);
    expect(r.length).toBe(58 - 2 + 1); });
  it("movingAverage 57 len 60 win 3", () => {
    const d = Array.from({length:60}, (_,k) => k+1);
    const r = movingAverage(d, 3);
    expect(r.length).toBe(60 - 3 + 1); });
  it("movingAverage 58 len 62 win 4", () => {
    const d = Array.from({length:62}, (_,k) => k+1);
    const r = movingAverage(d, 4);
    expect(r.length).toBe(62 - 4 + 1); });
  it("movingAverage 59 len 64 win 5", () => {
    const d = Array.from({length:64}, (_,k) => k+1);
    const r = movingAverage(d, 5);
    expect(r.length).toBe(64 - 5 + 1); });
  it("movingAverage 60 len 61 win 1", () => {
    const d = Array.from({length:61}, (_,k) => k+1);
    const r = movingAverage(d, 1);
    expect(r.length).toBe(61 - 1 + 1); });
  it("movingAverage 61 len 63 win 2", () => {
    const d = Array.from({length:63}, (_,k) => k+1);
    const r = movingAverage(d, 2);
    expect(r.length).toBe(63 - 2 + 1); });
  it("movingAverage 62 len 65 win 3", () => {
    const d = Array.from({length:65}, (_,k) => k+1);
    const r = movingAverage(d, 3);
    expect(r.length).toBe(65 - 3 + 1); });
  it("movingAverage 63 len 67 win 4", () => {
    const d = Array.from({length:67}, (_,k) => k+1);
    const r = movingAverage(d, 4);
    expect(r.length).toBe(67 - 4 + 1); });
  it("movingAverage 64 len 69 win 5", () => {
    const d = Array.from({length:69}, (_,k) => k+1);
    const r = movingAverage(d, 5);
    expect(r.length).toBe(69 - 5 + 1); });
  it("movingAverage 65 len 66 win 1", () => {
    const d = Array.from({length:66}, (_,k) => k+1);
    const r = movingAverage(d, 1);
    expect(r.length).toBe(66 - 1 + 1); });
  it("movingAverage 66 len 68 win 2", () => {
    const d = Array.from({length:68}, (_,k) => k+1);
    const r = movingAverage(d, 2);
    expect(r.length).toBe(68 - 2 + 1); });
  it("movingAverage 67 len 70 win 3", () => {
    const d = Array.from({length:70}, (_,k) => k+1);
    const r = movingAverage(d, 3);
    expect(r.length).toBe(70 - 3 + 1); });
  it("movingAverage 68 len 72 win 4", () => {
    const d = Array.from({length:72}, (_,k) => k+1);
    const r = movingAverage(d, 4);
    expect(r.length).toBe(72 - 4 + 1); });
  it("movingAverage 69 len 74 win 5", () => {
    const d = Array.from({length:74}, (_,k) => k+1);
    const r = movingAverage(d, 5);
    expect(r.length).toBe(74 - 5 + 1); });
  it("movingAverage 70 len 71 win 1", () => {
    const d = Array.from({length:71}, (_,k) => k+1);
    const r = movingAverage(d, 1);
    expect(r.length).toBe(71 - 1 + 1); });
  it("movingAverage 71 len 73 win 2", () => {
    const d = Array.from({length:73}, (_,k) => k+1);
    const r = movingAverage(d, 2);
    expect(r.length).toBe(73 - 2 + 1); });
  it("movingAverage 72 len 75 win 3", () => {
    const d = Array.from({length:75}, (_,k) => k+1);
    const r = movingAverage(d, 3);
    expect(r.length).toBe(75 - 3 + 1); });
  it("movingAverage 73 len 77 win 4", () => {
    const d = Array.from({length:77}, (_,k) => k+1);
    const r = movingAverage(d, 4);
    expect(r.length).toBe(77 - 4 + 1); });
  it("movingAverage 74 len 79 win 5", () => {
    const d = Array.from({length:79}, (_,k) => k+1);
    const r = movingAverage(d, 5);
    expect(r.length).toBe(79 - 5 + 1); });
  it("movingAverage 75 len 76 win 1", () => {
    const d = Array.from({length:76}, (_,k) => k+1);
    const r = movingAverage(d, 1);
    expect(r.length).toBe(76 - 1 + 1); });
  it("movingAverage 76 len 78 win 2", () => {
    const d = Array.from({length:78}, (_,k) => k+1);
    const r = movingAverage(d, 2);
    expect(r.length).toBe(78 - 2 + 1); });
  it("movingAverage 77 len 80 win 3", () => {
    const d = Array.from({length:80}, (_,k) => k+1);
    const r = movingAverage(d, 3);
    expect(r.length).toBe(80 - 3 + 1); });
  it("movingAverage 78 len 82 win 4", () => {
    const d = Array.from({length:82}, (_,k) => k+1);
    const r = movingAverage(d, 4);
    expect(r.length).toBe(82 - 4 + 1); });
  it("movingAverage 79 len 84 win 5", () => {
    const d = Array.from({length:84}, (_,k) => k+1);
    const r = movingAverage(d, 5);
    expect(r.length).toBe(84 - 5 + 1); });
  it("movingAverage 80 len 81 win 1", () => {
    const d = Array.from({length:81}, (_,k) => k+1);
    const r = movingAverage(d, 1);
    expect(r.length).toBe(81 - 1 + 1); });
});

describe("rms", () => {
  it("empty is 0", () => { expect(rms([])).toBe(0); });
  it("[3,4] is 5/sqrt(2)", () => { expect(rms([3,4])).toBeCloseTo(3.536, 2); });
  it("rms 1 values >=0", () => {
    const d = Array.from({length:1}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 2 values >=0", () => {
    const d = Array.from({length:2}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 3 values >=0", () => {
    const d = Array.from({length:3}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 4 values >=0", () => {
    const d = Array.from({length:4}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 5 values >=0", () => {
    const d = Array.from({length:5}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 6 values >=0", () => {
    const d = Array.from({length:6}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 7 values >=0", () => {
    const d = Array.from({length:7}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 8 values >=0", () => {
    const d = Array.from({length:8}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 9 values >=0", () => {
    const d = Array.from({length:9}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 10 values >=0", () => {
    const d = Array.from({length:10}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 11 values >=0", () => {
    const d = Array.from({length:11}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 12 values >=0", () => {
    const d = Array.from({length:12}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 13 values >=0", () => {
    const d = Array.from({length:13}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 14 values >=0", () => {
    const d = Array.from({length:14}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 15 values >=0", () => {
    const d = Array.from({length:15}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 16 values >=0", () => {
    const d = Array.from({length:16}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 17 values >=0", () => {
    const d = Array.from({length:17}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 18 values >=0", () => {
    const d = Array.from({length:18}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 19 values >=0", () => {
    const d = Array.from({length:19}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 20 values >=0", () => {
    const d = Array.from({length:20}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 21 values >=0", () => {
    const d = Array.from({length:21}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 22 values >=0", () => {
    const d = Array.from({length:22}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 23 values >=0", () => {
    const d = Array.from({length:23}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 24 values >=0", () => {
    const d = Array.from({length:24}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 25 values >=0", () => {
    const d = Array.from({length:25}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 26 values >=0", () => {
    const d = Array.from({length:26}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 27 values >=0", () => {
    const d = Array.from({length:27}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 28 values >=0", () => {
    const d = Array.from({length:28}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 29 values >=0", () => {
    const d = Array.from({length:29}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 30 values >=0", () => {
    const d = Array.from({length:30}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 31 values >=0", () => {
    const d = Array.from({length:31}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 32 values >=0", () => {
    const d = Array.from({length:32}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 33 values >=0", () => {
    const d = Array.from({length:33}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 34 values >=0", () => {
    const d = Array.from({length:34}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 35 values >=0", () => {
    const d = Array.from({length:35}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 36 values >=0", () => {
    const d = Array.from({length:36}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 37 values >=0", () => {
    const d = Array.from({length:37}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 38 values >=0", () => {
    const d = Array.from({length:38}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 39 values >=0", () => {
    const d = Array.from({length:39}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 40 values >=0", () => {
    const d = Array.from({length:40}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 41 values >=0", () => {
    const d = Array.from({length:41}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 42 values >=0", () => {
    const d = Array.from({length:42}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 43 values >=0", () => {
    const d = Array.from({length:43}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 44 values >=0", () => {
    const d = Array.from({length:44}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 45 values >=0", () => {
    const d = Array.from({length:45}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 46 values >=0", () => {
    const d = Array.from({length:46}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 47 values >=0", () => {
    const d = Array.from({length:47}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 48 values >=0", () => {
    const d = Array.from({length:48}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 49 values >=0", () => {
    const d = Array.from({length:49}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 50 values >=0", () => {
    const d = Array.from({length:50}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 51 values >=0", () => {
    const d = Array.from({length:51}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 52 values >=0", () => {
    const d = Array.from({length:52}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 53 values >=0", () => {
    const d = Array.from({length:53}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 54 values >=0", () => {
    const d = Array.from({length:54}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 55 values >=0", () => {
    const d = Array.from({length:55}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 56 values >=0", () => {
    const d = Array.from({length:56}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 57 values >=0", () => {
    const d = Array.from({length:57}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 58 values >=0", () => {
    const d = Array.from({length:58}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 59 values >=0", () => {
    const d = Array.from({length:59}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 60 values >=0", () => {
    const d = Array.from({length:60}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 61 values >=0", () => {
    const d = Array.from({length:61}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 62 values >=0", () => {
    const d = Array.from({length:62}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 63 values >=0", () => {
    const d = Array.from({length:63}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 64 values >=0", () => {
    const d = Array.from({length:64}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 65 values >=0", () => {
    const d = Array.from({length:65}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 66 values >=0", () => {
    const d = Array.from({length:66}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 67 values >=0", () => {
    const d = Array.from({length:67}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 68 values >=0", () => {
    const d = Array.from({length:68}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 69 values >=0", () => {
    const d = Array.from({length:69}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 70 values >=0", () => {
    const d = Array.from({length:70}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 71 values >=0", () => {
    const d = Array.from({length:71}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 72 values >=0", () => {
    const d = Array.from({length:72}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 73 values >=0", () => {
    const d = Array.from({length:73}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 74 values >=0", () => {
    const d = Array.from({length:74}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 75 values >=0", () => {
    const d = Array.from({length:75}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 76 values >=0", () => {
    const d = Array.from({length:76}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 77 values >=0", () => {
    const d = Array.from({length:77}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 78 values >=0", () => {
    const d = Array.from({length:78}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 79 values >=0", () => {
    const d = Array.from({length:79}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 80 values >=0", () => {
    const d = Array.from({length:80}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 81 values >=0", () => {
    const d = Array.from({length:81}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 82 values >=0", () => {
    const d = Array.from({length:82}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 83 values >=0", () => {
    const d = Array.from({length:83}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 84 values >=0", () => {
    const d = Array.from({length:84}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 85 values >=0", () => {
    const d = Array.from({length:85}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 86 values >=0", () => {
    const d = Array.from({length:86}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 87 values >=0", () => {
    const d = Array.from({length:87}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 88 values >=0", () => {
    const d = Array.from({length:88}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 89 values >=0", () => {
    const d = Array.from({length:89}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 90 values >=0", () => {
    const d = Array.from({length:90}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 91 values >=0", () => {
    const d = Array.from({length:91}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 92 values >=0", () => {
    const d = Array.from({length:92}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 93 values >=0", () => {
    const d = Array.from({length:93}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 94 values >=0", () => {
    const d = Array.from({length:94}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 95 values >=0", () => {
    const d = Array.from({length:95}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 96 values >=0", () => {
    const d = Array.from({length:96}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 97 values >=0", () => {
    const d = Array.from({length:97}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 98 values >=0", () => {
    const d = Array.from({length:98}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 99 values >=0", () => {
    const d = Array.from({length:99}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
  it("rms 100 values >=0", () => {
    const d = Array.from({length:100}, (_,k) => k+1);
    expect(rms(d)).toBeGreaterThanOrEqual(0); });
});

describe("clamp", () => {
  it("clamp below min", () => { expect(clamp(-5, 0, 10)).toBe(0); });
  it("clamp above max", () => { expect(clamp(15, 0, 10)).toBe(10); });
  it("in range unchanged", () => { expect(clamp(5, 0, 10)).toBe(5); });
  it("clamp 1 in [0,100]", () => { expect(clamp(1, 0, 100)).toBe(1); });
  it("clamp 2 in [0,100]", () => { expect(clamp(2, 0, 100)).toBe(2); });
  it("clamp 3 in [0,100]", () => { expect(clamp(3, 0, 100)).toBe(3); });
  it("clamp 4 in [0,100]", () => { expect(clamp(4, 0, 100)).toBe(4); });
  it("clamp 5 in [0,100]", () => { expect(clamp(5, 0, 100)).toBe(5); });
  it("clamp 6 in [0,100]", () => { expect(clamp(6, 0, 100)).toBe(6); });
  it("clamp 7 in [0,100]", () => { expect(clamp(7, 0, 100)).toBe(7); });
  it("clamp 8 in [0,100]", () => { expect(clamp(8, 0, 100)).toBe(8); });
  it("clamp 9 in [0,100]", () => { expect(clamp(9, 0, 100)).toBe(9); });
  it("clamp 10 in [0,100]", () => { expect(clamp(10, 0, 100)).toBe(10); });
  it("clamp 11 in [0,100]", () => { expect(clamp(11, 0, 100)).toBe(11); });
  it("clamp 12 in [0,100]", () => { expect(clamp(12, 0, 100)).toBe(12); });
  it("clamp 13 in [0,100]", () => { expect(clamp(13, 0, 100)).toBe(13); });
  it("clamp 14 in [0,100]", () => { expect(clamp(14, 0, 100)).toBe(14); });
  it("clamp 15 in [0,100]", () => { expect(clamp(15, 0, 100)).toBe(15); });
  it("clamp 16 in [0,100]", () => { expect(clamp(16, 0, 100)).toBe(16); });
  it("clamp 17 in [0,100]", () => { expect(clamp(17, 0, 100)).toBe(17); });
  it("clamp 18 in [0,100]", () => { expect(clamp(18, 0, 100)).toBe(18); });
  it("clamp 19 in [0,100]", () => { expect(clamp(19, 0, 100)).toBe(19); });
  it("clamp 20 in [0,100]", () => { expect(clamp(20, 0, 100)).toBe(20); });
  it("clamp 21 in [0,100]", () => { expect(clamp(21, 0, 100)).toBe(21); });
  it("clamp 22 in [0,100]", () => { expect(clamp(22, 0, 100)).toBe(22); });
  it("clamp 23 in [0,100]", () => { expect(clamp(23, 0, 100)).toBe(23); });
  it("clamp 24 in [0,100]", () => { expect(clamp(24, 0, 100)).toBe(24); });
  it("clamp 25 in [0,100]", () => { expect(clamp(25, 0, 100)).toBe(25); });
  it("clamp 26 in [0,100]", () => { expect(clamp(26, 0, 100)).toBe(26); });
  it("clamp 27 in [0,100]", () => { expect(clamp(27, 0, 100)).toBe(27); });
  it("clamp 28 in [0,100]", () => { expect(clamp(28, 0, 100)).toBe(28); });
  it("clamp 29 in [0,100]", () => { expect(clamp(29, 0, 100)).toBe(29); });
  it("clamp 30 in [0,100]", () => { expect(clamp(30, 0, 100)).toBe(30); });
  it("clamp 31 in [0,100]", () => { expect(clamp(31, 0, 100)).toBe(31); });
  it("clamp 32 in [0,100]", () => { expect(clamp(32, 0, 100)).toBe(32); });
  it("clamp 33 in [0,100]", () => { expect(clamp(33, 0, 100)).toBe(33); });
  it("clamp 34 in [0,100]", () => { expect(clamp(34, 0, 100)).toBe(34); });
  it("clamp 35 in [0,100]", () => { expect(clamp(35, 0, 100)).toBe(35); });
  it("clamp 36 in [0,100]", () => { expect(clamp(36, 0, 100)).toBe(36); });
  it("clamp 37 in [0,100]", () => { expect(clamp(37, 0, 100)).toBe(37); });
  it("clamp 38 in [0,100]", () => { expect(clamp(38, 0, 100)).toBe(38); });
  it("clamp 39 in [0,100]", () => { expect(clamp(39, 0, 100)).toBe(39); });
  it("clamp 40 in [0,100]", () => { expect(clamp(40, 0, 100)).toBe(40); });
  it("clamp 41 in [0,100]", () => { expect(clamp(41, 0, 100)).toBe(41); });
  it("clamp 42 in [0,100]", () => { expect(clamp(42, 0, 100)).toBe(42); });
  it("clamp 43 in [0,100]", () => { expect(clamp(43, 0, 100)).toBe(43); });
  it("clamp 44 in [0,100]", () => { expect(clamp(44, 0, 100)).toBe(44); });
  it("clamp 45 in [0,100]", () => { expect(clamp(45, 0, 100)).toBe(45); });
  it("clamp 46 in [0,100]", () => { expect(clamp(46, 0, 100)).toBe(46); });
  it("clamp 47 in [0,100]", () => { expect(clamp(47, 0, 100)).toBe(47); });
  it("clamp 48 in [0,100]", () => { expect(clamp(48, 0, 100)).toBe(48); });
  it("clamp 49 in [0,100]", () => { expect(clamp(49, 0, 100)).toBe(49); });
  it("clamp 50 in [0,100]", () => { expect(clamp(50, 0, 100)).toBe(50); });
  it("clamp 51 in [0,100]", () => { expect(clamp(51, 0, 100)).toBe(51); });
  it("clamp 52 in [0,100]", () => { expect(clamp(52, 0, 100)).toBe(52); });
  it("clamp 53 in [0,100]", () => { expect(clamp(53, 0, 100)).toBe(53); });
  it("clamp 54 in [0,100]", () => { expect(clamp(54, 0, 100)).toBe(54); });
  it("clamp 55 in [0,100]", () => { expect(clamp(55, 0, 100)).toBe(55); });
  it("clamp 56 in [0,100]", () => { expect(clamp(56, 0, 100)).toBe(56); });
  it("clamp 57 in [0,100]", () => { expect(clamp(57, 0, 100)).toBe(57); });
  it("clamp 58 in [0,100]", () => { expect(clamp(58, 0, 100)).toBe(58); });
  it("clamp 59 in [0,100]", () => { expect(clamp(59, 0, 100)).toBe(59); });
  it("clamp 60 in [0,100]", () => { expect(clamp(60, 0, 100)).toBe(60); });
  it("clamp 61 in [0,100]", () => { expect(clamp(61, 0, 100)).toBe(61); });
  it("clamp 62 in [0,100]", () => { expect(clamp(62, 0, 100)).toBe(62); });
  it("clamp 63 in [0,100]", () => { expect(clamp(63, 0, 100)).toBe(63); });
  it("clamp 64 in [0,100]", () => { expect(clamp(64, 0, 100)).toBe(64); });
  it("clamp 65 in [0,100]", () => { expect(clamp(65, 0, 100)).toBe(65); });
  it("clamp 66 in [0,100]", () => { expect(clamp(66, 0, 100)).toBe(66); });
  it("clamp 67 in [0,100]", () => { expect(clamp(67, 0, 100)).toBe(67); });
  it("clamp 68 in [0,100]", () => { expect(clamp(68, 0, 100)).toBe(68); });
  it("clamp 69 in [0,100]", () => { expect(clamp(69, 0, 100)).toBe(69); });
  it("clamp 70 in [0,100]", () => { expect(clamp(70, 0, 100)).toBe(70); });
  it("clamp 71 in [0,100]", () => { expect(clamp(71, 0, 100)).toBe(71); });
  it("clamp 72 in [0,100]", () => { expect(clamp(72, 0, 100)).toBe(72); });
  it("clamp 73 in [0,100]", () => { expect(clamp(73, 0, 100)).toBe(73); });
  it("clamp 74 in [0,100]", () => { expect(clamp(74, 0, 100)).toBe(74); });
  it("clamp 75 in [0,100]", () => { expect(clamp(75, 0, 100)).toBe(75); });
  it("clamp 76 in [0,100]", () => { expect(clamp(76, 0, 100)).toBe(76); });
  it("clamp 77 in [0,100]", () => { expect(clamp(77, 0, 100)).toBe(77); });
  it("clamp 78 in [0,100]", () => { expect(clamp(78, 0, 100)).toBe(78); });
  it("clamp 79 in [0,100]", () => { expect(clamp(79, 0, 100)).toBe(79); });
  it("clamp 80 in [0,100]", () => { expect(clamp(80, 0, 100)).toBe(80); });
  it("clamp 81 in [0,100]", () => { expect(clamp(81, 0, 100)).toBe(81); });
  it("clamp 82 in [0,100]", () => { expect(clamp(82, 0, 100)).toBe(82); });
  it("clamp 83 in [0,100]", () => { expect(clamp(83, 0, 100)).toBe(83); });
  it("clamp 84 in [0,100]", () => { expect(clamp(84, 0, 100)).toBe(84); });
  it("clamp 85 in [0,100]", () => { expect(clamp(85, 0, 100)).toBe(85); });
  it("clamp 86 in [0,100]", () => { expect(clamp(86, 0, 100)).toBe(86); });
  it("clamp 87 in [0,100]", () => { expect(clamp(87, 0, 100)).toBe(87); });
  it("clamp 88 in [0,100]", () => { expect(clamp(88, 0, 100)).toBe(88); });
  it("clamp 89 in [0,100]", () => { expect(clamp(89, 0, 100)).toBe(89); });
  it("clamp 90 in [0,100]", () => { expect(clamp(90, 0, 100)).toBe(90); });
  it("clamp 91 in [0,100]", () => { expect(clamp(91, 0, 100)).toBe(91); });
  it("clamp 92 in [0,100]", () => { expect(clamp(92, 0, 100)).toBe(92); });
  it("clamp 93 in [0,100]", () => { expect(clamp(93, 0, 100)).toBe(93); });
  it("clamp 94 in [0,100]", () => { expect(clamp(94, 0, 100)).toBe(94); });
  it("clamp 95 in [0,100]", () => { expect(clamp(95, 0, 100)).toBe(95); });
  it("clamp 96 in [0,100]", () => { expect(clamp(96, 0, 100)).toBe(96); });
  it("clamp 97 in [0,100]", () => { expect(clamp(97, 0, 100)).toBe(97); });
  it("clamp 98 in [0,100]", () => { expect(clamp(98, 0, 100)).toBe(98); });
  it("clamp 99 in [0,100]", () => { expect(clamp(99, 0, 100)).toBe(99); });
  it("clamp 100 in [0,100]", () => { expect(clamp(100, 0, 100)).toBe(100); });
});

describe("hammingWindow", () => {
  it("hammingWindow 2 has length 2", () => { expect(hammingWindow(2).length).toBe(2); });
  it("hammingWindow 3 has length 3", () => { expect(hammingWindow(3).length).toBe(3); });
  it("hammingWindow 4 has length 4", () => { expect(hammingWindow(4).length).toBe(4); });
  it("hammingWindow 5 has length 5", () => { expect(hammingWindow(5).length).toBe(5); });
  it("hammingWindow 6 has length 6", () => { expect(hammingWindow(6).length).toBe(6); });
  it("hammingWindow 7 has length 7", () => { expect(hammingWindow(7).length).toBe(7); });
  it("hammingWindow 8 has length 8", () => { expect(hammingWindow(8).length).toBe(8); });
  it("hammingWindow 9 has length 9", () => { expect(hammingWindow(9).length).toBe(9); });
  it("hammingWindow 10 has length 10", () => { expect(hammingWindow(10).length).toBe(10); });
  it("hammingWindow 11 has length 11", () => { expect(hammingWindow(11).length).toBe(11); });
  it("hammingWindow 12 has length 12", () => { expect(hammingWindow(12).length).toBe(12); });
  it("hammingWindow 13 has length 13", () => { expect(hammingWindow(13).length).toBe(13); });
  it("hammingWindow 14 has length 14", () => { expect(hammingWindow(14).length).toBe(14); });
  it("hammingWindow 15 has length 15", () => { expect(hammingWindow(15).length).toBe(15); });
  it("hammingWindow 16 has length 16", () => { expect(hammingWindow(16).length).toBe(16); });
  it("hammingWindow 17 has length 17", () => { expect(hammingWindow(17).length).toBe(17); });
  it("hammingWindow 18 has length 18", () => { expect(hammingWindow(18).length).toBe(18); });
  it("hammingWindow 19 has length 19", () => { expect(hammingWindow(19).length).toBe(19); });
  it("hammingWindow 20 has length 20", () => { expect(hammingWindow(20).length).toBe(20); });
  it("hammingWindow 21 has length 21", () => { expect(hammingWindow(21).length).toBe(21); });
  it("hammingWindow 22 has length 22", () => { expect(hammingWindow(22).length).toBe(22); });
  it("hammingWindow 23 has length 23", () => { expect(hammingWindow(23).length).toBe(23); });
  it("hammingWindow 24 has length 24", () => { expect(hammingWindow(24).length).toBe(24); });
  it("hammingWindow 25 has length 25", () => { expect(hammingWindow(25).length).toBe(25); });
  it("hammingWindow 26 has length 26", () => { expect(hammingWindow(26).length).toBe(26); });
  it("hammingWindow 27 has length 27", () => { expect(hammingWindow(27).length).toBe(27); });
  it("hammingWindow 28 has length 28", () => { expect(hammingWindow(28).length).toBe(28); });
  it("hammingWindow 29 has length 29", () => { expect(hammingWindow(29).length).toBe(29); });
  it("hammingWindow 30 has length 30", () => { expect(hammingWindow(30).length).toBe(30); });
  it("hammingWindow 31 has length 31", () => { expect(hammingWindow(31).length).toBe(31); });
  it("hammingWindow 32 has length 32", () => { expect(hammingWindow(32).length).toBe(32); });
  it("hammingWindow 33 has length 33", () => { expect(hammingWindow(33).length).toBe(33); });
  it("hammingWindow 34 has length 34", () => { expect(hammingWindow(34).length).toBe(34); });
  it("hammingWindow 35 has length 35", () => { expect(hammingWindow(35).length).toBe(35); });
  it("hammingWindow 36 has length 36", () => { expect(hammingWindow(36).length).toBe(36); });
  it("hammingWindow 37 has length 37", () => { expect(hammingWindow(37).length).toBe(37); });
  it("hammingWindow 38 has length 38", () => { expect(hammingWindow(38).length).toBe(38); });
  it("hammingWindow 39 has length 39", () => { expect(hammingWindow(39).length).toBe(39); });
  it("hammingWindow 40 has length 40", () => { expect(hammingWindow(40).length).toBe(40); });
  it("hammingWindow 41 has length 41", () => { expect(hammingWindow(41).length).toBe(41); });
  it("hammingWindow 42 has length 42", () => { expect(hammingWindow(42).length).toBe(42); });
  it("hammingWindow 43 has length 43", () => { expect(hammingWindow(43).length).toBe(43); });
  it("hammingWindow 44 has length 44", () => { expect(hammingWindow(44).length).toBe(44); });
  it("hammingWindow 45 has length 45", () => { expect(hammingWindow(45).length).toBe(45); });
  it("hammingWindow 46 has length 46", () => { expect(hammingWindow(46).length).toBe(46); });
  it("hammingWindow 47 has length 47", () => { expect(hammingWindow(47).length).toBe(47); });
  it("hammingWindow 48 has length 48", () => { expect(hammingWindow(48).length).toBe(48); });
  it("hammingWindow 49 has length 49", () => { expect(hammingWindow(49).length).toBe(49); });
  it("hammingWindow 50 has length 50", () => { expect(hammingWindow(50).length).toBe(50); });
  it("hammingWindow 51 has length 51", () => { expect(hammingWindow(51).length).toBe(51); });
  it("hammingWindow 52 has length 52", () => { expect(hammingWindow(52).length).toBe(52); });
  it("hammingWindow 53 has length 53", () => { expect(hammingWindow(53).length).toBe(53); });
  it("hammingWindow 54 has length 54", () => { expect(hammingWindow(54).length).toBe(54); });
  it("hammingWindow 55 has length 55", () => { expect(hammingWindow(55).length).toBe(55); });
  it("hammingWindow 56 has length 56", () => { expect(hammingWindow(56).length).toBe(56); });
  it("hammingWindow 57 has length 57", () => { expect(hammingWindow(57).length).toBe(57); });
  it("hammingWindow 58 has length 58", () => { expect(hammingWindow(58).length).toBe(58); });
  it("hammingWindow 59 has length 59", () => { expect(hammingWindow(59).length).toBe(59); });
  it("hammingWindow 60 has length 60", () => { expect(hammingWindow(60).length).toBe(60); });
  it("hammingWindow 61 has length 61", () => { expect(hammingWindow(61).length).toBe(61); });
  it("hammingWindow 62 has length 62", () => { expect(hammingWindow(62).length).toBe(62); });
  it("hammingWindow 63 has length 63", () => { expect(hammingWindow(63).length).toBe(63); });
  it("hammingWindow 64 has length 64", () => { expect(hammingWindow(64).length).toBe(64); });
  it("hammingWindow 65 has length 65", () => { expect(hammingWindow(65).length).toBe(65); });
  it("hammingWindow 66 has length 66", () => { expect(hammingWindow(66).length).toBe(66); });
  it("hammingWindow 67 has length 67", () => { expect(hammingWindow(67).length).toBe(67); });
  it("hammingWindow 68 has length 68", () => { expect(hammingWindow(68).length).toBe(68); });
  it("hammingWindow 69 has length 69", () => { expect(hammingWindow(69).length).toBe(69); });
  it("hammingWindow 70 has length 70", () => { expect(hammingWindow(70).length).toBe(70); });
  it("hammingWindow 71 has length 71", () => { expect(hammingWindow(71).length).toBe(71); });
  it("hammingWindow 72 has length 72", () => { expect(hammingWindow(72).length).toBe(72); });
  it("hammingWindow 73 has length 73", () => { expect(hammingWindow(73).length).toBe(73); });
  it("hammingWindow 74 has length 74", () => { expect(hammingWindow(74).length).toBe(74); });
  it("hammingWindow 75 has length 75", () => { expect(hammingWindow(75).length).toBe(75); });
  it("hammingWindow 76 has length 76", () => { expect(hammingWindow(76).length).toBe(76); });
  it("hammingWindow 77 has length 77", () => { expect(hammingWindow(77).length).toBe(77); });
  it("hammingWindow 78 has length 78", () => { expect(hammingWindow(78).length).toBe(78); });
  it("hammingWindow 79 has length 79", () => { expect(hammingWindow(79).length).toBe(79); });
  it("hammingWindow 80 has length 80", () => { expect(hammingWindow(80).length).toBe(80); });
});

describe("dotProduct", () => {
  it("[1,2].[3,4] is 11", () => { expect(dotProduct([1,2],[3,4])).toBe(11); });
  it("empty is 0", () => { expect(dotProduct([],[])).toBe(0); });
  it("dotProduct 1", () => {
    const a = Array.from({length:1}, () => 1);
    const b = Array.from({length:1}, () => 2);
    expect(dotProduct(a,b)).toBe(1*2); });
  it("dotProduct 2", () => {
    const a = Array.from({length:2}, () => 1);
    const b = Array.from({length:2}, () => 2);
    expect(dotProduct(a,b)).toBe(2*2); });
  it("dotProduct 3", () => {
    const a = Array.from({length:3}, () => 1);
    const b = Array.from({length:3}, () => 2);
    expect(dotProduct(a,b)).toBe(3*2); });
  it("dotProduct 4", () => {
    const a = Array.from({length:4}, () => 1);
    const b = Array.from({length:4}, () => 2);
    expect(dotProduct(a,b)).toBe(4*2); });
  it("dotProduct 5", () => {
    const a = Array.from({length:5}, () => 1);
    const b = Array.from({length:5}, () => 2);
    expect(dotProduct(a,b)).toBe(5*2); });
  it("dotProduct 6", () => {
    const a = Array.from({length:6}, () => 1);
    const b = Array.from({length:6}, () => 2);
    expect(dotProduct(a,b)).toBe(6*2); });
  it("dotProduct 7", () => {
    const a = Array.from({length:7}, () => 1);
    const b = Array.from({length:7}, () => 2);
    expect(dotProduct(a,b)).toBe(7*2); });
  it("dotProduct 8", () => {
    const a = Array.from({length:8}, () => 1);
    const b = Array.from({length:8}, () => 2);
    expect(dotProduct(a,b)).toBe(8*2); });
  it("dotProduct 9", () => {
    const a = Array.from({length:9}, () => 1);
    const b = Array.from({length:9}, () => 2);
    expect(dotProduct(a,b)).toBe(9*2); });
  it("dotProduct 10", () => {
    const a = Array.from({length:10}, () => 1);
    const b = Array.from({length:10}, () => 2);
    expect(dotProduct(a,b)).toBe(10*2); });
  it("dotProduct 11", () => {
    const a = Array.from({length:11}, () => 1);
    const b = Array.from({length:11}, () => 2);
    expect(dotProduct(a,b)).toBe(11*2); });
  it("dotProduct 12", () => {
    const a = Array.from({length:12}, () => 1);
    const b = Array.from({length:12}, () => 2);
    expect(dotProduct(a,b)).toBe(12*2); });
  it("dotProduct 13", () => {
    const a = Array.from({length:13}, () => 1);
    const b = Array.from({length:13}, () => 2);
    expect(dotProduct(a,b)).toBe(13*2); });
  it("dotProduct 14", () => {
    const a = Array.from({length:14}, () => 1);
    const b = Array.from({length:14}, () => 2);
    expect(dotProduct(a,b)).toBe(14*2); });
  it("dotProduct 15", () => {
    const a = Array.from({length:15}, () => 1);
    const b = Array.from({length:15}, () => 2);
    expect(dotProduct(a,b)).toBe(15*2); });
  it("dotProduct 16", () => {
    const a = Array.from({length:16}, () => 1);
    const b = Array.from({length:16}, () => 2);
    expect(dotProduct(a,b)).toBe(16*2); });
  it("dotProduct 17", () => {
    const a = Array.from({length:17}, () => 1);
    const b = Array.from({length:17}, () => 2);
    expect(dotProduct(a,b)).toBe(17*2); });
  it("dotProduct 18", () => {
    const a = Array.from({length:18}, () => 1);
    const b = Array.from({length:18}, () => 2);
    expect(dotProduct(a,b)).toBe(18*2); });
  it("dotProduct 19", () => {
    const a = Array.from({length:19}, () => 1);
    const b = Array.from({length:19}, () => 2);
    expect(dotProduct(a,b)).toBe(19*2); });
  it("dotProduct 20", () => {
    const a = Array.from({length:20}, () => 1);
    const b = Array.from({length:20}, () => 2);
    expect(dotProduct(a,b)).toBe(20*2); });
  it("dotProduct 21", () => {
    const a = Array.from({length:21}, () => 1);
    const b = Array.from({length:21}, () => 2);
    expect(dotProduct(a,b)).toBe(21*2); });
  it("dotProduct 22", () => {
    const a = Array.from({length:22}, () => 1);
    const b = Array.from({length:22}, () => 2);
    expect(dotProduct(a,b)).toBe(22*2); });
  it("dotProduct 23", () => {
    const a = Array.from({length:23}, () => 1);
    const b = Array.from({length:23}, () => 2);
    expect(dotProduct(a,b)).toBe(23*2); });
  it("dotProduct 24", () => {
    const a = Array.from({length:24}, () => 1);
    const b = Array.from({length:24}, () => 2);
    expect(dotProduct(a,b)).toBe(24*2); });
  it("dotProduct 25", () => {
    const a = Array.from({length:25}, () => 1);
    const b = Array.from({length:25}, () => 2);
    expect(dotProduct(a,b)).toBe(25*2); });
  it("dotProduct 26", () => {
    const a = Array.from({length:26}, () => 1);
    const b = Array.from({length:26}, () => 2);
    expect(dotProduct(a,b)).toBe(26*2); });
  it("dotProduct 27", () => {
    const a = Array.from({length:27}, () => 1);
    const b = Array.from({length:27}, () => 2);
    expect(dotProduct(a,b)).toBe(27*2); });
  it("dotProduct 28", () => {
    const a = Array.from({length:28}, () => 1);
    const b = Array.from({length:28}, () => 2);
    expect(dotProduct(a,b)).toBe(28*2); });
  it("dotProduct 29", () => {
    const a = Array.from({length:29}, () => 1);
    const b = Array.from({length:29}, () => 2);
    expect(dotProduct(a,b)).toBe(29*2); });
  it("dotProduct 30", () => {
    const a = Array.from({length:30}, () => 1);
    const b = Array.from({length:30}, () => 2);
    expect(dotProduct(a,b)).toBe(30*2); });
  it("dotProduct 31", () => {
    const a = Array.from({length:31}, () => 1);
    const b = Array.from({length:31}, () => 2);
    expect(dotProduct(a,b)).toBe(31*2); });
  it("dotProduct 32", () => {
    const a = Array.from({length:32}, () => 1);
    const b = Array.from({length:32}, () => 2);
    expect(dotProduct(a,b)).toBe(32*2); });
  it("dotProduct 33", () => {
    const a = Array.from({length:33}, () => 1);
    const b = Array.from({length:33}, () => 2);
    expect(dotProduct(a,b)).toBe(33*2); });
  it("dotProduct 34", () => {
    const a = Array.from({length:34}, () => 1);
    const b = Array.from({length:34}, () => 2);
    expect(dotProduct(a,b)).toBe(34*2); });
  it("dotProduct 35", () => {
    const a = Array.from({length:35}, () => 1);
    const b = Array.from({length:35}, () => 2);
    expect(dotProduct(a,b)).toBe(35*2); });
  it("dotProduct 36", () => {
    const a = Array.from({length:36}, () => 1);
    const b = Array.from({length:36}, () => 2);
    expect(dotProduct(a,b)).toBe(36*2); });
  it("dotProduct 37", () => {
    const a = Array.from({length:37}, () => 1);
    const b = Array.from({length:37}, () => 2);
    expect(dotProduct(a,b)).toBe(37*2); });
  it("dotProduct 38", () => {
    const a = Array.from({length:38}, () => 1);
    const b = Array.from({length:38}, () => 2);
    expect(dotProduct(a,b)).toBe(38*2); });
  it("dotProduct 39", () => {
    const a = Array.from({length:39}, () => 1);
    const b = Array.from({length:39}, () => 2);
    expect(dotProduct(a,b)).toBe(39*2); });
  it("dotProduct 40", () => {
    const a = Array.from({length:40}, () => 1);
    const b = Array.from({length:40}, () => 2);
    expect(dotProduct(a,b)).toBe(40*2); });
  it("dotProduct 41", () => {
    const a = Array.from({length:41}, () => 1);
    const b = Array.from({length:41}, () => 2);
    expect(dotProduct(a,b)).toBe(41*2); });
  it("dotProduct 42", () => {
    const a = Array.from({length:42}, () => 1);
    const b = Array.from({length:42}, () => 2);
    expect(dotProduct(a,b)).toBe(42*2); });
  it("dotProduct 43", () => {
    const a = Array.from({length:43}, () => 1);
    const b = Array.from({length:43}, () => 2);
    expect(dotProduct(a,b)).toBe(43*2); });
  it("dotProduct 44", () => {
    const a = Array.from({length:44}, () => 1);
    const b = Array.from({length:44}, () => 2);
    expect(dotProduct(a,b)).toBe(44*2); });
  it("dotProduct 45", () => {
    const a = Array.from({length:45}, () => 1);
    const b = Array.from({length:45}, () => 2);
    expect(dotProduct(a,b)).toBe(45*2); });
  it("dotProduct 46", () => {
    const a = Array.from({length:46}, () => 1);
    const b = Array.from({length:46}, () => 2);
    expect(dotProduct(a,b)).toBe(46*2); });
  it("dotProduct 47", () => {
    const a = Array.from({length:47}, () => 1);
    const b = Array.from({length:47}, () => 2);
    expect(dotProduct(a,b)).toBe(47*2); });
  it("dotProduct 48", () => {
    const a = Array.from({length:48}, () => 1);
    const b = Array.from({length:48}, () => 2);
    expect(dotProduct(a,b)).toBe(48*2); });
  it("dotProduct 49", () => {
    const a = Array.from({length:49}, () => 1);
    const b = Array.from({length:49}, () => 2);
    expect(dotProduct(a,b)).toBe(49*2); });
  it("dotProduct 50", () => {
    const a = Array.from({length:50}, () => 1);
    const b = Array.from({length:50}, () => 2);
    expect(dotProduct(a,b)).toBe(50*2); });
});

describe("downsample", () => {
  it("factor 1 is identity", () => { expect(downsample([1,2,3,4], 1)).toEqual([1,2,3,4]); });
  it("factor 2 halves length", () => { expect(downsample([1,2,3,4], 2)).toEqual([1,3]); });
  it("downsample 4 by 2", () => { const d = Array.from({length:4}, (_,k)=>k); expect(downsample(d,2).length).toBe(4/2); });
  it("downsample 8 by 2", () => { const d = Array.from({length:8}, (_,k)=>k); expect(downsample(d,2).length).toBe(8/2); });
  it("downsample 12 by 2", () => { const d = Array.from({length:12}, (_,k)=>k); expect(downsample(d,2).length).toBe(12/2); });
  it("downsample 16 by 2", () => { const d = Array.from({length:16}, (_,k)=>k); expect(downsample(d,2).length).toBe(16/2); });
  it("downsample 20 by 2", () => { const d = Array.from({length:20}, (_,k)=>k); expect(downsample(d,2).length).toBe(20/2); });
  it("downsample 24 by 2", () => { const d = Array.from({length:24}, (_,k)=>k); expect(downsample(d,2).length).toBe(24/2); });
  it("downsample 28 by 2", () => { const d = Array.from({length:28}, (_,k)=>k); expect(downsample(d,2).length).toBe(28/2); });
  it("downsample 32 by 2", () => { const d = Array.from({length:32}, (_,k)=>k); expect(downsample(d,2).length).toBe(32/2); });
  it("downsample 36 by 2", () => { const d = Array.from({length:36}, (_,k)=>k); expect(downsample(d,2).length).toBe(36/2); });
  it("downsample 40 by 2", () => { const d = Array.from({length:40}, (_,k)=>k); expect(downsample(d,2).length).toBe(40/2); });
  it("downsample 44 by 2", () => { const d = Array.from({length:44}, (_,k)=>k); expect(downsample(d,2).length).toBe(44/2); });
  it("downsample 48 by 2", () => { const d = Array.from({length:48}, (_,k)=>k); expect(downsample(d,2).length).toBe(48/2); });
  it("downsample 52 by 2", () => { const d = Array.from({length:52}, (_,k)=>k); expect(downsample(d,2).length).toBe(52/2); });
  it("downsample 56 by 2", () => { const d = Array.from({length:56}, (_,k)=>k); expect(downsample(d,2).length).toBe(56/2); });
  it("downsample 60 by 2", () => { const d = Array.from({length:60}, (_,k)=>k); expect(downsample(d,2).length).toBe(60/2); });
  it("downsample 64 by 2", () => { const d = Array.from({length:64}, (_,k)=>k); expect(downsample(d,2).length).toBe(64/2); });
  it("downsample 68 by 2", () => { const d = Array.from({length:68}, (_,k)=>k); expect(downsample(d,2).length).toBe(68/2); });
  it("downsample 72 by 2", () => { const d = Array.from({length:72}, (_,k)=>k); expect(downsample(d,2).length).toBe(72/2); });
  it("downsample 76 by 2", () => { const d = Array.from({length:76}, (_,k)=>k); expect(downsample(d,2).length).toBe(76/2); });
  it("downsample 80 by 2", () => { const d = Array.from({length:80}, (_,k)=>k); expect(downsample(d,2).length).toBe(80/2); });
  it("downsample 84 by 2", () => { const d = Array.from({length:84}, (_,k)=>k); expect(downsample(d,2).length).toBe(84/2); });
  it("downsample 88 by 2", () => { const d = Array.from({length:88}, (_,k)=>k); expect(downsample(d,2).length).toBe(88/2); });
  it("downsample 92 by 2", () => { const d = Array.from({length:92}, (_,k)=>k); expect(downsample(d,2).length).toBe(92/2); });
  it("downsample 96 by 2", () => { const d = Array.from({length:96}, (_,k)=>k); expect(downsample(d,2).length).toBe(96/2); });
  it("downsample 100 by 2", () => { const d = Array.from({length:100}, (_,k)=>k); expect(downsample(d,2).length).toBe(100/2); });
  it("downsample 104 by 2", () => { const d = Array.from({length:104}, (_,k)=>k); expect(downsample(d,2).length).toBe(104/2); });
  it("downsample 108 by 2", () => { const d = Array.from({length:108}, (_,k)=>k); expect(downsample(d,2).length).toBe(108/2); });
  it("downsample 112 by 2", () => { const d = Array.from({length:112}, (_,k)=>k); expect(downsample(d,2).length).toBe(112/2); });
  it("downsample 116 by 2", () => { const d = Array.from({length:116}, (_,k)=>k); expect(downsample(d,2).length).toBe(116/2); });
  it("downsample 120 by 2", () => { const d = Array.from({length:120}, (_,k)=>k); expect(downsample(d,2).length).toBe(120/2); });
  it("downsample 124 by 2", () => { const d = Array.from({length:124}, (_,k)=>k); expect(downsample(d,2).length).toBe(124/2); });
  it("downsample 128 by 2", () => { const d = Array.from({length:128}, (_,k)=>k); expect(downsample(d,2).length).toBe(128/2); });
  it("downsample 132 by 2", () => { const d = Array.from({length:132}, (_,k)=>k); expect(downsample(d,2).length).toBe(132/2); });
  it("downsample 136 by 2", () => { const d = Array.from({length:136}, (_,k)=>k); expect(downsample(d,2).length).toBe(136/2); });
  it("downsample 140 by 2", () => { const d = Array.from({length:140}, (_,k)=>k); expect(downsample(d,2).length).toBe(140/2); });
  it("downsample 144 by 2", () => { const d = Array.from({length:144}, (_,k)=>k); expect(downsample(d,2).length).toBe(144/2); });
  it("downsample 148 by 2", () => { const d = Array.from({length:148}, (_,k)=>k); expect(downsample(d,2).length).toBe(148/2); });
  it("downsample 152 by 2", () => { const d = Array.from({length:152}, (_,k)=>k); expect(downsample(d,2).length).toBe(152/2); });
  it("downsample 156 by 2", () => { const d = Array.from({length:156}, (_,k)=>k); expect(downsample(d,2).length).toBe(156/2); });
  it("downsample 160 by 2", () => { const d = Array.from({length:160}, (_,k)=>k); expect(downsample(d,2).length).toBe(160/2); });
  it("downsample 164 by 2", () => { const d = Array.from({length:164}, (_,k)=>k); expect(downsample(d,2).length).toBe(164/2); });
  it("downsample 168 by 2", () => { const d = Array.from({length:168}, (_,k)=>k); expect(downsample(d,2).length).toBe(168/2); });
  it("downsample 172 by 2", () => { const d = Array.from({length:172}, (_,k)=>k); expect(downsample(d,2).length).toBe(172/2); });
  it("downsample 176 by 2", () => { const d = Array.from({length:176}, (_,k)=>k); expect(downsample(d,2).length).toBe(176/2); });
  it("downsample 180 by 2", () => { const d = Array.from({length:180}, (_,k)=>k); expect(downsample(d,2).length).toBe(180/2); });
  it("downsample 184 by 2", () => { const d = Array.from({length:184}, (_,k)=>k); expect(downsample(d,2).length).toBe(184/2); });
  it("downsample 188 by 2", () => { const d = Array.from({length:188}, (_,k)=>k); expect(downsample(d,2).length).toBe(188/2); });
  it("downsample 192 by 2", () => { const d = Array.from({length:192}, (_,k)=>k); expect(downsample(d,2).length).toBe(192/2); });
  it("downsample 196 by 2", () => { const d = Array.from({length:196}, (_,k)=>k); expect(downsample(d,2).length).toBe(196/2); });
  it("downsample 200 by 2", () => { const d = Array.from({length:200}, (_,k)=>k); expect(downsample(d,2).length).toBe(200/2); });
});

describe("stdDev", () => {
  it("empty is 0", () => { expect(stdDev([])).toBe(0); });
  it("single is 0", () => { expect(stdDev([5])).toBe(0); });
  it("stdDev 2 values >=0", () => {
    const d = Array.from({length:2}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 3 values >=0", () => {
    const d = Array.from({length:3}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 4 values >=0", () => {
    const d = Array.from({length:4}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 5 values >=0", () => {
    const d = Array.from({length:5}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 6 values >=0", () => {
    const d = Array.from({length:6}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 7 values >=0", () => {
    const d = Array.from({length:7}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 8 values >=0", () => {
    const d = Array.from({length:8}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 9 values >=0", () => {
    const d = Array.from({length:9}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 10 values >=0", () => {
    const d = Array.from({length:10}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 11 values >=0", () => {
    const d = Array.from({length:11}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 12 values >=0", () => {
    const d = Array.from({length:12}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 13 values >=0", () => {
    const d = Array.from({length:13}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 14 values >=0", () => {
    const d = Array.from({length:14}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 15 values >=0", () => {
    const d = Array.from({length:15}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 16 values >=0", () => {
    const d = Array.from({length:16}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 17 values >=0", () => {
    const d = Array.from({length:17}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 18 values >=0", () => {
    const d = Array.from({length:18}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 19 values >=0", () => {
    const d = Array.from({length:19}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 20 values >=0", () => {
    const d = Array.from({length:20}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 21 values >=0", () => {
    const d = Array.from({length:21}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 22 values >=0", () => {
    const d = Array.from({length:22}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 23 values >=0", () => {
    const d = Array.from({length:23}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 24 values >=0", () => {
    const d = Array.from({length:24}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 25 values >=0", () => {
    const d = Array.from({length:25}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 26 values >=0", () => {
    const d = Array.from({length:26}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 27 values >=0", () => {
    const d = Array.from({length:27}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 28 values >=0", () => {
    const d = Array.from({length:28}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 29 values >=0", () => {
    const d = Array.from({length:29}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 30 values >=0", () => {
    const d = Array.from({length:30}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 31 values >=0", () => {
    const d = Array.from({length:31}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 32 values >=0", () => {
    const d = Array.from({length:32}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 33 values >=0", () => {
    const d = Array.from({length:33}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 34 values >=0", () => {
    const d = Array.from({length:34}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 35 values >=0", () => {
    const d = Array.from({length:35}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 36 values >=0", () => {
    const d = Array.from({length:36}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 37 values >=0", () => {
    const d = Array.from({length:37}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 38 values >=0", () => {
    const d = Array.from({length:38}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 39 values >=0", () => {
    const d = Array.from({length:39}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 40 values >=0", () => {
    const d = Array.from({length:40}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 41 values >=0", () => {
    const d = Array.from({length:41}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 42 values >=0", () => {
    const d = Array.from({length:42}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 43 values >=0", () => {
    const d = Array.from({length:43}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 44 values >=0", () => {
    const d = Array.from({length:44}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 45 values >=0", () => {
    const d = Array.from({length:45}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 46 values >=0", () => {
    const d = Array.from({length:46}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 47 values >=0", () => {
    const d = Array.from({length:47}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 48 values >=0", () => {
    const d = Array.from({length:48}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 49 values >=0", () => {
    const d = Array.from({length:49}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 50 values >=0", () => {
    const d = Array.from({length:50}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 51 values >=0", () => {
    const d = Array.from({length:51}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 52 values >=0", () => {
    const d = Array.from({length:52}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 53 values >=0", () => {
    const d = Array.from({length:53}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 54 values >=0", () => {
    const d = Array.from({length:54}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 55 values >=0", () => {
    const d = Array.from({length:55}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 56 values >=0", () => {
    const d = Array.from({length:56}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 57 values >=0", () => {
    const d = Array.from({length:57}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 58 values >=0", () => {
    const d = Array.from({length:58}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 59 values >=0", () => {
    const d = Array.from({length:59}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 60 values >=0", () => {
    const d = Array.from({length:60}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 61 values >=0", () => {
    const d = Array.from({length:61}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 62 values >=0", () => {
    const d = Array.from({length:62}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 63 values >=0", () => {
    const d = Array.from({length:63}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 64 values >=0", () => {
    const d = Array.from({length:64}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 65 values >=0", () => {
    const d = Array.from({length:65}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 66 values >=0", () => {
    const d = Array.from({length:66}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 67 values >=0", () => {
    const d = Array.from({length:67}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 68 values >=0", () => {
    const d = Array.from({length:68}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 69 values >=0", () => {
    const d = Array.from({length:69}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 70 values >=0", () => {
    const d = Array.from({length:70}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 71 values >=0", () => {
    const d = Array.from({length:71}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 72 values >=0", () => {
    const d = Array.from({length:72}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 73 values >=0", () => {
    const d = Array.from({length:73}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 74 values >=0", () => {
    const d = Array.from({length:74}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 75 values >=0", () => {
    const d = Array.from({length:75}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 76 values >=0", () => {
    const d = Array.from({length:76}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 77 values >=0", () => {
    const d = Array.from({length:77}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 78 values >=0", () => {
    const d = Array.from({length:78}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 79 values >=0", () => {
    const d = Array.from({length:79}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
  it("stdDev 80 values >=0", () => {
    const d = Array.from({length:80}, (_,k) => k+1);
    expect(stdDev(d)).toBeGreaterThanOrEqual(0); });
});

describe("upsample", () => {
  it("factor 1 is identity", () => { expect(upsample([1,2,3], 1)).toEqual([1,2,3]); });
  it("factor 2 doubles length", () => { expect(upsample([1,2], 2)).toEqual([1,0,2,0]); });
  it("upsample 1 factor 3 length", () => {
    const d = Array.from({length:1}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(1*3); });
  it("upsample 2 factor 3 length", () => {
    const d = Array.from({length:2}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(2*3); });
  it("upsample 3 factor 3 length", () => {
    const d = Array.from({length:3}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(3*3); });
  it("upsample 4 factor 3 length", () => {
    const d = Array.from({length:4}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(4*3); });
  it("upsample 5 factor 3 length", () => {
    const d = Array.from({length:5}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(5*3); });
  it("upsample 6 factor 3 length", () => {
    const d = Array.from({length:6}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(6*3); });
  it("upsample 7 factor 3 length", () => {
    const d = Array.from({length:7}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(7*3); });
  it("upsample 8 factor 3 length", () => {
    const d = Array.from({length:8}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(8*3); });
  it("upsample 9 factor 3 length", () => {
    const d = Array.from({length:9}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(9*3); });
  it("upsample 10 factor 3 length", () => {
    const d = Array.from({length:10}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(10*3); });
  it("upsample 11 factor 3 length", () => {
    const d = Array.from({length:11}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(11*3); });
  it("upsample 12 factor 3 length", () => {
    const d = Array.from({length:12}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(12*3); });
  it("upsample 13 factor 3 length", () => {
    const d = Array.from({length:13}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(13*3); });
  it("upsample 14 factor 3 length", () => {
    const d = Array.from({length:14}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(14*3); });
  it("upsample 15 factor 3 length", () => {
    const d = Array.from({length:15}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(15*3); });
  it("upsample 16 factor 3 length", () => {
    const d = Array.from({length:16}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(16*3); });
  it("upsample 17 factor 3 length", () => {
    const d = Array.from({length:17}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(17*3); });
  it("upsample 18 factor 3 length", () => {
    const d = Array.from({length:18}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(18*3); });
  it("upsample 19 factor 3 length", () => {
    const d = Array.from({length:19}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(19*3); });
  it("upsample 20 factor 3 length", () => {
    const d = Array.from({length:20}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(20*3); });
  it("upsample 21 factor 3 length", () => {
    const d = Array.from({length:21}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(21*3); });
  it("upsample 22 factor 3 length", () => {
    const d = Array.from({length:22}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(22*3); });
  it("upsample 23 factor 3 length", () => {
    const d = Array.from({length:23}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(23*3); });
  it("upsample 24 factor 3 length", () => {
    const d = Array.from({length:24}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(24*3); });
  it("upsample 25 factor 3 length", () => {
    const d = Array.from({length:25}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(25*3); });
  it("upsample 26 factor 3 length", () => {
    const d = Array.from({length:26}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(26*3); });
  it("upsample 27 factor 3 length", () => {
    const d = Array.from({length:27}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(27*3); });
  it("upsample 28 factor 3 length", () => {
    const d = Array.from({length:28}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(28*3); });
  it("upsample 29 factor 3 length", () => {
    const d = Array.from({length:29}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(29*3); });
  it("upsample 30 factor 3 length", () => {
    const d = Array.from({length:30}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(30*3); });
  it("upsample 31 factor 3 length", () => {
    const d = Array.from({length:31}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(31*3); });
  it("upsample 32 factor 3 length", () => {
    const d = Array.from({length:32}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(32*3); });
  it("upsample 33 factor 3 length", () => {
    const d = Array.from({length:33}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(33*3); });
  it("upsample 34 factor 3 length", () => {
    const d = Array.from({length:34}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(34*3); });
  it("upsample 35 factor 3 length", () => {
    const d = Array.from({length:35}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(35*3); });
  it("upsample 36 factor 3 length", () => {
    const d = Array.from({length:36}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(36*3); });
  it("upsample 37 factor 3 length", () => {
    const d = Array.from({length:37}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(37*3); });
  it("upsample 38 factor 3 length", () => {
    const d = Array.from({length:38}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(38*3); });
  it("upsample 39 factor 3 length", () => {
    const d = Array.from({length:39}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(39*3); });
  it("upsample 40 factor 3 length", () => {
    const d = Array.from({length:40}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(40*3); });
  it("upsample 41 factor 3 length", () => {
    const d = Array.from({length:41}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(41*3); });
  it("upsample 42 factor 3 length", () => {
    const d = Array.from({length:42}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(42*3); });
  it("upsample 43 factor 3 length", () => {
    const d = Array.from({length:43}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(43*3); });
  it("upsample 44 factor 3 length", () => {
    const d = Array.from({length:44}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(44*3); });
  it("upsample 45 factor 3 length", () => {
    const d = Array.from({length:45}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(45*3); });
  it("upsample 46 factor 3 length", () => {
    const d = Array.from({length:46}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(46*3); });
  it("upsample 47 factor 3 length", () => {
    const d = Array.from({length:47}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(47*3); });
  it("upsample 48 factor 3 length", () => {
    const d = Array.from({length:48}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(48*3); });
  it("upsample 49 factor 3 length", () => {
    const d = Array.from({length:49}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(49*3); });
  it("upsample 50 factor 3 length", () => {
    const d = Array.from({length:50}, (_,k) => k+1);
    expect(upsample(d, 3).length).toBe(50*3); });
});

describe("hannWindow", () => {
  it("hannWindow 2 has length 2", () => { expect(hannWindow(2).length).toBe(2); });
  it("hannWindow 3 has length 3", () => { expect(hannWindow(3).length).toBe(3); });
  it("hannWindow 4 has length 4", () => { expect(hannWindow(4).length).toBe(4); });
  it("hannWindow 5 has length 5", () => { expect(hannWindow(5).length).toBe(5); });
  it("hannWindow 6 has length 6", () => { expect(hannWindow(6).length).toBe(6); });
  it("hannWindow 7 has length 7", () => { expect(hannWindow(7).length).toBe(7); });
  it("hannWindow 8 has length 8", () => { expect(hannWindow(8).length).toBe(8); });
  it("hannWindow 9 has length 9", () => { expect(hannWindow(9).length).toBe(9); });
  it("hannWindow 10 has length 10", () => { expect(hannWindow(10).length).toBe(10); });
  it("hannWindow 11 has length 11", () => { expect(hannWindow(11).length).toBe(11); });
  it("hannWindow 12 has length 12", () => { expect(hannWindow(12).length).toBe(12); });
  it("hannWindow 13 has length 13", () => { expect(hannWindow(13).length).toBe(13); });
  it("hannWindow 14 has length 14", () => { expect(hannWindow(14).length).toBe(14); });
  it("hannWindow 15 has length 15", () => { expect(hannWindow(15).length).toBe(15); });
  it("hannWindow 16 has length 16", () => { expect(hannWindow(16).length).toBe(16); });
  it("hannWindow 17 has length 17", () => { expect(hannWindow(17).length).toBe(17); });
  it("hannWindow 18 has length 18", () => { expect(hannWindow(18).length).toBe(18); });
  it("hannWindow 19 has length 19", () => { expect(hannWindow(19).length).toBe(19); });
  it("hannWindow 20 has length 20", () => { expect(hannWindow(20).length).toBe(20); });
  it("hannWindow 21 has length 21", () => { expect(hannWindow(21).length).toBe(21); });
  it("hannWindow 22 has length 22", () => { expect(hannWindow(22).length).toBe(22); });
  it("hannWindow 23 has length 23", () => { expect(hannWindow(23).length).toBe(23); });
  it("hannWindow 24 has length 24", () => { expect(hannWindow(24).length).toBe(24); });
  it("hannWindow 25 has length 25", () => { expect(hannWindow(25).length).toBe(25); });
  it("hannWindow 26 has length 26", () => { expect(hannWindow(26).length).toBe(26); });
  it("hannWindow 27 has length 27", () => { expect(hannWindow(27).length).toBe(27); });
  it("hannWindow 28 has length 28", () => { expect(hannWindow(28).length).toBe(28); });
  it("hannWindow 29 has length 29", () => { expect(hannWindow(29).length).toBe(29); });
  it("hannWindow 30 has length 30", () => { expect(hannWindow(30).length).toBe(30); });
  it("hannWindow 31 has length 31", () => { expect(hannWindow(31).length).toBe(31); });
  it("hannWindow 32 has length 32", () => { expect(hannWindow(32).length).toBe(32); });
  it("hannWindow 33 has length 33", () => { expect(hannWindow(33).length).toBe(33); });
  it("hannWindow 34 has length 34", () => { expect(hannWindow(34).length).toBe(34); });
  it("hannWindow 35 has length 35", () => { expect(hannWindow(35).length).toBe(35); });
  it("hannWindow 36 has length 36", () => { expect(hannWindow(36).length).toBe(36); });
  it("hannWindow 37 has length 37", () => { expect(hannWindow(37).length).toBe(37); });
  it("hannWindow 38 has length 38", () => { expect(hannWindow(38).length).toBe(38); });
  it("hannWindow 39 has length 39", () => { expect(hannWindow(39).length).toBe(39); });
  it("hannWindow 40 has length 40", () => { expect(hannWindow(40).length).toBe(40); });
  it("hannWindow 41 has length 41", () => { expect(hannWindow(41).length).toBe(41); });
  it("hannWindow 42 has length 42", () => { expect(hannWindow(42).length).toBe(42); });
  it("hannWindow 43 has length 43", () => { expect(hannWindow(43).length).toBe(43); });
  it("hannWindow 44 has length 44", () => { expect(hannWindow(44).length).toBe(44); });
  it("hannWindow 45 has length 45", () => { expect(hannWindow(45).length).toBe(45); });
  it("hannWindow 46 has length 46", () => { expect(hannWindow(46).length).toBe(46); });
  it("hannWindow 47 has length 47", () => { expect(hannWindow(47).length).toBe(47); });
  it("hannWindow 48 has length 48", () => { expect(hannWindow(48).length).toBe(48); });
  it("hannWindow 49 has length 49", () => { expect(hannWindow(49).length).toBe(49); });
  it("hannWindow 50 has length 50", () => { expect(hannWindow(50).length).toBe(50); });
  it("hannWindow 51 has length 51", () => { expect(hannWindow(51).length).toBe(51); });
  it("hannWindow 52 has length 52", () => { expect(hannWindow(52).length).toBe(52); });
  it("hannWindow 53 has length 53", () => { expect(hannWindow(53).length).toBe(53); });
  it("hannWindow 54 has length 54", () => { expect(hannWindow(54).length).toBe(54); });
  it("hannWindow 55 has length 55", () => { expect(hannWindow(55).length).toBe(55); });
  it("hannWindow 56 has length 56", () => { expect(hannWindow(56).length).toBe(56); });
  it("hannWindow 57 has length 57", () => { expect(hannWindow(57).length).toBe(57); });
  it("hannWindow 58 has length 58", () => { expect(hannWindow(58).length).toBe(58); });
  it("hannWindow 59 has length 59", () => { expect(hannWindow(59).length).toBe(59); });
  it("hannWindow 60 has length 60", () => { expect(hannWindow(60).length).toBe(60); });
  it("hannWindow 61 has length 61", () => { expect(hannWindow(61).length).toBe(61); });
  it("hannWindow 62 has length 62", () => { expect(hannWindow(62).length).toBe(62); });
  it("hannWindow 63 has length 63", () => { expect(hannWindow(63).length).toBe(63); });
  it("hannWindow 64 has length 64", () => { expect(hannWindow(64).length).toBe(64); });
  it("hannWindow 65 has length 65", () => { expect(hannWindow(65).length).toBe(65); });
  it("hannWindow 66 has length 66", () => { expect(hannWindow(66).length).toBe(66); });
  it("hannWindow 67 has length 67", () => { expect(hannWindow(67).length).toBe(67); });
  it("hannWindow 68 has length 68", () => { expect(hannWindow(68).length).toBe(68); });
  it("hannWindow 69 has length 69", () => { expect(hannWindow(69).length).toBe(69); });
  it("hannWindow 70 has length 70", () => { expect(hannWindow(70).length).toBe(70); });
  it("hannWindow 71 has length 71", () => { expect(hannWindow(71).length).toBe(71); });
  it("hannWindow 72 has length 72", () => { expect(hannWindow(72).length).toBe(72); });
  it("hannWindow 73 has length 73", () => { expect(hannWindow(73).length).toBe(73); });
  it("hannWindow 74 has length 74", () => { expect(hannWindow(74).length).toBe(74); });
  it("hannWindow 75 has length 75", () => { expect(hannWindow(75).length).toBe(75); });
  it("hannWindow 76 has length 76", () => { expect(hannWindow(76).length).toBe(76); });
  it("hannWindow 77 has length 77", () => { expect(hannWindow(77).length).toBe(77); });
  it("hannWindow 78 has length 78", () => { expect(hannWindow(78).length).toBe(78); });
  it("hannWindow 79 has length 79", () => { expect(hannWindow(79).length).toBe(79); });
  it("hannWindow 80 has length 80", () => { expect(hannWindow(80).length).toBe(80); });
});

describe("applyWindow", () => {
  it("zero window zeros signal", () => { expect(applyWindow([1,2,3], [0,0,0])).toEqual([0,0,0]); });
  it("unit window preserves signal", () => { expect(applyWindow([1,2,3], [1,1,1])).toEqual([1,2,3]); });
  it("applyWindow 1 length preserved", () => {
    const d = Array.from({length:1}, (_,k) => k+1);
    const w = Array.from({length:1}, () => 1);
    expect(applyWindow(d, w).length).toBe(1); });
  it("applyWindow 2 length preserved", () => {
    const d = Array.from({length:2}, (_,k) => k+1);
    const w = Array.from({length:2}, () => 1);
    expect(applyWindow(d, w).length).toBe(2); });
  it("applyWindow 3 length preserved", () => {
    const d = Array.from({length:3}, (_,k) => k+1);
    const w = Array.from({length:3}, () => 1);
    expect(applyWindow(d, w).length).toBe(3); });
  it("applyWindow 4 length preserved", () => {
    const d = Array.from({length:4}, (_,k) => k+1);
    const w = Array.from({length:4}, () => 1);
    expect(applyWindow(d, w).length).toBe(4); });
  it("applyWindow 5 length preserved", () => {
    const d = Array.from({length:5}, (_,k) => k+1);
    const w = Array.from({length:5}, () => 1);
    expect(applyWindow(d, w).length).toBe(5); });
  it("applyWindow 6 length preserved", () => {
    const d = Array.from({length:6}, (_,k) => k+1);
    const w = Array.from({length:6}, () => 1);
    expect(applyWindow(d, w).length).toBe(6); });
  it("applyWindow 7 length preserved", () => {
    const d = Array.from({length:7}, (_,k) => k+1);
    const w = Array.from({length:7}, () => 1);
    expect(applyWindow(d, w).length).toBe(7); });
  it("applyWindow 8 length preserved", () => {
    const d = Array.from({length:8}, (_,k) => k+1);
    const w = Array.from({length:8}, () => 1);
    expect(applyWindow(d, w).length).toBe(8); });
  it("applyWindow 9 length preserved", () => {
    const d = Array.from({length:9}, (_,k) => k+1);
    const w = Array.from({length:9}, () => 1);
    expect(applyWindow(d, w).length).toBe(9); });
  it("applyWindow 10 length preserved", () => {
    const d = Array.from({length:10}, (_,k) => k+1);
    const w = Array.from({length:10}, () => 1);
    expect(applyWindow(d, w).length).toBe(10); });
  it("applyWindow 11 length preserved", () => {
    const d = Array.from({length:11}, (_,k) => k+1);
    const w = Array.from({length:11}, () => 1);
    expect(applyWindow(d, w).length).toBe(11); });
  it("applyWindow 12 length preserved", () => {
    const d = Array.from({length:12}, (_,k) => k+1);
    const w = Array.from({length:12}, () => 1);
    expect(applyWindow(d, w).length).toBe(12); });
  it("applyWindow 13 length preserved", () => {
    const d = Array.from({length:13}, (_,k) => k+1);
    const w = Array.from({length:13}, () => 1);
    expect(applyWindow(d, w).length).toBe(13); });
  it("applyWindow 14 length preserved", () => {
    const d = Array.from({length:14}, (_,k) => k+1);
    const w = Array.from({length:14}, () => 1);
    expect(applyWindow(d, w).length).toBe(14); });
  it("applyWindow 15 length preserved", () => {
    const d = Array.from({length:15}, (_,k) => k+1);
    const w = Array.from({length:15}, () => 1);
    expect(applyWindow(d, w).length).toBe(15); });
  it("applyWindow 16 length preserved", () => {
    const d = Array.from({length:16}, (_,k) => k+1);
    const w = Array.from({length:16}, () => 1);
    expect(applyWindow(d, w).length).toBe(16); });
  it("applyWindow 17 length preserved", () => {
    const d = Array.from({length:17}, (_,k) => k+1);
    const w = Array.from({length:17}, () => 1);
    expect(applyWindow(d, w).length).toBe(17); });
  it("applyWindow 18 length preserved", () => {
    const d = Array.from({length:18}, (_,k) => k+1);
    const w = Array.from({length:18}, () => 1);
    expect(applyWindow(d, w).length).toBe(18); });
  it("applyWindow 19 length preserved", () => {
    const d = Array.from({length:19}, (_,k) => k+1);
    const w = Array.from({length:19}, () => 1);
    expect(applyWindow(d, w).length).toBe(19); });
  it("applyWindow 20 length preserved", () => {
    const d = Array.from({length:20}, (_,k) => k+1);
    const w = Array.from({length:20}, () => 1);
    expect(applyWindow(d, w).length).toBe(20); });
  it("applyWindow 21 length preserved", () => {
    const d = Array.from({length:21}, (_,k) => k+1);
    const w = Array.from({length:21}, () => 1);
    expect(applyWindow(d, w).length).toBe(21); });
  it("applyWindow 22 length preserved", () => {
    const d = Array.from({length:22}, (_,k) => k+1);
    const w = Array.from({length:22}, () => 1);
    expect(applyWindow(d, w).length).toBe(22); });
  it("applyWindow 23 length preserved", () => {
    const d = Array.from({length:23}, (_,k) => k+1);
    const w = Array.from({length:23}, () => 1);
    expect(applyWindow(d, w).length).toBe(23); });
  it("applyWindow 24 length preserved", () => {
    const d = Array.from({length:24}, (_,k) => k+1);
    const w = Array.from({length:24}, () => 1);
    expect(applyWindow(d, w).length).toBe(24); });
  it("applyWindow 25 length preserved", () => {
    const d = Array.from({length:25}, (_,k) => k+1);
    const w = Array.from({length:25}, () => 1);
    expect(applyWindow(d, w).length).toBe(25); });
  it("applyWindow 26 length preserved", () => {
    const d = Array.from({length:26}, (_,k) => k+1);
    const w = Array.from({length:26}, () => 1);
    expect(applyWindow(d, w).length).toBe(26); });
  it("applyWindow 27 length preserved", () => {
    const d = Array.from({length:27}, (_,k) => k+1);
    const w = Array.from({length:27}, () => 1);
    expect(applyWindow(d, w).length).toBe(27); });
  it("applyWindow 28 length preserved", () => {
    const d = Array.from({length:28}, (_,k) => k+1);
    const w = Array.from({length:28}, () => 1);
    expect(applyWindow(d, w).length).toBe(28); });
  it("applyWindow 29 length preserved", () => {
    const d = Array.from({length:29}, (_,k) => k+1);
    const w = Array.from({length:29}, () => 1);
    expect(applyWindow(d, w).length).toBe(29); });
  it("applyWindow 30 length preserved", () => {
    const d = Array.from({length:30}, (_,k) => k+1);
    const w = Array.from({length:30}, () => 1);
    expect(applyWindow(d, w).length).toBe(30); });
  it("applyWindow 31 length preserved", () => {
    const d = Array.from({length:31}, (_,k) => k+1);
    const w = Array.from({length:31}, () => 1);
    expect(applyWindow(d, w).length).toBe(31); });
  it("applyWindow 32 length preserved", () => {
    const d = Array.from({length:32}, (_,k) => k+1);
    const w = Array.from({length:32}, () => 1);
    expect(applyWindow(d, w).length).toBe(32); });
  it("applyWindow 33 length preserved", () => {
    const d = Array.from({length:33}, (_,k) => k+1);
    const w = Array.from({length:33}, () => 1);
    expect(applyWindow(d, w).length).toBe(33); });
  it("applyWindow 34 length preserved", () => {
    const d = Array.from({length:34}, (_,k) => k+1);
    const w = Array.from({length:34}, () => 1);
    expect(applyWindow(d, w).length).toBe(34); });
  it("applyWindow 35 length preserved", () => {
    const d = Array.from({length:35}, (_,k) => k+1);
    const w = Array.from({length:35}, () => 1);
    expect(applyWindow(d, w).length).toBe(35); });
  it("applyWindow 36 length preserved", () => {
    const d = Array.from({length:36}, (_,k) => k+1);
    const w = Array.from({length:36}, () => 1);
    expect(applyWindow(d, w).length).toBe(36); });
  it("applyWindow 37 length preserved", () => {
    const d = Array.from({length:37}, (_,k) => k+1);
    const w = Array.from({length:37}, () => 1);
    expect(applyWindow(d, w).length).toBe(37); });
  it("applyWindow 38 length preserved", () => {
    const d = Array.from({length:38}, (_,k) => k+1);
    const w = Array.from({length:38}, () => 1);
    expect(applyWindow(d, w).length).toBe(38); });
  it("applyWindow 39 length preserved", () => {
    const d = Array.from({length:39}, (_,k) => k+1);
    const w = Array.from({length:39}, () => 1);
    expect(applyWindow(d, w).length).toBe(39); });
  it("applyWindow 40 length preserved", () => {
    const d = Array.from({length:40}, (_,k) => k+1);
    const w = Array.from({length:40}, () => 1);
    expect(applyWindow(d, w).length).toBe(40); });
  it("applyWindow 41 length preserved", () => {
    const d = Array.from({length:41}, (_,k) => k+1);
    const w = Array.from({length:41}, () => 1);
    expect(applyWindow(d, w).length).toBe(41); });
  it("applyWindow 42 length preserved", () => {
    const d = Array.from({length:42}, (_,k) => k+1);
    const w = Array.from({length:42}, () => 1);
    expect(applyWindow(d, w).length).toBe(42); });
  it("applyWindow 43 length preserved", () => {
    const d = Array.from({length:43}, (_,k) => k+1);
    const w = Array.from({length:43}, () => 1);
    expect(applyWindow(d, w).length).toBe(43); });
  it("applyWindow 44 length preserved", () => {
    const d = Array.from({length:44}, (_,k) => k+1);
    const w = Array.from({length:44}, () => 1);
    expect(applyWindow(d, w).length).toBe(44); });
  it("applyWindow 45 length preserved", () => {
    const d = Array.from({length:45}, (_,k) => k+1);
    const w = Array.from({length:45}, () => 1);
    expect(applyWindow(d, w).length).toBe(45); });
  it("applyWindow 46 length preserved", () => {
    const d = Array.from({length:46}, (_,k) => k+1);
    const w = Array.from({length:46}, () => 1);
    expect(applyWindow(d, w).length).toBe(46); });
  it("applyWindow 47 length preserved", () => {
    const d = Array.from({length:47}, (_,k) => k+1);
    const w = Array.from({length:47}, () => 1);
    expect(applyWindow(d, w).length).toBe(47); });
  it("applyWindow 48 length preserved", () => {
    const d = Array.from({length:48}, (_,k) => k+1);
    const w = Array.from({length:48}, () => 1);
    expect(applyWindow(d, w).length).toBe(48); });
});

describe("magnitude", () => {
  it("empty is 0", () => { expect(magnitude([])).toBe(0); });
  it("[3,4] is 5", () => { expect(magnitude([3,4])).toBe(5); });
  it("magnitude 1 values >=0", () => {
    const d = Array.from({length:1}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 2 values >=0", () => {
    const d = Array.from({length:2}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 3 values >=0", () => {
    const d = Array.from({length:3}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 4 values >=0", () => {
    const d = Array.from({length:4}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 5 values >=0", () => {
    const d = Array.from({length:5}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 6 values >=0", () => {
    const d = Array.from({length:6}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 7 values >=0", () => {
    const d = Array.from({length:7}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 8 values >=0", () => {
    const d = Array.from({length:8}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 9 values >=0", () => {
    const d = Array.from({length:9}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 10 values >=0", () => {
    const d = Array.from({length:10}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 11 values >=0", () => {
    const d = Array.from({length:11}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 12 values >=0", () => {
    const d = Array.from({length:12}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 13 values >=0", () => {
    const d = Array.from({length:13}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 14 values >=0", () => {
    const d = Array.from({length:14}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 15 values >=0", () => {
    const d = Array.from({length:15}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 16 values >=0", () => {
    const d = Array.from({length:16}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 17 values >=0", () => {
    const d = Array.from({length:17}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 18 values >=0", () => {
    const d = Array.from({length:18}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 19 values >=0", () => {
    const d = Array.from({length:19}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 20 values >=0", () => {
    const d = Array.from({length:20}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 21 values >=0", () => {
    const d = Array.from({length:21}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 22 values >=0", () => {
    const d = Array.from({length:22}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 23 values >=0", () => {
    const d = Array.from({length:23}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 24 values >=0", () => {
    const d = Array.from({length:24}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 25 values >=0", () => {
    const d = Array.from({length:25}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 26 values >=0", () => {
    const d = Array.from({length:26}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 27 values >=0", () => {
    const d = Array.from({length:27}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 28 values >=0", () => {
    const d = Array.from({length:28}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 29 values >=0", () => {
    const d = Array.from({length:29}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 30 values >=0", () => {
    const d = Array.from({length:30}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 31 values >=0", () => {
    const d = Array.from({length:31}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 32 values >=0", () => {
    const d = Array.from({length:32}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 33 values >=0", () => {
    const d = Array.from({length:33}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 34 values >=0", () => {
    const d = Array.from({length:34}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 35 values >=0", () => {
    const d = Array.from({length:35}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 36 values >=0", () => {
    const d = Array.from({length:36}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 37 values >=0", () => {
    const d = Array.from({length:37}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 38 values >=0", () => {
    const d = Array.from({length:38}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 39 values >=0", () => {
    const d = Array.from({length:39}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 40 values >=0", () => {
    const d = Array.from({length:40}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 41 values >=0", () => {
    const d = Array.from({length:41}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 42 values >=0", () => {
    const d = Array.from({length:42}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 43 values >=0", () => {
    const d = Array.from({length:43}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 44 values >=0", () => {
    const d = Array.from({length:44}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 45 values >=0", () => {
    const d = Array.from({length:45}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 46 values >=0", () => {
    const d = Array.from({length:46}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 47 values >=0", () => {
    const d = Array.from({length:47}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
  it("magnitude 48 values >=0", () => {
    const d = Array.from({length:48}, (_,k) => k+1);
    expect(magnitude(d)).toBeGreaterThanOrEqual(0); });
});

describe("peakDetect", () => {
  it("no peaks in flat signal", () => { expect(peakDetect([1,1,1,1])).toEqual([]); });
  it("single peak detected", () => { expect(peakDetect([0,1,0])).toEqual([1]); });
  it("peakDetect no negative threshold 1", () => {
    const d = Array.from({length:3}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 2", () => {
    const d = Array.from({length:4}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 3", () => {
    const d = Array.from({length:5}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 4", () => {
    const d = Array.from({length:6}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 5", () => {
    const d = Array.from({length:7}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 6", () => {
    const d = Array.from({length:8}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 7", () => {
    const d = Array.from({length:9}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 8", () => {
    const d = Array.from({length:10}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 9", () => {
    const d = Array.from({length:11}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 10", () => {
    const d = Array.from({length:12}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 11", () => {
    const d = Array.from({length:13}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 12", () => {
    const d = Array.from({length:14}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 13", () => {
    const d = Array.from({length:15}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 14", () => {
    const d = Array.from({length:16}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 15", () => {
    const d = Array.from({length:17}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 16", () => {
    const d = Array.from({length:18}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 17", () => {
    const d = Array.from({length:19}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 18", () => {
    const d = Array.from({length:20}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 19", () => {
    const d = Array.from({length:21}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 20", () => {
    const d = Array.from({length:22}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 21", () => {
    const d = Array.from({length:23}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 22", () => {
    const d = Array.from({length:24}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 23", () => {
    const d = Array.from({length:25}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 24", () => {
    const d = Array.from({length:26}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 25", () => {
    const d = Array.from({length:27}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 26", () => {
    const d = Array.from({length:28}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 27", () => {
    const d = Array.from({length:29}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 28", () => {
    const d = Array.from({length:30}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 29", () => {
    const d = Array.from({length:31}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 30", () => {
    const d = Array.from({length:32}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 31", () => {
    const d = Array.from({length:33}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 32", () => {
    const d = Array.from({length:34}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 33", () => {
    const d = Array.from({length:35}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 34", () => {
    const d = Array.from({length:36}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 35", () => {
    const d = Array.from({length:37}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 36", () => {
    const d = Array.from({length:38}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 37", () => {
    const d = Array.from({length:39}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 38", () => {
    const d = Array.from({length:40}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 39", () => {
    const d = Array.from({length:41}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 40", () => {
    const d = Array.from({length:42}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 41", () => {
    const d = Array.from({length:43}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 42", () => {
    const d = Array.from({length:44}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 43", () => {
    const d = Array.from({length:45}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 44", () => {
    const d = Array.from({length:46}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 45", () => {
    const d = Array.from({length:47}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 46", () => {
    const d = Array.from({length:48}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 47", () => {
    const d = Array.from({length:49}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
  it("peakDetect no negative threshold 48", () => {
    const d = Array.from({length:50}, (_,k) => Math.sin(k));
    expect(Array.isArray(peakDetect(d))).toBe(true); });
});

describe("zeroCrossings", () => {
  it("no crossings in constant", () => { expect(zeroCrossings([1,1,1])).toBe(0); });
  it("[1,-1] has 1 crossing", () => { expect(zeroCrossings([1,-1])).toBe(1); });
  it("zeroCrossings 1 returns number", () => {
    const d = Array.from({length:3}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 2 returns number", () => {
    const d = Array.from({length:4}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 3 returns number", () => {
    const d = Array.from({length:5}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 4 returns number", () => {
    const d = Array.from({length:6}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 5 returns number", () => {
    const d = Array.from({length:7}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 6 returns number", () => {
    const d = Array.from({length:8}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 7 returns number", () => {
    const d = Array.from({length:9}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 8 returns number", () => {
    const d = Array.from({length:10}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 9 returns number", () => {
    const d = Array.from({length:11}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 10 returns number", () => {
    const d = Array.from({length:12}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 11 returns number", () => {
    const d = Array.from({length:13}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 12 returns number", () => {
    const d = Array.from({length:14}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 13 returns number", () => {
    const d = Array.from({length:15}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 14 returns number", () => {
    const d = Array.from({length:16}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 15 returns number", () => {
    const d = Array.from({length:17}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 16 returns number", () => {
    const d = Array.from({length:18}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 17 returns number", () => {
    const d = Array.from({length:19}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 18 returns number", () => {
    const d = Array.from({length:20}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 19 returns number", () => {
    const d = Array.from({length:21}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 20 returns number", () => {
    const d = Array.from({length:22}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 21 returns number", () => {
    const d = Array.from({length:23}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 22 returns number", () => {
    const d = Array.from({length:24}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 23 returns number", () => {
    const d = Array.from({length:25}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 24 returns number", () => {
    const d = Array.from({length:26}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 25 returns number", () => {
    const d = Array.from({length:27}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 26 returns number", () => {
    const d = Array.from({length:28}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 27 returns number", () => {
    const d = Array.from({length:29}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 28 returns number", () => {
    const d = Array.from({length:30}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 29 returns number", () => {
    const d = Array.from({length:31}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 30 returns number", () => {
    const d = Array.from({length:32}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 31 returns number", () => {
    const d = Array.from({length:33}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 32 returns number", () => {
    const d = Array.from({length:34}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 33 returns number", () => {
    const d = Array.from({length:35}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 34 returns number", () => {
    const d = Array.from({length:36}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 35 returns number", () => {
    const d = Array.from({length:37}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 36 returns number", () => {
    const d = Array.from({length:38}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 37 returns number", () => {
    const d = Array.from({length:39}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 38 returns number", () => {
    const d = Array.from({length:40}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 39 returns number", () => {
    const d = Array.from({length:41}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 40 returns number", () => {
    const d = Array.from({length:42}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 41 returns number", () => {
    const d = Array.from({length:43}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 42 returns number", () => {
    const d = Array.from({length:44}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 43 returns number", () => {
    const d = Array.from({length:45}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 44 returns number", () => {
    const d = Array.from({length:46}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 45 returns number", () => {
    const d = Array.from({length:47}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 46 returns number", () => {
    const d = Array.from({length:48}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 47 returns number", () => {
    const d = Array.from({length:49}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
  it("zeroCrossings 48 returns number", () => {
    const d = Array.from({length:50}, (_,k) => Math.sin(k * 0.5));
    expect(typeof zeroCrossings(d)).toBe("number"); });
});

describe("quantize", () => {
  it("quantize 0.5 at 10 levels is 0.5", () => { expect(quantize(0.5, 10)).toBeCloseTo(0.5); });
  it("quantize 0 is 0", () => { expect(quantize(0, 100)).toBe(0); });
  it("quantize 0.01 at 100 levels", () => { expect(typeof quantize(0.01, 100)).toBe("number"); });
  it("quantize 0.02 at 100 levels", () => { expect(typeof quantize(0.02, 100)).toBe("number"); });
  it("quantize 0.03 at 100 levels", () => { expect(typeof quantize(0.03, 100)).toBe("number"); });
  it("quantize 0.04 at 100 levels", () => { expect(typeof quantize(0.04, 100)).toBe("number"); });
  it("quantize 0.05 at 100 levels", () => { expect(typeof quantize(0.05, 100)).toBe("number"); });
  it("quantize 0.06 at 100 levels", () => { expect(typeof quantize(0.06, 100)).toBe("number"); });
  it("quantize 0.07 at 100 levels", () => { expect(typeof quantize(0.07, 100)).toBe("number"); });
  it("quantize 0.08 at 100 levels", () => { expect(typeof quantize(0.08, 100)).toBe("number"); });
  it("quantize 0.09 at 100 levels", () => { expect(typeof quantize(0.09, 100)).toBe("number"); });
  it("quantize 0.1 at 100 levels", () => { expect(typeof quantize(0.1, 100)).toBe("number"); });
  it("quantize 0.11 at 100 levels", () => { expect(typeof quantize(0.11, 100)).toBe("number"); });
  it("quantize 0.12 at 100 levels", () => { expect(typeof quantize(0.12, 100)).toBe("number"); });
  it("quantize 0.13 at 100 levels", () => { expect(typeof quantize(0.13, 100)).toBe("number"); });
  it("quantize 0.14 at 100 levels", () => { expect(typeof quantize(0.14, 100)).toBe("number"); });
  it("quantize 0.15 at 100 levels", () => { expect(typeof quantize(0.15, 100)).toBe("number"); });
  it("quantize 0.16 at 100 levels", () => { expect(typeof quantize(0.16, 100)).toBe("number"); });
  it("quantize 0.17 at 100 levels", () => { expect(typeof quantize(0.17, 100)).toBe("number"); });
  it("quantize 0.18 at 100 levels", () => { expect(typeof quantize(0.18, 100)).toBe("number"); });
  it("quantize 0.19 at 100 levels", () => { expect(typeof quantize(0.19, 100)).toBe("number"); });
  it("quantize 0.2 at 100 levels", () => { expect(typeof quantize(0.2, 100)).toBe("number"); });
  it("quantize 0.21 at 100 levels", () => { expect(typeof quantize(0.21, 100)).toBe("number"); });
  it("quantize 0.22 at 100 levels", () => { expect(typeof quantize(0.22, 100)).toBe("number"); });
  it("quantize 0.23 at 100 levels", () => { expect(typeof quantize(0.23, 100)).toBe("number"); });
  it("quantize 0.24 at 100 levels", () => { expect(typeof quantize(0.24, 100)).toBe("number"); });
  it("quantize 0.25 at 100 levels", () => { expect(typeof quantize(0.25, 100)).toBe("number"); });
  it("quantize 0.26 at 100 levels", () => { expect(typeof quantize(0.26, 100)).toBe("number"); });
  it("quantize 0.27 at 100 levels", () => { expect(typeof quantize(0.27, 100)).toBe("number"); });
  it("quantize 0.28 at 100 levels", () => { expect(typeof quantize(0.28, 100)).toBe("number"); });
  it("quantize 0.29 at 100 levels", () => { expect(typeof quantize(0.29, 100)).toBe("number"); });
  it("quantize 0.3 at 100 levels", () => { expect(typeof quantize(0.3, 100)).toBe("number"); });
  it("quantize 0.31 at 100 levels", () => { expect(typeof quantize(0.31, 100)).toBe("number"); });
  it("quantize 0.32 at 100 levels", () => { expect(typeof quantize(0.32, 100)).toBe("number"); });
  it("quantize 0.33 at 100 levels", () => { expect(typeof quantize(0.33, 100)).toBe("number"); });
  it("quantize 0.34 at 100 levels", () => { expect(typeof quantize(0.34, 100)).toBe("number"); });
  it("quantize 0.35 at 100 levels", () => { expect(typeof quantize(0.35, 100)).toBe("number"); });
  it("quantize 0.36 at 100 levels", () => { expect(typeof quantize(0.36, 100)).toBe("number"); });
  it("quantize 0.37 at 100 levels", () => { expect(typeof quantize(0.37, 100)).toBe("number"); });
  it("quantize 0.38 at 100 levels", () => { expect(typeof quantize(0.38, 100)).toBe("number"); });
  it("quantize 0.39 at 100 levels", () => { expect(typeof quantize(0.39, 100)).toBe("number"); });
  it("quantize 0.4 at 100 levels", () => { expect(typeof quantize(0.4, 100)).toBe("number"); });
  it("quantize 0.41 at 100 levels", () => { expect(typeof quantize(0.41, 100)).toBe("number"); });
  it("quantize 0.42 at 100 levels", () => { expect(typeof quantize(0.42, 100)).toBe("number"); });
  it("quantize 0.43 at 100 levels", () => { expect(typeof quantize(0.43, 100)).toBe("number"); });
  it("quantize 0.44 at 100 levels", () => { expect(typeof quantize(0.44, 100)).toBe("number"); });
  it("quantize 0.45 at 100 levels", () => { expect(typeof quantize(0.45, 100)).toBe("number"); });
  it("quantize 0.46 at 100 levels", () => { expect(typeof quantize(0.46, 100)).toBe("number"); });
  it("quantize 0.47 at 100 levels", () => { expect(typeof quantize(0.47, 100)).toBe("number"); });
  it("quantize 0.48 at 100 levels", () => { expect(typeof quantize(0.48, 100)).toBe("number"); });
});

describe("exponentialMovingAverage", () => {
  it("empty returns empty", () => { expect(exponentialMovingAverage([], 0.5)).toEqual([]); });
  it("single value preserved", () => { expect(exponentialMovingAverage([5], 0.5)).toEqual([5]); });
  it("EMA length 2", () => {
    const d = Array.from({length:2}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(2); });
  it("EMA length 3", () => {
    const d = Array.from({length:3}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(3); });
  it("EMA length 4", () => {
    const d = Array.from({length:4}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(4); });
  it("EMA length 5", () => {
    const d = Array.from({length:5}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(5); });
  it("EMA length 6", () => {
    const d = Array.from({length:6}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(6); });
  it("EMA length 7", () => {
    const d = Array.from({length:7}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(7); });
  it("EMA length 8", () => {
    const d = Array.from({length:8}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(8); });
  it("EMA length 9", () => {
    const d = Array.from({length:9}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(9); });
  it("EMA length 10", () => {
    const d = Array.from({length:10}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(10); });
  it("EMA length 11", () => {
    const d = Array.from({length:11}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(11); });
  it("EMA length 12", () => {
    const d = Array.from({length:12}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(12); });
  it("EMA length 13", () => {
    const d = Array.from({length:13}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(13); });
  it("EMA length 14", () => {
    const d = Array.from({length:14}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(14); });
  it("EMA length 15", () => {
    const d = Array.from({length:15}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(15); });
  it("EMA length 16", () => {
    const d = Array.from({length:16}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(16); });
  it("EMA length 17", () => {
    const d = Array.from({length:17}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(17); });
  it("EMA length 18", () => {
    const d = Array.from({length:18}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(18); });
  it("EMA length 19", () => {
    const d = Array.from({length:19}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(19); });
  it("EMA length 20", () => {
    const d = Array.from({length:20}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(20); });
  it("EMA length 21", () => {
    const d = Array.from({length:21}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(21); });
  it("EMA length 22", () => {
    const d = Array.from({length:22}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(22); });
  it("EMA length 23", () => {
    const d = Array.from({length:23}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(23); });
  it("EMA length 24", () => {
    const d = Array.from({length:24}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(24); });
  it("EMA length 25", () => {
    const d = Array.from({length:25}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(25); });
  it("EMA length 26", () => {
    const d = Array.from({length:26}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(26); });
  it("EMA length 27", () => {
    const d = Array.from({length:27}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(27); });
  it("EMA length 28", () => {
    const d = Array.from({length:28}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(28); });
  it("EMA length 29", () => {
    const d = Array.from({length:29}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(29); });
  it("EMA length 30", () => {
    const d = Array.from({length:30}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(30); });
  it("EMA length 31", () => {
    const d = Array.from({length:31}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(31); });
  it("EMA length 32", () => {
    const d = Array.from({length:32}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(32); });
  it("EMA length 33", () => {
    const d = Array.from({length:33}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(33); });
  it("EMA length 34", () => {
    const d = Array.from({length:34}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(34); });
  it("EMA length 35", () => {
    const d = Array.from({length:35}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(35); });
  it("EMA length 36", () => {
    const d = Array.from({length:36}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(36); });
  it("EMA length 37", () => {
    const d = Array.from({length:37}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(37); });
  it("EMA length 38", () => {
    const d = Array.from({length:38}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(38); });
  it("EMA length 39", () => {
    const d = Array.from({length:39}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(39); });
  it("EMA length 40", () => {
    const d = Array.from({length:40}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(40); });
  it("EMA length 41", () => {
    const d = Array.from({length:41}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(41); });
  it("EMA length 42", () => {
    const d = Array.from({length:42}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(42); });
  it("EMA length 43", () => {
    const d = Array.from({length:43}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(43); });
  it("EMA length 44", () => {
    const d = Array.from({length:44}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(44); });
  it("EMA length 45", () => {
    const d = Array.from({length:45}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(45); });
  it("EMA length 46", () => {
    const d = Array.from({length:46}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(46); });
  it("EMA length 47", () => {
    const d = Array.from({length:47}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(47); });
  it("EMA length 48", () => {
    const d = Array.from({length:48}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(48); });
  it("EMA length 49", () => {
    const d = Array.from({length:49}, (_,k) => k+1);
    expect(exponentialMovingAverage(d, 0.3).length).toBe(49); });
});
