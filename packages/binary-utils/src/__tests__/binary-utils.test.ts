// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  getBit,
  setBit,
  clearBit,
  toggleBit,
  hasBit,
  countBits,
  leadingZeros,
  trailingZeros,
  highestBit,
  lowestBit,
  reverseBits,
  rotateLeft,
  rotateRight,
  isPowerOfTwo,
  nextPowerOfTwo,
  prevPowerOfTwo,
  log2,
  createFlags,
  hasFlag,
  setFlag,
  clearFlag,
  toggleFlag,
  combineFlags,
  getActiveFlags,
  toBitString,
  fromBitString,
  toBuffer,
  concat,
  split,
  indexOf,
  readUInt16,
  readUInt32,
  readInt16,
  readInt32,
  writeUInt16,
  writeUInt32,
  xorBuffers,
  hammingDistance,
  isEqual,
  toBinaryString,
  toHexDump,
  fromHexDump,
} from '../binary-utils';

// ---------------------------------------------------------------------------
// Helper: reference popcount via string method
// ---------------------------------------------------------------------------
function refCountBits(n: number): number {
  return (n >>> 0).toString(2).split('').filter((c) => c === '1').length;
}

// ---------------------------------------------------------------------------
// 1. getBit / setBit / clearBit / toggleBit — 32 × 4 = 128 tests
// ---------------------------------------------------------------------------
describe('getBit / setBit / clearBit / toggleBit per bit position', () => {
  for (let i = 0; i < 32; i++) {
    it(`getBit: bit ${i} of 0 is 0`, () => {
      expect(getBit(0, i)).toBe(0);
    });

    it(`setBit: setting bit ${i} on 0 yields 1 << ${i}`, () => {
      const expected = (1 << i) >>> 0;
      expect(setBit(0, i)).toBe(expected);
    });

    it(`clearBit: clearing bit ${i} on all-ones yields correct value`, () => {
      const allOnes = 0xffffffff >>> 0;
      const expected = (allOnes & ~(1 << i)) >>> 0;
      expect(clearBit(allOnes, i)).toBe(expected);
    });

    it(`toggleBit: toggling bit ${i} twice on 0 returns 0`, () => {
      expect(toggleBit(toggleBit(0, i), i)).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. countBits correctness — 100 tests (i = 0..99)
// ---------------------------------------------------------------------------
describe('countBits correctness (i=0..99)', () => {
  for (let i = 0; i < 100; i++) {
    it(`countBits(${i}) === refCountBits(${i})`, () => {
      expect(countBits(i)).toBe(refCountBits(i));
    });
  }
});

// ---------------------------------------------------------------------------
// 3. isPowerOfTwo — 100 tests (i = 0..99)
// ---------------------------------------------------------------------------
describe('isPowerOfTwo (i=0..99)', () => {
  const powersInRange = new Set<number>();
  for (let p = 0; p < 7; p++) powersInRange.add(1 << p); // 1,2,4,8,16,32,64

  for (let i = 0; i < 100; i++) {
    it(`isPowerOfTwo(${i}) is ${powersInRange.has(i)}`, () => {
      // Reference: n > 0 and (n & (n-1)) === 0
      const expected = i > 0 && (i & (i - 1)) === 0;
      expect(isPowerOfTwo(i)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 4. nextPowerOfTwo — 100 tests (i = 1..100)
// ---------------------------------------------------------------------------
describe('nextPowerOfTwo (i=1..100)', () => {
  function refNext(n: number): number {
    if (n <= 1) return 1;
    let v = 1;
    while (v < n) v <<= 1;
    return v >>> 0;
  }

  for (let i = 1; i <= 100; i++) {
    it(`nextPowerOfTwo(${i}) === ${refNext(i)}`, () => {
      expect(nextPowerOfTwo(i)).toBe(refNext(i));
    });
  }
});

// ---------------------------------------------------------------------------
// 5. toBitString / fromBitString roundtrip — 100 tests (i = 0..99)
// ---------------------------------------------------------------------------
describe('toBitString / fromBitString roundtrip (i=0..99)', () => {
  for (let i = 0; i < 100; i++) {
    it(`roundtrip for ${i}`, () => {
      const width = 8;
      const s = toBitString(i, width);
      expect(s).toHaveLength(width);
      expect(/^[01]+$/.test(s)).toBe(true);
      expect(fromBitString(s)).toBe(i >>> 0);
    });
  }
});

// ---------------------------------------------------------------------------
// 6. rotateLeft / rotateRight — 50 × 2 = 100 tests (i = 0..49)
// ---------------------------------------------------------------------------
describe('rotateLeft (i=0..49)', () => {
  const base = 0x12345678;
  for (let i = 0; i < 50; i++) {
    it(`rotateLeft(0x12345678, ${i}) and back`, () => {
      const rotated = rotateLeft(base, i);
      const restored = rotateRight(rotated, i);
      expect(restored).toBe(base >>> 0);
    });
  }
});

describe('rotateRight (i=0..49)', () => {
  const base = 0xdeadbeef >>> 0;
  for (let i = 0; i < 50; i++) {
    it(`rotateRight(0xdeadbeef, ${i}) and back`, () => {
      const rotated = rotateRight(base, i);
      const restored = rotateLeft(rotated, i);
      expect(restored).toBe(base);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. readUInt32 / writeUInt32 roundtrip big-endian — 50 tests (i = 0..49)
// ---------------------------------------------------------------------------
describe('readUInt32 / writeUInt32 roundtrip big-endian (i=0..49)', () => {
  for (let i = 0; i < 50; i++) {
    const value = (i * 0x01234567 + i * i) >>> 0;
    it(`big-endian roundtrip for value ${value}`, () => {
      const buf = writeUInt32(value, 'big-endian');
      expect(buf).toHaveLength(4);
      expect(readUInt32(buf, 0, 'big-endian')).toBe(value);
    });
  }
});

// ---------------------------------------------------------------------------
// 8. readUInt32 / writeUInt32 roundtrip little-endian — 50 tests (i = 0..49)
// ---------------------------------------------------------------------------
describe('readUInt32 / writeUInt32 roundtrip little-endian (i=0..49)', () => {
  for (let i = 0; i < 50; i++) {
    const value = (i * 0x89abcdef + i * 3) >>> 0;
    it(`little-endian roundtrip for value ${value}`, () => {
      const buf = writeUInt32(value, 'little-endian');
      expect(buf).toHaveLength(4);
      expect(readUInt32(buf, 0, 'little-endian')).toBe(value);
    });
  }
});

// ---------------------------------------------------------------------------
// 9. hasFlag / setFlag / clearFlag — 50 × 3 = 150 tests (i = 0..49)
// ---------------------------------------------------------------------------
describe('hasFlag / setFlag / clearFlag (i=0..49)', () => {
  for (let i = 0; i < 50; i++) {
    const flag = 1 << (i % 32);
    it(`hasFlag: value with flag bit ${i % 32} set returns true`, () => {
      expect(hasFlag(flag, flag)).toBe(true);
    });

    it(`setFlag: setting flag bit ${i % 32} on 0`, () => {
      expect(setFlag(0, flag)).toBe(flag >>> 0);
    });

    it(`clearFlag: clearing flag bit ${i % 32} from all-set gives correct value`, () => {
      const allSet = 0xffffffff >>> 0;
      const cleared = clearFlag(allSet, flag);
      expect(hasFlag(cleared, flag)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 10. Additional correctness tests: hasBit, leadingZeros, trailingZeros
// ---------------------------------------------------------------------------
describe('hasBit correctness', () => {
  it('hasBit(0b1010, 1) is true', () => {
    expect(hasBit(0b1010, 1)).toBe(true);
  });
  it('hasBit(0b1010, 0) is false', () => {
    expect(hasBit(0b1010, 0)).toBe(false);
  });
  it('hasBit(0b1010, 3) is true', () => {
    expect(hasBit(0b1010, 3)).toBe(true);
  });
  it('hasBit(0b1010, 2) is false', () => {
    expect(hasBit(0b1010, 2)).toBe(false);
  });
  it('hasBit(0xFFFFFFFF, 31) is true', () => {
    expect(hasBit(0xffffffff, 31)).toBe(true);
  });
});

describe('leadingZeros correctness', () => {
  it('leadingZeros(0) === 32', () => {
    expect(leadingZeros(0)).toBe(32);
  });
  it('leadingZeros(1) === 31', () => {
    expect(leadingZeros(1)).toBe(31);
  });
  it('leadingZeros(0x80000000) === 0', () => {
    expect(leadingZeros(0x80000000)).toBe(0);
  });
  it('leadingZeros(0x40000000) === 1', () => {
    expect(leadingZeros(0x40000000)).toBe(1);
  });
  it('leadingZeros(0xFF) === 24', () => {
    expect(leadingZeros(0xff)).toBe(24);
  });
  it('leadingZeros(0xFFFF) === 16', () => {
    expect(leadingZeros(0xffff)).toBe(16);
  });
});

describe('trailingZeros correctness', () => {
  it('trailingZeros(0) === 32', () => {
    expect(trailingZeros(0)).toBe(32);
  });
  it('trailingZeros(1) === 0', () => {
    expect(trailingZeros(1)).toBe(0);
  });
  it('trailingZeros(2) === 1', () => {
    expect(trailingZeros(2)).toBe(1);
  });
  it('trailingZeros(4) === 2', () => {
    expect(trailingZeros(4)).toBe(2);
  });
  it('trailingZeros(0x80000000) === 31', () => {
    expect(trailingZeros(0x80000000)).toBe(31);
  });
  it('trailingZeros(0b1000) === 3', () => {
    expect(trailingZeros(0b1000)).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// 11. highestBit / lowestBit
// ---------------------------------------------------------------------------
describe('highestBit', () => {
  it('highestBit(0) === -1', () => {
    expect(highestBit(0)).toBe(-1);
  });
  it('highestBit(1) === 0', () => {
    expect(highestBit(1)).toBe(0);
  });
  it('highestBit(2) === 1', () => {
    expect(highestBit(2)).toBe(1);
  });
  it('highestBit(0xFF) === 7', () => {
    expect(highestBit(0xff)).toBe(7);
  });
  it('highestBit(0x80000000) === 31', () => {
    expect(highestBit(0x80000000)).toBe(31);
  });
  it('highestBit(0b1010) === 3', () => {
    expect(highestBit(0b1010)).toBe(3);
  });
});

describe('lowestBit', () => {
  it('lowestBit(0) === -1', () => {
    expect(lowestBit(0)).toBe(-1);
  });
  it('lowestBit(1) === 0', () => {
    expect(lowestBit(1)).toBe(0);
  });
  it('lowestBit(2) === 1', () => {
    expect(lowestBit(2)).toBe(1);
  });
  it('lowestBit(0b1010) === 1', () => {
    expect(lowestBit(0b1010)).toBe(1);
  });
  it('lowestBit(0x80000000) === 31', () => {
    expect(lowestBit(0x80000000)).toBe(31);
  });
  it('lowestBit(0b1000) === 3', () => {
    expect(lowestBit(0b1000)).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// 12. reverseBits
// ---------------------------------------------------------------------------
describe('reverseBits', () => {
  it('reverseBits(0) === 0', () => {
    expect(reverseBits(0)).toBe(0);
  });
  it('reverseBits(0xFFFFFFFF) === 0xFFFFFFFF', () => {
    expect(reverseBits(0xffffffff)).toBe(0xffffffff);
  });
  it('reverseBits(1) === 0x80000000', () => {
    expect(reverseBits(1)).toBe(0x80000000);
  });
  it('reverseBits(0x80000000) === 1', () => {
    expect(reverseBits(0x80000000)).toBe(1);
  });
  it('reverseBits(reverseBits(0x12345678)) === 0x12345678', () => {
    const v = 0x12345678;
    expect(reverseBits(reverseBits(v))).toBe(v >>> 0);
  });
  it('reverseBits(0b10110000000000000000000000000000) has correct low bits', () => {
    // input: 10110000... reversed → ...00001101 (bit0=1, bit1=0, bit2=1, bit3=1)
    const n = 0b10110000000000000000000000000000 >>> 0;
    const r = reverseBits(n);
    expect(getBit(r, 0)).toBe(1);
    expect(getBit(r, 1)).toBe(0);
    expect(getBit(r, 2)).toBe(1);
    expect(getBit(r, 3)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 13. prevPowerOfTwo
// ---------------------------------------------------------------------------
describe('prevPowerOfTwo', () => {
  it('prevPowerOfTwo(1) === 1', () => {
    expect(prevPowerOfTwo(1)).toBe(1);
  });
  it('prevPowerOfTwo(2) === 2', () => {
    expect(prevPowerOfTwo(2)).toBe(2);
  });
  it('prevPowerOfTwo(3) === 2', () => {
    expect(prevPowerOfTwo(3)).toBe(2);
  });
  it('prevPowerOfTwo(4) === 4', () => {
    expect(prevPowerOfTwo(4)).toBe(4);
  });
  it('prevPowerOfTwo(5) === 4', () => {
    expect(prevPowerOfTwo(5)).toBe(4);
  });
  it('prevPowerOfTwo(100) === 64', () => {
    expect(prevPowerOfTwo(100)).toBe(64);
  });
  it('prevPowerOfTwo(128) === 128', () => {
    expect(prevPowerOfTwo(128)).toBe(128);
  });
  it('prevPowerOfTwo(255) === 128', () => {
    expect(prevPowerOfTwo(255)).toBe(128);
  });
  it('prevPowerOfTwo(256) === 256', () => {
    expect(prevPowerOfTwo(256)).toBe(256);
  });
});

// ---------------------------------------------------------------------------
// 14. log2
// ---------------------------------------------------------------------------
describe('log2', () => {
  it('log2(1) === 0', () => {
    expect(log2(1)).toBe(0);
  });
  it('log2(2) === 1', () => {
    expect(log2(2)).toBe(1);
  });
  it('log2(3) === 1', () => {
    expect(log2(3)).toBe(1);
  });
  it('log2(4) === 2', () => {
    expect(log2(4)).toBe(2);
  });
  it('log2(8) === 3', () => {
    expect(log2(8)).toBe(3);
  });
  it('log2(255) === 7', () => {
    expect(log2(255)).toBe(7);
  });
  it('log2(256) === 8', () => {
    expect(log2(256)).toBe(8);
  });
  it('log2(1024) === 10', () => {
    expect(log2(1024)).toBe(10);
  });
  it('log2 throws for 0', () => {
    expect(() => log2(0)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// 15. createFlags
// ---------------------------------------------------------------------------
describe('createFlags', () => {
  it('creates correct flag values for single name', () => {
    const f = createFlags('A');
    expect(f['A']).toBe(1);
  });
  it('creates correct flag values for two names', () => {
    const f = createFlags('A', 'B');
    expect(f['A']).toBe(1);
    expect(f['B']).toBe(2);
  });
  it('creates correct flag values for four names', () => {
    const f = createFlags('READ', 'WRITE', 'EXEC', 'DELETE');
    expect(f['READ']).toBe(1);
    expect(f['WRITE']).toBe(2);
    expect(f['EXEC']).toBe(4);
    expect(f['DELETE']).toBe(8);
  });
  it('flags are distinct powers of two', () => {
    const names = ['A', 'B', 'C', 'D', 'E'];
    const f = createFlags(...names);
    const vals = names.map((n) => f[n]);
    const unique = new Set(vals);
    expect(unique.size).toBe(names.length);
    vals.forEach((v) => expect(isPowerOfTwo(v)).toBe(true));
  });
});

// ---------------------------------------------------------------------------
// 16. toggleFlag / combineFlags / getActiveFlags
// ---------------------------------------------------------------------------
describe('toggleFlag', () => {
  it('toggleFlag adds a flag when absent', () => {
    expect(hasFlag(toggleFlag(0, 4), 4)).toBe(true);
  });
  it('toggleFlag removes a flag when present', () => {
    expect(hasFlag(toggleFlag(4, 4), 4)).toBe(false);
  });
  it('toggleFlag double-toggle is identity', () => {
    const v = 0b1100;
    const flag = 0b0100;
    expect(toggleFlag(toggleFlag(v, flag), flag)).toBe(v >>> 0);
  });
});

describe('combineFlags', () => {
  it('combineFlags of single flag', () => {
    expect(combineFlags(4)).toBe(4);
  });
  it('combineFlags of two disjoint flags', () => {
    expect(combineFlags(1, 2)).toBe(3);
  });
  it('combineFlags of three flags', () => {
    expect(combineFlags(1, 4, 8)).toBe(13);
  });
  it('combineFlags with overlapping flags', () => {
    expect(combineFlags(3, 6)).toBe(7);
  });
  it('combineFlags with no arguments', () => {
    expect(combineFlags()).toBe(0);
  });
});

describe('getActiveFlags', () => {
  const flags = createFlags('READ', 'WRITE', 'EXEC', 'DELETE');

  it('returns empty array when no flags set', () => {
    expect(getActiveFlags(0, flags)).toEqual([]);
  });
  it('returns single active flag', () => {
    expect(getActiveFlags(flags['READ'], flags)).toEqual(['READ']);
  });
  it('returns multiple active flags', () => {
    const v = combineFlags(flags['READ'], flags['WRITE']);
    const active = getActiveFlags(v, flags);
    expect(active).toContain('READ');
    expect(active).toContain('WRITE');
    expect(active).not.toContain('EXEC');
    expect(active).not.toContain('DELETE');
  });
  it('returns all flags when all set', () => {
    const v = combineFlags(...Object.values(flags));
    expect(getActiveFlags(v, flags).sort()).toEqual(['DELETE', 'EXEC', 'READ', 'WRITE']);
  });
});

// ---------------------------------------------------------------------------
// 17. toBitString edge cases
// ---------------------------------------------------------------------------
describe('toBitString edge cases', () => {
  it('default width is 8', () => {
    expect(toBitString(0)).toHaveLength(8);
    expect(toBitString(255)).toBe('11111111');
  });
  it('width 1 for 1', () => {
    expect(toBitString(1, 1)).toBe('1');
  });
  it('width 16 pads correctly', () => {
    expect(toBitString(1, 16)).toBe('0000000000000001');
  });
  it('width 32 for 0xFFFFFFFF', () => {
    expect(toBitString(0xffffffff, 32)).toBe('11111111111111111111111111111111');
  });
  it('toBitString(0, 4) === "0000"', () => {
    expect(toBitString(0, 4)).toBe('0000');
  });
  it('toBitString(0b1010, 4) === "1010"', () => {
    expect(toBitString(0b1010, 4)).toBe('1010');
  });
});

// ---------------------------------------------------------------------------
// 18. fromBitString edge cases
// ---------------------------------------------------------------------------
describe('fromBitString edge cases', () => {
  it('fromBitString("0") === 0', () => {
    expect(fromBitString('0')).toBe(0);
  });
  it('fromBitString("1") === 1', () => {
    expect(fromBitString('1')).toBe(1);
  });
  it('fromBitString("11111111") === 255', () => {
    expect(fromBitString('11111111')).toBe(255);
  });
  it('fromBitString("00000000") === 0', () => {
    expect(fromBitString('00000000')).toBe(0);
  });
  it('fromBitString("1111111111111111111111111111111") === 0x7FFFFFFF', () => {
    expect(fromBitString('1111111111111111111111111111111')).toBe(0x7fffffff);
  });
});

// ---------------------------------------------------------------------------
// 19. toBuffer
// ---------------------------------------------------------------------------
describe('toBuffer', () => {
  it('converts string to buffer', () => {
    const buf = toBuffer('hello');
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.toString('utf8')).toBe('hello');
  });
  it('converts number array to buffer', () => {
    const buf = toBuffer([0x41, 0x42, 0x43]);
    expect(buf.toString('ascii')).toBe('ABC');
  });
  it('converts Uint8Array to buffer', () => {
    const ua = new Uint8Array([1, 2, 3]);
    const buf = toBuffer(ua);
    expect(buf[0]).toBe(1);
    expect(buf[1]).toBe(2);
    expect(buf[2]).toBe(3);
  });
  it('empty string gives empty buffer', () => {
    expect(toBuffer('')).toHaveLength(0);
  });
  it('empty array gives empty buffer', () => {
    expect(toBuffer([])).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 20. concat
// ---------------------------------------------------------------------------
describe('concat', () => {
  it('concatenates two buffers', () => {
    const a = Buffer.from([1, 2]);
    const b = Buffer.from([3, 4]);
    const r = concat(a, b);
    expect(r).toEqual(Buffer.from([1, 2, 3, 4]));
  });
  it('concatenates three buffers', () => {
    const a = Buffer.from('hello');
    const b = Buffer.from(' ');
    const c = Buffer.from('world');
    expect(concat(a, b, c).toString()).toBe('hello world');
  });
  it('concat of single buffer is equal to that buffer', () => {
    const a = Buffer.from([5, 6, 7]);
    expect(concat(a)).toEqual(a);
  });
  it('concat with empty buffer', () => {
    const a = Buffer.from([1]);
    const b = Buffer.alloc(0);
    expect(concat(a, b)).toEqual(a);
  });
});

// ---------------------------------------------------------------------------
// 21. indexOf
// ---------------------------------------------------------------------------
describe('indexOf', () => {
  it('finds needle at start', () => {
    const h = Buffer.from([1, 2, 3, 4]);
    const n = Buffer.from([1, 2]);
    expect(indexOf(h, n)).toBe(0);
  });
  it('finds needle in middle', () => {
    const h = Buffer.from([0, 1, 2, 3, 4]);
    const n = Buffer.from([2, 3]);
    expect(indexOf(h, n)).toBe(2);
  });
  it('finds needle at end', () => {
    const h = Buffer.from([0, 1, 2, 3]);
    const n = Buffer.from([2, 3]);
    expect(indexOf(h, n)).toBe(2);
  });
  it('returns -1 when not found', () => {
    const h = Buffer.from([1, 2, 3]);
    const n = Buffer.from([4, 5]);
    expect(indexOf(h, n)).toBe(-1);
  });
  it('empty needle returns 0', () => {
    const h = Buffer.from([1, 2, 3]);
    expect(indexOf(h, Buffer.alloc(0))).toBe(0);
  });
  it('needle longer than haystack returns -1', () => {
    const h = Buffer.from([1]);
    const n = Buffer.from([1, 2]);
    expect(indexOf(h, n)).toBe(-1);
  });
});

// ---------------------------------------------------------------------------
// 22. split
// ---------------------------------------------------------------------------
describe('split', () => {
  it('splits buffer by single-byte delimiter', () => {
    const buf = Buffer.from([1, 0, 2, 0, 3]);
    const delim = Buffer.from([0]);
    const parts = split(buf, delim);
    expect(parts).toHaveLength(3);
    expect(parts[0]).toEqual(Buffer.from([1]));
    expect(parts[1]).toEqual(Buffer.from([2]));
    expect(parts[2]).toEqual(Buffer.from([3]));
  });
  it('no delimiter found returns single-element array', () => {
    const buf = Buffer.from([1, 2, 3]);
    const delim = Buffer.from([0]);
    const parts = split(buf, delim);
    expect(parts).toHaveLength(1);
    expect(parts[0]).toEqual(buf);
  });
  it('splits at start', () => {
    const buf = Buffer.from([0, 1, 2]);
    const delim = Buffer.from([0]);
    const parts = split(buf, delim);
    expect(parts[0]).toEqual(Buffer.alloc(0));
    expect(parts[1]).toEqual(Buffer.from([1, 2]));
  });
  it('splits string-like buffer by newline', () => {
    const buf = Buffer.from('hello\nworld\nfoo');
    const delim = Buffer.from('\n');
    const parts = split(buf, delim);
    expect(parts.map((p) => p.toString())).toEqual(['hello', 'world', 'foo']);
  });
});

// ---------------------------------------------------------------------------
// 23. readUInt16 / writeUInt16 roundtrip + signedness
// ---------------------------------------------------------------------------
describe('readUInt16 / writeUInt16 roundtrip', () => {
  const testValues = [0, 1, 255, 256, 32767, 32768, 65535];
  for (const v of testValues) {
    it(`uint16 big-endian roundtrip for ${v}`, () => {
      const buf = writeUInt16(v, 'big-endian');
      expect(readUInt16(buf, 0, 'big-endian')).toBe(v);
    });
    it(`uint16 little-endian roundtrip for ${v}`, () => {
      const buf = writeUInt16(v, 'little-endian');
      expect(readUInt16(buf, 0, 'little-endian')).toBe(v);
    });
  }
  it('big-endian and little-endian produce different bytes for asymmetric value', () => {
    const be = writeUInt16(0x1234, 'big-endian');
    const le = writeUInt16(0x1234, 'little-endian');
    expect(be[0]).toBe(0x12);
    expect(be[1]).toBe(0x34);
    expect(le[0]).toBe(0x34);
    expect(le[1]).toBe(0x12);
  });
});

// ---------------------------------------------------------------------------
// 24. readInt16 / readInt32
// ---------------------------------------------------------------------------
describe('readInt16 / readInt32', () => {
  it('readInt16 reads signed value correctly', () => {
    const buf = Buffer.from([0xff, 0xff]); // -1 in big-endian signed
    expect(readInt16(buf, 0, 'big-endian')).toBe(-1);
  });
  it('readInt16 little-endian reads signed value', () => {
    const buf = Buffer.from([0xff, 0xff]);
    expect(readInt16(buf, 0, 'little-endian')).toBe(-1);
  });
  it('readInt32 reads signed value correctly', () => {
    const buf = Buffer.from([0xff, 0xff, 0xff, 0xff]);
    expect(readInt32(buf, 0, 'big-endian')).toBe(-1);
  });
  it('readInt32 little-endian reads signed value', () => {
    const buf = Buffer.from([0xff, 0xff, 0xff, 0xff]);
    expect(readInt32(buf, 0, 'little-endian')).toBe(-1);
  });
  it('readInt32 positive value big-endian', () => {
    const buf = Buffer.from([0x00, 0x00, 0x01, 0x00]);
    expect(readInt32(buf, 0, 'big-endian')).toBe(256);
  });
});

// ---------------------------------------------------------------------------
// 25. xorBuffers
// ---------------------------------------------------------------------------
describe('xorBuffers', () => {
  it('XOR of buffer with itself is all zeros', () => {
    const a = Buffer.from([0xde, 0xad, 0xbe, 0xef]);
    expect(xorBuffers(a, a)).toEqual(Buffer.alloc(4, 0));
  });
  it('XOR of buffer with zeros is itself', () => {
    const a = Buffer.from([1, 2, 3]);
    const z = Buffer.alloc(3, 0);
    expect(xorBuffers(a, z)).toEqual(a);
  });
  it('XOR is commutative', () => {
    const a = Buffer.from([0xaa, 0xbb]);
    const b = Buffer.from([0x55, 0x44]);
    expect(xorBuffers(a, b)).toEqual(xorBuffers(b, a));
  });
  it('XOR with all-ones inverts bytes', () => {
    const a = Buffer.from([0x00, 0xff, 0x0f]);
    const ones = Buffer.from([0xff, 0xff, 0xff]);
    const result = xorBuffers(a, ones);
    expect(result[0]).toBe(0xff);
    expect(result[1]).toBe(0x00);
    expect(result[2]).toBe(0xf0);
  });
  it('throws when buffers have different lengths', () => {
    const a = Buffer.from([1, 2]);
    const b = Buffer.from([1]);
    expect(() => xorBuffers(a, b)).toThrow(RangeError);
  });
  it('XOR double-application is identity', () => {
    const a = Buffer.from([0x12, 0x34, 0x56]);
    const key = Buffer.from([0xab, 0xcd, 0xef]);
    expect(xorBuffers(xorBuffers(a, key), key)).toEqual(a);
  });
});

// ---------------------------------------------------------------------------
// 26. hammingDistance
// ---------------------------------------------------------------------------
describe('hammingDistance', () => {
  it('identical buffers have distance 0', () => {
    const a = Buffer.from([0xde, 0xad]);
    expect(hammingDistance(a, a)).toBe(0);
  });
  it('all-zeros vs all-ones has distance 8 per byte', () => {
    const zeros = Buffer.alloc(4, 0);
    const ones = Buffer.alloc(4, 0xff);
    expect(hammingDistance(zeros, ones)).toBe(32);
  });
  it('single-bit difference gives distance 1', () => {
    const a = Buffer.from([0b00000000]);
    const b = Buffer.from([0b00000001]);
    expect(hammingDistance(a, b)).toBe(1);
  });
  it('throws when lengths differ', () => {
    expect(() => hammingDistance(Buffer.from([1, 2]), Buffer.from([1]))).toThrow(RangeError);
  });
  it('symmetry: hammingDistance(a,b) === hammingDistance(b,a)', () => {
    const a = Buffer.from([0x12, 0x34]);
    const b = Buffer.from([0x56, 0x78]);
    expect(hammingDistance(a, b)).toBe(hammingDistance(b, a));
  });
});

// ---------------------------------------------------------------------------
// 27. isEqual (constant-time comparison)
// ---------------------------------------------------------------------------
describe('isEqual', () => {
  it('returns true for identical buffers', () => {
    const a = Buffer.from([1, 2, 3]);
    const b = Buffer.from([1, 2, 3]);
    expect(isEqual(a, b)).toBe(true);
  });
  it('returns false for different buffers of same length', () => {
    const a = Buffer.from([1, 2, 3]);
    const b = Buffer.from([1, 2, 4]);
    expect(isEqual(a, b)).toBe(false);
  });
  it('returns false for different lengths', () => {
    const a = Buffer.from([1, 2]);
    const b = Buffer.from([1, 2, 3]);
    expect(isEqual(a, b)).toBe(false);
  });
  it('returns true for empty buffers', () => {
    expect(isEqual(Buffer.alloc(0), Buffer.alloc(0))).toBe(true);
  });
  it('returns false for first byte differing', () => {
    const a = Buffer.from([0, 0, 0]);
    const b = Buffer.from([1, 0, 0]);
    expect(isEqual(a, b)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 28. toBinaryString
// ---------------------------------------------------------------------------
describe('toBinaryString', () => {
  it('empty buffer gives empty string', () => {
    expect(toBinaryString(Buffer.alloc(0))).toBe('');
  });
  it('single byte 0 gives "00000000"', () => {
    expect(toBinaryString(Buffer.from([0]))).toBe('00000000');
  });
  it('single byte 255 gives "11111111"', () => {
    expect(toBinaryString(Buffer.from([0xff]))).toBe('11111111');
  });
  it('two bytes are space-separated', () => {
    const result = toBinaryString(Buffer.from([0x0f, 0xf0]));
    expect(result).toBe('00001111 11110000');
  });
  it('three bytes produce two spaces', () => {
    const result = toBinaryString(Buffer.from([0, 128, 255]));
    expect(result.split(' ')).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// 29. toHexDump / fromHexDump roundtrip
// ---------------------------------------------------------------------------
describe('toHexDump / fromHexDump', () => {
  it('empty buffer produces empty string', () => {
    expect(toHexDump(Buffer.alloc(0))).toBe('');
  });

  it('single byte produces valid hex dump line', () => {
    const dump = toHexDump(Buffer.from([0x41]));
    expect(dump).toContain('41');
  });

  it('roundtrip: fromHexDump(toHexDump(buf)) equals original for short buffer', () => {
    const original = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
    const dump = toHexDump(original);
    const restored = fromHexDump(dump);
    expect(restored).toEqual(original);
  });

  it('roundtrip: 16-byte buffer', () => {
    const original = Buffer.from('0123456789abcdef', 'hex');
    const dump = toHexDump(original);
    const restored = fromHexDump(dump);
    expect(restored).toEqual(original);
  });

  it('roundtrip: 32-byte buffer (two rows)', () => {
    const original = Buffer.alloc(32);
    for (let i = 0; i < 32; i++) original[i] = i;
    const dump = toHexDump(original);
    const restored = fromHexDump(dump);
    expect(restored).toEqual(original);
  });

  it('dump contains offset in hex', () => {
    const buf = Buffer.alloc(17);
    const dump = toHexDump(buf);
    // second line offset should be 0x10 = "00000010"
    expect(dump).toContain('00000010');
  });

  it('custom width parameter works', () => {
    const buf = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);
    const dump = toHexDump(buf, 4);
    const lines = dump.split('\n');
    expect(lines).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// 30. Extended countBits loop (i = 100..199) — 100 additional tests
// ---------------------------------------------------------------------------
describe('countBits extended (i=100..199)', () => {
  for (let i = 100; i < 200; i++) {
    it(`countBits(${i}) === refCountBits(${i})`, () => {
      expect(countBits(i)).toBe(refCountBits(i));
    });
  }
});

// ---------------------------------------------------------------------------
// 31. Extended nextPowerOfTwo (i=101..200) — 100 additional tests
// ---------------------------------------------------------------------------
describe('nextPowerOfTwo extended (i=101..200)', () => {
  function refNext(n: number): number {
    if (n <= 1) return 1;
    let v = 1;
    while (v < n) v <<= 1;
    return v >>> 0;
  }

  for (let i = 101; i <= 200; i++) {
    it(`nextPowerOfTwo(${i}) === ${refNext(i)}`, () => {
      expect(nextPowerOfTwo(i)).toBe(refNext(i));
    });
  }
});

// ---------------------------------------------------------------------------
// 32. Extended toBitString/fromBitString roundtrip (i=100..199) — 100 tests
// ---------------------------------------------------------------------------
describe('toBitString/fromBitString roundtrip extended (i=100..199)', () => {
  for (let i = 100; i < 200; i++) {
    it(`roundtrip for ${i} with width 16`, () => {
      const s = toBitString(i, 16);
      expect(s).toHaveLength(16);
      expect(fromBitString(s)).toBe(i >>> 0);
    });
  }
});

// ---------------------------------------------------------------------------
// 33. writeUInt32 / readUInt32 big-endian extended (i=50..99) — 50 more tests
// ---------------------------------------------------------------------------
describe('readUInt32/writeUInt32 big-endian extended (i=50..99)', () => {
  for (let i = 50; i < 100; i++) {
    const value = (i * 0xfedcba98 + i) >>> 0;
    it(`big-endian roundtrip for value ${value} (i=${i})`, () => {
      const buf = writeUInt32(value, 'big-endian');
      expect(readUInt32(buf, 0, 'big-endian')).toBe(value);
    });
  }
});

// ---------------------------------------------------------------------------
// 34. writeUInt32 / readUInt32 little-endian extended (i=50..99) — 50 more tests
// ---------------------------------------------------------------------------
describe('readUInt32/writeUInt32 little-endian extended (i=50..99)', () => {
  for (let i = 50; i < 100; i++) {
    const value = (i * 0x13579bdf + i * 7) >>> 0;
    it(`little-endian roundtrip for value ${value} (i=${i})`, () => {
      const buf = writeUInt32(value, 'little-endian');
      expect(readUInt32(buf, 0, 'little-endian')).toBe(value);
    });
  }
});

// ---------------------------------------------------------------------------
// 35. Extended hasFlag / setFlag / clearFlag (i=50..99) — 50 × 3 = 150 more tests
// ---------------------------------------------------------------------------
describe('hasFlag/setFlag/clearFlag extended (i=50..99)', () => {
  for (let i = 50; i < 100; i++) {
    const flag = 1 << (i % 32);
    it(`hasFlag: value with flag bit ${i % 32} set (i=${i})`, () => {
      expect(hasFlag(flag, flag)).toBe(true);
    });
    it(`setFlag: result has flag bit ${i % 32} (i=${i})`, () => {
      const result = setFlag(0, flag);
      expect(hasFlag(result, flag)).toBe(true);
    });
    it(`clearFlag: result does not have flag bit ${i % 32} (i=${i})`, () => {
      const result = clearFlag(0xffffffff >>> 0, flag);
      expect(hasFlag(result, flag)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 36. rotateLeft/rotateRight identity property — 50 more tests (i=50..99)
// ---------------------------------------------------------------------------
describe('rotateLeft/rotateRight identity extended (i=50..99)', () => {
  const base = 0xabcdef01 >>> 0;
  for (let i = 50; i < 100; i++) {
    it(`rotate by ${i}: rotateRight(rotateLeft(x, ${i}), ${i}) === x`, () => {
      const n = i & 31;
      const rotated = rotateLeft(base, n);
      const restored = rotateRight(rotated, n);
      expect(restored).toBe(base);
    });
  }
});

// ---------------------------------------------------------------------------
// 37. isPowerOfTwo extended (i=100..199) — 100 more tests
// ---------------------------------------------------------------------------
describe('isPowerOfTwo extended (i=100..199)', () => {
  for (let i = 100; i < 200; i++) {
    it(`isPowerOfTwo(${i})`, () => {
      const expected = i > 0 && (i & (i - 1)) === 0;
      expect(isPowerOfTwo(i)).toBe(expected);
    });
  }
});
