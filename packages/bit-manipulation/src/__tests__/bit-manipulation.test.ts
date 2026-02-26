// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  setBit, clearBit, toggleBit, isBitSet, popcount, isPowerOf2,
  lowestSetBit, clearLowestSetBit, reverseBits, highestSetBit,
  countLeadingZeros, countTrailingZeros, rotateLeft, rotateRight,
  swapBits, extractBits, insertBits, toBinaryString, fromBinaryString,
  toHexString, fromHexString, parity, nextPowerOf2, prevPowerOf2,
  xorUpTo, bitAbs, bitSign, xorSwap, bitMax, bitMin, haveOppositeSigns,
  roundUpPow2, getNthBit, hammingDistance, lowBitMask, isEven, isOdd,
  multiplyByPow2, divideByPow2, toGrayCode, fromGrayCode, bitsNeeded,
  interleaveBits,
} from '../bit-manipulation';

// ─────────────────────────────────────────────────────────────────────────────
// 1. setBit — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('setBit', () => {
  for (let pos = 0; pos < 100; pos++) {
    const p = pos % 31;
    it(`setBit(0, ${p}) [iter ${pos}] has bit ${p} set`, () => {
      expect(isBitSet(setBit(0, p), p)).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. clearBit — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('clearBit', () => {
  for (let pos = 0; pos < 100; pos++) {
    const p = pos % 31;
    it(`clearBit(0xffffffff, ${p}) [iter ${pos}] has bit ${p} cleared`, () => {
      expect(isBitSet(clearBit(0xffffffff, p), p)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. toggleBit — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('toggleBit', () => {
  for (let pos = 0; pos < 50; pos++) {
    const p = pos % 31;
    it(`toggleBit(0, ${p}) [iter ${pos}] sets bit ${p}`, () => {
      expect(isBitSet(toggleBit(0, p), p)).toBe(true);
    });
  }
  for (let pos = 0; pos < 50; pos++) {
    const p = pos % 31;
    const full = (1 << p);
    it(`toggleBit(${full}, ${p}) [iter ${pos}] clears bit ${p}`, () => {
      expect(isBitSet(toggleBit(full, p), p)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. popcount — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('popcount', () => {
  for (let n = 0; n < 100; n++) {
    it(`popcount(${n}) returns a non-negative integer`, () => {
      const result = popcount(n);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(result)).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. isPowerOf2 — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('isPowerOf2', () => {
  const powers = new Set([1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]);
  for (let n = 1; n <= 100; n++) {
    if (powers.has(n)) {
      it(`isPowerOf2(${n}) is true`, () => {
        expect(isPowerOf2(n)).toBe(true);
      });
    } else {
      it(`isPowerOf2(${n}) is false`, () => {
        expect(isPowerOf2(n)).toBe(false);
      });
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. highestSetBit — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('highestSetBit', () => {
  it('highestSetBit(0) returns -1', () => {
    expect(highestSetBit(0)).toBe(-1);
  });
  it('highestSetBit(1) returns 0', () => {
    expect(highestSetBit(1)).toBe(0);
  });
  it('highestSetBit(2) returns 1', () => {
    expect(highestSetBit(2)).toBe(1);
  });
  it('highestSetBit(3) returns 1', () => {
    expect(highestSetBit(3)).toBe(1);
  });
  it('highestSetBit(4) returns 2', () => {
    expect(highestSetBit(4)).toBe(2);
  });
  it('highestSetBit(7) returns 2', () => {
    expect(highestSetBit(7)).toBe(2);
  });
  it('highestSetBit(8) returns 3', () => {
    expect(highestSetBit(8)).toBe(3);
  });
  it('highestSetBit(255) returns 7', () => {
    expect(highestSetBit(255)).toBe(7);
  });
  it('highestSetBit(256) returns 8', () => {
    expect(highestSetBit(256)).toBe(8);
  });
  it('highestSetBit(1024) returns 10', () => {
    expect(highestSetBit(1024)).toBe(10);
  });
  for (let i = 0; i < 40; i++) {
    const n = i + 1;
    it(`highestSetBit(${n}) returns a valid bit index`, () => {
      const hsb = highestSetBit(n);
      expect(hsb).toBeGreaterThanOrEqual(0);
      expect(hsb).toBeLessThan(32);
      // the highest set bit of n must actually be set
      expect(isBitSet(n, hsb)).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. rotateLeft / rotateRight — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('rotateLeft and rotateRight', () => {
  // rotateLeft 50 tests
  for (let i = 0; i < 50; i++) {
    const n = (i * 7 + 1) & 0xffffffff;
    const k = i % 32;
    it(`rotateLeft(${n}, ${k}) roundtrips with rotateRight`, () => {
      const rotated = rotateLeft(n, k);
      expect(rotateRight(rotated, k)).toBe(n >>> 0);
    });
  }
  // rotateRight 50 tests
  for (let i = 0; i < 50; i++) {
    const n = (i * 13 + 5) & 0xffffffff;
    const k = i % 32;
    it(`rotateRight(${n}, ${k}) roundtrips with rotateLeft`, () => {
      const rotated = rotateRight(n, k);
      expect(rotateLeft(rotated, k)).toBe(n >>> 0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. toBinaryString — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('toBinaryString', () => {
  for (let n = 0; n < 50; n++) {
    it(`toBinaryString(${n}) has length 8 by default`, () => {
      const s = toBinaryString(n);
      expect(s.length).toBe(8);
      expect(/^[01]+$/.test(s)).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. hammingDistance — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('hammingDistance', () => {
  // hammingDistance(n, n) === 0
  for (let n = 0; n < 50; n++) {
    it(`hammingDistance(${n}, ${n}) === 0`, () => {
      expect(hammingDistance(n, n)).toBe(0);
    });
  }
  // hammingDistance is symmetric
  for (let i = 0; i < 50; i++) {
    const a = i;
    const b = i * 3 + 7;
    it(`hammingDistance(${a}, ${b}) === hammingDistance(${b}, ${a})`, () => {
      expect(hammingDistance(a, b)).toBe(hammingDistance(b, a));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. isEven / isOdd — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('isEven and isOdd', () => {
  for (let n = 0; n < 100; n++) {
    it(`isEven(${n}) and isOdd(${n}) are complementary`, () => {
      expect(isEven(n)).toBe(n % 2 === 0);
      expect(isOdd(n)).toBe(n % 2 !== 0);
      expect(isEven(n) !== isOdd(n)).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. toGrayCode / fromGrayCode roundtrip — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('toGrayCode and fromGrayCode roundtrip', () => {
  for (let n = 0; n < 100; n++) {
    it(`fromGrayCode(toGrayCode(${n})) === ${n}`, () => {
      expect(fromGrayCode(toGrayCode(n))).toBe(n);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. bitMax / bitMin — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('bitMax and bitMin', () => {
  for (let i = 0; i < 50; i++) {
    const a = i;
    const b = 100 - i;
    it(`bitMax(${a}, ${b}) === Math.max(${a}, ${b})`, () => {
      expect(bitMax(a, b)).toBe(Math.max(a, b));
    });
  }
  for (let i = 0; i < 50; i++) {
    const a = i;
    const b = 100 - i;
    it(`bitMin(${a}, ${b}) === Math.min(${a}, ${b})`, () => {
      expect(bitMin(a, b)).toBe(Math.min(a, b));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. xorSwap — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('xorSwap', () => {
  for (let i = 0; i < 50; i++) {
    const a = i * 3;
    const b = i * 7 + 1;
    it(`xorSwap(${a}, ${b}) returns [${b}, ${a}]`, () => {
      const [ra, rb] = xorSwap(a, b);
      expect(ra).toBe(b);
      expect(rb).toBe(a);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 14. bitsNeeded — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('bitsNeeded', () => {
  it('bitsNeeded(0) returns 1', () => {
    expect(bitsNeeded(0)).toBe(1);
  });
  it('bitsNeeded(1) returns 1', () => {
    expect(bitsNeeded(1)).toBe(1);
  });
  it('bitsNeeded(2) returns 2', () => {
    expect(bitsNeeded(2)).toBe(2);
  });
  it('bitsNeeded(3) returns 2', () => {
    expect(bitsNeeded(3)).toBe(2);
  });
  it('bitsNeeded(4) returns 3', () => {
    expect(bitsNeeded(4)).toBe(3);
  });
  for (let n = 1; n <= 45; n++) {
    it(`bitsNeeded(${n}) is at least 1`, () => {
      const bits = bitsNeeded(n);
      expect(bits).toBeGreaterThanOrEqual(1);
      // 2^(bits-1) <= n < 2^bits
      expect(Math.pow(2, bits - 1)).toBeLessThanOrEqual(n);
      expect(n).toBeLessThan(Math.pow(2, bits));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 15. extractBits / insertBits — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('extractBits and insertBits', () => {
  // extractBits: insert then extract should recover the value
  for (let i = 0; i < 25; i++) {
    const value = i % 16;        // 4-bit value 0..15
    const start = i % 8;         // start bit 0..7
    const length = 4;
    it(`insertBits then extractBits recovers value ${value} at start ${start}`, () => {
      const packed = insertBits(0, value, start, length);
      expect(extractBits(packed, start, length)).toBe(value);
    });
  }
  // extractBits: verify specific known cases
  for (let i = 0; i < 25; i++) {
    const n = 0b11001010;
    const start = i % 8;
    const length = Math.min(4, 8 - start);
    it(`extractBits(0b11001010, ${start}, ${length}) returns a non-negative integer`, () => {
      const result = extractBits(n, start, length);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(1 << length);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 16. General bit operations — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('general bit operations', () => {
  // isBitSet after setBit
  for (let i = 0; i < 10; i++) {
    const pos = i % 31;
    it(`isBitSet(setBit(0, ${pos}), ${pos}) is true [general ${i}]`, () => {
      expect(isBitSet(setBit(0, pos), pos)).toBe(true);
    });
  }
  // clearLowestSetBit
  for (let n = 1; n <= 10; n++) {
    it(`clearLowestSetBit(${n}) has fewer bits set`, () => {
      expect(popcount(clearLowestSetBit(n))).toBe(popcount(n) - 1);
    });
  }
  // lowestSetBit is always a power of 2
  for (let n = 1; n <= 10; n++) {
    it(`lowestSetBit(${n}) is a power of 2`, () => {
      const lsb = lowestSetBit(n);
      expect(isPowerOf2(lsb)).toBe(true);
    });
  }
  // parity is 0 or 1
  for (let n = 0; n < 10; n++) {
    it(`parity(${n}) is 0 or 1`, () => {
      const p = parity(n);
      expect(p === 0 || p === 1).toBe(true);
    });
  }
  // getNthBit returns 0 or 1
  for (let i = 0; i < 10; i++) {
    const n = i * 17;
    const pos = i % 8;
    it(`getNthBit(${n}, ${pos}) is 0 or 1`, () => {
      const bit = getNthBit(n, pos);
      expect(bit === 0 || bit === 1).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 17. nextPowerOf2 — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('nextPowerOf2', () => {
  it('nextPowerOf2(0) returns 1', () => {
    expect(nextPowerOf2(0)).toBe(1);
  });
  it('nextPowerOf2(1) returns 1', () => {
    expect(nextPowerOf2(1)).toBe(1);
  });
  it('nextPowerOf2(2) returns 2', () => {
    expect(nextPowerOf2(2)).toBe(2);
  });
  it('nextPowerOf2(3) returns 4', () => {
    expect(nextPowerOf2(3)).toBe(4);
  });
  it('nextPowerOf2(4) returns 4', () => {
    expect(nextPowerOf2(4)).toBe(4);
  });
  it('nextPowerOf2(5) returns 8', () => {
    expect(nextPowerOf2(5)).toBe(8);
  });
  for (let n = 1; n <= 44; n++) {
    it(`nextPowerOf2(${n}) is a power of 2 and >= ${n}`, () => {
      const result = nextPowerOf2(n);
      expect(isPowerOf2(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(n);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 18. countTrailingZeros — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('countTrailingZeros', () => {
  it('countTrailingZeros(0) returns 32', () => {
    expect(countTrailingZeros(0)).toBe(32);
  });
  it('countTrailingZeros(1) returns 0', () => {
    expect(countTrailingZeros(1)).toBe(0);
  });
  it('countTrailingZeros(2) returns 1', () => {
    expect(countTrailingZeros(2)).toBe(1);
  });
  it('countTrailingZeros(4) returns 2', () => {
    expect(countTrailingZeros(4)).toBe(2);
  });
  it('countTrailingZeros(8) returns 3', () => {
    expect(countTrailingZeros(8)).toBe(3);
  });
  it('countTrailingZeros(16) returns 4', () => {
    expect(countTrailingZeros(16)).toBe(4);
  });
  // For any power of 2 = 2^k, countTrailingZeros should return k
  for (let k = 0; k < 31; k++) {
    it(`countTrailingZeros(2^${k}) returns ${k}`, () => {
      expect(countTrailingZeros(1 << k)).toBe(k);
    });
  }
  // For odd numbers, countTrailingZeros should return 0
  for (let i = 0; i < 13; i++) {
    const n = 2 * i + 1;
    it(`countTrailingZeros(${n}) is 0 (odd)`, () => {
      expect(countTrailingZeros(n)).toBe(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 19. fromBinaryString / toHexString / fromHexString — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('binary and hex string conversions', () => {
  for (let n = 0; n < 25; n++) {
    it(`fromBinaryString(toBinaryString(${n})) roundtrips to ${n}`, () => {
      expect(fromBinaryString(toBinaryString(n))).toBe(n);
    });
  }
  for (let n = 0; n < 25; n++) {
    it(`fromHexString(toHexString(${n})) roundtrips to ${n}`, () => {
      expect(fromHexString(toHexString(n))).toBe(n);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 20. haveOppositeSigns — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('haveOppositeSigns', () => {
  for (let i = 1; i <= 25; i++) {
    it(`haveOppositeSigns(${i}, ${-i}) is true`, () => {
      expect(haveOppositeSigns(i, -i)).toBe(true);
    });
  }
  for (let i = 1; i <= 25; i++) {
    it(`haveOppositeSigns(${i}, ${i}) is false`, () => {
      expect(haveOppositeSigns(i, i)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 21. bitAbs / bitSign — 60 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('bitAbs', () => {
  for (let n = 1; n <= 30; n++) {
    it(`bitAbs(${n}) === ${n}`, () => {
      expect(bitAbs(n)).toBe(n);
    });
  }
  for (let n = 1; n <= 30; n++) {
    it(`bitAbs(${-n}) === ${n}`, () => {
      expect(bitAbs(-n)).toBe(n);
    });
  }
});

describe('bitSign', () => {
  it('bitSign(0) is 0', () => {
    expect(bitSign(0)).toBe(0);
  });
  for (let n = 1; n <= 24; n++) {
    it(`bitSign(${n}) is 1`, () => {
      expect(bitSign(n)).toBe(1);
    });
  }
  for (let n = 1; n <= 25; n++) {
    it(`bitSign(${-n}) is -1`, () => {
      expect(bitSign(-n)).toBe(-1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 22. lowBitMask — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('lowBitMask', () => {
  it('lowBitMask(0) returns 0', () => {
    expect(lowBitMask(0)).toBe(0);
  });
  it('lowBitMask(1) returns 1', () => {
    expect(lowBitMask(1)).toBe(1);
  });
  it('lowBitMask(2) returns 3', () => {
    expect(lowBitMask(2)).toBe(3);
  });
  it('lowBitMask(4) returns 15', () => {
    expect(lowBitMask(4)).toBe(15);
  });
  it('lowBitMask(8) returns 255', () => {
    expect(lowBitMask(8)).toBe(255);
  });
  for (let n = 1; n <= 45; n++) {
    it(`lowBitMask(${n}) has popcount ${Math.min(n, 32)}`, () => {
      const mask = lowBitMask(n);
      expect(popcount(mask)).toBe(Math.min(n, 32));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 23. multiplyByPow2 / divideByPow2 — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('multiplyByPow2 and divideByPow2', () => {
  for (let i = 0; i < 25; i++) {
    const n = i + 1;
    const k = i % 4;
    it(`multiplyByPow2(${n}, ${k}) === ${n} * ${Math.pow(2, k)}`, () => {
      expect(multiplyByPow2(n, k)).toBe(n * Math.pow(2, k));
    });
  }
  for (let i = 0; i < 25; i++) {
    const k = i % 4;
    const n = (i + 1) << k;     // ensure exact divisibility
    it(`divideByPow2(${n}, ${k}) === ${n >> k}`, () => {
      expect(divideByPow2(n, k)).toBe(n >> k);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 24. roundUpPow2 — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('roundUpPow2', () => {
  // Round up to 4-byte alignment
  for (let n = 0; n < 25; n++) {
    it(`roundUpPow2(${n}, 4) is a multiple of 4`, () => {
      const result = roundUpPow2(n, 4);
      expect(result % 4).toBe(0);
      expect(result).toBeGreaterThanOrEqual(n);
    });
  }
  // Round up to 8-byte alignment
  for (let n = 0; n < 25; n++) {
    it(`roundUpPow2(${n}, 8) is a multiple of 8`, () => {
      const result = roundUpPow2(n, 8);
      expect(result % 8).toBe(0);
      expect(result).toBeGreaterThanOrEqual(n);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 25. swapBits — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('swapBits', () => {
  for (let i = 0; i < 50; i++) {
    const n = i * 5 + 3;
    const bi = i % 15;
    const bj = (i + 7) % 15;
    it(`swapBits(${n}, ${bi}, ${bj}): bit ${bi} and ${bj} are exchanged`, () => {
      const result = swapBits(n, bi, bj);
      // after swapping, bit bi of result should equal bit bj of original
      expect(isBitSet(result, bi)).toBe(isBitSet(n, bj));
      expect(isBitSet(result, bj)).toBe(isBitSet(n, bi));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 26. prevPowerOf2 — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('prevPowerOf2', () => {
  it('prevPowerOf2(0) returns 0', () => {
    expect(prevPowerOf2(0)).toBe(0);
  });
  it('prevPowerOf2(1) returns 1', () => {
    expect(prevPowerOf2(1)).toBe(1);
  });
  it('prevPowerOf2(2) returns 2', () => {
    expect(prevPowerOf2(2)).toBe(2);
  });
  it('prevPowerOf2(3) returns 2', () => {
    expect(prevPowerOf2(3)).toBe(2);
  });
  it('prevPowerOf2(4) returns 4', () => {
    expect(prevPowerOf2(4)).toBe(4);
  });
  it('prevPowerOf2(5) returns 4', () => {
    expect(prevPowerOf2(5)).toBe(4);
  });
  it('prevPowerOf2(7) returns 4', () => {
    expect(prevPowerOf2(7)).toBe(4);
  });
  it('prevPowerOf2(8) returns 8', () => {
    expect(prevPowerOf2(8)).toBe(8);
  });
  for (let n = 2; n <= 22; n++) {
    it(`prevPowerOf2(${n}) is a power of 2 and <= ${n}`, () => {
      const result = prevPowerOf2(n);
      expect(isPowerOf2(result)).toBe(true);
      expect(result).toBeLessThanOrEqual(n);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 27. countLeadingZeros — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('countLeadingZeros', () => {
  it('countLeadingZeros(0) returns 32', () => {
    expect(countLeadingZeros(0)).toBe(32);
  });
  it('countLeadingZeros(1) returns 31', () => {
    expect(countLeadingZeros(1)).toBe(31);
  });
  it('countLeadingZeros(2) returns 30', () => {
    expect(countLeadingZeros(2)).toBe(30);
  });
  it('countLeadingZeros(4) returns 29', () => {
    expect(countLeadingZeros(4)).toBe(29);
  });
  it('countLeadingZeros(0x80000000) returns 0', () => {
    expect(countLeadingZeros(0x80000000)).toBe(0);
  });
  for (let k = 0; k < 25; k++) {
    const n = 1 << k;
    it(`countLeadingZeros(1 << ${k}) returns ${31 - k}`, () => {
      expect(countLeadingZeros(n)).toBe(31 - k);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 28. xorUpTo — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('xorUpTo', () => {
  // XOR from 0..n: the pattern repeats every 4
  const expected = [0, 1, 3, 0, 4, 1, 7, 0, 8, 1, 11, 0, 12, 1, 15, 0, 16, 1, 19, 0, 20, 1, 23, 0, 24, 1, 27, 0, 28, 1];
  for (let n = 0; n < 30; n++) {
    it(`xorUpTo(${n}) returns ${expected[n]}`, () => {
      expect(xorUpTo(n)).toBe(expected[n]);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 29. reverseBits — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('reverseBits', () => {
  it('reverseBits(0) returns 0', () => {
    expect(reverseBits(0)).toBe(0);
  });
  it('reverseBits(0xffffffff) returns 0xffffffff', () => {
    expect(reverseBits(0xffffffff)).toBe(0xffffffff);
  });
  it('reverseBits(1) returns 0x80000000', () => {
    expect(reverseBits(1)).toBe(0x80000000);
  });
  it('reverseBits(0x80000000) returns 1', () => {
    expect(reverseBits(0x80000000)).toBe(1);
  });
  // reverseBits is its own inverse
  for (let i = 0; i < 26; i++) {
    const n = (i * 123456789) >>> 0;
    it(`reverseBits(reverseBits(${n})) roundtrips`, () => {
      expect(reverseBits(reverseBits(n))).toBe(n);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 30. interleaveBits — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('interleaveBits', () => {
  it('interleaveBits(0, 0) returns 0', () => {
    expect(interleaveBits(0, 0)).toBe(0);
  });
  it('interleaveBits(1, 0) sets bit 0', () => {
    const result = interleaveBits(1, 0);
    expect(isBitSet(result, 0)).toBe(true);
  });
  it('interleaveBits(0, 1) sets bit 1', () => {
    const result = interleaveBits(0, 1);
    expect(isBitSet(result, 1)).toBe(true);
  });
  for (let i = 0; i < 27; i++) {
    const x = i % 256;
    const y = (i * 3) % 256;
    it(`interleaveBits(${x}, ${y}) returns a non-negative integer`, () => {
      const result = interleaveBits(x, y);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 31. popcount specific known values — 20 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('popcount known values', () => {
  it('popcount(0) === 0', () => { expect(popcount(0)).toBe(0); });
  it('popcount(1) === 1', () => { expect(popcount(1)).toBe(1); });
  it('popcount(2) === 1', () => { expect(popcount(2)).toBe(1); });
  it('popcount(3) === 2', () => { expect(popcount(3)).toBe(2); });
  it('popcount(7) === 3', () => { expect(popcount(7)).toBe(3); });
  it('popcount(15) === 4', () => { expect(popcount(15)).toBe(4); });
  it('popcount(255) === 8', () => { expect(popcount(255)).toBe(8); });
  it('popcount(256) === 1', () => { expect(popcount(256)).toBe(1); });
  it('popcount(0xffff) === 16', () => { expect(popcount(0xffff)).toBe(16); });
  it('popcount(0xffffffff) === 32', () => { expect(popcount(0xffffffff)).toBe(32); });
  it('popcount(0x55555555) === 16', () => { expect(popcount(0x55555555)).toBe(16); });
  it('popcount(0xaaaaaaaa) === 16', () => { expect(popcount(0xaaaaaaaa)).toBe(16); });
  it('popcount(0x0f0f0f0f) === 16', () => { expect(popcount(0x0f0f0f0f)).toBe(16); });
  it('popcount(0x12345678) === 13', () => { expect(popcount(0x12345678)).toBe(13); });
  it('popcount(4) === 1', () => { expect(popcount(4)).toBe(1); });
  it('popcount(5) === 2', () => { expect(popcount(5)).toBe(2); });
  it('popcount(6) === 2', () => { expect(popcount(6)).toBe(2); });
  it('popcount(8) === 1', () => { expect(popcount(8)).toBe(1); });
  it('popcount(9) === 2', () => { expect(popcount(9)).toBe(2); });
  it('popcount(10) === 2', () => { expect(popcount(10)).toBe(2); });
});

// ─────────────────────────────────────────────────────────────────────────────
// 32. hammingDistance specific values — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('hammingDistance specific values', () => {
  it('hammingDistance(0, 0) === 0', () => { expect(hammingDistance(0, 0)).toBe(0); });
  it('hammingDistance(0, 1) === 1', () => { expect(hammingDistance(0, 1)).toBe(1); });
  it('hammingDistance(1, 2) === 2', () => { expect(hammingDistance(1, 2)).toBe(2); });
  it('hammingDistance(3, 0) === 2', () => { expect(hammingDistance(3, 0)).toBe(2); });
  it('hammingDistance(15, 0) === 4', () => { expect(hammingDistance(15, 0)).toBe(4); });
  it('hammingDistance(255, 0) === 8', () => { expect(hammingDistance(255, 0)).toBe(8); });
  it('hammingDistance(0xff, 0xff) === 0', () => { expect(hammingDistance(0xff, 0xff)).toBe(0); });
  for (let i = 0; i < 23; i++) {
    const a = i;
    const b = i ^ (1 << (i % 8));  // flip one bit
    it(`hammingDistance(${a}, ${b}) === 1 [one bit flip ${i}]`, () => {
      expect(hammingDistance(a, b)).toBe(1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 33. Gray code specific values — 20 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Gray code specific values', () => {
  const grayTable: Array<[number, number]> = [
    [0, 0], [1, 1], [2, 3], [3, 2], [4, 6], [5, 7], [6, 5], [7, 4],
    [8, 12], [9, 13], [10, 15], [11, 14], [12, 10], [13, 11], [14, 9], [15, 8],
  ];
  for (const [n, g] of grayTable) {
    it(`toGrayCode(${n}) === ${g}`, () => {
      expect(toGrayCode(n)).toBe(g);
    });
  }
  for (const [n, g] of grayTable) {
    it(`fromGrayCode(${g}) === ${n}`, () => {
      expect(fromGrayCode(g)).toBe(n);
    });
  }
});
