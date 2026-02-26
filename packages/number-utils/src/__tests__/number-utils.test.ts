// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  clamp, lerp, remap, roundTo, floorTo, ceilTo, toFixed,
  isPrime, gcd, lcm, factorial, fibonacci,
  sumArray, product, mean, median, mode,
  variance, stdDev, percentile, normalize, range,
  isEven, isOdd, isInteger, isFiniteNumber, inRange,
  toRoman, fromRoman, formatWithCommas, safeDiv,
} from '../number-utils';

describe('clamp', () => {
  it('clamps 5 to [0,10] => 5', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it('clamps -5 to [0,10] => 0', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });
  it('clamps 15 to [0,10] => 10', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
  it('clamps 0 to [0,10] => 0', () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });
  it('clamps 10 to [0,10] => 10', () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });
  it('clamps 5 to [5,5] => 5', () => {
    expect(clamp(5, 5, 5)).toBe(5);
  });
  it('clamps -100 to [-10,10] => -10', () => {
    expect(clamp(-100, -10, 10)).toBe(-10);
  });
  it('clamps 100 to [-10,10] => 10', () => {
    expect(clamp(100, -10, 10)).toBe(10);
  });
  it('clamps 0 to [-10,10] => 0', () => {
    expect(clamp(0, -10, 10)).toBe(0);
  });
  it('clamps 3 to [3,4] => 3', () => {
    expect(clamp(3, 3, 4)).toBe(3);
  });
  it('clamp generated 0: clamp(-20,-10,40)=-10', () => {
    expect(clamp(-20, -10, 40)).toBe(-10);
  });
  it('clamp generated 1: clamp(-19,-10,40)=-10', () => {
    expect(clamp(-19, -10, 40)).toBe(-10);
  });
  it('clamp generated 2: clamp(-18,-10,40)=-10', () => {
    expect(clamp(-18, -10, 40)).toBe(-10);
  });
  it('clamp generated 3: clamp(-17,-10,40)=-10', () => {
    expect(clamp(-17, -10, 40)).toBe(-10);
  });
  it('clamp generated 4: clamp(-16,-10,40)=-10', () => {
    expect(clamp(-16, -10, 40)).toBe(-10);
  });
  it('clamp generated 5: clamp(-15,-10,40)=-10', () => {
    expect(clamp(-15, -10, 40)).toBe(-10);
  });
  it('clamp generated 6: clamp(-14,-10,40)=-10', () => {
    expect(clamp(-14, -10, 40)).toBe(-10);
  });
  it('clamp generated 7: clamp(-13,-10,40)=-10', () => {
    expect(clamp(-13, -10, 40)).toBe(-10);
  });
  it('clamp generated 8: clamp(-12,-10,40)=-10', () => {
    expect(clamp(-12, -10, 40)).toBe(-10);
  });
  it('clamp generated 9: clamp(-11,-10,40)=-10', () => {
    expect(clamp(-11, -10, 40)).toBe(-10);
  });
  it('clamp generated 10: clamp(-10,-10,40)=-10', () => {
    expect(clamp(-10, -10, 40)).toBe(-10);
  });
  it('clamp generated 11: clamp(-9,-10,40)=-9', () => {
    expect(clamp(-9, -10, 40)).toBe(-9);
  });
  it('clamp generated 12: clamp(-8,-10,40)=-8', () => {
    expect(clamp(-8, -10, 40)).toBe(-8);
  });
  it('clamp generated 13: clamp(-7,-10,40)=-7', () => {
    expect(clamp(-7, -10, 40)).toBe(-7);
  });
  it('clamp generated 14: clamp(-6,-10,40)=-6', () => {
    expect(clamp(-6, -10, 40)).toBe(-6);
  });
  it('clamp generated 15: clamp(-5,-10,40)=-5', () => {
    expect(clamp(-5, -10, 40)).toBe(-5);
  });
  it('clamp generated 16: clamp(-4,-10,40)=-4', () => {
    expect(clamp(-4, -10, 40)).toBe(-4);
  });
  it('clamp generated 17: clamp(-3,-10,40)=-3', () => {
    expect(clamp(-3, -10, 40)).toBe(-3);
  });
  it('clamp generated 18: clamp(-2,-10,40)=-2', () => {
    expect(clamp(-2, -10, 40)).toBe(-2);
  });
  it('clamp generated 19: clamp(-1,-10,40)=-1', () => {
    expect(clamp(-1, -10, 40)).toBe(-1);
  });
  it('clamp generated 20: clamp(0,-10,40)=0', () => {
    expect(clamp(0, -10, 40)).toBe(0);
  });
  it('clamp generated 21: clamp(1,-10,40)=1', () => {
    expect(clamp(1, -10, 40)).toBe(1);
  });
  it('clamp generated 22: clamp(2,-10,40)=2', () => {
    expect(clamp(2, -10, 40)).toBe(2);
  });
  it('clamp generated 23: clamp(3,-10,40)=3', () => {
    expect(clamp(3, -10, 40)).toBe(3);
  });
  it('clamp generated 24: clamp(4,-10,40)=4', () => {
    expect(clamp(4, -10, 40)).toBe(4);
  });
  it('clamp generated 25: clamp(5,-10,40)=5', () => {
    expect(clamp(5, -10, 40)).toBe(5);
  });
  it('clamp generated 26: clamp(6,-10,40)=6', () => {
    expect(clamp(6, -10, 40)).toBe(6);
  });
  it('clamp generated 27: clamp(7,-10,40)=7', () => {
    expect(clamp(7, -10, 40)).toBe(7);
  });
  it('clamp generated 28: clamp(8,-10,40)=8', () => {
    expect(clamp(8, -10, 40)).toBe(8);
  });
  it('clamp generated 29: clamp(9,-10,40)=9', () => {
    expect(clamp(9, -10, 40)).toBe(9);
  });
  it('clamp generated 30: clamp(10,-10,40)=10', () => {
    expect(clamp(10, -10, 40)).toBe(10);
  });
  it('clamp generated 31: clamp(11,-10,40)=11', () => {
    expect(clamp(11, -10, 40)).toBe(11);
  });
  it('clamp generated 32: clamp(12,-10,40)=12', () => {
    expect(clamp(12, -10, 40)).toBe(12);
  });
  it('clamp generated 33: clamp(13,-10,40)=13', () => {
    expect(clamp(13, -10, 40)).toBe(13);
  });
  it('clamp generated 34: clamp(14,-10,40)=14', () => {
    expect(clamp(14, -10, 40)).toBe(14);
  });
  it('clamp generated 35: clamp(15,-10,40)=15', () => {
    expect(clamp(15, -10, 40)).toBe(15);
  });
  it('clamp generated 36: clamp(16,-10,40)=16', () => {
    expect(clamp(16, -10, 40)).toBe(16);
  });
  it('clamp generated 37: clamp(17,-10,40)=17', () => {
    expect(clamp(17, -10, 40)).toBe(17);
  });
  it('clamp generated 38: clamp(18,-10,40)=18', () => {
    expect(clamp(18, -10, 40)).toBe(18);
  });
  it('clamp generated 39: clamp(19,-10,40)=19', () => {
    expect(clamp(19, -10, 40)).toBe(19);
  });
  it('clamp generated 40: clamp(20,-10,40)=20', () => {
    expect(clamp(20, -10, 40)).toBe(20);
  });
  it('clamp generated 41: clamp(21,-10,40)=21', () => {
    expect(clamp(21, -10, 40)).toBe(21);
  });
  it('clamp generated 42: clamp(22,-10,40)=22', () => {
    expect(clamp(22, -10, 40)).toBe(22);
  });
  it('clamp generated 43: clamp(23,-10,40)=23', () => {
    expect(clamp(23, -10, 40)).toBe(23);
  });
  it('clamp generated 44: clamp(24,-10,40)=24', () => {
    expect(clamp(24, -10, 40)).toBe(24);
  });
  it('clamp generated 45: clamp(25,-10,40)=25', () => {
    expect(clamp(25, -10, 40)).toBe(25);
  });
  it('clamp generated 46: clamp(26,-10,40)=26', () => {
    expect(clamp(26, -10, 40)).toBe(26);
  });
  it('clamp generated 47: clamp(27,-10,40)=27', () => {
    expect(clamp(27, -10, 40)).toBe(27);
  });
  it('clamp generated 48: clamp(28,-10,40)=28', () => {
    expect(clamp(28, -10, 40)).toBe(28);
  });
  it('clamp generated 49: clamp(29,-10,40)=29', () => {
    expect(clamp(29, -10, 40)).toBe(29);
  });
  it('clamp generated 50: clamp(30,-10,40)=30', () => {
    expect(clamp(30, -10, 40)).toBe(30);
  });
  it('clamp generated 51: clamp(31,-10,40)=31', () => {
    expect(clamp(31, -10, 40)).toBe(31);
  });
  it('clamp generated 52: clamp(32,-10,40)=32', () => {
    expect(clamp(32, -10, 40)).toBe(32);
  });
  it('clamp generated 53: clamp(33,-10,40)=33', () => {
    expect(clamp(33, -10, 40)).toBe(33);
  });
  it('clamp generated 54: clamp(34,-10,40)=34', () => {
    expect(clamp(34, -10, 40)).toBe(34);
  });
  it('clamp generated 55: clamp(35,-10,40)=35', () => {
    expect(clamp(35, -10, 40)).toBe(35);
  });
  it('clamp generated 56: clamp(36,-10,40)=36', () => {
    expect(clamp(36, -10, 40)).toBe(36);
  });
  it('clamp generated 57: clamp(37,-10,40)=37', () => {
    expect(clamp(37, -10, 40)).toBe(37);
  });
  it('clamp generated 58: clamp(38,-10,40)=38', () => {
    expect(clamp(38, -10, 40)).toBe(38);
  });
  it('clamp generated 59: clamp(39,-10,40)=39', () => {
    expect(clamp(39, -10, 40)).toBe(39);
  });
  it('clamp generated 60: clamp(40,-10,40)=40', () => {
    expect(clamp(40, -10, 40)).toBe(40);
  });
  it('clamp generated 61: clamp(41,-10,40)=40', () => {
    expect(clamp(41, -10, 40)).toBe(40);
  });
  it('clamp generated 62: clamp(42,-10,40)=40', () => {
    expect(clamp(42, -10, 40)).toBe(40);
  });
  it('clamp generated 63: clamp(43,-10,40)=40', () => {
    expect(clamp(43, -10, 40)).toBe(40);
  });
  it('clamp generated 64: clamp(44,-10,40)=40', () => {
    expect(clamp(44, -10, 40)).toBe(40);
  });
  it('clamp generated 65: clamp(45,-10,40)=40', () => {
    expect(clamp(45, -10, 40)).toBe(40);
  });
  it('clamp generated 66: clamp(46,-10,40)=40', () => {
    expect(clamp(46, -10, 40)).toBe(40);
  });
  it('clamp generated 67: clamp(47,-10,40)=40', () => {
    expect(clamp(47, -10, 40)).toBe(40);
  });
  it('clamp generated 68: clamp(48,-10,40)=40', () => {
    expect(clamp(48, -10, 40)).toBe(40);
  });
  it('clamp generated 69: clamp(49,-10,40)=40', () => {
    expect(clamp(49, -10, 40)).toBe(40);
  });
  it('clamp generated 70: clamp(50,-10,40)=40', () => {
    expect(clamp(50, -10, 40)).toBe(40);
  });
  it('clamp generated 71: clamp(51,-10,40)=40', () => {
    expect(clamp(51, -10, 40)).toBe(40);
  });
  it('clamp generated 72: clamp(52,-10,40)=40', () => {
    expect(clamp(52, -10, 40)).toBe(40);
  });
  it('clamp generated 73: clamp(53,-10,40)=40', () => {
    expect(clamp(53, -10, 40)).toBe(40);
  });
  it('clamp generated 74: clamp(54,-10,40)=40', () => {
    expect(clamp(54, -10, 40)).toBe(40);
  });
  it('clamp generated 75: clamp(55,-10,40)=40', () => {
    expect(clamp(55, -10, 40)).toBe(40);
  });
  it('clamp generated 76: clamp(56,-10,40)=40', () => {
    expect(clamp(56, -10, 40)).toBe(40);
  });
  it('clamp generated 77: clamp(57,-10,40)=40', () => {
    expect(clamp(57, -10, 40)).toBe(40);
  });
  it('clamp generated 78: clamp(58,-10,40)=40', () => {
    expect(clamp(58, -10, 40)).toBe(40);
  });
  it('clamp generated 79: clamp(59,-10,40)=40', () => {
    expect(clamp(59, -10, 40)).toBe(40);
  });
  it('clamp generated 80: clamp(60,-10,40)=40', () => {
    expect(clamp(60, -10, 40)).toBe(40);
  });
  it('clamp generated 81: clamp(61,-10,40)=40', () => {
    expect(clamp(61, -10, 40)).toBe(40);
  });
  it('clamp generated 82: clamp(62,-10,40)=40', () => {
    expect(clamp(62, -10, 40)).toBe(40);
  });
  it('clamp generated 83: clamp(63,-10,40)=40', () => {
    expect(clamp(63, -10, 40)).toBe(40);
  });
  it('clamp generated 84: clamp(64,-10,40)=40', () => {
    expect(clamp(64, -10, 40)).toBe(40);
  });
  it('clamp generated 85: clamp(65,-10,40)=40', () => {
    expect(clamp(65, -10, 40)).toBe(40);
  });
  it('clamp generated 86: clamp(66,-10,40)=40', () => {
    expect(clamp(66, -10, 40)).toBe(40);
  });
  it('clamp generated 87: clamp(67,-10,40)=40', () => {
    expect(clamp(67, -10, 40)).toBe(40);
  });
  it('clamp generated 88: clamp(68,-10,40)=40', () => {
    expect(clamp(68, -10, 40)).toBe(40);
  });
  it('clamp generated 89: clamp(69,-10,40)=40', () => {
    expect(clamp(69, -10, 40)).toBe(40);
  });
});

describe('lerp', () => {
  it('lerp(0,10,0)~=0', () => {
    expect(lerp(0, 10, 0)).toBeCloseTo(0, 5);
  });
  it('lerp(0,10,1)~=10', () => {
    expect(lerp(0, 10, 1)).toBeCloseTo(10, 5);
  });
  it('lerp(1,11,0)~=1', () => {
    expect(lerp(1, 11, 0)).toBeCloseTo(1, 5);
  });
  it('lerp(1,11,1)~=11', () => {
    expect(lerp(1, 11, 1)).toBeCloseTo(11, 5);
  });
  it('lerp(2,12,0)~=2', () => {
    expect(lerp(2, 12, 0)).toBeCloseTo(2, 5);
  });
  it('lerp(2,12,1)~=12', () => {
    expect(lerp(2, 12, 1)).toBeCloseTo(12, 5);
  });
  it('lerp(3,13,0)~=3', () => {
    expect(lerp(3, 13, 0)).toBeCloseTo(3, 5);
  });
  it('lerp(3,13,1)~=13', () => {
    expect(lerp(3, 13, 1)).toBeCloseTo(13, 5);
  });
  it('lerp(4,14,0)~=4', () => {
    expect(lerp(4, 14, 0)).toBeCloseTo(4, 5);
  });
  it('lerp(4,14,1)~=14', () => {
    expect(lerp(4, 14, 1)).toBeCloseTo(14, 5);
  });
  it('lerp(5,15,0)~=5', () => {
    expect(lerp(5, 15, 0)).toBeCloseTo(5, 5);
  });
  it('lerp(5,15,1)~=15', () => {
    expect(lerp(5, 15, 1)).toBeCloseTo(15, 5);
  });
  it('lerp(6,16,0)~=6', () => {
    expect(lerp(6, 16, 0)).toBeCloseTo(6, 5);
  });
  it('lerp(6,16,1)~=16', () => {
    expect(lerp(6, 16, 1)).toBeCloseTo(16, 5);
  });
  it('lerp(7,17,0)~=7', () => {
    expect(lerp(7, 17, 0)).toBeCloseTo(7, 5);
  });
  it('lerp(7,17,1)~=17', () => {
    expect(lerp(7, 17, 1)).toBeCloseTo(17, 5);
  });
  it('lerp(8,18,0)~=8', () => {
    expect(lerp(8, 18, 0)).toBeCloseTo(8, 5);
  });
  it('lerp(8,18,1)~=18', () => {
    expect(lerp(8, 18, 1)).toBeCloseTo(18, 5);
  });
  it('lerp(9,19,0)~=9', () => {
    expect(lerp(9, 19, 0)).toBeCloseTo(9, 5);
  });
  it('lerp(9,19,1)~=19', () => {
    expect(lerp(9, 19, 1)).toBeCloseTo(19, 5);
  });
  it('lerp(10,20,0)~=10', () => {
    expect(lerp(10, 20, 0)).toBeCloseTo(10, 5);
  });
  it('lerp(10,20,1)~=20', () => {
    expect(lerp(10, 20, 1)).toBeCloseTo(20, 5);
  });
  it('lerp(11,21,0)~=11', () => {
    expect(lerp(11, 21, 0)).toBeCloseTo(11, 5);
  });
  it('lerp(11,21,1)~=21', () => {
    expect(lerp(11, 21, 1)).toBeCloseTo(21, 5);
  });
  it('lerp(12,22,0)~=12', () => {
    expect(lerp(12, 22, 0)).toBeCloseTo(12, 5);
  });
  it('lerp(12,22,1)~=22', () => {
    expect(lerp(12, 22, 1)).toBeCloseTo(22, 5);
  });
  it('lerp(13,23,0)~=13', () => {
    expect(lerp(13, 23, 0)).toBeCloseTo(13, 5);
  });
  it('lerp(13,23,1)~=23', () => {
    expect(lerp(13, 23, 1)).toBeCloseTo(23, 5);
  });
  it('lerp(14,24,0)~=14', () => {
    expect(lerp(14, 24, 0)).toBeCloseTo(14, 5);
  });
  it('lerp(14,24,1)~=24', () => {
    expect(lerp(14, 24, 1)).toBeCloseTo(24, 5);
  });
  it('lerp(15,25,0)~=15', () => {
    expect(lerp(15, 25, 0)).toBeCloseTo(15, 5);
  });
  it('lerp(15,25,1)~=25', () => {
    expect(lerp(15, 25, 1)).toBeCloseTo(25, 5);
  });
  it('lerp(16,26,0)~=16', () => {
    expect(lerp(16, 26, 0)).toBeCloseTo(16, 5);
  });
  it('lerp(16,26,1)~=26', () => {
    expect(lerp(16, 26, 1)).toBeCloseTo(26, 5);
  });
  it('lerp(17,27,0)~=17', () => {
    expect(lerp(17, 27, 0)).toBeCloseTo(17, 5);
  });
  it('lerp(17,27,1)~=27', () => {
    expect(lerp(17, 27, 1)).toBeCloseTo(27, 5);
  });
  it('lerp(18,28,0)~=18', () => {
    expect(lerp(18, 28, 0)).toBeCloseTo(18, 5);
  });
  it('lerp(18,28,1)~=28', () => {
    expect(lerp(18, 28, 1)).toBeCloseTo(28, 5);
  });
  it('lerp(19,29,0)~=19', () => {
    expect(lerp(19, 29, 0)).toBeCloseTo(19, 5);
  });
  it('lerp(19,29,1)~=29', () => {
    expect(lerp(19, 29, 1)).toBeCloseTo(29, 5);
  });
  it('lerp(0,20,0.5)~=10.0', () => {
    expect(lerp(0, 20, 0.5)).toBeCloseTo(10.0, 5);
  });
  it('lerp(2,22,0.5)~=12.0', () => {
    expect(lerp(2, 22, 0.5)).toBeCloseTo(12.0, 5);
  });
  it('lerp(4,24,0.5)~=14.0', () => {
    expect(lerp(4, 24, 0.5)).toBeCloseTo(14.0, 5);
  });
  it('lerp(6,26,0.5)~=16.0', () => {
    expect(lerp(6, 26, 0.5)).toBeCloseTo(16.0, 5);
  });
  it('lerp(8,28,0.5)~=18.0', () => {
    expect(lerp(8, 28, 0.5)).toBeCloseTo(18.0, 5);
  });
  it('lerp(10,30,0.5)~=20.0', () => {
    expect(lerp(10, 30, 0.5)).toBeCloseTo(20.0, 5);
  });
  it('lerp(12,32,0.5)~=22.0', () => {
    expect(lerp(12, 32, 0.5)).toBeCloseTo(22.0, 5);
  });
  it('lerp(14,34,0.5)~=24.0', () => {
    expect(lerp(14, 34, 0.5)).toBeCloseTo(24.0, 5);
  });
  it('lerp(16,36,0.5)~=26.0', () => {
    expect(lerp(16, 36, 0.5)).toBeCloseTo(26.0, 5);
  });
  it('lerp(18,38,0.5)~=28.0', () => {
    expect(lerp(18, 38, 0.5)).toBeCloseTo(28.0, 5);
  });
  it('lerp(20,40,0.5)~=30.0', () => {
    expect(lerp(20, 40, 0.5)).toBeCloseTo(30.0, 5);
  });
  it('lerp(22,42,0.5)~=32.0', () => {
    expect(lerp(22, 42, 0.5)).toBeCloseTo(32.0, 5);
  });
  it('lerp(24,44,0.5)~=34.0', () => {
    expect(lerp(24, 44, 0.5)).toBeCloseTo(34.0, 5);
  });
  it('lerp(26,46,0.5)~=36.0', () => {
    expect(lerp(26, 46, 0.5)).toBeCloseTo(36.0, 5);
  });
  it('lerp(28,48,0.5)~=38.0', () => {
    expect(lerp(28, 48, 0.5)).toBeCloseTo(38.0, 5);
  });
  it('lerp(30,50,0.5)~=40.0', () => {
    expect(lerp(30, 50, 0.5)).toBeCloseTo(40.0, 5);
  });
  it('lerp(32,52,0.5)~=42.0', () => {
    expect(lerp(32, 52, 0.5)).toBeCloseTo(42.0, 5);
  });
  it('lerp(34,54,0.5)~=44.0', () => {
    expect(lerp(34, 54, 0.5)).toBeCloseTo(44.0, 5);
  });
  it('lerp(36,56,0.5)~=46.0', () => {
    expect(lerp(36, 56, 0.5)).toBeCloseTo(46.0, 5);
  });
  it('lerp(38,58,0.5)~=48.0', () => {
    expect(lerp(38, 58, 0.5)).toBeCloseTo(48.0, 5);
  });
  it('lerp(0,40,0.25)~=10.0', () => {
    expect(lerp(0, 40, 0.25)).toBeCloseTo(10.0, 5);
  });
  it('lerp(1,41,0.25)~=11.0', () => {
    expect(lerp(1, 41, 0.25)).toBeCloseTo(11.0, 5);
  });
  it('lerp(2,42,0.25)~=12.0', () => {
    expect(lerp(2, 42, 0.25)).toBeCloseTo(12.0, 5);
  });
  it('lerp(3,43,0.25)~=13.0', () => {
    expect(lerp(3, 43, 0.25)).toBeCloseTo(13.0, 5);
  });
  it('lerp(4,44,0.25)~=14.0', () => {
    expect(lerp(4, 44, 0.25)).toBeCloseTo(14.0, 5);
  });
  it('lerp(5,45,0.25)~=15.0', () => {
    expect(lerp(5, 45, 0.25)).toBeCloseTo(15.0, 5);
  });
  it('lerp(6,46,0.25)~=16.0', () => {
    expect(lerp(6, 46, 0.25)).toBeCloseTo(16.0, 5);
  });
  it('lerp(7,47,0.25)~=17.0', () => {
    expect(lerp(7, 47, 0.25)).toBeCloseTo(17.0, 5);
  });
  it('lerp(8,48,0.25)~=18.0', () => {
    expect(lerp(8, 48, 0.25)).toBeCloseTo(18.0, 5);
  });
  it('lerp(9,49,0.25)~=19.0', () => {
    expect(lerp(9, 49, 0.25)).toBeCloseTo(19.0, 5);
  });
  it('lerp(10,50,0.25)~=20.0', () => {
    expect(lerp(10, 50, 0.25)).toBeCloseTo(20.0, 5);
  });
  it('lerp(11,51,0.25)~=21.0', () => {
    expect(lerp(11, 51, 0.25)).toBeCloseTo(21.0, 5);
  });
  it('lerp(12,52,0.25)~=22.0', () => {
    expect(lerp(12, 52, 0.25)).toBeCloseTo(22.0, 5);
  });
  it('lerp(13,53,0.25)~=23.0', () => {
    expect(lerp(13, 53, 0.25)).toBeCloseTo(23.0, 5);
  });
  it('lerp(14,54,0.25)~=24.0', () => {
    expect(lerp(14, 54, 0.25)).toBeCloseTo(24.0, 5);
  });
  it('lerp(15,55,0.25)~=25.0', () => {
    expect(lerp(15, 55, 0.25)).toBeCloseTo(25.0, 5);
  });
  it('lerp(16,56,0.25)~=26.0', () => {
    expect(lerp(16, 56, 0.25)).toBeCloseTo(26.0, 5);
  });
  it('lerp(17,57,0.25)~=27.0', () => {
    expect(lerp(17, 57, 0.25)).toBeCloseTo(27.0, 5);
  });
  it('lerp(18,58,0.25)~=28.0', () => {
    expect(lerp(18, 58, 0.25)).toBeCloseTo(28.0, 5);
  });
  it('lerp(19,59,0.25)~=29.0', () => {
    expect(lerp(19, 59, 0.25)).toBeCloseTo(29.0, 5);
  });
});

