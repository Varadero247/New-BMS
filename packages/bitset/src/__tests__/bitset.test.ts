// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  BitSet,
  setBit,
  clearBit,
  flipBit,
  getBit,
  popCount,
  popCount32Array,
  trailingZeros,
  leadingZeros,
  isPowerOfTwo,
  nextPowerOfTwo,
  lowestSetBit,
  fromIndices,
  fromString,
  fromNumber,
} from '../bitset';

// ─── BitSet.set / BitSet.get (index 0..99) ───────────────────────────────────
describe('BitSet set and get — single bit', () => {
  for (let i = 0; i < 100; i++) {
    it(`sets bit ${i} and reads it back as true`, () => {
      const bs = new BitSet(128);
      bs.set(i);
      expect(bs.get(i)).toBe(true);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`get(${i}) is false on a freshly constructed BitSet of size 128`, () => {
      const bs = new BitSet(128);
      expect(bs.get(i)).toBe(false);
    });
  }
});

// ─── BitSet.test alias ────────────────────────────────────────────────────────
describe('BitSet test() alias', () => {
  for (let i = 0; i < 32; i++) {
    it(`test(${i}) equals get(${i}) after set`, () => {
      const bs = new BitSet(64);
      bs.set(i);
      expect(bs.test(i)).toBe(bs.get(i));
    });
  }
});

// ─── BitSet.clear ─────────────────────────────────────────────────────────────
describe('BitSet clear — single bit', () => {
  for (let i = 0; i < 100; i++) {
    it(`clears bit ${i} after setting it`, () => {
      const bs = new BitSet(128);
      bs.set(i);
      expect(bs.get(i)).toBe(true);
      bs.clear(i);
      expect(bs.get(i)).toBe(false);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`clearing already-clear bit ${i} keeps it false`, () => {
      const bs = new BitSet(64);
      bs.clear(i);
      expect(bs.get(i)).toBe(false);
    });
  }
});

// ─── BitSet.flip ──────────────────────────────────────────────────────────────
describe('BitSet flip', () => {
  for (let i = 0; i < 64; i++) {
    it(`flip toggles bit ${i} from false to true`, () => {
      const bs = new BitSet(128);
      bs.flip(i);
      expect(bs.get(i)).toBe(true);
    });
  }

  for (let i = 0; i < 32; i++) {
    it(`double-flip of bit ${i} restores false`, () => {
      const bs = new BitSet(128);
      bs.flip(i);
      bs.flip(i);
      expect(bs.get(i)).toBe(false);
    });
  }
});

// ─── BitSet.setAll / clearAll ─────────────────────────────────────────────────
describe('BitSet setAll', () => {
  for (let size = 1; size <= 40; size++) {
    it(`setAll() makes every bit true for size=${size}`, () => {
      const bs = new BitSet(size);
      bs.setAll();
      for (let i = 0; i < size; i++) {
        expect(bs.get(i)).toBe(true);
      }
    });
  }
});

describe('BitSet clearAll', () => {
  for (let size = 1; size <= 40; size++) {
    it(`clearAll() makes every bit false for size=${size}`, () => {
      const bs = new BitSet(size);
      bs.setAll();
      bs.clearAll();
      for (let i = 0; i < size; i++) {
        expect(bs.get(i)).toBe(false);
      }
    });
  }
});

// ─── BitSet.setRange / clearRange ────────────────────────────────────────────
describe('BitSet setRange', () => {
  for (let start = 0; start < 10; start++) {
    it(`setRange(${start}, ${start + 9}) sets exactly 10 bits in a 64-bit set`, () => {
      const bs = new BitSet(64);
      bs.setRange(start, start + 9);
      for (let i = start; i <= start + 9; i++) {
        expect(bs.get(i)).toBe(true);
      }
      if (start > 0) expect(bs.get(start - 1)).toBe(false);
      if (start + 10 < 64) expect(bs.get(start + 10)).toBe(false);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`setRange(${i}, ${i}) sets exactly bit ${i}`, () => {
      const bs = new BitSet(64);
      bs.setRange(i, i);
      expect(bs.get(i)).toBe(true);
      expect(bs.count()).toBe(1);
    });
  }
});

describe('BitSet clearRange', () => {
  for (let start = 0; start < 10; start++) {
    it(`clearRange(${start}, ${start + 9}) clears 10 bits`, () => {
      const bs = new BitSet(64);
      bs.setAll();
      bs.clearRange(start, start + 9);
      for (let i = start; i <= start + 9; i++) {
        expect(bs.get(i)).toBe(false);
      }
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`clearRange(${i}, ${i}) clears only bit ${i}`, () => {
      const bs = new BitSet(64);
      bs.setAll();
      bs.clearRange(i, i);
      expect(bs.get(i)).toBe(false);
      expect(bs.count()).toBe(63);
    });
  }
});

// ─── BitSet.and ───────────────────────────────────────────────────────────────
describe('BitSet and()', () => {
  for (let i = 0; i < 32; i++) {
    it(`and(): bit ${i} set in both → result has bit ${i}`, () => {
      const a = new BitSet(64);
      const b = new BitSet(64);
      a.set(i);
      b.set(i);
      expect(a.and(b).get(i)).toBe(true);
    });
  }

  for (let i = 0; i < 32; i++) {
    it(`and(): bit ${i} set in only one → result does not have bit ${i}`, () => {
      const a = new BitSet(64);
      const b = new BitSet(64);
      a.set(i);
      // b has nothing
      expect(a.and(b).get(i)).toBe(false);
    });
  }

  it('and() of two full sets equals a full set', () => {
    const a = new BitSet(32);
    const b = new BitSet(32);
    a.setAll();
    b.setAll();
    expect(a.and(b).count()).toBe(32);
  });

  it('and() of full and empty equals empty', () => {
    const a = new BitSet(32);
    const b = new BitSet(32);
    a.setAll();
    expect(a.and(b).isEmpty()).toBe(true);
  });
});

// ─── BitSet.or ────────────────────────────────────────────────────────────────
describe('BitSet or()', () => {
  for (let i = 0; i < 32; i++) {
    it(`or(): bit ${i} set in a → result has bit ${i}`, () => {
      const a = new BitSet(64);
      const b = new BitSet(64);
      a.set(i);
      expect(a.or(b).get(i)).toBe(true);
    });
  }

  for (let i = 0; i < 32; i++) {
    it(`or(): bit ${i} set in b → result has bit ${i}`, () => {
      const a = new BitSet(64);
      const b = new BitSet(64);
      b.set(i);
      expect(a.or(b).get(i)).toBe(true);
    });
  }

  it('or() of empty sets is empty', () => {
    const a = new BitSet(32);
    const b = new BitSet(32);
    expect(a.or(b).isEmpty()).toBe(true);
  });

  it('or() of full sets is full', () => {
    const a = new BitSet(32);
    const b = new BitSet(32);
    a.setAll();
    b.setAll();
    expect(a.or(b).isFull()).toBe(true);
  });
});

// ─── BitSet.xor ───────────────────────────────────────────────────────────────
describe('BitSet xor()', () => {
  for (let i = 0; i < 32; i++) {
    it(`xor(): bit ${i} set in a only → result has bit ${i}`, () => {
      const a = new BitSet(64);
      const b = new BitSet(64);
      a.set(i);
      expect(a.xor(b).get(i)).toBe(true);
    });
  }

  for (let i = 0; i < 32; i++) {
    it(`xor(): bit ${i} set in both → result does not have bit ${i}`, () => {
      const a = new BitSet(64);
      const b = new BitSet(64);
      a.set(i);
      b.set(i);
      expect(a.xor(b).get(i)).toBe(false);
    });
  }

  it('xor() of identical sets is empty', () => {
    const a = new BitSet(32);
    const b = new BitSet(32);
    a.setAll();
    b.setAll();
    expect(a.xor(b).isEmpty()).toBe(true);
  });

  it('xor() of empty sets is empty', () => {
    const a = new BitSet(32);
    const b = new BitSet(32);
    expect(a.xor(b).isEmpty()).toBe(true);
  });
});

// ─── BitSet.not ───────────────────────────────────────────────────────────────
describe('BitSet not()', () => {
  for (let size = 1; size <= 40; size++) {
    it(`not() of empty size=${size} equals full`, () => {
      const bs = new BitSet(size);
      expect(bs.not().count()).toBe(size);
    });
  }

  for (let size = 1; size <= 20; size++) {
    it(`not() of full size=${size} is empty`, () => {
      const bs = new BitSet(size);
      bs.setAll();
      expect(bs.not().isEmpty()).toBe(true);
    });
  }

  it('not() does not affect bits beyond size', () => {
    const bs = new BitSet(10);
    const neg = bs.not();
    expect(neg.count()).toBe(10);
  });

  it('double not() is identity', () => {
    const bs = new BitSet(64);
    bs.set(3); bs.set(7); bs.set(63);
    const original = bs.clone();
    expect(bs.not().not().equals(original)).toBe(true);
  });
});

// ─── BitSet.andNot ────────────────────────────────────────────────────────────
describe('BitSet andNot()', () => {
  for (let i = 0; i < 32; i++) {
    it(`andNot(): bit ${i} set in both → result is 0`, () => {
      const a = new BitSet(64);
      const b = new BitSet(64);
      a.set(i);
      b.set(i);
      expect(a.andNot(b).get(i)).toBe(false);
    });
  }

  for (let i = 0; i < 16; i++) {
    it(`andNot(): bit ${i} only in a → result keeps bit ${i}`, () => {
      const a = new BitSet(64);
      const b = new BitSet(64);
      a.set(i);
      expect(a.andNot(b).get(i)).toBe(true);
    });
  }

  it('andNot of full and full is empty', () => {
    const a = new BitSet(32);
    const b = new BitSet(32);
    a.setAll();
    b.setAll();
    expect(a.andNot(b).isEmpty()).toBe(true);
  });
});

// ─── In-place operations ──────────────────────────────────────────────────────
describe('BitSet andInPlace()', () => {
  for (let i = 0; i < 16; i++) {
    it(`andInPlace(): bit ${i} in a but not b → cleared`, () => {
      const a = new BitSet(64);
      const b = new BitSet(64);
      a.set(i);
      a.andInPlace(b);
      expect(a.get(i)).toBe(false);
    });
  }

  it('andInPlace() with matching bits preserves them', () => {
    const a = new BitSet(32);
    const b = new BitSet(32);
    a.set(0); a.set(15); a.set(31);
    b.set(0); b.set(15); b.set(31);
    a.andInPlace(b);
    expect(a.get(0)).toBe(true);
    expect(a.get(15)).toBe(true);
    expect(a.get(31)).toBe(true);
  });
});

describe('BitSet orInPlace()', () => {
  for (let i = 0; i < 16; i++) {
    it(`orInPlace(): bit ${i} from b is added to a`, () => {
      const a = new BitSet(64);
      const b = new BitSet(64);
      b.set(i);
      a.orInPlace(b);
      expect(a.get(i)).toBe(true);
    });
  }
});

describe('BitSet xorInPlace()', () => {
  for (let i = 0; i < 16; i++) {
    it(`xorInPlace(): bit ${i} toggled once → true`, () => {
      const a = new BitSet(64);
      const b = new BitSet(64);
      b.set(i);
      a.xorInPlace(b);
      expect(a.get(i)).toBe(true);
    });
  }

  for (let i = 0; i < 16; i++) {
    it(`xorInPlace(): bit ${i} toggled twice → false`, () => {
      const a = new BitSet(64);
      const b = new BitSet(64);
      b.set(i);
      a.xorInPlace(b);
      a.xorInPlace(b);
      expect(a.get(i)).toBe(false);
    });
  }
});

// ─── count / isEmpty / isFull ─────────────────────────────────────────────────
describe('BitSet count()', () => {
  for (let n = 0; n <= 40; n++) {
    it(`count() = ${n} after setting ${n} bits`, () => {
      const bs = new BitSet(64);
      for (let i = 0; i < n; i++) bs.set(i);
      expect(bs.count()).toBe(n);
    });
  }
});

describe('BitSet isEmpty()', () => {
  it('fresh BitSet is empty', () => {
    expect(new BitSet(64).isEmpty()).toBe(true);
  });

  for (let i = 0; i < 20; i++) {
    it(`setting bit ${i} makes isEmpty() false`, () => {
      const bs = new BitSet(64);
      bs.set(i);
      expect(bs.isEmpty()).toBe(false);
    });
  }
});

describe('BitSet isFull()', () => {
  for (let size = 1; size <= 40; size++) {
    it(`isFull() true when all ${size} bits set`, () => {
      const bs = new BitSet(size);
      bs.setAll();
      expect(bs.isFull()).toBe(true);
    });
  }

  it('not full when one bit missing', () => {
    const bs = new BitSet(32);
    bs.setAll();
    bs.clear(15);
    expect(bs.isFull()).toBe(false);
  });
});

// ─── isSubsetOf / isSupersetOf / intersects / equals ─────────────────────────
describe('BitSet isSubsetOf()', () => {
  it('empty set is subset of any set', () => {
    const empty = new BitSet(32);
    const full = new BitSet(32);
    full.setAll();
    expect(empty.isSubsetOf(full)).toBe(true);
  });

  it('full set is NOT subset of empty', () => {
    const empty = new BitSet(32);
    const full = new BitSet(32);
    full.setAll();
    expect(full.isSubsetOf(empty)).toBe(false);
  });

  for (let i = 0; i < 32; i++) {
    it(`{${i}} is subset of full 32-bit set`, () => {
      const single = new BitSet(32);
      single.set(i);
      const full = new BitSet(32);
      full.setAll();
      expect(single.isSubsetOf(full)).toBe(true);
    });
  }

  for (let i = 0; i < 16; i++) {
    it(`{${i}} is NOT subset of {${i + 16}}`, () => {
      const a = new BitSet(32);
      a.set(i);
      const b = new BitSet(32);
      b.set(i + 16);
      expect(a.isSubsetOf(b)).toBe(false);
    });
  }

  it('a set is a subset of itself', () => {
    const bs = new BitSet(32);
    bs.set(0); bs.set(10); bs.set(20);
    expect(bs.isSubsetOf(bs)).toBe(true);
  });
});

describe('BitSet isSupersetOf()', () => {
  it('full set is superset of any subset', () => {
    const full = new BitSet(32);
    full.setAll();
    const sub = new BitSet(32);
    sub.set(5); sub.set(15);
    expect(full.isSupersetOf(sub)).toBe(true);
  });

  for (let i = 0; i < 16; i++) {
    it(`full 32-bit set is superset of {${i}}`, () => {
      const full = new BitSet(32);
      full.setAll();
      const single = new BitSet(32);
      single.set(i);
      expect(full.isSupersetOf(single)).toBe(true);
    });
  }
});

describe('BitSet intersects()', () => {
  for (let i = 0; i < 32; i++) {
    it(`{${i}} intersects with a set that also has bit ${i}`, () => {
      const a = new BitSet(64);
      const b = new BitSet(64);
      a.set(i);
      b.set(i);
      b.set(i + 1 < 64 ? i + 1 : 0);
      expect(a.intersects(b)).toBe(true);
    });
  }

  it('disjoint sets do not intersect', () => {
    const a = new BitSet(64);
    const b = new BitSet(64);
    for (let i = 0; i < 32; i++) a.set(i);
    for (let i = 32; i < 64; i++) b.set(i);
    expect(a.intersects(b)).toBe(false);
  });

  it('empty sets do not intersect', () => {
    expect(new BitSet(32).intersects(new BitSet(32))).toBe(false);
  });
});

describe('BitSet equals()', () => {
  it('fresh BitSets of same size are equal', () => {
    expect(new BitSet(32).equals(new BitSet(32))).toBe(true);
  });

  it('BitSets of different sizes are not equal', () => {
    expect(new BitSet(32).equals(new BitSet(64))).toBe(false);
  });

  for (let i = 0; i < 32; i++) {
    it(`differs when only one has bit ${i} set`, () => {
      const a = new BitSet(64);
      const b = new BitSet(64);
      a.set(i);
      expect(a.equals(b)).toBe(false);
    });
  }

  it('clone equals original', () => {
    const bs = new BitSet(64);
    bs.set(0); bs.set(31); bs.set(63);
    expect(bs.equals(bs.clone())).toBe(true);
  });
});

// ─── firstSet / nextSet / toArray ─────────────────────────────────────────────
describe('BitSet firstSet()', () => {
  it('returns undefined for empty set', () => {
    expect(new BitSet(64).firstSet()).toBeUndefined();
  });

  for (let i = 0; i < 64; i++) {
    it(`firstSet() = ${i} when only bit ${i} is set`, () => {
      const bs = new BitSet(128);
      bs.set(i);
      expect(bs.firstSet()).toBe(i);
    });
  }

  it('firstSet() finds minimum when multiple bits set', () => {
    const bs = new BitSet(64);
    bs.set(40); bs.set(5); bs.set(20);
    expect(bs.firstSet()).toBe(5);
  });
});

describe('BitSet nextSet()', () => {
  for (let i = 0; i < 32; i++) {
    it(`nextSet(${i}) = ${i} when bit ${i} is set`, () => {
      const bs = new BitSet(64);
      bs.set(i);
      expect(bs.nextSet(i)).toBe(i);
    });
  }

  for (let i = 0; i < 32; i++) {
    it(`nextSet(${i + 1}) = undefined after only bit ${i} is set`, () => {
      const bs = new BitSet(64);
      bs.set(i);
      expect(bs.nextSet(i + 1)).toBeUndefined();
    });
  }

  it('nextSet enumerates all set bits in order', () => {
    const bs = new BitSet(64);
    const expected = [3, 17, 33, 63];
    for (const b of expected) bs.set(b);
    const result: number[] = [];
    let idx = bs.nextSet(0);
    while (idx !== undefined) {
      result.push(idx);
      idx = bs.nextSet(idx + 1);
    }
    expect(result).toEqual(expected);
  });

  it('nextSet returns undefined for from >= size', () => {
    const bs = new BitSet(32);
    bs.setAll();
    expect(bs.nextSet(32)).toBeUndefined();
  });
});

describe('BitSet toArray()', () => {
  it('toArray() of empty set is []', () => {
    expect(new BitSet(64).toArray()).toEqual([]);
  });

  it('toArray() of full 8-bit set is [0..7]', () => {
    const bs = new BitSet(8);
    bs.setAll();
    expect(bs.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  for (let i = 0; i < 32; i++) {
    it(`toArray() returns [${i}] when only bit ${i} set`, () => {
      const bs = new BitSet(64);
      bs.set(i);
      expect(bs.toArray()).toEqual([i]);
    });
  }

  it('toArray() returns indices in ascending order', () => {
    const bs = new BitSet(64);
    bs.set(63); bs.set(0); bs.set(31);
    expect(bs.toArray()).toEqual([0, 31, 63]);
  });
});

// ─── toString / toHex / clone ─────────────────────────────────────────────────
describe('BitSet toString()', () => {
  it('empty BitSet(8) toString is "00000000"', () => {
    expect(new BitSet(8).toString()).toBe('00000000');
  });

  it('full BitSet(8) toString is "11111111"', () => {
    const bs = new BitSet(8);
    bs.setAll();
    expect(bs.toString()).toBe('11111111');
  });

  it('toString length equals size', () => {
    const bs = new BitSet(37);
    expect(bs.toString().length).toBe(37);
  });

  it('toString reflects individual bit positions', () => {
    const bs = new BitSet(8);
    bs.set(0); bs.set(3); bs.set(7);
    const str = bs.toString();
    expect(str[0]).toBe('1');
    expect(str[3]).toBe('1');
    expect(str[7]).toBe('1');
    expect(str[1]).toBe('0');
  });

  for (let i = 0; i < 16; i++) {
    it(`toString() has '1' at position ${i} when bit ${i} set`, () => {
      const bs = new BitSet(32);
      bs.set(i);
      expect(bs.toString()[i]).toBe('1');
    });
  }
});

describe('BitSet toHex()', () => {
  it('empty BitSet(32) toHex is "00000000"', () => {
    expect(new BitSet(32).toHex()).toBe('00000000');
  });

  it('toHex length = words * 8', () => {
    const bs = new BitSet(64);
    expect(bs.toHex().length).toBe(16);
  });

  it('full BitSet(32) toHex is "ffffffff"', () => {
    const bs = new BitSet(32);
    bs.setAll();
    expect(bs.toHex()).toBe('ffffffff');
  });

  it('toHex for empty size=0 is empty string', () => {
    expect(new BitSet(0).toHex()).toBe('');
  });
});

describe('BitSet clone()', () => {
  for (let i = 0; i < 16; i++) {
    it(`clone preserves bit ${i}`, () => {
      const bs = new BitSet(32);
      bs.set(i);
      const c = bs.clone();
      expect(c.get(i)).toBe(true);
    });
  }

  it('modifying clone does not affect original', () => {
    const bs = new BitSet(32);
    bs.setAll();
    const c = bs.clone();
    c.clearAll();
    expect(bs.isFull()).toBe(true);
    expect(c.isEmpty()).toBe(true);
  });

  it('clone size equals original size', () => {
    const bs = new BitSet(77);
    expect(bs.clone().size).toBe(77);
  });

  it('clone byteLength equals original byteLength', () => {
    const bs = new BitSet(128);
    expect(bs.clone().byteLength).toBe(bs.byteLength);
  });
});

// ─── setBit / clearBit / flipBit / getBit ────────────────────────────────────
describe('setBit()', () => {
  for (let i = 0; i < 32; i++) {
    it(`setBit(0, ${i}) returns value with bit ${i} set`, () => {
      const result = setBit(0, i);
      expect(getBit(result, i)).toBe(true);
    });
  }
});

describe('clearBit()', () => {
  for (let i = 0; i < 32; i++) {
    it(`clearBit with all bits set clears bit ${i}`, () => {
      const all = 0xffffffff;
      const result = clearBit(all, i);
      expect(getBit(result, i)).toBe(false);
    });
  }
});

describe('flipBit()', () => {
  for (let i = 0; i < 16; i++) {
    it(`flipBit on 0 at position ${i} sets the bit`, () => {
      expect(getBit(flipBit(0, i), i)).toBe(true);
    });
  }

  for (let i = 0; i < 16; i++) {
    it(`double flipBit at position ${i} is identity`, () => {
      const n = 0b10101010;
      expect(flipBit(flipBit(n, i), i)).toBe(n >>> 0);
    });
  }
});

describe('getBit()', () => {
  for (let i = 0; i < 32; i++) {
    it(`getBit(0, ${i}) is false`, () => {
      expect(getBit(0, i)).toBe(false);
    });
  }
});

// ─── popCount ─────────────────────────────────────────────────────────────────
describe('popCount()', () => {
  it('popCount(0) = 0', () => expect(popCount(0)).toBe(0));
  it('popCount(1) = 1', () => expect(popCount(1)).toBe(1));
  it('popCount(2) = 1', () => expect(popCount(2)).toBe(1));
  it('popCount(3) = 2', () => expect(popCount(3)).toBe(2));

  for (let i = 0; i < 32; i++) {
    it(`popCount(1 << ${i}) = 1`, () => {
      expect(popCount(1 << i)).toBe(1);
    });
  }

  it('popCount(0xffffffff) = 32', () => expect(popCount(0xffffffff)).toBe(32));
  it('popCount(0x0f0f0f0f) = 16', () => expect(popCount(0x0f0f0f0f)).toBe(16));
  it('popCount(0xf0f0f0f0) = 16', () => expect(popCount(0xf0f0f0f0 >>> 0)).toBe(16));
  it('popCount(0x55555555) = 16', () => expect(popCount(0x55555555)).toBe(16));
  it('popCount(0xaaaaaaaa) = 16', () => expect(popCount(0xaaaaaaaa >>> 0)).toBe(16));
  it('popCount(0x80000000) = 1', () => expect(popCount(0x80000000 >>> 0)).toBe(1));
  it('popCount(0x7fffffff) = 31', () => expect(popCount(0x7fffffff)).toBe(31));
});

describe('popCount32Array()', () => {
  it('empty array popcount is 0', () => {
    expect(popCount32Array(new Uint32Array(0))).toBe(0);
  });

  it('all-zero array popcount is 0', () => {
    expect(popCount32Array(new Uint32Array(4))).toBe(0);
  });

  it('single word all ones = 32', () => {
    const arr = new Uint32Array([0xffffffff]);
    expect(popCount32Array(arr)).toBe(32);
  });

  it('two words with 16 bits each = 32', () => {
    const arr = new Uint32Array([0x0f0f0f0f, 0x0f0f0f0f]);
    expect(popCount32Array(arr)).toBe(32);
  });
});

// ─── trailingZeros ────────────────────────────────────────────────────────────
describe('trailingZeros()', () => {
  it('trailingZeros(0) = 32', () => expect(trailingZeros(0)).toBe(32));
  it('trailingZeros(1) = 0', () => expect(trailingZeros(1)).toBe(0));
  it('trailingZeros(2) = 1', () => expect(trailingZeros(2)).toBe(1));
  it('trailingZeros(4) = 2', () => expect(trailingZeros(4)).toBe(2));
  it('trailingZeros(8) = 3', () => expect(trailingZeros(8)).toBe(3));
  it('trailingZeros(0x80000000) = 31', () => expect(trailingZeros(0x80000000 >>> 0)).toBe(31));

  for (let i = 0; i < 32; i++) {
    it(`trailingZeros(1 << ${i}) = ${i}`, () => {
      expect(trailingZeros((1 << i) >>> 0)).toBe(i);
    });
  }

  it('trailingZeros(0b110) = 1', () => expect(trailingZeros(0b110)).toBe(1));
  it('trailingZeros(0b1000) = 3', () => expect(trailingZeros(0b1000)).toBe(3));
  it('trailingZeros(3) = 0', () => expect(trailingZeros(3)).toBe(0));
});

// ─── leadingZeros ─────────────────────────────────────────────────────────────
describe('leadingZeros()', () => {
  it('leadingZeros(0) = 32', () => expect(leadingZeros(0)).toBe(32));
  it('leadingZeros(1) = 31', () => expect(leadingZeros(1)).toBe(31));
  it('leadingZeros(2) = 30', () => expect(leadingZeros(2)).toBe(30));
  it('leadingZeros(0x80000000) = 0', () => expect(leadingZeros(0x80000000 >>> 0)).toBe(0));
  it('leadingZeros(0xffffffff) = 0', () => expect(leadingZeros(0xffffffff >>> 0)).toBe(0));
  it('leadingZeros(0x40000000) = 1', () => expect(leadingZeros(0x40000000)).toBe(1));
  it('leadingZeros(0x7fffffff) = 1', () => expect(leadingZeros(0x7fffffff)).toBe(1));
  it('leadingZeros(0x0fffffff) = 4', () => expect(leadingZeros(0x0fffffff)).toBe(4));

  for (let i = 0; i < 32; i++) {
    it(`leadingZeros(1 << ${i}) = ${31 - i}`, () => {
      expect(leadingZeros((1 << i) >>> 0)).toBe(31 - i);
    });
  }
});

// ─── isPowerOfTwo ─────────────────────────────────────────────────────────────
describe('isPowerOfTwo()', () => {
  const powers = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768,
    65536, 131072, 262144, 524288, 1048576, 2097152, 4194304, 8388608, 16777216,
    33554432, 67108864, 134217728, 268435456, 536870912, 1073741824];

  for (const p of powers) {
    it(`isPowerOfTwo(${p}) is true`, () => {
      expect(isPowerOfTwo(p)).toBe(true);
    });
  }

  const nonPowers = [0, 3, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 17, 100, 1000, -1, -2];
  for (const n of nonPowers) {
    it(`isPowerOfTwo(${n}) is false`, () => {
      expect(isPowerOfTwo(n)).toBe(false);
    });
  }
});

// ─── nextPowerOfTwo ───────────────────────────────────────────────────────────
describe('nextPowerOfTwo()', () => {
  it('nextPowerOfTwo(0) = 1', () => expect(nextPowerOfTwo(0)).toBe(1));
  it('nextPowerOfTwo(1) = 1', () => expect(nextPowerOfTwo(1)).toBe(1));
  it('nextPowerOfTwo(2) = 2', () => expect(nextPowerOfTwo(2)).toBe(2));
  it('nextPowerOfTwo(3) = 4', () => expect(nextPowerOfTwo(3)).toBe(4));
  it('nextPowerOfTwo(4) = 4', () => expect(nextPowerOfTwo(4)).toBe(4));
  it('nextPowerOfTwo(5) = 8', () => expect(nextPowerOfTwo(5)).toBe(8));
  it('nextPowerOfTwo(7) = 8', () => expect(nextPowerOfTwo(7)).toBe(8));
  it('nextPowerOfTwo(8) = 8', () => expect(nextPowerOfTwo(8)).toBe(8));
  it('nextPowerOfTwo(9) = 16', () => expect(nextPowerOfTwo(9)).toBe(16));
  it('nextPowerOfTwo(16) = 16', () => expect(nextPowerOfTwo(16)).toBe(16));
  it('nextPowerOfTwo(17) = 32', () => expect(nextPowerOfTwo(17)).toBe(32));
  it('nextPowerOfTwo(100) = 128', () => expect(nextPowerOfTwo(100)).toBe(128));
  it('nextPowerOfTwo(1000) = 1024', () => expect(nextPowerOfTwo(1000)).toBe(1024));
  it('nextPowerOfTwo(1024) = 1024', () => expect(nextPowerOfTwo(1024)).toBe(1024));
  it('nextPowerOfTwo(1025) = 2048', () => expect(nextPowerOfTwo(1025)).toBe(2048));

  for (let i = 0; i < 16; i++) {
    const p = 1 << i;
    it(`nextPowerOfTwo(${p}) = ${p}`, () => expect(nextPowerOfTwo(p)).toBe(p));
  }

  for (let i = 2; i < 16; i++) {
    const p = 1 << i;
    it(`nextPowerOfTwo(${p - 1}) = ${p}`, () => expect(nextPowerOfTwo(p - 1)).toBe(p));
  }
});

// ─── lowestSetBit ─────────────────────────────────────────────────────────────
describe('lowestSetBit()', () => {
  it('lowestSetBit(0) = 0', () => expect(lowestSetBit(0)).toBe(0));
  it('lowestSetBit(1) = 1', () => expect(lowestSetBit(1)).toBe(1));
  it('lowestSetBit(2) = 2', () => expect(lowestSetBit(2)).toBe(2));
  it('lowestSetBit(3) = 1', () => expect(lowestSetBit(3)).toBe(1));
  it('lowestSetBit(4) = 4', () => expect(lowestSetBit(4)).toBe(4));
  it('lowestSetBit(6) = 2', () => expect(lowestSetBit(6)).toBe(2));
  it('lowestSetBit(8) = 8', () => expect(lowestSetBit(8)).toBe(8));
  it('lowestSetBit(12) = 4', () => expect(lowestSetBit(12)).toBe(4));
  it('lowestSetBit(0xff) = 1', () => expect(lowestSetBit(0xff)).toBe(1));
  it('lowestSetBit(0x100) = 256', () => expect(lowestSetBit(0x100)).toBe(256));

  for (let i = 0; i < 16; i++) {
    const p = 1 << i;
    it(`lowestSetBit(${p}) = ${p}`, () => expect(lowestSetBit(p)).toBe(p));
  }
});

// ─── fromIndices ──────────────────────────────────────────────────────────────
describe('fromIndices()', () => {
  it('fromIndices([], 32) is empty', () => {
    expect(fromIndices([], 32).isEmpty()).toBe(true);
  });

  for (let i = 0; i < 32; i++) {
    it(`fromIndices([${i}], 64) sets bit ${i}`, () => {
      const bs = fromIndices([i], 64);
      expect(bs.get(i)).toBe(true);
      expect(bs.count()).toBe(1);
    });
  }

  it('fromIndices sets multiple bits correctly', () => {
    const bs = fromIndices([0, 5, 10, 31], 64);
    expect(bs.get(0)).toBe(true);
    expect(bs.get(5)).toBe(true);
    expect(bs.get(10)).toBe(true);
    expect(bs.get(31)).toBe(true);
    expect(bs.count()).toBe(4);
  });

  it('fromIndices size is preserved', () => {
    expect(fromIndices([1, 2], 100).size).toBe(100);
  });
});

// ─── fromString ───────────────────────────────────────────────────────────────
describe('fromString()', () => {
  it('fromString("") creates size-0 BitSet', () => {
    expect(fromString('').size).toBe(0);
  });

  it('fromString("0") creates 1-bit empty set', () => {
    expect(fromString('0').isEmpty()).toBe(true);
  });

  it('fromString("1") creates 1-bit full set', () => {
    expect(fromString('1').isFull()).toBe(true);
  });

  it('fromString("10000000") sets only bit 0', () => {
    const bs = fromString('10000000');
    expect(bs.get(0)).toBe(true);
    expect(bs.count()).toBe(1);
  });

  it('fromString("11111111") creates full 8-bit set', () => {
    expect(fromString('11111111').count()).toBe(8);
  });

  it('fromString("01010101") sets even-index bits', () => {
    const bs = fromString('01010101');
    expect(bs.get(1)).toBe(true);
    expect(bs.get(3)).toBe(true);
    expect(bs.get(5)).toBe(true);
    expect(bs.get(7)).toBe(true);
    expect(bs.count()).toBe(4);
  });

  it('fromString is inverse of toString', () => {
    const bs = new BitSet(16);
    bs.set(0); bs.set(3); bs.set(7); bs.set(15);
    expect(fromString(bs.toString()).equals(bs)).toBe(true);
  });

  for (let i = 0; i < 8; i++) {
    it(`fromString sets bit ${i} when string has '1' at position ${i}`, () => {
      const chars = Array(8).fill('0');
      chars[i] = '1';
      const bs = fromString(chars.join(''));
      expect(bs.get(i)).toBe(true);
    });
  }
});

// ─── fromNumber ───────────────────────────────────────────────────────────────
describe('fromNumber()', () => {
  it('fromNumber(0) is empty', () => {
    expect(fromNumber(0, 32).isEmpty()).toBe(true);
  });

  it('fromNumber(1) has bit 0 set', () => {
    expect(fromNumber(1, 32).get(0)).toBe(true);
  });

  it('fromNumber(2) has bit 1 set', () => {
    const bs = fromNumber(2, 32);
    expect(bs.get(0)).toBe(false);
    expect(bs.get(1)).toBe(true);
  });

  it('fromNumber(0xffffffff) has all 32 bits set', () => {
    expect(fromNumber(0xffffffff >>> 0, 32).count()).toBe(32);
  });

  it('fromNumber default size is 32', () => {
    expect(fromNumber(0).size).toBe(32);
  });

  for (let i = 0; i < 16; i++) {
    it(`fromNumber(1 << ${i}) has only bit ${i} set`, () => {
      const bs = fromNumber((1 << i) >>> 0, 32);
      expect(bs.get(i)).toBe(true);
      expect(bs.count()).toBe(1);
    });
  }

  it('fromNumber with custom size preserves size', () => {
    expect(fromNumber(0xff, 8).size).toBe(8);
  });

  it('fromNumber does not set bits beyond size', () => {
    const bs = fromNumber(0xffff, 8);
    expect(bs.count()).toBe(8);
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────
describe('Edge cases', () => {
  it('BitSet of size 0 has count 0', () => {
    expect(new BitSet(0).count()).toBe(0);
  });

  it('BitSet of size 0 is empty', () => {
    expect(new BitSet(0).isEmpty()).toBe(true);
  });

  it('BitSet of size 0 isFull', () => {
    // 0 bits set === 0 size
    expect(new BitSet(0).isFull()).toBe(true);
  });

  it('BitSet of size 0 toString is empty string', () => {
    expect(new BitSet(0).toString()).toBe('');
  });

  it('BitSet of size 1 set/get works', () => {
    const bs = new BitSet(1);
    bs.set(0);
    expect(bs.get(0)).toBe(true);
    expect(bs.count()).toBe(1);
  });

  it('BitSet of size 1 clear works', () => {
    const bs = new BitSet(1);
    bs.set(0);
    bs.clear(0);
    expect(bs.get(0)).toBe(false);
  });

  it('BitSet throws on negative size', () => {
    expect(() => new BitSet(-1)).toThrow(RangeError);
  });

  it('get throws on out-of-range index', () => {
    const bs = new BitSet(8);
    expect(() => bs.get(8)).toThrow(RangeError);
    expect(() => bs.get(-1)).toThrow(RangeError);
  });

  it('set throws on out-of-range index', () => {
    const bs = new BitSet(8);
    expect(() => bs.set(8)).toThrow(RangeError);
  });

  it('clear throws on out-of-range index', () => {
    const bs = new BitSet(8);
    expect(() => bs.clear(8)).toThrow(RangeError);
  });

  it('flip throws on out-of-range index', () => {
    const bs = new BitSet(8);
    expect(() => bs.flip(8)).toThrow(RangeError);
  });

  it('setRange throws on invalid range', () => {
    const bs = new BitSet(8);
    expect(() => bs.setRange(5, 2)).toThrow(RangeError);
  });

  it('clearRange throws on invalid range', () => {
    const bs = new BitSet(8);
    expect(() => bs.clearRange(-1, 5)).toThrow(RangeError);
  });

  it('BitSet of size 1 not() of empty is full', () => {
    const bs = new BitSet(1);
    expect(bs.not().isFull()).toBe(true);
  });

  it('BitSet size 32 exactly fits one word', () => {
    const bs = new BitSet(32);
    bs.setAll();
    expect(bs.count()).toBe(32);
  });

  it('BitSet size 33 uses two words, count is 33 after setAll', () => {
    const bs = new BitSet(33);
    bs.setAll();
    expect(bs.count()).toBe(33);
  });

  it('BitSet size 64 exactly fits two words', () => {
    const bs = new BitSet(64);
    bs.setAll();
    expect(bs.count()).toBe(64);
  });

  it('BitSet size 65 uses three words, count is 65 after setAll', () => {
    const bs = new BitSet(65);
    bs.setAll();
    expect(bs.count()).toBe(65);
  });

  it('large BitSet: size 1024 setAll count is 1024', () => {
    const bs = new BitSet(1024);
    bs.setAll();
    expect(bs.count()).toBe(1024);
  });

  it('large BitSet: size 1000 toArray has 1000 elements', () => {
    const bs = new BitSet(1000);
    bs.setAll();
    expect(bs.toArray().length).toBe(1000);
  });

  it('byteLength is 4 * number of 32-bit words', () => {
    const bs = new BitSet(64);
    expect(bs.byteLength).toBe(8);
  });

  it('byteLength for size 0 is 0', () => {
    expect(new BitSet(0).byteLength).toBe(0);
  });

  it('and() returns new BitSet, not same reference', () => {
    const a = new BitSet(32);
    const b = new BitSet(32);
    const c = a.and(b);
    expect(c).not.toBe(a);
    expect(c).not.toBe(b);
  });

  it('or() returns new BitSet, not same reference', () => {
    const a = new BitSet(32);
    const b = new BitSet(32);
    const c = a.or(b);
    expect(c).not.toBe(a);
  });

  it('firstSet returns undefined for size=0 BitSet', () => {
    expect(new BitSet(0).firstSet()).toBeUndefined();
  });

  it('nextSet(0) returns undefined on empty set', () => {
    expect(new BitSet(32).nextSet(0)).toBeUndefined();
  });

  it('BitSet size property is readable', () => {
    const bs = new BitSet(42);
    expect(bs.size).toBe(42);
  });

  it('setAll then clearAll results in empty', () => {
    const bs = new BitSet(256);
    bs.setAll();
    bs.clearAll();
    expect(bs.isEmpty()).toBe(true);
  });

  it('xor of full and empty returns full', () => {
    const full = new BitSet(32);
    full.setAll();
    const empty = new BitSet(32);
    expect(full.xor(empty).count()).toBe(32);
  });

  it('or of empty and full returns full', () => {
    const full = new BitSet(32);
    full.setAll();
    const empty = new BitSet(32);
    expect(empty.or(full).count()).toBe(32);
  });

  it('intersects() is symmetric', () => {
    const a = new BitSet(64);
    const b = new BitSet(64);
    a.set(5); b.set(5);
    expect(a.intersects(b)).toBe(b.intersects(a));
  });

  it('equals() is symmetric', () => {
    const a = new BitSet(32);
    const b = new BitSet(32);
    a.set(3); b.set(3);
    expect(a.equals(b)).toBe(b.equals(a));
  });

  it('isSubsetOf empty is reflexive for empty sets', () => {
    const a = new BitSet(32);
    const b = new BitSet(32);
    expect(a.isSubsetOf(b)).toBe(true);
    expect(b.isSubsetOf(a)).toBe(true);
  });

  it('toHex of BitSet(1) is "00000000" (padded to word)', () => {
    expect(new BitSet(1).toHex()).toBe('00000000');
  });

  it('popCount of alternating bits 0x55555555 is 16', () => {
    expect(popCount(0x55555555)).toBe(16);
  });
});

// ─── Additional arithmetic helper tests ───────────────────────────────────────
describe('Additional setBit/clearBit interaction', () => {
  for (let i = 0; i < 16; i++) {
    it(`setBit then clearBit at ${i} restores original`, () => {
      const orig = 0;
      expect(clearBit(setBit(orig, i), i)).toBe(orig >>> 0);
    });
  }

  for (let i = 0; i < 16; i++) {
    it(`setBit is idempotent at position ${i}`, () => {
      const n = setBit(0, i);
      expect(setBit(n, i)).toBe(n);
    });
  }
});

describe('Additional popCount tests', () => {
  const pairs: [number, number][] = [
    [0b00000000, 0],
    [0b00000001, 1],
    [0b00000011, 2],
    [0b00000111, 3],
    [0b00001111, 4],
    [0b00011111, 5],
    [0b00111111, 6],
    [0b01111111, 7],
    [0b11111111, 8],
    [0b10101010, 4],
    [0b01010101, 4],
    [0b11001100, 4],
    [0b00110011, 4],
    [0b11110000, 4],
    [0b00001111, 4],
  ];
  for (const [n, expected] of pairs) {
    it(`popCount(0b${n.toString(2).padStart(8, '0')}) = ${expected}`, () => {
      expect(popCount(n)).toBe(expected);
    });
  }
});

describe('BitSet cross-word boundary operations', () => {
  it('set bit 31 (last bit of word 0) works correctly', () => {
    const bs = new BitSet(64);
    bs.set(31);
    expect(bs.get(31)).toBe(true);
    expect(bs.get(32)).toBe(false);
  });

  it('set bit 32 (first bit of word 1) works correctly', () => {
    const bs = new BitSet(64);
    bs.set(32);
    expect(bs.get(31)).toBe(false);
    expect(bs.get(32)).toBe(true);
  });

  it('setRange spanning word boundary works', () => {
    const bs = new BitSet(64);
    bs.setRange(30, 34);
    for (let i = 30; i <= 34; i++) expect(bs.get(i)).toBe(true);
    expect(bs.get(29)).toBe(false);
    expect(bs.get(35)).toBe(false);
  });

  it('count across two words', () => {
    const bs = new BitSet(64);
    bs.set(0); bs.set(31); bs.set(32); bs.set(63);
    expect(bs.count()).toBe(4);
  });

  it('firstSet across word boundary', () => {
    const bs = new BitSet(64);
    bs.set(40);
    expect(bs.firstSet()).toBe(40);
  });

  it('nextSet crossing word boundary', () => {
    const bs = new BitSet(64);
    bs.set(31); bs.set(32);
    expect(bs.nextSet(32)).toBe(32);
  });

  it('not() across multiple words preserves size', () => {
    const bs = new BitSet(96);
    const negated = bs.not();
    expect(negated.count()).toBe(96);
  });

  it('and() across 3 words works', () => {
    const a = new BitSet(96);
    const b = new BitSet(96);
    a.setAll(); b.setAll();
    expect(a.and(b).count()).toBe(96);
  });
});

describe('BitSet size and byteLength variants', () => {
  const sizes = [1, 7, 8, 15, 16, 31, 32, 33, 63, 64, 65, 100, 128, 200, 256, 512, 1000];
  for (const size of sizes) {
    it(`BitSet(${size}) has correct size property`, () => {
      expect(new BitSet(size).size).toBe(size);
    });
  }

  for (const size of sizes) {
    it(`BitSet(${size}) setAll count equals size`, () => {
      const bs = new BitSet(size);
      bs.setAll();
      expect(bs.count()).toBe(size);
    });
  }
});

describe('fromNumber extra tests', () => {
  it('fromNumber(5) has bits 0 and 2 set', () => {
    const bs = fromNumber(5, 8);
    expect(bs.get(0)).toBe(true);
    expect(bs.get(1)).toBe(false);
    expect(bs.get(2)).toBe(true);
  });

  it('fromNumber(7) has bits 0,1,2 set', () => {
    const bs = fromNumber(7, 8);
    expect(bs.get(0)).toBe(true);
    expect(bs.get(1)).toBe(true);
    expect(bs.get(2)).toBe(true);
    expect(bs.get(3)).toBe(false);
  });

  it('fromNumber(0xf0, 8) has bits 4,5,6,7 set', () => {
    const bs = fromNumber(0xf0, 8);
    expect(bs.get(4)).toBe(true);
    expect(bs.get(5)).toBe(true);
    expect(bs.get(6)).toBe(true);
    expect(bs.get(7)).toBe(true);
    expect(bs.get(0)).toBe(false);
    expect(bs.count()).toBe(4);
  });
});

describe('BitSet andInPlace reduces count correctly', () => {
  it('full AND empty becomes empty', () => {
    const a = new BitSet(32);
    a.setAll();
    const b = new BitSet(32);
    a.andInPlace(b);
    expect(a.isEmpty()).toBe(true);
  });

  it('partial AND partial', () => {
    const a = new BitSet(32);
    const b = new BitSet(32);
    a.set(0); a.set(1); a.set(2);
    b.set(1); b.set(2); b.set(3);
    a.andInPlace(b);
    expect(a.get(0)).toBe(false);
    expect(a.get(1)).toBe(true);
    expect(a.get(2)).toBe(true);
    expect(a.get(3)).toBe(false);
    expect(a.count()).toBe(2);
  });
});

describe('BitSet orInPlace increases count correctly', () => {
  it('empty OR full becomes full', () => {
    const a = new BitSet(32);
    const b = new BitSet(32);
    b.setAll();
    a.orInPlace(b);
    expect(a.isFull()).toBe(true);
  });
});

describe('BitSet xorInPlace is self-inverse', () => {
  it('a XOR b XOR b = a', () => {
    const a = new BitSet(32);
    const b = new BitSet(32);
    a.set(5); a.set(10); a.set(20);
    b.set(3); b.set(10); b.set(25);
    const original = a.clone();
    a.xorInPlace(b);
    a.xorInPlace(b);
    expect(a.equals(original)).toBe(true);
  });
});

describe('BitSet toArray consistency', () => {
  it('toArray of all-bits-set set has elements in ascending order', () => {
    const bs = new BitSet(32);
    bs.setAll();
    const arr = bs.toArray();
    for (let i = 0; i < arr.length - 1; i++) {
      expect(arr[i]).toBeLessThan(arr[i + 1]);
    }
  });

  it('toArray count matches count()', () => {
    const bs = new BitSet(64);
    bs.set(3); bs.set(10); bs.set(33); bs.set(63);
    expect(bs.toArray().length).toBe(bs.count());
  });
});

describe('BitSet subset/superset transitivity', () => {
  it('A⊆B and B⊆C implies A⊆C', () => {
    const a = new BitSet(32);
    const b = new BitSet(32);
    const c = new BitSet(32);
    a.set(0);
    b.set(0); b.set(1);
    c.setAll();
    expect(a.isSubsetOf(b)).toBe(true);
    expect(b.isSubsetOf(c)).toBe(true);
    expect(a.isSubsetOf(c)).toBe(true);
  });
});

describe('trailingZeros extra cases', () => {
  it('trailingZeros(0b10) = 1', () => expect(trailingZeros(0b10)).toBe(1));
  it('trailingZeros(0b100) = 2', () => expect(trailingZeros(0b100)).toBe(2));
  it('trailingZeros(0b1000) = 3', () => expect(trailingZeros(0b1000)).toBe(3));
  it('trailingZeros(0b1010) = 1', () => expect(trailingZeros(0b1010)).toBe(1));
  it('trailingZeros(0b1100) = 2', () => expect(trailingZeros(0b1100)).toBe(2));
});

describe('leadingZeros extra cases', () => {
  it('leadingZeros(0x1) = 31', () => expect(leadingZeros(0x1)).toBe(31));
  it('leadingZeros(0x3) = 30', () => expect(leadingZeros(0x3)).toBe(30));
  it('leadingZeros(0x7) = 29', () => expect(leadingZeros(0x7)).toBe(29));
  it('leadingZeros(0xf) = 28', () => expect(leadingZeros(0xf)).toBe(28));
  it('leadingZeros(0xff) = 24', () => expect(leadingZeros(0xff)).toBe(24));
});

describe('lowestSetBit extra cases', () => {
  it('lowestSetBit(0b1010) = 2', () => expect(lowestSetBit(0b1010)).toBe(2));
  it('lowestSetBit(0b1100) = 4', () => expect(lowestSetBit(0b1100)).toBe(4));
  it('lowestSetBit(0b1000) = 8', () => expect(lowestSetBit(0b1000)).toBe(8));
  it('lowestSetBit(0b10000) = 16', () => expect(lowestSetBit(0b10000)).toBe(16));
  it('lowestSetBit(0b11111) = 1', () => expect(lowestSetBit(0b11111)).toBe(1));
});

describe('BitSet population on random-like patterns', () => {
  it('count() equals sum of individual get() calls', () => {
    const bs = new BitSet(128);
    const setBits = [0, 5, 11, 31, 32, 63, 64, 95, 100, 127];
    for (const b of setBits) bs.set(b);
    let manual = 0;
    for (let i = 0; i < 128; i++) if (bs.get(i)) manual++;
    expect(bs.count()).toBe(manual);
  });

  it('toArray length equals count()', () => {
    const bs = new BitSet(64);
    const setBits = [1, 7, 14, 22, 30, 38, 46, 54, 62];
    for (const b of setBits) bs.set(b);
    expect(bs.toArray().length).toBe(bs.count());
    expect(bs.toArray().length).toBe(setBits.length);
  });

  it('fromString(toString()) round-trip is identity', () => {
    const bs = new BitSet(32);
    bs.set(0); bs.set(7); bs.set(15); bs.set(23); bs.set(31);
    expect(fromString(bs.toString()).equals(bs)).toBe(true);
  });
});

describe('BitSet intersects vs subset relationship', () => {
  it('if A is subset of B and A is non-empty, they intersect', () => {
    const a = new BitSet(32);
    const b = new BitSet(32);
    a.set(5);
    b.set(5); b.set(10);
    expect(a.isSubsetOf(b)).toBe(true);
    expect(a.intersects(b)).toBe(true);
  });

  it('disjoint sets do not intersect and are not subsets of each other', () => {
    const a = new BitSet(64);
    const b = new BitSet(64);
    for (let i = 0; i < 32; i++) a.set(i);
    for (let i = 32; i < 64; i++) b.set(i);
    expect(a.intersects(b)).toBe(false);
    expect(a.isSubsetOf(b)).toBe(false);
    expect(b.isSubsetOf(a)).toBe(false);
  });
});