describe('remap', () => {
  it('remap(0,0,10,0,100)~=0', () => {
    expect(remap(0, 0, 10, 0, 100)).toBeCloseTo(0, 5);
  });
  it('remap(5,0,10,0,100)~=50', () => {
    expect(remap(5, 0, 10, 0, 100)).toBeCloseTo(50, 5);
  });
  it('remap(10,0,10,0,100)~=100', () => {
    expect(remap(10, 0, 10, 0, 100)).toBeCloseTo(100, 5);
  });
  it('remap(0,0,1,-1,1)~=-1', () => {
    expect(remap(0, 0, 1, -1, 1)).toBeCloseTo(-1, 5);
  });
  it('remap(1,0,1,-1,1)~=1', () => {
    expect(remap(1, 0, 1, -1, 1)).toBeCloseTo(1, 5);
  });
  it('remap(0.5,0,1,-1,1)~=0', () => {
    expect(remap(0.5, 0, 1, -1, 1)).toBeCloseTo(0, 5);
  });
  it('remap(5,0,10,10,20)~=15', () => {
    expect(remap(5, 0, 10, 10, 20)).toBeCloseTo(15, 5);
  });
  it('remap(0,0,100,0,1)~=0', () => {
    expect(remap(0, 0, 100, 0, 1)).toBeCloseTo(0, 5);
  });
  it('remap(100,0,100,0,1)~=1', () => {
    expect(remap(100, 0, 100, 0, 1)).toBeCloseTo(1, 5);
  });
  it('remap(50,0,100,0,1)~=0.5', () => {
    expect(remap(50, 0, 100, 0, 1)).toBeCloseTo(0.5, 5);
  });
  it('remap(0,0,100,0,10)~=0.0', () => {
    expect(remap(0, 0, 100, 0, 10)).toBeCloseTo(0.0, 5);
  });
  it('remap(5,0,100,0,10)~=0.5', () => {
    expect(remap(5, 0, 100, 0, 10)).toBeCloseTo(0.5, 5);
  });
  it('remap(10,0,100,0,10)~=1.0', () => {
    expect(remap(10, 0, 100, 0, 10)).toBeCloseTo(1.0, 5);
  });
  it('remap(15,0,100,0,10)~=1.5', () => {
    expect(remap(15, 0, 100, 0, 10)).toBeCloseTo(1.5, 5);
  });
  it('remap(20,0,100,0,10)~=2.0', () => {
    expect(remap(20, 0, 100, 0, 10)).toBeCloseTo(2.0, 5);
  });
  it('remap(25,0,100,0,10)~=2.5', () => {
    expect(remap(25, 0, 100, 0, 10)).toBeCloseTo(2.5, 5);
  });
  it('remap(30,0,100,0,10)~=3.0', () => {
    expect(remap(30, 0, 100, 0, 10)).toBeCloseTo(3.0, 5);
  });
  it('remap(35,0,100,0,10)~=3.5', () => {
    expect(remap(35, 0, 100, 0, 10)).toBeCloseTo(3.5, 5);
  });
  it('remap(40,0,100,0,10)~=4.0', () => {
    expect(remap(40, 0, 100, 0, 10)).toBeCloseTo(4.0, 5);
  });
  it('remap(45,0,100,0,10)~=4.5', () => {
    expect(remap(45, 0, 100, 0, 10)).toBeCloseTo(4.5, 5);
  });
  it('remap(50,0,100,0,10)~=5.0', () => {
    expect(remap(50, 0, 100, 0, 10)).toBeCloseTo(5.0, 5);
  });
  it('remap(55,0,100,0,10)~=5.5', () => {
    expect(remap(55, 0, 100, 0, 10)).toBeCloseTo(5.5, 5);
  });
  it('remap(60,0,100,0,10)~=6.0', () => {
    expect(remap(60, 0, 100, 0, 10)).toBeCloseTo(6.0, 5);
  });
  it('remap(65,0,100,0,10)~=6.5', () => {
    expect(remap(65, 0, 100, 0, 10)).toBeCloseTo(6.5, 5);
  });
  it('remap(70,0,100,0,10)~=7.0', () => {
    expect(remap(70, 0, 100, 0, 10)).toBeCloseTo(7.0, 5);
  });
  it('remap(75,0,100,0,10)~=7.5', () => {
    expect(remap(75, 0, 100, 0, 10)).toBeCloseTo(7.5, 5);
  });
  it('remap(80,0,100,0,10)~=8.0', () => {
    expect(remap(80, 0, 100, 0, 10)).toBeCloseTo(8.0, 5);
  });
  it('remap(85,0,100,0,10)~=8.5', () => {
    expect(remap(85, 0, 100, 0, 10)).toBeCloseTo(8.5, 5);
  });
  it('remap(90,0,100,0,10)~=9.0', () => {
    expect(remap(90, 0, 100, 0, 10)).toBeCloseTo(9.0, 5);
  });
  it('remap(95,0,100,0,10)~=9.5', () => {
    expect(remap(95, 0, 100, 0, 10)).toBeCloseTo(9.5, 5);
  });
});

describe('roundTo', () => {
  it('roundTo(0.25,1)~=0.3', () => {
    expect(roundTo(0.25, 1)).toBeCloseTo(0.3, 5);
  });
  it('roundTo(0.75,1)~=0.8', () => {
    expect(roundTo(0.75, 1)).toBeCloseTo(0.8, 5);
  });
  it('roundTo(1.25,1)~=1.3', () => {
    expect(roundTo(1.25, 1)).toBeCloseTo(1.3, 5);
  });
  it('roundTo(2.75,1)~=2.8', () => {
    expect(roundTo(2.75, 1)).toBeCloseTo(2.8, 5);
  });
  it('roundTo(1.0,2)~=1.0', () => {
    expect(roundTo(1.0, 2)).toBeCloseTo(1.0, 5);
  });
  it('roundTo(0.5,0)~=1', () => {
    expect(roundTo(0.5, 0)).toBeCloseTo(1, 5);
  });
  it('roundTo(2.4,0)~=2', () => {
    expect(roundTo(2.4, 0)).toBeCloseTo(2, 5);
  });
  it('roundTo(3.5,0)~=4', () => {
    expect(roundTo(3.5, 0)).toBeCloseTo(4, 5);
  });
  it('roundTo(3.14159,2)~=3.14', () => {
    expect(roundTo(3.14159, 2)).toBeCloseTo(3.14, 5);
  });
  it('roundTo(2.71828,3)~=2.718', () => {
    expect(roundTo(2.71828, 3)).toBeCloseTo(2.718, 5);
  });
  it('roundTo(0.0,1)~=0.0', () => {
    expect(roundTo(0.0, 1)).toBeCloseTo(0.0, 5);
  });
  it('roundTo(0.5,1)~=0.5', () => {
    expect(roundTo(0.5, 1)).toBeCloseTo(0.5, 5);
  });
  it('roundTo(1.0,1)~=1.0', () => {
    expect(roundTo(1.0, 1)).toBeCloseTo(1.0, 5);
  });
  it('roundTo(1.5,1)~=1.5', () => {
    expect(roundTo(1.5, 1)).toBeCloseTo(1.5, 5);
  });
  it('roundTo(2.0,1)~=2.0', () => {
    expect(roundTo(2.0, 1)).toBeCloseTo(2.0, 5);
  });
  it('roundTo(2.5,1)~=2.5', () => {
    expect(roundTo(2.5, 1)).toBeCloseTo(2.5, 5);
  });
  it('roundTo(3.0,1)~=3.0', () => {
    expect(roundTo(3.0, 1)).toBeCloseTo(3.0, 5);
  });
  it('roundTo(3.5,1)~=3.5', () => {
    expect(roundTo(3.5, 1)).toBeCloseTo(3.5, 5);
  });
  it('roundTo(4.0,1)~=4.0', () => {
    expect(roundTo(4.0, 1)).toBeCloseTo(4.0, 5);
  });
  it('roundTo(4.5,1)~=4.5', () => {
    expect(roundTo(4.5, 1)).toBeCloseTo(4.5, 5);
  });
  it('roundTo(5.0,1)~=5.0', () => {
    expect(roundTo(5.0, 1)).toBeCloseTo(5.0, 5);
  });
  it('roundTo(5.5,1)~=5.5', () => {
    expect(roundTo(5.5, 1)).toBeCloseTo(5.5, 5);
  });
  it('roundTo(6.0,1)~=6.0', () => {
    expect(roundTo(6.0, 1)).toBeCloseTo(6.0, 5);
  });
  it('roundTo(6.5,1)~=6.5', () => {
    expect(roundTo(6.5, 1)).toBeCloseTo(6.5, 5);
  });
  it('roundTo(7.0,1)~=7.0', () => {
    expect(roundTo(7.0, 1)).toBeCloseTo(7.0, 5);
  });
});

describe('floorTo', () => {
  it('floorTo(1.9,1)~=1.9', () => {
    expect(floorTo(1.9, 1)).toBeCloseTo(1.9, 5);
  });
  it('floorTo(1.1,1)~=1.1', () => {
    expect(floorTo(1.1, 1)).toBeCloseTo(1.1, 5);
  });
  it('floorTo(2.5,1)~=2.5', () => {
    expect(floorTo(2.5, 1)).toBeCloseTo(2.5, 5);
  });
  it('floorTo(0.9,0)~=0', () => {
    expect(floorTo(0.9, 0)).toBeCloseTo(0, 5);
  });
  it('floorTo(1.0,0)~=1', () => {
    expect(floorTo(1.0, 0)).toBeCloseTo(1, 5);
  });
  it('floorTo(3.14159,2)~=3.14', () => {
    expect(floorTo(3.14159, 2)).toBeCloseTo(3.14, 5);
  });
  it('floorTo(-1.5,1)~=-1.5', () => {
    expect(floorTo(-1.5, 1)).toBeCloseTo(-1.5, 5);
  });
  it('floorTo(0.1,0)~=0.0', () => {
    expect(floorTo(0.1, 0)).toBeCloseTo(0.0, 5);
  });
  it('floorTo(0.6,0)~=0.0', () => {
    expect(floorTo(0.6, 0)).toBeCloseTo(0.0, 5);
  });
  it('floorTo(1.1,0)~=1.0', () => {
    expect(floorTo(1.1, 0)).toBeCloseTo(1.0, 5);
  });
  it('floorTo(1.6,0)~=1.0', () => {
    expect(floorTo(1.6, 0)).toBeCloseTo(1.0, 5);
  });
  it('floorTo(2.1,0)~=2.0', () => {
    expect(floorTo(2.1, 0)).toBeCloseTo(2.0, 5);
  });
  it('floorTo(2.6,0)~=2.0', () => {
    expect(floorTo(2.6, 0)).toBeCloseTo(2.0, 5);
  });
  it('floorTo(3.1,0)~=3.0', () => {
    expect(floorTo(3.1, 0)).toBeCloseTo(3.0, 5);
  });
  it('floorTo(3.6,0)~=3.0', () => {
    expect(floorTo(3.6, 0)).toBeCloseTo(3.0, 5);
  });
  it('floorTo(4.1,0)~=4.0', () => {
    expect(floorTo(4.1, 0)).toBeCloseTo(4.0, 5);
  });
  it('floorTo(4.6,0)~=4.0', () => {
    expect(floorTo(4.6, 0)).toBeCloseTo(4.0, 5);
  });
  it('floorTo(5.1,0)~=5.0', () => {
    expect(floorTo(5.1, 0)).toBeCloseTo(5.0, 5);
  });
  it('floorTo(5.6,0)~=5.0', () => {
    expect(floorTo(5.6, 0)).toBeCloseTo(5.0, 5);
  });
  it('floorTo(6.1,0)~=6.0', () => {
    expect(floorTo(6.1, 0)).toBeCloseTo(6.0, 5);
  });
  it('floorTo(6.6,0)~=6.0', () => {
    expect(floorTo(6.6, 0)).toBeCloseTo(6.0, 5);
  });
  it('floorTo(7.1,0)~=7.0', () => {
    expect(floorTo(7.1, 0)).toBeCloseTo(7.0, 5);
  });
  it('floorTo(7.6,0)~=7.0', () => {
    expect(floorTo(7.6, 0)).toBeCloseTo(7.0, 5);
  });
  it('floorTo(8.1,0)~=8.0', () => {
    expect(floorTo(8.1, 0)).toBeCloseTo(8.0, 5);
  });
  it('floorTo(8.6,0)~=8.0', () => {
    expect(floorTo(8.6, 0)).toBeCloseTo(8.0, 5);
  });
});

describe('ceilTo', () => {
  it('ceilTo(1.1,1)~=1.1', () => {
    expect(ceilTo(1.1, 1)).toBeCloseTo(1.1, 5);
  });
  it('ceilTo(1.9,1)~=1.9', () => {
    expect(ceilTo(1.9, 1)).toBeCloseTo(1.9, 5);
  });
  it('ceilTo(2.1,0)~=3', () => {
    expect(ceilTo(2.1, 0)).toBeCloseTo(3, 5);
  });
  it('ceilTo(0.0,0)~=0', () => {
    expect(ceilTo(0.0, 0)).toBeCloseTo(0, 5);
  });
  it('ceilTo(3.14159,3)~=3.142', () => {
    expect(ceilTo(3.14159, 3)).toBeCloseTo(3.142, 5);
  });
  it('ceilTo(0.5,0)~=1', () => {
    expect(ceilTo(0.5, 0)).toBeCloseTo(1, 5);
  });
  it('ceilTo(0.1,0)~=1.0', () => {
    expect(ceilTo(0.1, 0)).toBeCloseTo(1.0, 5);
  });
  it('ceilTo(0.6,0)~=1.0', () => {
    expect(ceilTo(0.6, 0)).toBeCloseTo(1.0, 5);
  });
  it('ceilTo(1.1,0)~=2.0', () => {
    expect(ceilTo(1.1, 0)).toBeCloseTo(2.0, 5);
  });
  it('ceilTo(1.6,0)~=2.0', () => {
    expect(ceilTo(1.6, 0)).toBeCloseTo(2.0, 5);
  });
  it('ceilTo(2.1,0)~=3.0', () => {
    expect(ceilTo(2.1, 0)).toBeCloseTo(3.0, 5);
  });
  it('ceilTo(2.6,0)~=3.0', () => {
    expect(ceilTo(2.6, 0)).toBeCloseTo(3.0, 5);
  });
  it('ceilTo(3.1,0)~=4.0', () => {
    expect(ceilTo(3.1, 0)).toBeCloseTo(4.0, 5);
  });
  it('ceilTo(3.6,0)~=4.0', () => {
    expect(ceilTo(3.6, 0)).toBeCloseTo(4.0, 5);
  });
  it('ceilTo(4.1,0)~=5.0', () => {
    expect(ceilTo(4.1, 0)).toBeCloseTo(5.0, 5);
  });
  it('ceilTo(4.6,0)~=5.0', () => {
    expect(ceilTo(4.6, 0)).toBeCloseTo(5.0, 5);
  });
  it('ceilTo(5.1,0)~=6.0', () => {
    expect(ceilTo(5.1, 0)).toBeCloseTo(6.0, 5);
  });
  it('ceilTo(5.6,0)~=6.0', () => {
    expect(ceilTo(5.6, 0)).toBeCloseTo(6.0, 5);
  });
  it('ceilTo(6.1,0)~=7.0', () => {
    expect(ceilTo(6.1, 0)).toBeCloseTo(7.0, 5);
  });
  it('ceilTo(6.6,0)~=7.0', () => {
    expect(ceilTo(6.6, 0)).toBeCloseTo(7.0, 5);
  });
  it('ceilTo(7.1,0)~=8.0', () => {
    expect(ceilTo(7.1, 0)).toBeCloseTo(8.0, 5);
  });
  it('ceilTo(7.6,0)~=8.0', () => {
    expect(ceilTo(7.6, 0)).toBeCloseTo(8.0, 5);
  });
  it('ceilTo(8.1,0)~=9.0', () => {
    expect(ceilTo(8.1, 0)).toBeCloseTo(9.0, 5);
  });
  it('ceilTo(8.6,0)~=9.0', () => {
    expect(ceilTo(8.6, 0)).toBeCloseTo(9.0, 5);
  });
  it('ceilTo(9.1,0)~=10.0', () => {
    expect(ceilTo(9.1, 0)).toBeCloseTo(10.0, 5);
  });
});

describe('toFixed', () => {
  it('toFixed(3.14159,2)="3.14"', () => {
    expect(toFixed(3.14159, 2)).toBe('3.14');
  });
  it('toFixed(0,2)="0.00"', () => {
    expect(toFixed(0, 2)).toBe('0.00');
  });
  it('toFixed(1,0)="1"', () => {
    expect(toFixed(1, 0)).toBe('1');
  });
  it('toFixed(1000.5,1)="1000.5"', () => {
    expect(toFixed(1000.5, 1)).toBe('1000.5');
  });
  it('toFixed(-3.14,2)="-3.14"', () => {
    expect(toFixed(-3.14, 2)).toBe('-3.14');
  });
  it('toFixed(0.0,2)="0.00"', () => {
    expect(toFixed(0.0, 2)).toBe('0.00');
  });
  it('toFixed(1.5,2)="1.50"', () => {
    expect(toFixed(1.5, 2)).toBe('1.50');
  });
  it('toFixed(3.0,2)="3.00"', () => {
    expect(toFixed(3.0, 2)).toBe('3.00');
  });
  it('toFixed(4.5,2)="4.50"', () => {
    expect(toFixed(4.5, 2)).toBe('4.50');
  });
  it('toFixed(6.0,2)="6.00"', () => {
    expect(toFixed(6.0, 2)).toBe('6.00');
  });
  it('toFixed(7.5,2)="7.50"', () => {
    expect(toFixed(7.5, 2)).toBe('7.50');
  });
  it('toFixed(9.0,2)="9.00"', () => {
    expect(toFixed(9.0, 2)).toBe('9.00');
  });
  it('toFixed(10.5,2)="10.50"', () => {
    expect(toFixed(10.5, 2)).toBe('10.50');
  });
  it('toFixed(12.0,2)="12.00"', () => {
    expect(toFixed(12.0, 2)).toBe('12.00');
  });
  it('toFixed(13.5,2)="13.50"', () => {
    expect(toFixed(13.5, 2)).toBe('13.50');
  });
  it('toFixed(15.0,2)="15.00"', () => {
    expect(toFixed(15.0, 2)).toBe('15.00');
  });
  it('toFixed(16.5,2)="16.50"', () => {
    expect(toFixed(16.5, 2)).toBe('16.50');
  });
  it('toFixed(18.0,2)="18.00"', () => {
    expect(toFixed(18.0, 2)).toBe('18.00');
  });
  it('toFixed(19.5,2)="19.50"', () => {
    expect(toFixed(19.5, 2)).toBe('19.50');
  });
  it('toFixed(21.0,2)="21.00"', () => {
    expect(toFixed(21.0, 2)).toBe('21.00');
  });
  it('toFixed(22.5,2)="22.50"', () => {
    expect(toFixed(22.5, 2)).toBe('22.50');
  });
  it('toFixed(24.0,2)="24.00"', () => {
    expect(toFixed(24.0, 2)).toBe('24.00');
  });
  it('toFixed(25.5,2)="25.50"', () => {
    expect(toFixed(25.5, 2)).toBe('25.50');
  });
  it('toFixed(27.0,2)="27.00"', () => {
    expect(toFixed(27.0, 2)).toBe('27.00');
  });
  it('toFixed(28.5,2)="28.50"', () => {
    expect(toFixed(28.5, 2)).toBe('28.50');
  });
});

describe('isPrime', () => {
  it('isPrime(2) is true', () => {
    expect(isPrime(2)).toBe(true);
  });
  it('isPrime(3) is true', () => {
    expect(isPrime(3)).toBe(true);
  });
  it('isPrime(5) is true', () => {
    expect(isPrime(5)).toBe(true);
  });
  it('isPrime(7) is true', () => {
    expect(isPrime(7)).toBe(true);
  });
  it('isPrime(11) is true', () => {
    expect(isPrime(11)).toBe(true);
  });
  it('isPrime(13) is true', () => {
    expect(isPrime(13)).toBe(true);
  });
  it('isPrime(17) is true', () => {
    expect(isPrime(17)).toBe(true);
  });
  it('isPrime(19) is true', () => {
    expect(isPrime(19)).toBe(true);
  });
  it('isPrime(23) is true', () => {
    expect(isPrime(23)).toBe(true);
  });
  it('isPrime(29) is true', () => {
    expect(isPrime(29)).toBe(true);
  });
  it('isPrime(31) is true', () => {
    expect(isPrime(31)).toBe(true);
  });
  it('isPrime(37) is true', () => {
    expect(isPrime(37)).toBe(true);
  });
  it('isPrime(41) is true', () => {
    expect(isPrime(41)).toBe(true);
  });
  it('isPrime(43) is true', () => {
    expect(isPrime(43)).toBe(true);
  });
  it('isPrime(47) is true', () => {
    expect(isPrime(47)).toBe(true);
  });
  it('isPrime(53) is true', () => {
    expect(isPrime(53)).toBe(true);
  });
  it('isPrime(59) is true', () => {
    expect(isPrime(59)).toBe(true);
  });
  it('isPrime(61) is true', () => {
    expect(isPrime(61)).toBe(true);
  });
  it('isPrime(67) is true', () => {
    expect(isPrime(67)).toBe(true);
  });
  it('isPrime(71) is true', () => {
    expect(isPrime(71)).toBe(true);
  });
  it('isPrime(73) is true', () => {
    expect(isPrime(73)).toBe(true);
  });
  it('isPrime(79) is true', () => {
    expect(isPrime(79)).toBe(true);
  });
  it('isPrime(83) is true', () => {
    expect(isPrime(83)).toBe(true);
  });
  it('isPrime(89) is true', () => {
    expect(isPrime(89)).toBe(true);
  });
  it('isPrime(97) is true', () => {
    expect(isPrime(97)).toBe(true);
  });
  it('isPrime(101) is true', () => {
    expect(isPrime(101)).toBe(true);
  });
  it('isPrime(103) is true', () => {
    expect(isPrime(103)).toBe(true);
  });
  it('isPrime(107) is true', () => {
    expect(isPrime(107)).toBe(true);
  });
  it('isPrime(109) is true', () => {
    expect(isPrime(109)).toBe(true);
  });
  it('isPrime(113) is true', () => {
    expect(isPrime(113)).toBe(true);
  });
  it('isPrime(127) is true', () => {
    expect(isPrime(127)).toBe(true);
  });
  it('isPrime(131) is true', () => {
    expect(isPrime(131)).toBe(true);
  });
  it('isPrime(137) is true', () => {
    expect(isPrime(137)).toBe(true);
  });
  it('isPrime(139) is true', () => {
    expect(isPrime(139)).toBe(true);
  });
  it('isPrime(149) is true', () => {
    expect(isPrime(149)).toBe(true);
  });
  it('isPrime(151) is true', () => {
    expect(isPrime(151)).toBe(true);
  });
  it('isPrime(157) is true', () => {
    expect(isPrime(157)).toBe(true);
  });
  it('isPrime(163) is true', () => {
    expect(isPrime(163)).toBe(true);
  });
  it('isPrime(167) is true', () => {
    expect(isPrime(167)).toBe(true);
  });
  it('isPrime(173) is true', () => {
    expect(isPrime(173)).toBe(true);
  });
  it('isPrime(179) is true', () => {
    expect(isPrime(179)).toBe(true);
  });
  it('isPrime(181) is true', () => {
    expect(isPrime(181)).toBe(true);
  });
  it('isPrime(191) is true', () => {
    expect(isPrime(191)).toBe(true);
  });
  it('isPrime(193) is true', () => {
    expect(isPrime(193)).toBe(true);
  });
  it('isPrime(197) is true', () => {
    expect(isPrime(197)).toBe(true);
  });
  it('isPrime(199) is true', () => {
    expect(isPrime(199)).toBe(true);
  });
  it('isPrime(211) is true', () => {
    expect(isPrime(211)).toBe(true);
  });
  it('isPrime(223) is true', () => {
    expect(isPrime(223)).toBe(true);
  });
  it('isPrime(227) is true', () => {
    expect(isPrime(227)).toBe(true);
  });
  it('isPrime(229) is true', () => {
    expect(isPrime(229)).toBe(true);
  });
  it('isPrime(0) is false', () => {
    expect(isPrime(0)).toBe(false);
  });
  it('isPrime(1) is false', () => {
    expect(isPrime(1)).toBe(false);
  });
  it('isPrime(4) is false', () => {
    expect(isPrime(4)).toBe(false);
  });
  it('isPrime(6) is false', () => {
    expect(isPrime(6)).toBe(false);
  });
  it('isPrime(8) is false', () => {
    expect(isPrime(8)).toBe(false);
  });
  it('isPrime(9) is false', () => {
    expect(isPrime(9)).toBe(false);
  });
  it('isPrime(10) is false', () => {
    expect(isPrime(10)).toBe(false);
  });
  it('isPrime(12) is false', () => {
    expect(isPrime(12)).toBe(false);
  });
  it('isPrime(14) is false', () => {
    expect(isPrime(14)).toBe(false);
  });
  it('isPrime(15) is false', () => {
    expect(isPrime(15)).toBe(false);
  });
  it('isPrime(16) is false', () => {
    expect(isPrime(16)).toBe(false);
  });
  it('isPrime(18) is false', () => {
    expect(isPrime(18)).toBe(false);
  });
  it('isPrime(20) is false', () => {
    expect(isPrime(20)).toBe(false);
  });
  it('isPrime(21) is false', () => {
    expect(isPrime(21)).toBe(false);
  });
  it('isPrime(22) is false', () => {
    expect(isPrime(22)).toBe(false);
  });
  it('isPrime(24) is false', () => {
    expect(isPrime(24)).toBe(false);
  });
  it('isPrime(25) is false', () => {
    expect(isPrime(25)).toBe(false);
  });
  it('isPrime(26) is false', () => {
    expect(isPrime(26)).toBe(false);
  });
  it('isPrime(27) is false', () => {
    expect(isPrime(27)).toBe(false);
  });
  it('isPrime(28) is false', () => {
    expect(isPrime(28)).toBe(false);
  });
  it('isPrime(30) is false', () => {
    expect(isPrime(30)).toBe(false);
  });
  it('isPrime(32) is false', () => {
    expect(isPrime(32)).toBe(false);
  });
  it('isPrime(33) is false', () => {
    expect(isPrime(33)).toBe(false);
  });
  it('isPrime(34) is false', () => {
    expect(isPrime(34)).toBe(false);
  });
  it('isPrime(35) is false', () => {
    expect(isPrime(35)).toBe(false);
  });
  it('isPrime(36) is false', () => {
    expect(isPrime(36)).toBe(false);
  });
  it('isPrime(38) is false', () => {
    expect(isPrime(38)).toBe(false);
  });
  it('isPrime(39) is false', () => {
    expect(isPrime(39)).toBe(false);
  });
  it('isPrime(40) is false', () => {
    expect(isPrime(40)).toBe(false);
  });
  it('isPrime(42) is false', () => {
    expect(isPrime(42)).toBe(false);
  });
  it('isPrime(44) is false', () => {
    expect(isPrime(44)).toBe(false);
  });
  it('isPrime(45) is false', () => {
    expect(isPrime(45)).toBe(false);
  });
  it('isPrime(46) is false', () => {
    expect(isPrime(46)).toBe(false);
  });
  it('isPrime(48) is false', () => {
    expect(isPrime(48)).toBe(false);
  });
  it('isPrime(49) is false', () => {
    expect(isPrime(49)).toBe(false);
  });
  it('isPrime(50) is false', () => {
    expect(isPrime(50)).toBe(false);
  });
  it('isPrime(51) is false', () => {
    expect(isPrime(51)).toBe(false);
  });
  it('isPrime(52) is false', () => {
    expect(isPrime(52)).toBe(false);
  });
  it('isPrime(54) is false', () => {
    expect(isPrime(54)).toBe(false);
  });
  it('isPrime(55) is false', () => {
    expect(isPrime(55)).toBe(false);
  });
  it('isPrime(56) is false', () => {
    expect(isPrime(56)).toBe(false);
  });
  it('isPrime(57) is false', () => {
    expect(isPrime(57)).toBe(false);
  });
  it('isPrime(58) is false', () => {
    expect(isPrime(58)).toBe(false);
  });
  it('isPrime(60) is false', () => {
    expect(isPrime(60)).toBe(false);
  });
  it('isPrime(62) is false', () => {
    expect(isPrime(62)).toBe(false);
  });
  it('isPrime(63) is false', () => {
    expect(isPrime(63)).toBe(false);
  });
  it('isPrime(64) is false', () => {
    expect(isPrime(64)).toBe(false);
  });
  it('isPrime(65) is false', () => {
    expect(isPrime(65)).toBe(false);
  });
  it('isPrime(66) is false', () => {
    expect(isPrime(66)).toBe(false);
  });
  it('isPrime(68) is false', () => {
    expect(isPrime(68)).toBe(false);
  });
});

describe('gcd', () => {
  it('gcd(12,8)=4', () => {
    expect(gcd(12, 8)).toBe(4);
  });
  it('gcd(48,18)=6', () => {
    expect(gcd(48, 18)).toBe(6);
  });
  it('gcd(100,75)=25', () => {
    expect(gcd(100, 75)).toBe(25);
  });
  it('gcd(7,5)=1', () => {
    expect(gcd(7, 5)).toBe(1);
  });
  it('gcd(0,5)=5', () => {
    expect(gcd(0, 5)).toBe(5);
  });
  it('gcd(5,0)=5', () => {
    expect(gcd(5, 0)).toBe(5);
  });
  it('gcd(0,0)=0', () => {
    expect(gcd(0, 0)).toBe(0);
  });
  it('gcd(36,24)=12', () => {
    expect(gcd(36, 24)).toBe(12);
  });
  it('gcd(17,13)=1', () => {
    expect(gcd(17, 13)).toBe(1);
  });
  it('gcd(1000,250)=250', () => {
    expect(gcd(1000, 250)).toBe(250);
  });
  it('gcd(6,4)=2', () => {
    expect(gcd(6, 4)).toBe(2);
  });
  it('gcd(12,8)=4', () => {
    expect(gcd(12, 8)).toBe(4);
  });
  it('gcd(18,12)=6', () => {
    expect(gcd(18, 12)).toBe(6);
  });
  it('gcd(24,16)=8', () => {
    expect(gcd(24, 16)).toBe(8);
  });
  it('gcd(30,20)=10', () => {
    expect(gcd(30, 20)).toBe(10);
  });
  it('gcd(36,24)=12', () => {
    expect(gcd(36, 24)).toBe(12);
  });
  it('gcd(42,28)=14', () => {
    expect(gcd(42, 28)).toBe(14);
  });
  it('gcd(48,32)=16', () => {
    expect(gcd(48, 32)).toBe(16);
  });
  it('gcd(54,36)=18', () => {
    expect(gcd(54, 36)).toBe(18);
  });
  it('gcd(60,40)=20', () => {
    expect(gcd(60, 40)).toBe(20);
  });
  it('gcd(66,44)=22', () => {
    expect(gcd(66, 44)).toBe(22);
  });
  it('gcd(72,48)=24', () => {
    expect(gcd(72, 48)).toBe(24);
  });
  it('gcd(78,52)=26', () => {
    expect(gcd(78, 52)).toBe(26);
  });
  it('gcd(84,56)=28', () => {
    expect(gcd(84, 56)).toBe(28);
  });
  it('gcd(90,60)=30', () => {
    expect(gcd(90, 60)).toBe(30);
  });
  it('gcd(96,64)=32', () => {
    expect(gcd(96, 64)).toBe(32);
  });
  it('gcd(102,68)=34', () => {
    expect(gcd(102, 68)).toBe(34);
  });
  it('gcd(108,72)=36', () => {
    expect(gcd(108, 72)).toBe(36);
  });
  it('gcd(114,76)=38', () => {
    expect(gcd(114, 76)).toBe(38);
  });
  it('gcd(120,80)=40', () => {
    expect(gcd(120, 80)).toBe(40);
  });
  it('gcd(126,84)=42', () => {
    expect(gcd(126, 84)).toBe(42);
  });
  it('gcd(132,88)=44', () => {
    expect(gcd(132, 88)).toBe(44);
  });
  it('gcd(138,92)=46', () => {
    expect(gcd(138, 92)).toBe(46);
  });
  it('gcd(144,96)=48', () => {
    expect(gcd(144, 96)).toBe(48);
  });
  it('gcd(150,100)=50', () => {
    expect(gcd(150, 100)).toBe(50);
  });
  it('gcd(156,104)=52', () => {
    expect(gcd(156, 104)).toBe(52);
  });
  it('gcd(162,108)=54', () => {
    expect(gcd(162, 108)).toBe(54);
  });
  it('gcd(168,112)=56', () => {
    expect(gcd(168, 112)).toBe(56);
  });
  it('gcd(174,116)=58', () => {
    expect(gcd(174, 116)).toBe(58);
  });
  it('gcd(180,120)=60', () => {
    expect(gcd(180, 120)).toBe(60);
  });
  it('gcd(186,124)=62', () => {
    expect(gcd(186, 124)).toBe(62);
  });
  it('gcd(192,128)=64', () => {
    expect(gcd(192, 128)).toBe(64);
  });
  it('gcd(198,132)=66', () => {
    expect(gcd(198, 132)).toBe(66);
  });
  it('gcd(204,136)=68', () => {
    expect(gcd(204, 136)).toBe(68);
  });
  it('gcd(210,140)=70', () => {
    expect(gcd(210, 140)).toBe(70);
  });
  it('gcd(216,144)=72', () => {
    expect(gcd(216, 144)).toBe(72);
  });
  it('gcd(222,148)=74', () => {
    expect(gcd(222, 148)).toBe(74);
  });
  it('gcd(228,152)=76', () => {
    expect(gcd(228, 152)).toBe(76);
  });
  it('gcd(234,156)=78', () => {
    expect(gcd(234, 156)).toBe(78);
  });
  it('gcd(240,160)=80', () => {
    expect(gcd(240, 160)).toBe(80);
  });
  it('gcd(246,164)=82', () => {
    expect(gcd(246, 164)).toBe(82);
  });
  it('gcd(252,168)=84', () => {
    expect(gcd(252, 168)).toBe(84);
  });
  it('gcd(258,172)=86', () => {
    expect(gcd(258, 172)).toBe(86);
  });
  it('gcd(264,176)=88', () => {
    expect(gcd(264, 176)).toBe(88);
  });
  it('gcd(270,180)=90', () => {
    expect(gcd(270, 180)).toBe(90);
  });
  it('gcd(276,184)=92', () => {
    expect(gcd(276, 184)).toBe(92);
  });
  it('gcd(282,188)=94', () => {
    expect(gcd(282, 188)).toBe(94);
  });
  it('gcd(288,192)=96', () => {
    expect(gcd(288, 192)).toBe(96);
  });
  it('gcd(294,196)=98', () => {
    expect(gcd(294, 196)).toBe(98);
  });
  it('gcd(300,200)=100', () => {
    expect(gcd(300, 200)).toBe(100);
  });
  it('gcd(306,204)=102', () => {
    expect(gcd(306, 204)).toBe(102);
  });
  it('gcd(312,208)=104', () => {
    expect(gcd(312, 208)).toBe(104);
  });
  it('gcd(318,212)=106', () => {
    expect(gcd(318, 212)).toBe(106);
  });
  it('gcd(324,216)=108', () => {
    expect(gcd(324, 216)).toBe(108);
  });
  it('gcd(330,220)=110', () => {
    expect(gcd(330, 220)).toBe(110);
  });
  it('gcd(336,224)=112', () => {
    expect(gcd(336, 224)).toBe(112);
  });
  it('gcd(342,228)=114', () => {
    expect(gcd(342, 228)).toBe(114);
  });
  it('gcd(348,232)=116', () => {
    expect(gcd(348, 232)).toBe(116);
  });
  it('gcd(354,236)=118', () => {
    expect(gcd(354, 236)).toBe(118);
  });
  it('gcd(360,240)=120', () => {
    expect(gcd(360, 240)).toBe(120);
  });
  it('gcd(366,244)=122', () => {
    expect(gcd(366, 244)).toBe(122);
  });
  it('gcd(372,248)=124', () => {
    expect(gcd(372, 248)).toBe(124);
  });
  it('gcd(378,252)=126', () => {
    expect(gcd(378, 252)).toBe(126);
  });
  it('gcd(384,256)=128', () => {
    expect(gcd(384, 256)).toBe(128);
  });
  it('gcd(390,260)=130', () => {
    expect(gcd(390, 260)).toBe(130);
  });
  it('gcd(396,264)=132', () => {
    expect(gcd(396, 264)).toBe(132);
  });
  it('gcd(402,268)=134', () => {
    expect(gcd(402, 268)).toBe(134);
  });
  it('gcd(408,272)=136', () => {
    expect(gcd(408, 272)).toBe(136);
  });
  it('gcd(414,276)=138', () => {
    expect(gcd(414, 276)).toBe(138);
  });
  it('gcd(420,280)=140', () => {
    expect(gcd(420, 280)).toBe(140);
  });
  it('gcd(426,284)=142', () => {
    expect(gcd(426, 284)).toBe(142);
  });
  it('gcd(432,288)=144', () => {
    expect(gcd(432, 288)).toBe(144);
  });
  it('gcd(438,292)=146', () => {
    expect(gcd(438, 292)).toBe(146);
  });
  it('gcd(444,296)=148', () => {
    expect(gcd(444, 296)).toBe(148);
  });
  it('gcd(450,300)=150', () => {
    expect(gcd(450, 300)).toBe(150);
  });
  it('gcd(456,304)=152', () => {
    expect(gcd(456, 304)).toBe(152);
  });
  it('gcd(462,308)=154', () => {
    expect(gcd(462, 308)).toBe(154);
  });
  it('gcd(468,312)=156', () => {
    expect(gcd(468, 312)).toBe(156);
  });
  it('gcd(474,316)=158', () => {
    expect(gcd(474, 316)).toBe(158);
  });
  it('gcd(480,320)=160', () => {
    expect(gcd(480, 320)).toBe(160);
  });
  it('gcd(486,324)=162', () => {
    expect(gcd(486, 324)).toBe(162);
  });
  it('gcd(492,328)=164', () => {
    expect(gcd(492, 328)).toBe(164);
  });
  it('gcd(498,332)=166', () => {
    expect(gcd(498, 332)).toBe(166);
  });
  it('gcd(504,336)=168', () => {
    expect(gcd(504, 336)).toBe(168);
  });
  it('gcd(510,340)=170', () => {
    expect(gcd(510, 340)).toBe(170);
  });
  it('gcd(516,344)=172', () => {
    expect(gcd(516, 344)).toBe(172);
  });
  it('gcd(522,348)=174', () => {
    expect(gcd(522, 348)).toBe(174);
  });
  it('gcd(528,352)=176', () => {
    expect(gcd(528, 352)).toBe(176);
  });
  it('gcd(534,356)=178', () => {
    expect(gcd(534, 356)).toBe(178);
  });
  it('gcd(540,360)=180', () => {
    expect(gcd(540, 360)).toBe(180);
  });
});

describe('lcm', () => {
  it('lcm(4,6)=12', () => {
    expect(lcm(4, 6)).toBe(12);
  });
  it('lcm(3,5)=15', () => {
    expect(lcm(3, 5)).toBe(15);
  });
  it('lcm(12,8)=24', () => {
    expect(lcm(12, 8)).toBe(24);
  });
  it('lcm(7,11)=77', () => {
    expect(lcm(7, 11)).toBe(77);
  });
  it('lcm(0,5)=0', () => {
    expect(lcm(0, 5)).toBe(0);
  });
  it('lcm(5,0)=0', () => {
    expect(lcm(5, 0)).toBe(0);
  });
  it('lcm(1,100)=100', () => {
    expect(lcm(1, 100)).toBe(100);
  });
  it('lcm(9,6)=18', () => {
    expect(lcm(9, 6)).toBe(18);
  });
  it('lcm(15,10)=30', () => {
    expect(lcm(15, 10)).toBe(30);
  });
  it('lcm(100,25)=100', () => {
    expect(lcm(100, 25)).toBe(100);
  });
  it('lcm(1,2)=2', () => {
    expect(lcm(1, 2)).toBe(2);
  });
  it('lcm(2,3)=6', () => {
    expect(lcm(2, 3)).toBe(6);
  });
  it('lcm(3,4)=12', () => {
    expect(lcm(3, 4)).toBe(12);
  });
  it('lcm(4,5)=20', () => {
    expect(lcm(4, 5)).toBe(20);
  });
  it('lcm(5,6)=30', () => {
    expect(lcm(5, 6)).toBe(30);
  });
  it('lcm(6,7)=42', () => {
    expect(lcm(6, 7)).toBe(42);
  });
  it('lcm(7,8)=56', () => {
    expect(lcm(7, 8)).toBe(56);
  });
  it('lcm(8,9)=72', () => {
    expect(lcm(8, 9)).toBe(72);
  });
  it('lcm(9,10)=90', () => {
    expect(lcm(9, 10)).toBe(90);
  });
  it('lcm(10,11)=110', () => {
    expect(lcm(10, 11)).toBe(110);
  });
  it('lcm(11,2)=22', () => {
    expect(lcm(11, 2)).toBe(22);
  });
  it('lcm(12,3)=12', () => {
    expect(lcm(12, 3)).toBe(12);
  });
  it('lcm(13,4)=52', () => {
    expect(lcm(13, 4)).toBe(52);
  });
  it('lcm(14,5)=70', () => {
    expect(lcm(14, 5)).toBe(70);
  });
  it('lcm(15,6)=30', () => {
    expect(lcm(15, 6)).toBe(30);
  });
  it('lcm(16,7)=112', () => {
    expect(lcm(16, 7)).toBe(112);
  });
  it('lcm(17,8)=136', () => {
    expect(lcm(17, 8)).toBe(136);
  });
  it('lcm(18,9)=18', () => {
    expect(lcm(18, 9)).toBe(18);
  });
  it('lcm(19,10)=190', () => {
    expect(lcm(19, 10)).toBe(190);
  });
  it('lcm(20,11)=220', () => {
    expect(lcm(20, 11)).toBe(220);
  });
  it('lcm(21,2)=42', () => {
    expect(lcm(21, 2)).toBe(42);
  });
  it('lcm(22,3)=66', () => {
    expect(lcm(22, 3)).toBe(66);
  });
  it('lcm(23,4)=92', () => {
    expect(lcm(23, 4)).toBe(92);
  });
  it('lcm(24,5)=120', () => {
    expect(lcm(24, 5)).toBe(120);
  });
  it('lcm(25,6)=150', () => {
    expect(lcm(25, 6)).toBe(150);
  });
  it('lcm(26,7)=182', () => {
    expect(lcm(26, 7)).toBe(182);
  });
  it('lcm(27,8)=216', () => {
    expect(lcm(27, 8)).toBe(216);
  });
  it('lcm(28,9)=252', () => {
    expect(lcm(28, 9)).toBe(252);
  });
  it('lcm(29,10)=290', () => {
    expect(lcm(29, 10)).toBe(290);
  });
  it('lcm(30,11)=330', () => {
    expect(lcm(30, 11)).toBe(330);
  });
  it('lcm(31,2)=62', () => {
    expect(lcm(31, 2)).toBe(62);
  });
  it('lcm(32,3)=96', () => {
    expect(lcm(32, 3)).toBe(96);
  });
  it('lcm(33,4)=132', () => {
    expect(lcm(33, 4)).toBe(132);
  });
  it('lcm(34,5)=170', () => {
    expect(lcm(34, 5)).toBe(170);
  });
  it('lcm(35,6)=210', () => {
    expect(lcm(35, 6)).toBe(210);
  });
  it('lcm(36,7)=252', () => {
    expect(lcm(36, 7)).toBe(252);
  });
  it('lcm(37,8)=296', () => {
    expect(lcm(37, 8)).toBe(296);
  });
  it('lcm(38,9)=342', () => {
    expect(lcm(38, 9)).toBe(342);
  });
  it('lcm(39,10)=390', () => {
    expect(lcm(39, 10)).toBe(390);
  });
  it('lcm(40,11)=440', () => {
    expect(lcm(40, 11)).toBe(440);
  });
  it('lcm(41,2)=82', () => {
    expect(lcm(41, 2)).toBe(82);
  });
  it('lcm(42,3)=42', () => {
    expect(lcm(42, 3)).toBe(42);
  });
  it('lcm(43,4)=172', () => {
    expect(lcm(43, 4)).toBe(172);
  });
  it('lcm(44,5)=220', () => {
    expect(lcm(44, 5)).toBe(220);
  });
  it('lcm(45,6)=90', () => {
    expect(lcm(45, 6)).toBe(90);
  });
  it('lcm(46,7)=322', () => {
    expect(lcm(46, 7)).toBe(322);
  });
  it('lcm(47,8)=376', () => {
    expect(lcm(47, 8)).toBe(376);
  });
  it('lcm(48,9)=144', () => {
    expect(lcm(48, 9)).toBe(144);
  });
  it('lcm(49,10)=490', () => {
    expect(lcm(49, 10)).toBe(490);
  });
  it('lcm(50,11)=550', () => {
    expect(lcm(50, 11)).toBe(550);
  });
  it('lcm(51,2)=102', () => {
    expect(lcm(51, 2)).toBe(102);
  });
  it('lcm(52,3)=156', () => {
    expect(lcm(52, 3)).toBe(156);
  });
  it('lcm(53,4)=212', () => {
    expect(lcm(53, 4)).toBe(212);
  });
  it('lcm(54,5)=270', () => {
    expect(lcm(54, 5)).toBe(270);
  });
  it('lcm(55,6)=330', () => {
    expect(lcm(55, 6)).toBe(330);
  });
  it('lcm(56,7)=56', () => {
    expect(lcm(56, 7)).toBe(56);
  });
  it('lcm(57,8)=456', () => {
    expect(lcm(57, 8)).toBe(456);
  });
  it('lcm(58,9)=522', () => {
    expect(lcm(58, 9)).toBe(522);
  });
  it('lcm(59,10)=590', () => {
    expect(lcm(59, 10)).toBe(590);
  });
  it('lcm(60,11)=660', () => {
    expect(lcm(60, 11)).toBe(660);
  });
  it('lcm(61,2)=122', () => {
    expect(lcm(61, 2)).toBe(122);
  });
  it('lcm(62,3)=186', () => {
    expect(lcm(62, 3)).toBe(186);
  });
  it('lcm(63,4)=252', () => {
    expect(lcm(63, 4)).toBe(252);
  });
  it('lcm(64,5)=320', () => {
    expect(lcm(64, 5)).toBe(320);
  });
  it('lcm(65,6)=390', () => {
    expect(lcm(65, 6)).toBe(390);
  });
  it('lcm(66,7)=462', () => {
    expect(lcm(66, 7)).toBe(462);
  });
  it('lcm(67,8)=536', () => {
    expect(lcm(67, 8)).toBe(536);
  });
  it('lcm(68,9)=612', () => {
    expect(lcm(68, 9)).toBe(612);
  });
  it('lcm(69,10)=690', () => {
    expect(lcm(69, 10)).toBe(690);
  });
  it('lcm(70,11)=770', () => {
    expect(lcm(70, 11)).toBe(770);
  });
  it('lcm(71,2)=142', () => {
    expect(lcm(71, 2)).toBe(142);
  });
  it('lcm(72,3)=72', () => {
    expect(lcm(72, 3)).toBe(72);
  });
  it('lcm(73,4)=292', () => {
    expect(lcm(73, 4)).toBe(292);
  });
  it('lcm(74,5)=370', () => {
    expect(lcm(74, 5)).toBe(370);
  });
  it('lcm(75,6)=150', () => {
    expect(lcm(75, 6)).toBe(150);
  });
  it('lcm(76,7)=532', () => {
    expect(lcm(76, 7)).toBe(532);
  });
  it('lcm(77,8)=616', () => {
    expect(lcm(77, 8)).toBe(616);
  });
  it('lcm(78,9)=234', () => {
    expect(lcm(78, 9)).toBe(234);
  });
  it('lcm(79,10)=790', () => {
    expect(lcm(79, 10)).toBe(790);
  });
  it('lcm(80,11)=880', () => {
    expect(lcm(80, 11)).toBe(880);
  });
  it('lcm(81,2)=162', () => {
    expect(lcm(81, 2)).toBe(162);
  });
  it('lcm(82,3)=246', () => {
    expect(lcm(82, 3)).toBe(246);
  });
  it('lcm(83,4)=332', () => {
    expect(lcm(83, 4)).toBe(332);
  });
  it('lcm(84,5)=420', () => {
    expect(lcm(84, 5)).toBe(420);
  });
  it('lcm(85,6)=510', () => {
    expect(lcm(85, 6)).toBe(510);
  });
  it('lcm(86,7)=602', () => {
    expect(lcm(86, 7)).toBe(602);
  });
  it('lcm(87,8)=696', () => {
    expect(lcm(87, 8)).toBe(696);
  });
  it('lcm(88,9)=792', () => {
    expect(lcm(88, 9)).toBe(792);
  });
  it('lcm(89,10)=890', () => {
    expect(lcm(89, 10)).toBe(890);
  });
  it('lcm(90,11)=990', () => {
    expect(lcm(90, 11)).toBe(990);
  });
});

describe('factorial', () => {
  it('factorial(0)=1', () => {
    expect(factorial(0)).toBe(1);
  });
  it('factorial(1)=1', () => {
    expect(factorial(1)).toBe(1);
  });
  it('factorial(2)=2', () => {
    expect(factorial(2)).toBe(2);
  });
  it('factorial(3)=6', () => {
    expect(factorial(3)).toBe(6);
  });
  it('factorial(4)=24', () => {
    expect(factorial(4)).toBe(24);
  });
  it('factorial(5)=120', () => {
    expect(factorial(5)).toBe(120);
  });
  it('factorial(6)=720', () => {
    expect(factorial(6)).toBe(720);
  });
  it('factorial(7)=5040', () => {
    expect(factorial(7)).toBe(5040);
  });
  it('factorial(8)=40320', () => {
    expect(factorial(8)).toBe(40320);
  });
  it('factorial(9)=362880', () => {
    expect(factorial(9)).toBe(362880);
  });
  it('factorial(10)=3628800', () => {
    expect(factorial(10)).toBe(3628800);
  });
  it('factorial(11)=39916800', () => {
    expect(factorial(11)).toBe(39916800);
  });
  it('factorial(12)=479001600', () => {
    expect(factorial(12)).toBe(479001600);
  });
  it('factorial(13)=6227020800', () => {
    expect(factorial(13)).toBe(6227020800);
  });
  it('factorial(14)=87178291200', () => {
    expect(factorial(14)).toBe(87178291200);
  });
  it('factorial(15)=1307674368000', () => {
    expect(factorial(15)).toBe(1307674368000);
  });
  it('factorial(16)=20922789888000', () => {
    expect(factorial(16)).toBe(20922789888000);
  });
  it('factorial(17)=355687428096000', () => {
    expect(factorial(17)).toBe(355687428096000);
  });
  it('factorial(18)=6402373705728000', () => {
    expect(factorial(18)).toBe(6402373705728000);
  });
  it('factorial(5) verify again => 120', () => {
    expect(factorial(5)).toBe(120);
  });
  it('factorial(10) verify again => 3628800', () => {
    expect(factorial(10)).toBe(3628800);
  });
  it('factorial(6) verify again => 720', () => {
    expect(factorial(6)).toBe(720);
  });
  it('factorial(7) verify again => 5040', () => {
    expect(factorial(7)).toBe(5040);
  });
  it('factorial(8) verify again => 40320', () => {
    expect(factorial(8)).toBe(40320);
  });
  it('factorial(9) verify again => 362880', () => {
    expect(factorial(9)).toBe(362880);
  });
  it('factorial(12) verify again => 479001600', () => {
    expect(factorial(12)).toBe(479001600);
  });
  it('factorial(15) verify again => 1307674368000', () => {
    expect(factorial(15)).toBe(1307674368000);
  });
  it('factorial(3) verify again => 6', () => {
    expect(factorial(3)).toBe(6);
  });
  it('factorial(4) verify again => 24', () => {
    expect(factorial(4)).toBe(24);
  });
  it('factorial(2) verify again => 2', () => {
    expect(factorial(2)).toBe(2);
  });
  it('factorial(1) verify again => 1', () => {
    expect(factorial(1)).toBe(1);
  });
  it('factorial(0) verify again => 1', () => {
    expect(factorial(0)).toBe(1);
  });
  it('factorial(11) verify again => 39916800', () => {
    expect(factorial(11)).toBe(39916800);
  });
  it('factorial(16) verify again => 20922789888000', () => {
    expect(factorial(16)).toBe(20922789888000);
  });
  it('factorial(17) verify again => 355687428096000', () => {
    expect(factorial(17)).toBe(355687428096000);
  });
  it('factorial(13) verify again => 6227020800', () => {
    expect(factorial(13)).toBe(6227020800);
  });
  it('factorial(14) verify again => 87178291200', () => {
    expect(factorial(14)).toBe(87178291200);
  });
  it('factorial(18) verify again => 6402373705728000', () => {
    expect(factorial(18)).toBe(6402373705728000);
  });
  it('factorial(0) verify again => 1', () => {
    expect(factorial(0)).toBe(1);
  });
  it('factorial(1) verify again => 1', () => {
    expect(factorial(1)).toBe(1);
  });
  it('factorial(2) verify again => 2', () => {
    expect(factorial(2)).toBe(2);
  });
  it('factorial(3) verify again => 6', () => {
    expect(factorial(3)).toBe(6);
  });
  it('factorial(4) verify again => 24', () => {
    expect(factorial(4)).toBe(24);
  });
  it('factorial(5) verify again => 120', () => {
    expect(factorial(5)).toBe(120);
  });
  it('factorial(6) verify again => 720', () => {
    expect(factorial(6)).toBe(720);
  });
  it('factorial(7) verify again => 5040', () => {
    expect(factorial(7)).toBe(5040);
  });
  it('factorial(8) verify again => 40320', () => {
    expect(factorial(8)).toBe(40320);
  });
  it('factorial(9) verify again => 362880', () => {
    expect(factorial(9)).toBe(362880);
  });
  it('factorial(10) verify again => 3628800', () => {
    expect(factorial(10)).toBe(3628800);
  });
  it('factorial(11) verify again => 39916800', () => {
    expect(factorial(11)).toBe(39916800);
  });
  it('factorial(-1) throws', () => {
    expect(() => factorial(-1)).toThrow();
  });
  it('factorial(-5) throws', () => {
    expect(() => factorial(-5)).toThrow();
  });
});

describe('fibonacci', () => {
  it('fibonacci(0)=0', () => {
    expect(fibonacci(0)).toBe(0);
  });
  it('fibonacci(1)=1', () => {
    expect(fibonacci(1)).toBe(1);
  });
  it('fibonacci(2)=1', () => {
    expect(fibonacci(2)).toBe(1);
  });
  it('fibonacci(3)=2', () => {
    expect(fibonacci(3)).toBe(2);
  });
  it('fibonacci(4)=3', () => {
    expect(fibonacci(4)).toBe(3);
  });
  it('fibonacci(5)=5', () => {
    expect(fibonacci(5)).toBe(5);
  });
  it('fibonacci(6)=8', () => {
    expect(fibonacci(6)).toBe(8);
  });
  it('fibonacci(7)=13', () => {
    expect(fibonacci(7)).toBe(13);
  });
  it('fibonacci(8)=21', () => {
    expect(fibonacci(8)).toBe(21);
  });
  it('fibonacci(9)=34', () => {
    expect(fibonacci(9)).toBe(34);
  });
  it('fibonacci(10)=55', () => {
    expect(fibonacci(10)).toBe(55);
  });
  it('fibonacci(11)=89', () => {
    expect(fibonacci(11)).toBe(89);
  });
  it('fibonacci(12)=144', () => {
    expect(fibonacci(12)).toBe(144);
  });
  it('fibonacci(13)=233', () => {
    expect(fibonacci(13)).toBe(233);
  });
  it('fibonacci(14)=377', () => {
    expect(fibonacci(14)).toBe(377);
  });
  it('fibonacci(15)=610', () => {
    expect(fibonacci(15)).toBe(610);
  });
  it('fibonacci(16)=987', () => {
    expect(fibonacci(16)).toBe(987);
  });
  it('fibonacci(17)=1597', () => {
    expect(fibonacci(17)).toBe(1597);
  });
  it('fibonacci(18)=2584', () => {
    expect(fibonacci(18)).toBe(2584);
  });
  it('fibonacci(19)=4181', () => {
    expect(fibonacci(19)).toBe(4181);
  });
  it('fibonacci(20)=6765', () => {
    expect(fibonacci(20)).toBe(6765);
  });
  it('fibonacci(21)=10946', () => {
    expect(fibonacci(21)).toBe(10946);
  });
  it('fibonacci(22)=17711', () => {
    expect(fibonacci(22)).toBe(17711);
  });
  it('fibonacci(23)=28657', () => {
    expect(fibonacci(23)).toBe(28657);
  });
  it('fibonacci(24)=46368', () => {
    expect(fibonacci(24)).toBe(46368);
  });
  it('fibonacci(25)=75025', () => {
    expect(fibonacci(25)).toBe(75025);
  });
  it('fibonacci(26)=121393', () => {
    expect(fibonacci(26)).toBe(121393);
  });
  it('fibonacci(27)=196418', () => {
    expect(fibonacci(27)).toBe(196418);
  });
  it('fibonacci(28)=317811', () => {
    expect(fibonacci(28)).toBe(317811);
  });
  it('fibonacci(29)=514229', () => {
    expect(fibonacci(29)).toBe(514229);
  });
  it('fibonacci(30)=832040', () => {
    expect(fibonacci(30)).toBe(832040);
  });
  it('fibonacci(31)=1346269', () => {
    expect(fibonacci(31)).toBe(1346269);
  });
  it('fibonacci(32)=2178309', () => {
    expect(fibonacci(32)).toBe(2178309);
  });
  it('fibonacci(33)=3524578', () => {
    expect(fibonacci(33)).toBe(3524578);
  });
  it('fibonacci(34)=5702887', () => {
    expect(fibonacci(34)).toBe(5702887);
  });
  it('fibonacci(35)=9227465', () => {
    expect(fibonacci(35)).toBe(9227465);
  });
  it('fibonacci(36)=14930352', () => {
    expect(fibonacci(36)).toBe(14930352);
  });
  it('fibonacci(37)=24157817', () => {
    expect(fibonacci(37)).toBe(24157817);
  });
  it('fibonacci(38)=39088169', () => {
    expect(fibonacci(38)).toBe(39088169);
  });
  it('fibonacci(39)=63245986', () => {
    expect(fibonacci(39)).toBe(63245986);
  });
  it('fibonacci(40)=102334155', () => {
    expect(fibonacci(40)).toBe(102334155);
  });
  it('fibonacci(41)=165580141', () => {
    expect(fibonacci(41)).toBe(165580141);
  });
  it('fibonacci(42)=267914296', () => {
    expect(fibonacci(42)).toBe(267914296);
  });
  it('fibonacci(43)=433494437', () => {
    expect(fibonacci(43)).toBe(433494437);
  });
  it('fibonacci(44)=701408733', () => {
    expect(fibonacci(44)).toBe(701408733);
  });
  it('fibonacci(45)=1134903170', () => {
    expect(fibonacci(45)).toBe(1134903170);
  });
  it('fibonacci(46)=1836311903', () => {
    expect(fibonacci(46)).toBe(1836311903);
  });
  it('fibonacci(47)=2971215073', () => {
    expect(fibonacci(47)).toBe(2971215073);
  });
  it('fibonacci(48)=4807526976', () => {
    expect(fibonacci(48)).toBe(4807526976);
  });
  it('fibonacci(49)=7778742049', () => {
    expect(fibonacci(49)).toBe(7778742049);
  });
});

describe('sumArray', () => {
  it('sumArray([1, 2, 3])=6', () => {
    expect(sumArray([1, 2, 3])).toBeCloseTo(6, 5);
  });
  it('sumArray([0])=0', () => {
    expect(sumArray([0])).toBeCloseTo(0, 5);
  });
  it('sumArray([])=0', () => {
    expect(sumArray([])).toBeCloseTo(0, 5);
  });
  it('sumArray([1])=1', () => {
    expect(sumArray([1])).toBeCloseTo(1, 5);
  });
  it('sumArray([-1, -2, -3])=-6', () => {
    expect(sumArray([-1, -2, -3])).toBeCloseTo(-6, 5);
  });
  it('sumArray([1, 2, 3, 4, 5])=15', () => {
    expect(sumArray([1, 2, 3, 4, 5])).toBeCloseTo(15, 5);
  });
  it('sumArray([10, 20, 30])=60', () => {
    expect(sumArray([10, 20, 30])).toBeCloseTo(60, 5);
  });
  it('sumArray([100])=100', () => {
    expect(sumArray([100])).toBeCloseTo(100, 5);
  });
  it('sumArray([-5, 5])=0', () => {
    expect(sumArray([-5, 5])).toBeCloseTo(0, 5);
  });
  it('sumArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])=55', () => {
    expect(sumArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBeCloseTo(55, 5);
  });
  it('sumArray([1])=1', () => {
    expect(sumArray([1])).toBeCloseTo(1, 5);
  });
  it('sumArray([1, 2])=3', () => {
    expect(sumArray([1, 2])).toBeCloseTo(3, 5);
  });
  it('sumArray([1, 2, 3])=6', () => {
    expect(sumArray([1, 2, 3])).toBeCloseTo(6, 5);
  });
  it('sumArray([1, 2, 3, 4])=10', () => {
    expect(sumArray([1, 2, 3, 4])).toBeCloseTo(10, 5);
  });
  it('sumArray([1, 2, 3, 4, 5])=15', () => {
    expect(sumArray([1, 2, 3, 4, 5])).toBeCloseTo(15, 5);
  });
  it('sumArray([1, 2, 3, 4, 5, 6])=21', () => {
    expect(sumArray([1, 2, 3, 4, 5, 6])).toBeCloseTo(21, 5);
  });
  it('sumArray([1, 2, 3, 4, 5, 6, 7])=28', () => {
    expect(sumArray([1, 2, 3, 4, 5, 6, 7])).toBeCloseTo(28, 5);
  });
  it('sumArray([1, 2, 3, 4, 5, 6, 7, 8])=36', () => {
    expect(sumArray([1, 2, 3, 4, 5, 6, 7, 8])).toBeCloseTo(36, 5);
  });
  it('sumArray([1, 2, 3, 4, 5, 6, 7, 8, 9])=45', () => {
    expect(sumArray([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBeCloseTo(45, 5);
  });
  it('sumArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])=55', () => {
    expect(sumArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBeCloseTo(55, 5);
  });
  it('sumArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])=66', () => {
    expect(sumArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toBeCloseTo(66, 5);
  });
  it('sumArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])=78', () => {
    expect(sumArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBeCloseTo(78, 5);
  });
  it('sumArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])=91', () => {
    expect(sumArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])).toBeCloseTo(91, 5);
  });
  it('sumArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])=105', () => {
    expect(sumArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])).toBeCloseTo(105, 5);
  });
  it('sumArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])=120', () => {
    expect(sumArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])).toBeCloseTo(120, 5);
  });
});

describe('product', () => {
  it('product([1, 2, 3])=6', () => {
    expect(product([1, 2, 3])).toBeCloseTo(6, 5);
  });
  it('product([1])=1', () => {
    expect(product([1])).toBeCloseTo(1, 5);
  });
  it('product([2, 3, 4])=24', () => {
    expect(product([2, 3, 4])).toBeCloseTo(24, 5);
  });
  it('product([0, 5])=0', () => {
    expect(product([0, 5])).toBeCloseTo(0, 5);
  });
  it('product([])=1', () => {
    expect(product([])).toBeCloseTo(1, 5);
  });
  it('product([2, 2, 2, 2])=16', () => {
    expect(product([2, 2, 2, 2])).toBeCloseTo(16, 5);
  });
  it('product([1, 1, 1])=1', () => {
    expect(product([1, 1, 1])).toBeCloseTo(1, 5);
  });
  it('product([-1, 1])=-1', () => {
    expect(product([-1, 1])).toBeCloseTo(-1, 5);
  });
  it('product([-2, -3])=6', () => {
    expect(product([-2, -3])).toBeCloseTo(6, 5);
  });
  it('product([5, 4, 3, 2, 1])=120', () => {
    expect(product([5, 4, 3, 2, 1])).toBeCloseTo(120, 5);
  });
  it('product([1, 1])=1', () => {
    expect(product([1, 1])).toBeCloseTo(1, 5);
  });
  it('product([2, 2])=4', () => {
    expect(product([2, 2])).toBeCloseTo(4, 5);
  });
  it('product([3, 3])=9', () => {
    expect(product([3, 3])).toBeCloseTo(9, 5);
  });
  it('product([4, 4])=16', () => {
    expect(product([4, 4])).toBeCloseTo(16, 5);
  });
  it('product([5, 5])=25', () => {
    expect(product([5, 5])).toBeCloseTo(25, 5);
  });
  it('product([6, 6])=36', () => {
    expect(product([6, 6])).toBeCloseTo(36, 5);
  });
  it('product([7, 7])=49', () => {
    expect(product([7, 7])).toBeCloseTo(49, 5);
  });
  it('product([8, 8])=64', () => {
    expect(product([8, 8])).toBeCloseTo(64, 5);
  });
  it('product([9, 9])=81', () => {
    expect(product([9, 9])).toBeCloseTo(81, 5);
  });
  it('product([10, 10])=100', () => {
    expect(product([10, 10])).toBeCloseTo(100, 5);
  });
  it('product([11, 11])=121', () => {
    expect(product([11, 11])).toBeCloseTo(121, 5);
  });
  it('product([12, 12])=144', () => {
    expect(product([12, 12])).toBeCloseTo(144, 5);
  });
  it('product([13, 13])=169', () => {
    expect(product([13, 13])).toBeCloseTo(169, 5);
  });
  it('product([14, 14])=196', () => {
    expect(product([14, 14])).toBeCloseTo(196, 5);
  });
  it('product([15, 15])=225', () => {
    expect(product([15, 15])).toBeCloseTo(225, 5);
  });
});

describe('mean', () => {
  it('mean([1, 2, 3])~=2', () => {
    expect(mean([1, 2, 3])).toBeCloseTo(2, 5);
  });
  it('mean([0, 100])~=50', () => {
    expect(mean([0, 100])).toBeCloseTo(50, 5);
  });
  it('mean([5])~=5', () => {
    expect(mean([5])).toBeCloseTo(5, 5);
  });
  it('mean([1, 1, 1])~=1', () => {
    expect(mean([1, 1, 1])).toBeCloseTo(1, 5);
  });
  it('mean([-5, 5])~=0', () => {
    expect(mean([-5, 5])).toBeCloseTo(0, 5);
  });
  it('mean([2, 4, 6, 8])~=5', () => {
    expect(mean([2, 4, 6, 8])).toBeCloseTo(5, 5);
  });
  it('mean([1, 2])~=1.5', () => {
    expect(mean([1, 2])).toBeCloseTo(1.5, 5);
  });
  it('mean([3, 3, 3, 3])~=3', () => {
    expect(mean([3, 3, 3, 3])).toBeCloseTo(3, 5);
  });
  it('mean([10, 20, 30, 40, 50])~=30', () => {
    expect(mean([10, 20, 30, 40, 50])).toBeCloseTo(30, 5);
  });
  it('mean([0, 0, 0])~=0', () => {
    expect(mean([0, 0, 0])).toBeCloseTo(0, 5);
  });
  it('mean([1, 2])~=1.5', () => {
    expect(mean([1, 2])).toBeCloseTo(1.5, 5);
  });
  it('mean([1, 2, 3])~=2.0', () => {
    expect(mean([1, 2, 3])).toBeCloseTo(2.0, 5);
  });
  it('mean([1, 2, 3, 4])~=2.5', () => {
    expect(mean([1, 2, 3, 4])).toBeCloseTo(2.5, 5);
  });
  it('mean([1, 2, 3, 4, 5])~=3.0', () => {
    expect(mean([1, 2, 3, 4, 5])).toBeCloseTo(3.0, 5);
  });
  it('mean([1, 2, 3, 4, 5, 6])~=3.5', () => {
    expect(mean([1, 2, 3, 4, 5, 6])).toBeCloseTo(3.5, 5);
  });
  it('mean([1, 2, 3, 4, 5, 6, 7])~=4.0', () => {
    expect(mean([1, 2, 3, 4, 5, 6, 7])).toBeCloseTo(4.0, 5);
  });
  it('mean([1, 2, 3, 4, 5, 6, 7, 8])~=4.5', () => {
    expect(mean([1, 2, 3, 4, 5, 6, 7, 8])).toBeCloseTo(4.5, 5);
  });
  it('mean([1, 2, 3, 4, 5, 6, 7, 8, 9])~=5.0', () => {
    expect(mean([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBeCloseTo(5.0, 5);
  });
  it('mean([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])~=5.5', () => {
    expect(mean([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBeCloseTo(5.5, 5);
  });
  it('mean([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])~=6.0', () => {
    expect(mean([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toBeCloseTo(6.0, 5);
  });
  it('mean([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])~=6.5', () => {
    expect(mean([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBeCloseTo(6.5, 5);
  });
  it('mean([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])~=7.0', () => {
    expect(mean([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])).toBeCloseTo(7.0, 5);
  });
  it('mean([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])~=7.5', () => {
    expect(mean([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])).toBeCloseTo(7.5, 5);
  });
  it('mean([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])~=8.0', () => {
    expect(mean([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])).toBeCloseTo(8.0, 5);
  });
  it('mean([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])~=8.5', () => {
    expect(mean([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])).toBeCloseTo(8.5, 5);
  });
  it('mean([]) throws', () => {
    expect(() => mean([])).toThrow();
  });
});

describe('median', () => {
  it('median([1, 2, 3])~=2', () => {
    expect(median([1, 2, 3])).toBeCloseTo(2, 5);
  });
  it('median([1, 2])~=1.5', () => {
    expect(median([1, 2])).toBeCloseTo(1.5, 5);
  });
  it('median([3, 1, 2])~=2', () => {
    expect(median([3, 1, 2])).toBeCloseTo(2, 5);
  });
  it('median([4, 1, 3, 2])~=2.5', () => {
    expect(median([4, 1, 3, 2])).toBeCloseTo(2.5, 5);
  });
  it('median([5])~=5', () => {
    expect(median([5])).toBeCloseTo(5, 5);
  });
  it('median([1, 3, 5, 7, 9])~=5', () => {
    expect(median([1, 3, 5, 7, 9])).toBeCloseTo(5, 5);
  });
  it('median([2, 2, 2, 2])~=2', () => {
    expect(median([2, 2, 2, 2])).toBeCloseTo(2, 5);
  });
  it('median([1, 100])~=50.5', () => {
    expect(median([1, 100])).toBeCloseTo(50.5, 5);
  });
  it('median([10, 20, 30, 40, 50])~=30', () => {
    expect(median([10, 20, 30, 40, 50])).toBeCloseTo(30, 5);
  });
  it('median([7, 3, 5, 1, 9])~=5', () => {
    expect(median([7, 3, 5, 1, 9])).toBeCloseTo(5, 5);
  });
  it('median([1, 2])~=1.5', () => {
    expect(median([1, 2])).toBeCloseTo(1.5, 5);
  });
  it('median([1, 2, 3])~=2', () => {
    expect(median([1, 2, 3])).toBeCloseTo(2, 5);
  });
  it('median([1, 2, 3, 4])~=2.5', () => {
    expect(median([1, 2, 3, 4])).toBeCloseTo(2.5, 5);
  });
  it('median([1, 2, 3, 4, 5])~=3', () => {
    expect(median([1, 2, 3, 4, 5])).toBeCloseTo(3, 5);
  });
  it('median([1, 2, 3, 4, 5, 6])~=3.5', () => {
    expect(median([1, 2, 3, 4, 5, 6])).toBeCloseTo(3.5, 5);
  });
  it('median([1, 2, 3, 4, 5, 6, 7])~=4', () => {
    expect(median([1, 2, 3, 4, 5, 6, 7])).toBeCloseTo(4, 5);
  });
  it('median([1, 2, 3, 4, 5, 6, 7, 8])~=4.5', () => {
    expect(median([1, 2, 3, 4, 5, 6, 7, 8])).toBeCloseTo(4.5, 5);
  });
  it('median([1, 2, 3, 4, 5, 6, 7, 8, 9])~=5', () => {
    expect(median([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBeCloseTo(5, 5);
  });
  it('median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])~=5.5', () => {
    expect(median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBeCloseTo(5.5, 5);
  });
  it('median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])~=6', () => {
    expect(median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toBeCloseTo(6, 5);
  });
  it('median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])~=6.5', () => {
    expect(median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBeCloseTo(6.5, 5);
  });
  it('median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])~=7', () => {
    expect(median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])).toBeCloseTo(7, 5);
  });
  it('median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])~=7.5', () => {
    expect(median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])).toBeCloseTo(7.5, 5);
  });
  it('median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])~=8', () => {
    expect(median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])).toBeCloseTo(8, 5);
  });
  it('median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])~=8.5', () => {
    expect(median([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])).toBeCloseTo(8.5, 5);
  });
  it('median([]) throws', () => {
    expect(() => median([])).toThrow();
  });
});

describe('mode', () => {
  it('mode([1, 2, 2, 3])=[2]', () => {
    expect(mode([1, 2, 2, 3])).toEqual([2]);
  });
  it('mode([1, 1, 2, 2])=[1, 2]', () => {
    expect(mode([1, 1, 2, 2])).toEqual([1, 2]);
  });
  it('mode([5])=[5]', () => {
    expect(mode([5])).toEqual([5]);
  });
  it('mode([3, 3, 3])=[3]', () => {
    expect(mode([3, 3, 3])).toEqual([3]);
  });
  it('mode([1, 2, 3])=[1, 2, 3]', () => {
    expect(mode([1, 2, 3])).toEqual([1, 2, 3]);
  });
  it('mode([4, 4, 1, 1, 2])=[1, 4]', () => {
    expect(mode([4, 4, 1, 1, 2])).toEqual([1, 4]);
  });
  it('mode([1, 2, 2, 3, 3, 3])=[3]', () => {
    expect(mode([1, 2, 2, 3, 3, 3])).toEqual([3]);
  });
  it('mode([10, 10, 20])=[10]', () => {
    expect(mode([10, 10, 20])).toEqual([10]);
  });
  it('mode([1, 2, 3, 4, 4, 4])=[4]', () => {
    expect(mode([1, 2, 3, 4, 4, 4])).toEqual([4]);
  });
  it('mode([7, 8, 9])=[7, 8, 9]', () => {
    expect(mode([7, 8, 9])).toEqual([7, 8, 9]);
  });
  it('mode([]) throws', () => {
    expect(() => mode([])).toThrow();
  });
});

describe('variance', () => {
  it('variance([2, 2, 2])~=0', () => {
    expect(variance([2, 2, 2])).toBeCloseTo(0, 5);
  });
  it('variance([1, 3])~=1', () => {
    expect(variance([1, 3])).toBeCloseTo(1, 5);
  });
  it('variance([1, 2, 3, 4, 5])~=2', () => {
    expect(variance([1, 2, 3, 4, 5])).toBeCloseTo(2, 5);
  });
  it('variance([0, 10])~=25', () => {
    expect(variance([0, 10])).toBeCloseTo(25, 5);
  });
  it('variance([5, 5, 5, 5])~=0', () => {
    expect(variance([5, 5, 5, 5])).toBeCloseTo(0, 5);
  });
  it('variance([1, 2])~=0.25', () => {
    expect(variance([1, 2])).toBeCloseTo(0.25, 5);
  });
  it('variance([1, 2, 3])~=0.66667', () => {
    expect(variance([1, 2, 3])).toBeCloseTo(0.66666667, 5);
  });
  it('variance([1, 2, 3, 4])~=1.25', () => {
    expect(variance([1, 2, 3, 4])).toBeCloseTo(1.25, 5);
  });
  it('variance([1, 2, 3, 4, 5])~=2.0', () => {
    expect(variance([1, 2, 3, 4, 5])).toBeCloseTo(2.0, 5);
  });
  it('variance([1, 2, 3, 4, 5, 6])~=2.91667', () => {
    expect(variance([1, 2, 3, 4, 5, 6])).toBeCloseTo(2.91666667, 5);
  });
  it('variance([1, 2, 3, 4, 5, 6, 7])~=4.0', () => {
    expect(variance([1, 2, 3, 4, 5, 6, 7])).toBeCloseTo(4.0, 5);
  });
  it('variance([1, 2, 3, 4, 5, 6, 7, 8])~=5.25', () => {
    expect(variance([1, 2, 3, 4, 5, 6, 7, 8])).toBeCloseTo(5.25, 5);
  });
  it('variance([1, 2, 3, 4, 5, 6, 7, 8, 9])~=6.66667', () => {
    expect(variance([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBeCloseTo(6.66666667, 5);
  });
  it('variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])~=8.25', () => {
    expect(variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBeCloseTo(8.25, 5);
  });
  it('variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])~=10.0', () => {
    expect(variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toBeCloseTo(10.0, 5);
  });
  it('variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])~=11.91667', () => {
    expect(variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBeCloseTo(11.91666667, 5);
  });
  it('variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])~=14.0', () => {
    expect(variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])).toBeCloseTo(14.0, 5);
  });
  it('variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])~=16.25', () => {
    expect(variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])).toBeCloseTo(16.25, 5);
  });
  it('variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])~=18.66667', () => {
    expect(variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])).toBeCloseTo(18.66666667, 5);
  });
  it('variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])~=21.25', () => {
    expect(variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])).toBeCloseTo(21.25, 5);
  });
  it('variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17])~=24.0', () => {
    expect(variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17])).toBeCloseTo(24.0, 5);
  });
  it('variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])~=26.91667', () => {
    expect(variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])).toBeCloseTo(26.91666667, 5);
  });
  it('variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19])~=30.0', () => {
    expect(variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19])).toBeCloseTo(30.0, 5);
  });
  it('variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])~=33.25', () => {
    expect(variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])).toBeCloseTo(33.25, 5);
  });
  it('variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21])~=36.66667', () => {
    expect(variance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21])).toBeCloseTo(36.66666667, 5);
  });
  it('variance([]) throws', () => {
    expect(() => variance([])).toThrow();
  });
});

describe('stdDev', () => {
  it('stdDev([2, 2, 2])~=0', () => {
    expect(stdDev([2, 2, 2])).toBeCloseTo(0, 5);
  });
  it('stdDev([0, 10])~=5', () => {
    expect(stdDev([0, 10])).toBeCloseTo(5, 5);
  });
  it('stdDev([1, 2])~=0.5', () => {
    expect(stdDev([1, 2])).toBeCloseTo(0.5, 5);
  });
  it('stdDev([1, 2, 3])~=0.8165', () => {
    expect(stdDev([1, 2, 3])).toBeCloseTo(0.81649658, 5);
  });
  it('stdDev([1, 2, 3, 4])~=1.11803', () => {
    expect(stdDev([1, 2, 3, 4])).toBeCloseTo(1.11803399, 5);
  });
  it('stdDev([1, 2, 3, 4, 5])~=1.41421', () => {
    expect(stdDev([1, 2, 3, 4, 5])).toBeCloseTo(1.41421356, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6])~=1.70783', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6])).toBeCloseTo(1.70782513, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6, 7])~=2.0', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6, 7])).toBeCloseTo(2.0, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6, 7, 8])~=2.29129', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6, 7, 8])).toBeCloseTo(2.29128785, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9])~=2.58199', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9])).toBeCloseTo(2.5819889, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])~=2.87228', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBeCloseTo(2.87228132, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])~=3.16228', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).toBeCloseTo(3.16227766, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])~=3.45205', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBeCloseTo(3.45205253, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])~=3.74166', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])).toBeCloseTo(3.74165739, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])~=4.03113', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])).toBeCloseTo(4.03112887, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])~=4.32049', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])).toBeCloseTo(4.3204938, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])~=4.60977', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])).toBeCloseTo(4.60977223, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17])~=4.89898', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17])).toBeCloseTo(4.89897949, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])~=5.18813', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])).toBeCloseTo(5.18812747, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19])~=5.47723', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19])).toBeCloseTo(5.47722558, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])~=5.76628', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])).toBeCloseTo(5.7662813, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21])~=6.0553', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21])).toBeCloseTo(6.05530071, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22])~=6.34429', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22])).toBeCloseTo(6.34428877, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23])~=6.63325', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23])).toBeCloseTo(6.63324958, 5);
  });
  it('stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24])~=6.92219', () => {
    expect(stdDev([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24])).toBeCloseTo(6.92218655, 5);
  });
  it('stdDev([]) throws', () => {
    expect(() => stdDev([])).toThrow();
  });
});

describe('percentile', () => {
  it('percentile([1, 2, 3, 4, 5],0)~=1', () => {
    expect(percentile([1, 2, 3, 4, 5], 0)).toBeCloseTo(1, 5);
  });
  it('percentile([1, 2, 3, 4, 5],100)~=5', () => {
    expect(percentile([1, 2, 3, 4, 5], 100)).toBeCloseTo(5, 5);
  });
  it('percentile([1, 2, 3, 4, 5],50)~=3', () => {
    expect(percentile([1, 2, 3, 4, 5], 50)).toBeCloseTo(3, 5);
  });
  it('percentile([1, 2, 3, 4, 5],25)~=2', () => {
    expect(percentile([1, 2, 3, 4, 5], 25)).toBeCloseTo(2, 5);
  });
  it('percentile([1, 2, 3, 4, 5],75)~=4', () => {
    expect(percentile([1, 2, 3, 4, 5], 75)).toBeCloseTo(4, 5);
  });
  it('percentile([10, 20, 30, 40, 50],50)~=30', () => {
    expect(percentile([10, 20, 30, 40, 50], 50)).toBeCloseTo(30, 5);
  });
  it('percentile([1, 3, 5, 7, 9],0)~=1', () => {
    expect(percentile([1, 3, 5, 7, 9], 0)).toBeCloseTo(1, 5);
  });
  it('percentile([1, 3, 5, 7, 9],100)~=9', () => {
    expect(percentile([1, 3, 5, 7, 9], 100)).toBeCloseTo(9, 5);
  });
  it('percentile([1, 3, 5, 7, 9],50)~=5', () => {
    expect(percentile([1, 3, 5, 7, 9], 50)).toBeCloseTo(5, 5);
  });
  it('percentile([2, 4, 6, 8, 10],0)~=2', () => {
    expect(percentile([2, 4, 6, 8, 10], 0)).toBeCloseTo(2, 5);
  });
  it('percentile([2, 4, 6, 8, 10],100)~=10', () => {
    expect(percentile([2, 4, 6, 8, 10], 100)).toBeCloseTo(10, 5);
  });
  it('percentile([2, 4, 6, 8, 10],50)~=6', () => {
    expect(percentile([2, 4, 6, 8, 10], 50)).toBeCloseTo(6, 5);
  });
  it('percentile([]) throws', () => {
    expect(() => percentile([], 50)).toThrow();
  });
  it('percentile p<0 throws', () => {
    expect(() => percentile([1,2], -1)).toThrow();
  });
  it('percentile p>100 throws', () => {
    expect(() => percentile([1,2], 101)).toThrow();
  });
});

describe('normalize', () => {
  it('normalize([0, 10])', () => {
    const result = normalize([0, 10]);
    expect(result[0]).toBeCloseTo(0, 5);
    expect(result[1]).toBeCloseTo(1, 5);
  });
  it('normalize([5, 5])', () => {
    const result = normalize([5, 5]);
    expect(result[0]).toBeCloseTo(0, 5);
    expect(result[1]).toBeCloseTo(0, 5);
  });
  it('normalize([0, 5, 10])', () => {
    const result = normalize([0, 5, 10]);
    expect(result[0]).toBeCloseTo(0, 5);
    expect(result[1]).toBeCloseTo(0.5, 5);
    expect(result[2]).toBeCloseTo(1, 5);
  });
  it('normalize([1, 2, 3, 4, 5])', () => {
    const result = normalize([1, 2, 3, 4, 5]);
    expect(result[0]).toBeCloseTo(0, 5);
    expect(result[1]).toBeCloseTo(0.25, 5);
    expect(result[2]).toBeCloseTo(0.5, 5);
    expect(result[3]).toBeCloseTo(0.75, 5);
    expect(result[4]).toBeCloseTo(1, 5);
  });
  it('normalize([10, 20, 30])', () => {
    const result = normalize([10, 20, 30]);
    expect(result[0]).toBeCloseTo(0, 5);
    expect(result[1]).toBeCloseTo(0.5, 5);
    expect(result[2]).toBeCloseTo(1, 5);
  });
  it('normalize([]) throws', () => {
    expect(() => normalize([])).toThrow();
  });
});

describe('range', () => {
  it('range([1, 2, 3, 4, 5])=4', () => {
    expect(range([1, 2, 3, 4, 5])).toBeCloseTo(4, 5);
  });
  it('range([10, 20, 30])=20', () => {
    expect(range([10, 20, 30])).toBeCloseTo(20, 5);
  });
  it('range([5])=0', () => {
    expect(range([5])).toBeCloseTo(0, 5);
  });
  it('range([-5, 5])=10', () => {
    expect(range([-5, 5])).toBeCloseTo(10, 5);
  });
  it('range([0, 0, 0])=0', () => {
    expect(range([0, 0, 0])).toBeCloseTo(0, 5);
  });
  it('range([100, 1])=99', () => {
    expect(range([100, 1])).toBeCloseTo(99, 5);
  });
  it('range([3, 1, 4, 1, 5, 9, 2, 6])=8', () => {
    expect(range([3, 1, 4, 1, 5, 9, 2, 6])).toBeCloseTo(8, 5);
  });
  it('range([1, 1, 1, 1])=0', () => {
    expect(range([1, 1, 1, 1])).toBeCloseTo(0, 5);
  });
  it('range([0, 100])=100', () => {
    expect(range([0, 100])).toBeCloseTo(100, 5);
  });
  it('range([50, 50, 50])=0', () => {
    expect(range([50, 50, 50])).toBeCloseTo(0, 5);
  });
  it('range([]) throws', () => {
    expect(() => range([])).toThrow();
  });
});

describe('isEven', () => {
  it('isEven(-20)=true', () => {
    expect(isEven(-20)).toBe(true);
  });
  it('isEven(-19)=false', () => {
    expect(isEven(-19)).toBe(false);
  });
  it('isEven(-18)=true', () => {
    expect(isEven(-18)).toBe(true);
  });
  it('isEven(-17)=false', () => {
    expect(isEven(-17)).toBe(false);
  });
  it('isEven(-16)=true', () => {
    expect(isEven(-16)).toBe(true);
  });
  it('isEven(-15)=false', () => {
    expect(isEven(-15)).toBe(false);
  });
  it('isEven(-14)=true', () => {
    expect(isEven(-14)).toBe(true);
  });
  it('isEven(-13)=false', () => {
    expect(isEven(-13)).toBe(false);
  });
  it('isEven(-12)=true', () => {
    expect(isEven(-12)).toBe(true);
  });
  it('isEven(-11)=false', () => {
    expect(isEven(-11)).toBe(false);
  });
  it('isEven(-10)=true', () => {
    expect(isEven(-10)).toBe(true);
  });
  it('isEven(-9)=false', () => {
    expect(isEven(-9)).toBe(false);
  });
  it('isEven(-8)=true', () => {
    expect(isEven(-8)).toBe(true);
  });
  it('isEven(-7)=false', () => {
    expect(isEven(-7)).toBe(false);
  });
  it('isEven(-6)=true', () => {
    expect(isEven(-6)).toBe(true);
  });
  it('isEven(-5)=false', () => {
    expect(isEven(-5)).toBe(false);
  });
  it('isEven(-4)=true', () => {
    expect(isEven(-4)).toBe(true);
  });
  it('isEven(-3)=false', () => {
    expect(isEven(-3)).toBe(false);
  });
  it('isEven(-2)=true', () => {
    expect(isEven(-2)).toBe(true);
  });
  it('isEven(-1)=false', () => {
    expect(isEven(-1)).toBe(false);
  });
  it('isEven(0)=true', () => {
    expect(isEven(0)).toBe(true);
  });
  it('isEven(1)=false', () => {
    expect(isEven(1)).toBe(false);
  });
  it('isEven(2)=true', () => {
    expect(isEven(2)).toBe(true);
  });
  it('isEven(3)=false', () => {
    expect(isEven(3)).toBe(false);
  });
  it('isEven(4)=true', () => {
    expect(isEven(4)).toBe(true);
  });
  it('isEven(5)=false', () => {
    expect(isEven(5)).toBe(false);
  });
  it('isEven(6)=true', () => {
    expect(isEven(6)).toBe(true);
  });
  it('isEven(7)=false', () => {
    expect(isEven(7)).toBe(false);
  });
  it('isEven(8)=true', () => {
    expect(isEven(8)).toBe(true);
  });
  it('isEven(9)=false', () => {
    expect(isEven(9)).toBe(false);
  });
  it('isEven(10)=true', () => {
    expect(isEven(10)).toBe(true);
  });
  it('isEven(11)=false', () => {
    expect(isEven(11)).toBe(false);
  });
  it('isEven(12)=true', () => {
    expect(isEven(12)).toBe(true);
  });
  it('isEven(13)=false', () => {
    expect(isEven(13)).toBe(false);
  });
  it('isEven(14)=true', () => {
    expect(isEven(14)).toBe(true);
  });
  it('isEven(15)=false', () => {
    expect(isEven(15)).toBe(false);
  });
  it('isEven(16)=true', () => {
    expect(isEven(16)).toBe(true);
  });
  it('isEven(17)=false', () => {
    expect(isEven(17)).toBe(false);
  });
  it('isEven(18)=true', () => {
    expect(isEven(18)).toBe(true);
  });
  it('isEven(19)=false', () => {
    expect(isEven(19)).toBe(false);
  });
  it('isEven(20)=true', () => {
    expect(isEven(20)).toBe(true);
  });
  it('isEven(1.5) is false', () => { expect(isEven(1.5)).toBe(false); });
  it('isEven(2.0) is true', () => { expect(isEven(2.0)).toBe(true); });
  it('isEven(100) is true', () => { expect(isEven(100)).toBe(true); });
  it('isEven(101) is false', () => { expect(isEven(101)).toBe(false); });
});

describe('isOdd', () => {
  it('isOdd(-20)=false', () => {
    expect(isOdd(-20)).toBe(false);
  });
  it('isOdd(-19)=true', () => {
    expect(isOdd(-19)).toBe(true);
  });
  it('isOdd(-18)=false', () => {
    expect(isOdd(-18)).toBe(false);
  });
  it('isOdd(-17)=true', () => {
    expect(isOdd(-17)).toBe(true);
  });
  it('isOdd(-16)=false', () => {
    expect(isOdd(-16)).toBe(false);
  });
  it('isOdd(-15)=true', () => {
    expect(isOdd(-15)).toBe(true);
  });
  it('isOdd(-14)=false', () => {
    expect(isOdd(-14)).toBe(false);
  });
  it('isOdd(-13)=true', () => {
    expect(isOdd(-13)).toBe(true);
  });
  it('isOdd(-12)=false', () => {
    expect(isOdd(-12)).toBe(false);
  });
  it('isOdd(-11)=true', () => {
    expect(isOdd(-11)).toBe(true);
  });
  it('isOdd(-10)=false', () => {
    expect(isOdd(-10)).toBe(false);
  });
  it('isOdd(-9)=true', () => {
    expect(isOdd(-9)).toBe(true);
  });
  it('isOdd(-8)=false', () => {
    expect(isOdd(-8)).toBe(false);
  });
  it('isOdd(-7)=true', () => {
    expect(isOdd(-7)).toBe(true);
  });
  it('isOdd(-6)=false', () => {
    expect(isOdd(-6)).toBe(false);
  });
  it('isOdd(-5)=true', () => {
    expect(isOdd(-5)).toBe(true);
  });
  it('isOdd(-4)=false', () => {
    expect(isOdd(-4)).toBe(false);
  });
  it('isOdd(-3)=true', () => {
    expect(isOdd(-3)).toBe(true);
  });
  it('isOdd(-2)=false', () => {
    expect(isOdd(-2)).toBe(false);
  });
  it('isOdd(-1)=true', () => {
    expect(isOdd(-1)).toBe(true);
  });
  it('isOdd(0)=false', () => {
    expect(isOdd(0)).toBe(false);
  });
  it('isOdd(1)=true', () => {
    expect(isOdd(1)).toBe(true);
  });
  it('isOdd(2)=false', () => {
    expect(isOdd(2)).toBe(false);
  });
  it('isOdd(3)=true', () => {
    expect(isOdd(3)).toBe(true);
  });
  it('isOdd(4)=false', () => {
    expect(isOdd(4)).toBe(false);
  });
  it('isOdd(5)=true', () => {
    expect(isOdd(5)).toBe(true);
  });
  it('isOdd(6)=false', () => {
    expect(isOdd(6)).toBe(false);
  });
  it('isOdd(7)=true', () => {
    expect(isOdd(7)).toBe(true);
  });
  it('isOdd(8)=false', () => {
    expect(isOdd(8)).toBe(false);
  });
  it('isOdd(9)=true', () => {
    expect(isOdd(9)).toBe(true);
  });
  it('isOdd(10)=false', () => {
    expect(isOdd(10)).toBe(false);
  });
  it('isOdd(11)=true', () => {
    expect(isOdd(11)).toBe(true);
  });
  it('isOdd(12)=false', () => {
    expect(isOdd(12)).toBe(false);
  });
  it('isOdd(13)=true', () => {
    expect(isOdd(13)).toBe(true);
  });
  it('isOdd(14)=false', () => {
    expect(isOdd(14)).toBe(false);
  });
  it('isOdd(15)=true', () => {
    expect(isOdd(15)).toBe(true);
  });
  it('isOdd(16)=false', () => {
    expect(isOdd(16)).toBe(false);
  });
  it('isOdd(17)=true', () => {
    expect(isOdd(17)).toBe(true);
  });
  it('isOdd(18)=false', () => {
    expect(isOdd(18)).toBe(false);
  });
  it('isOdd(19)=true', () => {
    expect(isOdd(19)).toBe(true);
  });
  it('isOdd(20)=false', () => {
    expect(isOdd(20)).toBe(false);
  });
  it('isOdd(1.5) is false', () => { expect(isOdd(1.5)).toBe(false); });
  it('isOdd(3.0) is true', () => { expect(isOdd(3.0)).toBe(true); });
  it('isOdd(99) is true', () => { expect(isOdd(99)).toBe(true); });
  it('isOdd(100) is false', () => { expect(isOdd(100)).toBe(false); });
});

describe('isInteger', () => {
  it('isInteger(0) is true', () => { expect(isInteger(0)).toBe(true); });
  it('isInteger(1) is true', () => { expect(isInteger(1)).toBe(true); });
  it('isInteger(2) is true', () => { expect(isInteger(2)).toBe(true); });
  it('isInteger(3) is true', () => { expect(isInteger(3)).toBe(true); });
  it('isInteger(4) is true', () => { expect(isInteger(4)).toBe(true); });
  it('isInteger(5) is true', () => { expect(isInteger(5)).toBe(true); });
  it('isInteger(6) is true', () => { expect(isInteger(6)).toBe(true); });
  it('isInteger(7) is true', () => { expect(isInteger(7)).toBe(true); });
  it('isInteger(8) is true', () => { expect(isInteger(8)).toBe(true); });
  it('isInteger(9) is true', () => { expect(isInteger(9)).toBe(true); });
  it('isInteger(10) is true', () => { expect(isInteger(10)).toBe(true); });
  it('isInteger(11) is true', () => { expect(isInteger(11)).toBe(true); });
  it('isInteger(12) is true', () => { expect(isInteger(12)).toBe(true); });
  it('isInteger(13) is true', () => { expect(isInteger(13)).toBe(true); });
  it('isInteger(14) is true', () => { expect(isInteger(14)).toBe(true); });
  it('isInteger(15) is true', () => { expect(isInteger(15)).toBe(true); });
  it('isInteger(16) is true', () => { expect(isInteger(16)).toBe(true); });
  it('isInteger(17) is true', () => { expect(isInteger(17)).toBe(true); });
  it('isInteger(18) is true', () => { expect(isInteger(18)).toBe(true); });
  it('isInteger(19) is true', () => { expect(isInteger(19)).toBe(true); });
  it('isInteger(20) is true', () => { expect(isInteger(20)).toBe(true); });
  it('isInteger(21) is true', () => { expect(isInteger(21)).toBe(true); });
  it('isInteger(22) is true', () => { expect(isInteger(22)).toBe(true); });
  it('isInteger(23) is true', () => { expect(isInteger(23)).toBe(true); });
  it('isInteger(24) is true', () => { expect(isInteger(24)).toBe(true); });
  it('isInteger(1.5) is false', () => { expect(isInteger(1.5)).toBe(false); });
  it('isInteger(0.1) is false', () => { expect(isInteger(0.1)).toBe(false); });
  it('isInteger(-2.7) is false', () => { expect(isInteger(-2.7)).toBe(false); });
  it('isInteger(3.14) is false', () => { expect(isInteger(3.14)).toBe(false); });
  it('isInteger(0.001) is false', () => { expect(isInteger(0.001)).toBe(false); });
  it('isInteger(0.999) is false', () => { expect(isInteger(0.999)).toBe(false); });
  it('isInteger(2.0001) is false', () => { expect(isInteger(2.0001)).toBe(false); });
  it('isInteger(-0.1) is false', () => { expect(isInteger(-0.1)).toBe(false); });
  it('isInteger(-10) is true', () => { expect(isInteger(-10)).toBe(true); });
  it('isInteger(1000) is true', () => { expect(isInteger(1000)).toBe(true); });
});

describe('isFiniteNumber', () => {
  it('isFiniteNumber(0) is true', () => { expect(isFiniteNumber(0)).toBe(true); });
  it('isFiniteNumber(1) is true', () => { expect(isFiniteNumber(1)).toBe(true); });
  it('isFiniteNumber(2) is true', () => { expect(isFiniteNumber(2)).toBe(true); });
  it('isFiniteNumber(3) is true', () => { expect(isFiniteNumber(3)).toBe(true); });
  it('isFiniteNumber(4) is true', () => { expect(isFiniteNumber(4)).toBe(true); });
  it('isFiniteNumber(5) is true', () => { expect(isFiniteNumber(5)).toBe(true); });
  it('isFiniteNumber(6) is true', () => { expect(isFiniteNumber(6)).toBe(true); });
  it('isFiniteNumber(7) is true', () => { expect(isFiniteNumber(7)).toBe(true); });
  it('isFiniteNumber(8) is true', () => { expect(isFiniteNumber(8)).toBe(true); });
  it('isFiniteNumber(9) is true', () => { expect(isFiniteNumber(9)).toBe(true); });
  it('isFiniteNumber(10) is true', () => { expect(isFiniteNumber(10)).toBe(true); });
  it('isFiniteNumber(11) is true', () => { expect(isFiniteNumber(11)).toBe(true); });
  it('isFiniteNumber(12) is true', () => { expect(isFiniteNumber(12)).toBe(true); });
  it('isFiniteNumber(13) is true', () => { expect(isFiniteNumber(13)).toBe(true); });
  it('isFiniteNumber(14) is true', () => { expect(isFiniteNumber(14)).toBe(true); });
  it('isFiniteNumber(15) is true', () => { expect(isFiniteNumber(15)).toBe(true); });
  it('isFiniteNumber(16) is true', () => { expect(isFiniteNumber(16)).toBe(true); });
  it('isFiniteNumber(17) is true', () => { expect(isFiniteNumber(17)).toBe(true); });
  it('isFiniteNumber(18) is true', () => { expect(isFiniteNumber(18)).toBe(true); });
  it('isFiniteNumber(19) is true', () => { expect(isFiniteNumber(19)).toBe(true); });
  it('isFiniteNumber(-1) is true', () => { expect(isFiniteNumber(-1)).toBe(true); });
  it('isFiniteNumber(-2) is true', () => { expect(isFiniteNumber(-2)).toBe(true); });
  it('isFiniteNumber(-3) is true', () => { expect(isFiniteNumber(-3)).toBe(true); });
  it('isFiniteNumber(-4) is true', () => { expect(isFiniteNumber(-4)).toBe(true); });
  it('isFiniteNumber(-5) is true', () => { expect(isFiniteNumber(-5)).toBe(true); });
  it('isFiniteNumber(-6) is true', () => { expect(isFiniteNumber(-6)).toBe(true); });
  it('isFiniteNumber(-7) is true', () => { expect(isFiniteNumber(-7)).toBe(true); });
  it('isFiniteNumber(-8) is true', () => { expect(isFiniteNumber(-8)).toBe(true); });
  it('isFiniteNumber(-9) is true', () => { expect(isFiniteNumber(-9)).toBe(true); });
  it('isFiniteNumber(-10) is true', () => { expect(isFiniteNumber(-10)).toBe(true); });
  it('isFiniteNumber(Infinity) is false', () => { expect(isFiniteNumber(Infinity)).toBe(false); });
  it('isFiniteNumber(-Infinity) is false', () => { expect(isFiniteNumber(-Infinity)).toBe(false); });
  it('isFiniteNumber(NaN) is false', () => { expect(isFiniteNumber(NaN)).toBe(false); });
  it('isFiniteNumber("1") is false', () => { expect(isFiniteNumber('1')).toBe(false); });
  it('isFiniteNumber(null) is false', () => { expect(isFiniteNumber(null)).toBe(false); });
  it('isFiniteNumber(undefined) is false', () => { expect(isFiniteNumber(undefined)).toBe(false); });
  it('isFiniteNumber({}) is false', () => { expect(isFiniteNumber({})).toBe(false); });
  it('isFiniteNumber([]) is false', () => { expect(isFiniteNumber([])).toBe(false); });
});

describe('inRange', () => {
  it('inRange(5,0,10,false)=true', () => {
    expect(inRange(5, 0, 10, false)).toBe(true);
  });
  it('inRange(0,0,10,false)=true', () => {
    expect(inRange(0, 0, 10, false)).toBe(true);
  });
  it('inRange(10,0,10,false)=true', () => {
    expect(inRange(10, 0, 10, false)).toBe(true);
  });
  it('inRange(-1,0,10,false)=false', () => {
    expect(inRange(-1, 0, 10, false)).toBe(false);
  });
  it('inRange(11,0,10,false)=false', () => {
    expect(inRange(11, 0, 10, false)).toBe(false);
  });
  it('inRange(5,0,10,true)=true', () => {
    expect(inRange(5, 0, 10, true)).toBe(true);
  });
  it('inRange(0,0,10,true)=false', () => {
    expect(inRange(0, 0, 10, true)).toBe(false);
  });
  it('inRange(10,0,10,true)=false', () => {
    expect(inRange(10, 0, 10, true)).toBe(false);
  });
  it('inRange(3,3,3,false)=true', () => {
    expect(inRange(3, 3, 3, false)).toBe(true);
  });
  it('inRange(3,3,3,true)=false', () => {
    expect(inRange(3, 3, 3, true)).toBe(false);
  });
  it('inRange(0,0,30,false)=true', () => {
    expect(inRange(0, 0, 30, false)).toBe(true);
  });
  it('inRange(1,0,30,false)=true', () => {
    expect(inRange(1, 0, 30, false)).toBe(true);
  });
  it('inRange(2,0,30,false)=true', () => {
    expect(inRange(2, 0, 30, false)).toBe(true);
  });
  it('inRange(3,0,30,false)=true', () => {
    expect(inRange(3, 0, 30, false)).toBe(true);
  });
  it('inRange(4,0,30,false)=true', () => {
    expect(inRange(4, 0, 30, false)).toBe(true);
  });
  it('inRange(5,0,30,false)=true', () => {
    expect(inRange(5, 0, 30, false)).toBe(true);
  });
  it('inRange(6,0,30,false)=true', () => {
    expect(inRange(6, 0, 30, false)).toBe(true);
  });
  it('inRange(7,0,30,false)=true', () => {
    expect(inRange(7, 0, 30, false)).toBe(true);
  });
  it('inRange(8,0,30,false)=true', () => {
    expect(inRange(8, 0, 30, false)).toBe(true);
  });
  it('inRange(9,0,30,false)=true', () => {
    expect(inRange(9, 0, 30, false)).toBe(true);
  });
  it('inRange(10,0,30,false)=true', () => {
    expect(inRange(10, 0, 30, false)).toBe(true);
  });
  it('inRange(11,0,30,false)=true', () => {
    expect(inRange(11, 0, 30, false)).toBe(true);
  });
  it('inRange(12,0,30,false)=true', () => {
    expect(inRange(12, 0, 30, false)).toBe(true);
  });
  it('inRange(13,0,30,false)=true', () => {
    expect(inRange(13, 0, 30, false)).toBe(true);
  });
  it('inRange(14,0,30,false)=true', () => {
    expect(inRange(14, 0, 30, false)).toBe(true);
  });
  it('inRange(15,0,30,false)=true', () => {
    expect(inRange(15, 0, 30, false)).toBe(true);
  });
  it('inRange(16,0,30,false)=true', () => {
    expect(inRange(16, 0, 30, false)).toBe(true);
  });
  it('inRange(17,0,30,false)=true', () => {
    expect(inRange(17, 0, 30, false)).toBe(true);
  });
  it('inRange(18,0,30,false)=true', () => {
    expect(inRange(18, 0, 30, false)).toBe(true);
  });
  it('inRange(19,0,30,false)=true', () => {
    expect(inRange(19, 0, 30, false)).toBe(true);
  });
  it('inRange(20,0,30,false)=true', () => {
    expect(inRange(20, 0, 30, false)).toBe(true);
  });
  it('inRange(21,0,30,false)=true', () => {
    expect(inRange(21, 0, 30, false)).toBe(true);
  });
  it('inRange(22,0,30,false)=true', () => {
    expect(inRange(22, 0, 30, false)).toBe(true);
  });
  it('inRange(23,0,30,false)=true', () => {
    expect(inRange(23, 0, 30, false)).toBe(true);
  });
  it('inRange(24,0,30,false)=true', () => {
    expect(inRange(24, 0, 30, false)).toBe(true);
  });
});

describe('toRoman', () => {
  it('toRoman(1)="I"', () => {
    expect(toRoman(1)).toBe('I');
  });
  it('toRoman(2)="II"', () => {
    expect(toRoman(2)).toBe('II');
  });
  it('toRoman(3)="III"', () => {
    expect(toRoman(3)).toBe('III');
  });
  it('toRoman(4)="IV"', () => {
    expect(toRoman(4)).toBe('IV');
  });
  it('toRoman(5)="V"', () => {
    expect(toRoman(5)).toBe('V');
  });
  it('toRoman(6)="VI"', () => {
    expect(toRoman(6)).toBe('VI');
  });
  it('toRoman(7)="VII"', () => {
    expect(toRoman(7)).toBe('VII');
  });
  it('toRoman(8)="VIII"', () => {
    expect(toRoman(8)).toBe('VIII');
  });
  it('toRoman(9)="IX"', () => {
    expect(toRoman(9)).toBe('IX');
  });
  it('toRoman(10)="X"', () => {
    expect(toRoman(10)).toBe('X');
  });
  it('toRoman(11)="XI"', () => {
    expect(toRoman(11)).toBe('XI');
  });
  it('toRoman(12)="XII"', () => {
    expect(toRoman(12)).toBe('XII');
  });
  it('toRoman(13)="XIII"', () => {
    expect(toRoman(13)).toBe('XIII');
  });
  it('toRoman(14)="XIV"', () => {
    expect(toRoman(14)).toBe('XIV');
  });
  it('toRoman(15)="XV"', () => {
    expect(toRoman(15)).toBe('XV');
  });
  it('toRoman(16)="XVI"', () => {
    expect(toRoman(16)).toBe('XVI');
  });
  it('toRoman(17)="XVII"', () => {
    expect(toRoman(17)).toBe('XVII');
  });
  it('toRoman(18)="XVIII"', () => {
    expect(toRoman(18)).toBe('XVIII');
  });
  it('toRoman(19)="XIX"', () => {
    expect(toRoman(19)).toBe('XIX');
  });
  it('toRoman(20)="XX"', () => {
    expect(toRoman(20)).toBe('XX');
  });
  it('toRoman(21)="XXI"', () => {
    expect(toRoman(21)).toBe('XXI');
  });
  it('toRoman(30)="XXX"', () => {
    expect(toRoman(30)).toBe('XXX');
  });
  it('toRoman(40)="XL"', () => {
    expect(toRoman(40)).toBe('XL');
  });
  it('toRoman(49)="XLIX"', () => {
    expect(toRoman(49)).toBe('XLIX');
  });
  it('toRoman(50)="L"', () => {
    expect(toRoman(50)).toBe('L');
  });
  it('toRoman(51)="LI"', () => {
    expect(toRoman(51)).toBe('LI');
  });
  it('toRoman(60)="LX"', () => {
    expect(toRoman(60)).toBe('LX');
  });
  it('toRoman(70)="LXX"', () => {
    expect(toRoman(70)).toBe('LXX');
  });
  it('toRoman(79)="LXXIX"', () => {
    expect(toRoman(79)).toBe('LXXIX');
  });
  it('toRoman(80)="LXXX"', () => {
    expect(toRoman(80)).toBe('LXXX');
  });
  it('toRoman(89)="LXXXIX"', () => {
    expect(toRoman(89)).toBe('LXXXIX');
  });
  it('toRoman(90)="XC"', () => {
    expect(toRoman(90)).toBe('XC');
  });
  it('toRoman(99)="XCIX"', () => {
    expect(toRoman(99)).toBe('XCIX');
  });
  it('toRoman(100)="C"', () => {
    expect(toRoman(100)).toBe('C');
  });
  it('toRoman(101)="CI"', () => {
    expect(toRoman(101)).toBe('CI');
  });
  it('toRoman(104)="CIV"', () => {
    expect(toRoman(104)).toBe('CIV');
  });
  it('toRoman(400)="CD"', () => {
    expect(toRoman(400)).toBe('CD');
  });
  it('toRoman(444)="CDXLIV"', () => {
    expect(toRoman(444)).toBe('CDXLIV');
  });
  it('toRoman(499)="CDXCIX"', () => {
    expect(toRoman(499)).toBe('CDXCIX');
  });
  it('toRoman(500)="D"', () => {
    expect(toRoman(500)).toBe('D');
  });
  it('toRoman(501)="DI"', () => {
    expect(toRoman(501)).toBe('DI');
  });
  it('toRoman(555)="DLV"', () => {
    expect(toRoman(555)).toBe('DLV');
  });
  it('toRoman(600)="DC"', () => {
    expect(toRoman(600)).toBe('DC');
  });
  it('toRoman(700)="DCC"', () => {
    expect(toRoman(700)).toBe('DCC');
  });
  it('toRoman(800)="DCCC"', () => {
    expect(toRoman(800)).toBe('DCCC');
  });
  it('toRoman(900)="CM"', () => {
    expect(toRoman(900)).toBe('CM');
  });
  it('toRoman(999)="CMXCIX"', () => {
    expect(toRoman(999)).toBe('CMXCIX');
  });
  it('toRoman(1000)="M"', () => {
    expect(toRoman(1000)).toBe('M');
  });
  it('toRoman(1001)="MI"', () => {
    expect(toRoman(1001)).toBe('MI');
  });
  it('toRoman(1004)="MIV"', () => {
    expect(toRoman(1004)).toBe('MIV');
  });
  it('toRoman(0) throws', () => { expect(() => toRoman(0)).toThrow(); });
  it('toRoman(4000) throws', () => { expect(() => toRoman(4000)).toThrow(); });
  it('toRoman(-1) throws', () => { expect(() => toRoman(-1)).toThrow(); });
  it('toRoman(3.5) throws', () => { expect(() => toRoman(3.5 as any)).toThrow(); });
});

describe('fromRoman', () => {
  it('fromRoman("I")=1', () => {
    expect(fromRoman('I')).toBe(1);
  });
  it('fromRoman("II")=2', () => {
    expect(fromRoman('II')).toBe(2);
  });
  it('fromRoman("III")=3', () => {
    expect(fromRoman('III')).toBe(3);
  });
  it('fromRoman("IV")=4', () => {
    expect(fromRoman('IV')).toBe(4);
  });
  it('fromRoman("V")=5', () => {
    expect(fromRoman('V')).toBe(5);
  });
  it('fromRoman("VI")=6', () => {
    expect(fromRoman('VI')).toBe(6);
  });
  it('fromRoman("VII")=7', () => {
    expect(fromRoman('VII')).toBe(7);
  });
  it('fromRoman("VIII")=8', () => {
    expect(fromRoman('VIII')).toBe(8);
  });
  it('fromRoman("IX")=9', () => {
    expect(fromRoman('IX')).toBe(9);
  });
  it('fromRoman("X")=10', () => {
    expect(fromRoman('X')).toBe(10);
  });
  it('fromRoman("XI")=11', () => {
    expect(fromRoman('XI')).toBe(11);
  });
  it('fromRoman("XII")=12', () => {
    expect(fromRoman('XII')).toBe(12);
  });
  it('fromRoman("XIII")=13', () => {
    expect(fromRoman('XIII')).toBe(13);
  });
  it('fromRoman("XIV")=14', () => {
    expect(fromRoman('XIV')).toBe(14);
  });
  it('fromRoman("XV")=15', () => {
    expect(fromRoman('XV')).toBe(15);
  });
  it('fromRoman("XVI")=16', () => {
    expect(fromRoman('XVI')).toBe(16);
  });
  it('fromRoman("XVII")=17', () => {
    expect(fromRoman('XVII')).toBe(17);
  });
  it('fromRoman("XVIII")=18', () => {
    expect(fromRoman('XVIII')).toBe(18);
  });
  it('fromRoman("XIX")=19', () => {
    expect(fromRoman('XIX')).toBe(19);
  });
  it('fromRoman("XX")=20', () => {
    expect(fromRoman('XX')).toBe(20);
  });
  it('fromRoman("XXI")=21', () => {
    expect(fromRoman('XXI')).toBe(21);
  });
  it('fromRoman("XXX")=30', () => {
    expect(fromRoman('XXX')).toBe(30);
  });
  it('fromRoman("XL")=40', () => {
    expect(fromRoman('XL')).toBe(40);
  });
  it('fromRoman("XLIX")=49', () => {
    expect(fromRoman('XLIX')).toBe(49);
  });
  it('fromRoman("L")=50', () => {
    expect(fromRoman('L')).toBe(50);
  });
  it('fromRoman("LI")=51', () => {
    expect(fromRoman('LI')).toBe(51);
  });
  it('fromRoman("LX")=60', () => {
    expect(fromRoman('LX')).toBe(60);
  });
  it('fromRoman("LXX")=70', () => {
    expect(fromRoman('LXX')).toBe(70);
  });
  it('fromRoman("LXXIX")=79', () => {
    expect(fromRoman('LXXIX')).toBe(79);
  });
  it('fromRoman("LXXX")=80', () => {
    expect(fromRoman('LXXX')).toBe(80);
  });
  it('fromRoman("LXXXIX")=89', () => {
    expect(fromRoman('LXXXIX')).toBe(89);
  });
  it('fromRoman("XC")=90', () => {
    expect(fromRoman('XC')).toBe(90);
  });
  it('fromRoman("XCIX")=99', () => {
    expect(fromRoman('XCIX')).toBe(99);
  });
  it('fromRoman("C")=100', () => {
    expect(fromRoman('C')).toBe(100);
  });
  it('fromRoman("CI")=101', () => {
    expect(fromRoman('CI')).toBe(101);
  });
  it('fromRoman("CIV")=104', () => {
    expect(fromRoman('CIV')).toBe(104);
  });
  it('fromRoman("CD")=400', () => {
    expect(fromRoman('CD')).toBe(400);
  });
  it('fromRoman("CDXLIV")=444', () => {
    expect(fromRoman('CDXLIV')).toBe(444);
  });
  it('fromRoman("CDXCIX")=499', () => {
    expect(fromRoman('CDXCIX')).toBe(499);
  });
  it('fromRoman("D")=500', () => {
    expect(fromRoman('D')).toBe(500);
  });
  it('fromRoman("DI")=501', () => {
    expect(fromRoman('DI')).toBe(501);
  });
  it('fromRoman("DLV")=555', () => {
    expect(fromRoman('DLV')).toBe(555);
  });
  it('fromRoman("DC")=600', () => {
    expect(fromRoman('DC')).toBe(600);
  });
  it('fromRoman("DCC")=700', () => {
    expect(fromRoman('DCC')).toBe(700);
  });
  it('fromRoman("DCCC")=800', () => {
    expect(fromRoman('DCCC')).toBe(800);
  });
  it('fromRoman("CM")=900', () => {
    expect(fromRoman('CM')).toBe(900);
  });
  it('fromRoman("CMXCIX")=999', () => {
    expect(fromRoman('CMXCIX')).toBe(999);
  });
  it('fromRoman invalid throws', () => { expect(() => fromRoman('ABCD')).toThrow(); });
  it('round-trip 1999', () => { expect(fromRoman(toRoman(1999))).toBe(1999); });
  it('round-trip 2026', () => { expect(fromRoman(toRoman(2026))).toBe(2026); });
  it('case insensitive xiv=14', () => { expect(fromRoman('xiv')).toBe(14); });
  it('case insensitive mcm=1900', () => { expect(fromRoman('mcm')).toBe(1900); });
});

describe('formatWithCommas', () => {
  it('formatWithCommas(0)="0"', () => {
    expect(formatWithCommas(0)).toBe('0');
  });
  it('formatWithCommas(1)="1"', () => {
    expect(formatWithCommas(1)).toBe('1');
  });
  it('formatWithCommas(100)="100"', () => {
    expect(formatWithCommas(100)).toBe('100');
  });
  it('formatWithCommas(1000)="1,000"', () => {
    expect(formatWithCommas(1000)).toBe('1,000');
  });
  it('formatWithCommas(10000)="10,000"', () => {
    expect(formatWithCommas(10000)).toBe('10,000');
  });
  it('formatWithCommas(100000)="100,000"', () => {
    expect(formatWithCommas(100000)).toBe('100,000');
  });
  it('formatWithCommas(1000000)="1,000,000"', () => {
    expect(formatWithCommas(1000000)).toBe('1,000,000');
  });
  it('formatWithCommas(1000000000)="1,000,000,000"', () => {
    expect(formatWithCommas(1000000000)).toBe('1,000,000,000');
  });
  it('formatWithCommas(-1000)="-1,000"', () => {
    expect(formatWithCommas(-1000)).toBe('-1,000');
  });
  it('formatWithCommas(1234567)="1,234,567"', () => {
    expect(formatWithCommas(1234567)).toBe('1,234,567');
  });
  it('formatWithCommas(999)="999"', () => {
    expect(formatWithCommas(999)).toBe('999');
  });
  it('formatWithCommas(1001)="1,001"', () => {
    expect(formatWithCommas(1001)).toBe('1,001');
  });
  it('formatWithCommas(10001)="10,001"', () => {
    expect(formatWithCommas(10001)).toBe('10,001');
  });
  it('formatWithCommas(1234567890)="1,234,567,890"', () => {
    expect(formatWithCommas(1234567890)).toBe('1,234,567,890');
  });
  it('formatWithCommas(500)="500"', () => {
    expect(formatWithCommas(500)).toBe('500');
  });
  it('formatWithCommas(5000)="5,000"', () => {
    expect(formatWithCommas(5000)).toBe('5,000');
  });
  it('formatWithCommas(1000)="1,000"', () => {
    expect(formatWithCommas(1000)).toBe('1,000');
  });
  it('formatWithCommas(2000)="2,000"', () => {
    expect(formatWithCommas(2000)).toBe('2,000');
  });
  it('formatWithCommas(3000)="3,000"', () => {
    expect(formatWithCommas(3000)).toBe('3,000');
  });
  it('formatWithCommas(4000)="4,000"', () => {
    expect(formatWithCommas(4000)).toBe('4,000');
  });
  it('formatWithCommas(5000)="5,000"', () => {
    expect(formatWithCommas(5000)).toBe('5,000');
  });
  it('formatWithCommas(6000)="6,000"', () => {
    expect(formatWithCommas(6000)).toBe('6,000');
  });
  it('formatWithCommas(7000)="7,000"', () => {
    expect(formatWithCommas(7000)).toBe('7,000');
  });
  it('formatWithCommas(8000)="8,000"', () => {
    expect(formatWithCommas(8000)).toBe('8,000');
  });
  it('formatWithCommas(9000)="9,000"', () => {
    expect(formatWithCommas(9000)).toBe('9,000');
  });
  it('formatWithCommas(10000)="10,000"', () => {
    expect(formatWithCommas(10000)).toBe('10,000');
  });
  it('formatWithCommas(11000)="11,000"', () => {
    expect(formatWithCommas(11000)).toBe('11,000');
  });
  it('formatWithCommas(12000)="12,000"', () => {
    expect(formatWithCommas(12000)).toBe('12,000');
  });
  it('formatWithCommas(13000)="13,000"', () => {
    expect(formatWithCommas(13000)).toBe('13,000');
  });
  it('formatWithCommas(14000)="14,000"', () => {
    expect(formatWithCommas(14000)).toBe('14,000');
  });
  it('formatWithCommas(15000)="15,000"', () => {
    expect(formatWithCommas(15000)).toBe('15,000');
  });
  it('formatWithCommas(16000)="16,000"', () => {
    expect(formatWithCommas(16000)).toBe('16,000');
  });
  it('formatWithCommas(17000)="17,000"', () => {
    expect(formatWithCommas(17000)).toBe('17,000');
  });
  it('formatWithCommas(18000)="18,000"', () => {
    expect(formatWithCommas(18000)).toBe('18,000');
  });
  it('formatWithCommas(19000)="19,000"', () => {
    expect(formatWithCommas(19000)).toBe('19,000');
  });
  it('formatWithCommas(20000)="20,000"', () => {
    expect(formatWithCommas(20000)).toBe('20,000');
  });
  it('formatWithCommas(21000)="21,000"', () => {
    expect(formatWithCommas(21000)).toBe('21,000');
  });
  it('formatWithCommas(22000)="22,000"', () => {
    expect(formatWithCommas(22000)).toBe('22,000');
  });
  it('formatWithCommas(23000)="23,000"', () => {
    expect(formatWithCommas(23000)).toBe('23,000');
  });
  it('formatWithCommas(24000)="24,000"', () => {
    expect(formatWithCommas(24000)).toBe('24,000');
  });
  it('formatWithCommas(25000)="25,000"', () => {
    expect(formatWithCommas(25000)).toBe('25,000');
  });
  it('formatWithCommas(26000)="26,000"', () => {
    expect(formatWithCommas(26000)).toBe('26,000');
  });
  it('formatWithCommas(27000)="27,000"', () => {
    expect(formatWithCommas(27000)).toBe('27,000');
  });
  it('formatWithCommas(28000)="28,000"', () => {
    expect(formatWithCommas(28000)).toBe('28,000');
  });
  it('formatWithCommas(29000)="29,000"', () => {
    expect(formatWithCommas(29000)).toBe('29,000');
  });
  it('formatWithCommas(30000)="30,000"', () => {
    expect(formatWithCommas(30000)).toBe('30,000');
  });
  it('formatWithCommas(31000)="31,000"', () => {
    expect(formatWithCommas(31000)).toBe('31,000');
  });
  it('formatWithCommas(32000)="32,000"', () => {
    expect(formatWithCommas(32000)).toBe('32,000');
  });
  it('formatWithCommas(33000)="33,000"', () => {
    expect(formatWithCommas(33000)).toBe('33,000');
  });
  it('formatWithCommas(34000)="34,000"', () => {
    expect(formatWithCommas(34000)).toBe('34,000');
  });
  it('formatWithCommas(35000)="35,000"', () => {
    expect(formatWithCommas(35000)).toBe('35,000');
  });
  it('formatWithCommas(36000)="36,000"', () => {
    expect(formatWithCommas(36000)).toBe('36,000');
  });
  it('formatWithCommas(37000)="37,000"', () => {
    expect(formatWithCommas(37000)).toBe('37,000');
  });
  it('formatWithCommas(38000)="38,000"', () => {
    expect(formatWithCommas(38000)).toBe('38,000');
  });
  it('formatWithCommas(39000)="39,000"', () => {
    expect(formatWithCommas(39000)).toBe('39,000');
  });
  it('formatWithCommas(40000)="40,000"', () => {
    expect(formatWithCommas(40000)).toBe('40,000');
  });
  it('formatWithCommas(41000)="41,000"', () => {
    expect(formatWithCommas(41000)).toBe('41,000');
  });
  it('formatWithCommas(42000)="42,000"', () => {
    expect(formatWithCommas(42000)).toBe('42,000');
  });
  it('formatWithCommas(43000)="43,000"', () => {
    expect(formatWithCommas(43000)).toBe('43,000');
  });
  it('formatWithCommas(44000)="44,000"', () => {
    expect(formatWithCommas(44000)).toBe('44,000');
  });
  it('formatWithCommas(45000)="45,000"', () => {
    expect(formatWithCommas(45000)).toBe('45,000');
  });
  it('formatWithCommas(46000)="46,000"', () => {
    expect(formatWithCommas(46000)).toBe('46,000');
  });
  it('formatWithCommas(47000)="47,000"', () => {
    expect(formatWithCommas(47000)).toBe('47,000');
  });
  it('formatWithCommas(48000)="48,000"', () => {
    expect(formatWithCommas(48000)).toBe('48,000');
  });
  it('formatWithCommas(49000)="49,000"', () => {
    expect(formatWithCommas(49000)).toBe('49,000');
  });
  it('formatWithCommas(50000)="50,000"', () => {
    expect(formatWithCommas(50000)).toBe('50,000');
  });
  it('formatWithCommas(51000)="51,000"', () => {
    expect(formatWithCommas(51000)).toBe('51,000');
  });
  it('formatWithCommas(52000)="52,000"', () => {
    expect(formatWithCommas(52000)).toBe('52,000');
  });
  it('formatWithCommas(53000)="53,000"', () => {
    expect(formatWithCommas(53000)).toBe('53,000');
  });
  it('formatWithCommas(54000)="54,000"', () => {
    expect(formatWithCommas(54000)).toBe('54,000');
  });
  it('formatWithCommas(55000)="55,000"', () => {
    expect(formatWithCommas(55000)).toBe('55,000');
  });
  it('formatWithCommas(56000)="56,000"', () => {
    expect(formatWithCommas(56000)).toBe('56,000');
  });
  it('formatWithCommas(57000)="57,000"', () => {
    expect(formatWithCommas(57000)).toBe('57,000');
  });
  it('formatWithCommas(58000)="58,000"', () => {
    expect(formatWithCommas(58000)).toBe('58,000');
  });
  it('formatWithCommas(59000)="59,000"', () => {
    expect(formatWithCommas(59000)).toBe('59,000');
  });
  it('formatWithCommas(60000)="60,000"', () => {
    expect(formatWithCommas(60000)).toBe('60,000');
  });
  it('formatWithCommas(1234.56)="1,234.56"', () => { expect(formatWithCommas(1234.56)).toBe('1,234.56'); });
  it('formatWithCommas(0.5)="0.5"', () => { expect(formatWithCommas(0.5)).toBe('0.5'); });
  it('formatWithCommas(-1234567)="-1,234,567"', () => { expect(formatWithCommas(-1234567)).toBe('-1,234,567'); });
  it('formatWithCommas(1000000.99)="1,000,000.99"', () => { expect(formatWithCommas(1000000.99)).toBe('1,000,000.99'); });
  it('formatWithCommas(12)="12"', () => { expect(formatWithCommas(12)).toBe('12'); });
  it('formatWithCommas(99)="99"', () => { expect(formatWithCommas(99)).toBe('99'); });
  it('formatWithCommas(1999999)="1,999,999"', () => { expect(formatWithCommas(1999999)).toBe('1,999,999'); });
  it('formatWithCommas(10000000)="10,000,000"', () => { expect(formatWithCommas(10000000)).toBe('10,000,000'); });
});

describe('safeDiv', () => {
  it('safeDiv(10,2)=5', () => { expect(safeDiv(10, 2)).toBeCloseTo(5, 5); });
  it('safeDiv(1,0)=0 default', () => { expect(safeDiv(1, 0)).toBe(0); });
  it('safeDiv(1,0,99)=99', () => { expect(safeDiv(1, 0, 99)).toBe(99); });
  it('safeDiv(0,5)=0', () => { expect(safeDiv(0, 5)).toBeCloseTo(0, 5); });
  it('safeDiv(-10,2)=-5', () => { expect(safeDiv(-10, 2)).toBeCloseTo(-5, 5); });
  it('safeDiv(7,2)=3.5', () => { expect(safeDiv(7, 2)).toBeCloseTo(3.5, 5); });
  it('safeDiv(0,0)=0', () => { expect(safeDiv(0, 0)).toBe(0); });
  it('safeDiv(100,4)=25', () => { expect(safeDiv(100, 4)).toBeCloseTo(25, 5); });
  it('safeDiv(10,1)=10 [1]', () => { expect(safeDiv(10, 1)).toBeCloseTo(10, 5); });
  it('safeDiv(20,2)=10 [2]', () => { expect(safeDiv(20, 2)).toBeCloseTo(10, 5); });
  it('safeDiv(30,3)=10 [3]', () => { expect(safeDiv(30, 3)).toBeCloseTo(10, 5); });
  it('safeDiv(40,4)=10 [4]', () => { expect(safeDiv(40, 4)).toBeCloseTo(10, 5); });
  it('safeDiv(50,5)=10 [5]', () => { expect(safeDiv(50, 5)).toBeCloseTo(10, 5); });
  it('safeDiv(60,6)=10 [6]', () => { expect(safeDiv(60, 6)).toBeCloseTo(10, 5); });
  it('safeDiv(70,7)=10 [7]', () => { expect(safeDiv(70, 7)).toBeCloseTo(10, 5); });
  it('safeDiv(80,8)=10 [8]', () => { expect(safeDiv(80, 8)).toBeCloseTo(10, 5); });
  it('safeDiv(90,9)=10 [9]', () => { expect(safeDiv(90, 9)).toBeCloseTo(10, 5); });
  it('safeDiv(100,10)=10 [10]', () => { expect(safeDiv(100, 10)).toBeCloseTo(10, 5); });
  it('safeDiv(110,11)=10 [11]', () => { expect(safeDiv(110, 11)).toBeCloseTo(10, 5); });
  it('safeDiv(120,12)=10 [12]', () => { expect(safeDiv(120, 12)).toBeCloseTo(10, 5); });
  it('safeDiv(130,13)=10 [13]', () => { expect(safeDiv(130, 13)).toBeCloseTo(10, 5); });
  it('safeDiv(140,14)=10 [14]', () => { expect(safeDiv(140, 14)).toBeCloseTo(10, 5); });
  it('safeDiv(150,15)=10 [15]', () => { expect(safeDiv(150, 15)).toBeCloseTo(10, 5); });
  it('safeDiv(160,16)=10 [16]', () => { expect(safeDiv(160, 16)).toBeCloseTo(10, 5); });
  it('safeDiv(170,17)=10 [17]', () => { expect(safeDiv(170, 17)).toBeCloseTo(10, 5); });
  it('safeDiv(180,18)=10 [18]', () => { expect(safeDiv(180, 18)).toBeCloseTo(10, 5); });
  it('safeDiv(190,19)=10 [19]', () => { expect(safeDiv(190, 19)).toBeCloseTo(10, 5); });
  it('safeDiv(200,20)=10 [20]', () => { expect(safeDiv(200, 20)).toBeCloseTo(10, 5); });
  it('safeDiv(210,21)=10 [21]', () => { expect(safeDiv(210, 21)).toBeCloseTo(10, 5); });
  it('safeDiv(220,22)=10 [22]', () => { expect(safeDiv(220, 22)).toBeCloseTo(10, 5); });
  it('safeDiv(230,23)=10 [23]', () => { expect(safeDiv(230, 23)).toBeCloseTo(10, 5); });
  it('safeDiv(240,24)=10 [24]', () => { expect(safeDiv(240, 24)).toBeCloseTo(10, 5); });
  it('safeDiv(250,25)=10 [25]', () => { expect(safeDiv(250, 25)).toBeCloseTo(10, 5); });
  it('safeDiv(260,26)=10 [26]', () => { expect(safeDiv(260, 26)).toBeCloseTo(10, 5); });
  it('safeDiv(270,27)=10 [27]', () => { expect(safeDiv(270, 27)).toBeCloseTo(10, 5); });
  it('safeDiv(280,28)=10 [28]', () => { expect(safeDiv(280, 28)).toBeCloseTo(10, 5); });
  it('safeDiv(290,29)=10 [29]', () => { expect(safeDiv(290, 29)).toBeCloseTo(10, 5); });
  it('safeDiv(300,30)=10 [30]', () => { expect(safeDiv(300, 30)).toBeCloseTo(10, 5); });
  it('safeDiv(310,31)=10 [31]', () => { expect(safeDiv(310, 31)).toBeCloseTo(10, 5); });
  it('safeDiv(320,32)=10 [32]', () => { expect(safeDiv(320, 32)).toBeCloseTo(10, 5); });
  it('safeDiv(330,33)=10 [33]', () => { expect(safeDiv(330, 33)).toBeCloseTo(10, 5); });
  it('safeDiv(340,34)=10 [34]', () => { expect(safeDiv(340, 34)).toBeCloseTo(10, 5); });
  it('safeDiv(350,35)=10 [35]', () => { expect(safeDiv(350, 35)).toBeCloseTo(10, 5); });
  it('safeDiv(360,36)=10 [36]', () => { expect(safeDiv(360, 36)).toBeCloseTo(10, 5); });
  it('safeDiv(370,37)=10 [37]', () => { expect(safeDiv(370, 37)).toBeCloseTo(10, 5); });
  it('safeDiv(380,38)=10 [38]', () => { expect(safeDiv(380, 38)).toBeCloseTo(10, 5); });
  it('safeDiv(390,39)=10 [39]', () => { expect(safeDiv(390, 39)).toBeCloseTo(10, 5); });
  it('safeDiv(400,40)=10 [40]', () => { expect(safeDiv(400, 40)).toBeCloseTo(10, 5); });
  it('safeDiv(410,41)=10 [41]', () => { expect(safeDiv(410, 41)).toBeCloseTo(10, 5); });
  it('safeDiv(420,42)=10 [42]', () => { expect(safeDiv(420, 42)).toBeCloseTo(10, 5); });
});
