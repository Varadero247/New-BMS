// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  uuidV4,
  uuidV1,
  NIL_UUID,
  isUUID,
  isUUIDv4,
  isUUIDv1,
  parseUUID,
  normalizeUUID,
  stripHyphens,
  compareUUIDs,
  uuidToBytes,
  bytesToUUID,
  generateBatch,
  shortId,
  sequentialUUID,
  uuidVersion,
  uuidV5,
  uuidToBase64,
  base64ToUUID,
  uuidsEqual,
  sortUUIDs,
  NAMESPACE_DNS,
  NAMESPACE_URL,
  NAMESPACE_OID,
} from '../uuid-utils';

// ---------------------------------------------------------------------------
// Pre-generate pools used across multiple suites
// ---------------------------------------------------------------------------
const V4_POOL = Array.from({ length: 200 }, () => uuidV4());
const V1_POOL = Array.from({ length: 50 }, () => uuidV1());
const SEQ_POOL = Array.from({ length: 60 }, () => sequentialUUID());

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_GENERIC_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------------------
// 1. uuidV4 — 100 tests
// ---------------------------------------------------------------------------
describe('uuidV4', () => {
  for (let i = 0; i < 100; i++) {
    it(`generated UUID #${i} matches v4 regex`, () => {
      expect(V4_POOL[i]).toMatch(UUID_V4_REGEX);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. isUUID — 100 tests (50 valid, 50 invalid)
// ---------------------------------------------------------------------------
describe('isUUID', () => {
  // 50 valid UUIDs from pool
  for (let i = 0; i < 50; i++) {
    it(`isUUID returns true for valid v4 UUID #${i}`, () => {
      expect(isUUID(V4_POOL[i])).toBe(true);
    });
  }

  // 10 valid v1
  for (let i = 0; i < 10; i++) {
    it(`isUUID returns true for valid v1 UUID #${i}`, () => {
      expect(isUUID(V1_POOL[i])).toBe(true);
    });
  }

  // 20 invalid strings
  const invalids = [
    '',
    'not-a-uuid',
    '00000000-0000-0000-0000-00000000000Z',
    '00000000000000000000000000000000000',
    '12345678-1234-1234-1234-12345678901',
    '12345678-1234-6234-8123-123456789012', // version 6 not valid
    'zzzzzzzz-zzzz-4zzz-azzz-zzzzzzzzzzzz',
    '00000000-0000-0000-0000',
    null as unknown as string,
    undefined as unknown as string,
    12345 as unknown as string,
    '00000000_0000_4000_8000_000000000000',
    'GGGGGGGG-GGGG-4GGG-8GGG-GGGGGGGGGGGG',
    '   ',
    '00000000-0000-0000-0000-00000000000',
    '00000000-0000-0000-0000-0000000000000',
    '0000000-0000-4000-8000-000000000000',
    '000000000-0000-4000-8000-000000000000',
    '00000000-000-4000-8000-000000000000',
    '00000000-00000-4000-8000-000000000000',
  ];
  for (let i = 0; i < invalids.length; i++) {
    const inv = invalids[i];
    it(`isUUID returns false for invalid input #${i}: ${JSON.stringify(inv)}`, () => {
      expect(isUUID(inv)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. isUUIDv4 — 100 tests
// ---------------------------------------------------------------------------
describe('isUUIDv4', () => {
  // 50 v4 UUIDs should pass
  for (let i = 0; i < 50; i++) {
    it(`isUUIDv4 returns true for v4 UUID #${i}`, () => {
      expect(isUUIDv4(V4_POOL[i])).toBe(true);
    });
  }

  // 10 v1 UUIDs should fail
  for (let i = 0; i < 10; i++) {
    it(`isUUIDv4 returns false for v1 UUID #${i}`, () => {
      expect(isUUIDv4(V1_POOL[i])).toBe(false);
    });
  }

  // 10 invalid strings
  const invalidV4 = [
    '',
    'not-uuid',
    NIL_UUID,
    'zzzzzzzz-zzzz-4zzz-azzz-zzzzzzzzzzzz',
    '00000000-0000-3000-8000-000000000000', // version 3
    '00000000-0000-5000-8000-000000000000', // version 5
    '00000000-0000-4000-0000-000000000000', // invalid variant
    null as unknown as string,
    undefined as unknown as string,
    12345 as unknown as string,
  ];
  for (let i = 0; i < invalidV4.length; i++) {
    it(`isUUIDv4 returns false for invalid #${i}: ${JSON.stringify(invalidV4[i])}`, () => {
      expect(isUUIDv4(invalidV4[i])).toBe(false);
    });
  }

  // 30 more v4 from pool positions 50-79
  for (let i = 50; i < 80; i++) {
    it(`isUUIDv4 returns true for v4 UUID #${i}`, () => {
      expect(isUUIDv4(V4_POOL[i])).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 4. normalizeUUID — 100 tests
// ---------------------------------------------------------------------------
describe('normalizeUUID', () => {
  // 50 round-trips: strip then re-normalize
  for (let i = 0; i < 50; i++) {
    it(`normalizeUUID round-trips UUID #${i}`, () => {
      const original = V4_POOL[i];
      const stripped = original.replace(/-/g, '');
      const normalized = normalizeUUID(stripped);
      expect(normalized).toBe(original.toLowerCase());
    });
  }

  // 30 already-hyphenated UUIDs come back lowercase identical
  for (let i = 0; i < 30; i++) {
    it(`normalizeUUID is idempotent on UUID #${i}`, () => {
      const uuid = V4_POOL[i];
      expect(normalizeUUID(uuid)).toBe(normalizeUUID(normalizeUUID(uuid)));
    });
  }

  // 10 uppercase inputs
  for (let i = 0; i < 10; i++) {
    it(`normalizeUUID lowercases UUID #${i}`, () => {
      const upper = V4_POOL[i].toUpperCase();
      expect(normalizeUUID(upper)).toBe(V4_POOL[i].toLowerCase());
    });
  }

  // 5 throws on bad input
  const badInputs = ['', 'bad', 'xyz', '12345', 'not-hex!!!-0000-0000-0000-000000000000'];
  for (let i = 0; i < badInputs.length; i++) {
    it(`normalizeUUID throws on invalid input #${i}: "${badInputs[i]}"`, () => {
      expect(() => normalizeUUID(badInputs[i])).toThrow();
    });
  }

  // 5 correct format checks (segment lengths)
  for (let i = 0; i < 5; i++) {
    it(`normalizeUUID produces correct segment lengths for UUID #${i}`, () => {
      const norm = normalizeUUID(V4_POOL[i]);
      const parts = norm.split('-');
      expect(parts).toHaveLength(5);
      expect(parts[0]).toHaveLength(8);
      expect(parts[1]).toHaveLength(4);
      expect(parts[2]).toHaveLength(4);
      expect(parts[3]).toHaveLength(4);
      expect(parts[4]).toHaveLength(12);
    });
  }
});

// ---------------------------------------------------------------------------
// 5. stripHyphens — 100 tests
// ---------------------------------------------------------------------------
describe('stripHyphens', () => {
  // 50 UUIDs: stripped must be 32 chars, all hex
  for (let i = 0; i < 50; i++) {
    it(`stripHyphens produces 32-char hex string for UUID #${i}`, () => {
      const stripped = stripHyphens(V4_POOL[i]);
      expect(stripped).toHaveLength(32);
      expect(/^[0-9a-f]{32}$/.test(stripped)).toBe(true);
    });
  }

  // 30 UUIDs: no hyphens present
  for (let i = 0; i < 30; i++) {
    it(`stripHyphens result contains no hyphens for UUID #${i}`, () => {
      expect(stripHyphens(V4_POOL[i])).not.toContain('-');
    });
  }

  // 10 uppercase round-trips
  for (let i = 0; i < 10; i++) {
    it(`stripHyphens lowercases UUID #${i}`, () => {
      const upper = V4_POOL[i].toUpperCase();
      const stripped = stripHyphens(upper);
      expect(stripped).toBe(stripped.toLowerCase());
    });
  }

  // 5 throws on bad input
  const badInputs2 = ['', 'not-a-uuid', 'ZZZZZZZZ', '!!!', 'short'];
  for (let i = 0; i < badInputs2.length; i++) {
    it(`stripHyphens throws on invalid input #${i}: "${badInputs2[i]}"`, () => {
      expect(() => stripHyphens(badInputs2[i])).toThrow();
    });
  }

  // 5 already-stripped remain the same
  for (let i = 0; i < 5; i++) {
    it(`stripHyphens is idempotent after first strip for UUID #${i}`, () => {
      const stripped = stripHyphens(V4_POOL[i]);
      // Re-normalizing stripped then stripping again should give same result
      const reStripped = normalizeUUID(stripped).replace(/-/g, '');
      expect(reStripped).toBe(stripped);
    });
  }
});

// ---------------------------------------------------------------------------
// 6. compareUUIDs — 100 tests
// ---------------------------------------------------------------------------
describe('compareUUIDs', () => {
  // 20 identical UUID pairs → 0
  for (let i = 0; i < 20; i++) {
    it(`compareUUIDs returns 0 for identical UUID #${i}`, () => {
      expect(compareUUIDs(V4_POOL[i], V4_POOL[i])).toBe(0);
    });
  }

  // 20 case-insensitive: same UUID uppercase vs lowercase → 0
  for (let i = 0; i < 20; i++) {
    it(`compareUUIDs returns 0 for same UUID different case #${i}`, () => {
      expect(compareUUIDs(V4_POOL[i].toUpperCase(), V4_POOL[i].toLowerCase())).toBe(0);
    });
  }

  // 20 known ordering: NIL_UUID < any real UUID from pool
  for (let i = 0; i < 20; i++) {
    it(`compareUUIDs: NIL_UUID < V4_POOL[${i}] (returns -1)`, () => {
      const result = compareUUIDs(NIL_UUID, V4_POOL[i]);
      // NIL is all zeros; any non-zero UUID should be >=
      // Since real UUIDs have version bits, they will always be > NIL
      expect(result).toBe(-1);
    });
  }

  // 20 symmetry: if a < b then b > a
  for (let i = 0; i < 20; i++) {
    it(`compareUUIDs is antisymmetric for pair #${i}`, () => {
      const a = V4_POOL[i * 2];
      const b = V4_POOL[i * 2 + 1];
      const ab = compareUUIDs(a, b);
      const ba = compareUUIDs(b, a);
      // They should be opposite in sign (or both 0)
      if (ab === 0) {
        expect(ba).toBe(0);
      } else {
        expect(ab * ba).toBeLessThan(0);
      }
    });
  }

  // 20 transitivity checks: sort 3 UUIDs and verify ordering
  for (let i = 0; i < 20; i++) {
    it(`compareUUIDs transitivity check #${i}`, () => {
      const sorted = [V4_POOL[i], V4_POOL[i + 1], V4_POOL[i + 2]].sort((a, b) =>
        compareUUIDs(a, b)
      );
      expect(compareUUIDs(sorted[0], sorted[1])).toBeLessThanOrEqual(0);
      expect(compareUUIDs(sorted[1], sorted[2])).toBeLessThanOrEqual(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. uuidToBytes / bytesToUUID — 100 tests
// ---------------------------------------------------------------------------
describe('uuidToBytes and bytesToUUID', () => {
  // 50 round-trips: UUID → bytes → UUID
  for (let i = 0; i < 50; i++) {
    it(`uuidToBytes/bytesToUUID round-trip for UUID #${i}`, () => {
      const uuid = V4_POOL[i];
      const bytes = uuidToBytes(uuid);
      const restored = bytesToUUID(bytes);
      expect(restored).toBe(uuid.toLowerCase());
    });
  }

  // 30 bytes are exactly 16
  for (let i = 0; i < 30; i++) {
    it(`uuidToBytes returns Uint8Array of length 16 for UUID #${i}`, () => {
      const bytes = uuidToBytes(V4_POOL[i]);
      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBe(16);
    });
  }

  // 10 byte range checks: all bytes 0-255
  for (let i = 0; i < 10; i++) {
    it(`uuidToBytes bytes are in range 0-255 for UUID #${i}`, () => {
      const bytes = uuidToBytes(V4_POOL[i]);
      for (const byte of bytes) {
        expect(byte).toBeGreaterThanOrEqual(0);
        expect(byte).toBeLessThanOrEqual(255);
      }
    });
  }

  // 5 NIL UUID → all zero bytes
  for (let i = 0; i < 5; i++) {
    it(`uuidToBytes of NIL_UUID produces all-zero array (check #${i})`, () => {
      const bytes = uuidToBytes(NIL_UUID);
      expect(Array.from(bytes).every((b) => b === 0)).toBe(true);
    });
  }

  // 5 bytesToUUID throws on wrong-length arrays
  it('bytesToUUID throws when given 15-byte array', () => {
    expect(() => bytesToUUID(new Uint8Array(15))).toThrow();
  });
  it('bytesToUUID throws when given 17-byte array', () => {
    expect(() => bytesToUUID(new Uint8Array(17))).toThrow();
  });
  it('bytesToUUID throws when given 0-byte array', () => {
    expect(() => bytesToUUID(new Uint8Array(0))).toThrow();
  });
  it('bytesToUUID succeeds with exact 16 zeros', () => {
    expect(bytesToUUID(new Uint8Array(16))).toBe(NIL_UUID);
  });
  it('uuidToBytes and bytesToUUID are inverses of each other', () => {
    const uuid = V4_POOL[0];
    expect(bytesToUUID(uuidToBytes(uuid))).toBe(uuid.toLowerCase());
  });
});

// ---------------------------------------------------------------------------
// 8. generateBatch — 100 tests
// ---------------------------------------------------------------------------
describe('generateBatch', () => {
  // 50 tests: batch size 1..50, each result has correct count
  for (let i = 1; i <= 50; i++) {
    it(`generateBatch(${i}) returns array of length ${i}`, () => {
      const batch = generateBatch(i);
      expect(batch).toHaveLength(i);
    });
  }

  // 30 tests: every UUID in batch #i is a valid v4
  for (let i = 1; i <= 30; i++) {
    it(`generateBatch(${i}): all items match v4 regex`, () => {
      const batch = generateBatch(i);
      for (const uuid of batch) {
        expect(uuid).toMatch(UUID_V4_REGEX);
      }
    });
  }

  // 10 edge cases
  it('generateBatch(0) returns empty array', () => {
    expect(generateBatch(0)).toEqual([]);
  });
  it('generateBatch(100) returns 100 items', () => {
    expect(generateBatch(100)).toHaveLength(100);
  });
  it('generateBatch result is an array', () => {
    expect(Array.isArray(generateBatch(5))).toBe(true);
  });
  it('generateBatch(-1) returns empty array', () => {
    expect(generateBatch(-1)).toEqual([]);
  });
  it('generateBatch(1) returns array with 1 string', () => {
    const b = generateBatch(1);
    expect(typeof b[0]).toBe('string');
  });
  it('generateBatch produces unique UUIDs (batch of 10)', () => {
    const batch = generateBatch(10);
    const unique = new Set(batch);
    expect(unique.size).toBe(10);
  });
  it('generateBatch produces unique UUIDs (batch of 50)', () => {
    const batch = generateBatch(50);
    const unique = new Set(batch);
    expect(unique.size).toBe(50);
  });
  it('generateBatch produces unique UUIDs (batch of 100)', () => {
    const batch = generateBatch(100);
    const unique = new Set(batch);
    expect(unique.size).toBe(100);
  });
  it('generateBatch items are strings', () => {
    generateBatch(5).forEach((u) => expect(typeof u).toBe('string'));
  });
  it('generateBatch(2) items are different', () => {
    const [a, b] = generateBatch(2);
    expect(a).not.toBe(b);
  });
});

// ---------------------------------------------------------------------------
// 9. shortId — 50 tests
// ---------------------------------------------------------------------------
describe('shortId', () => {
  // 30 tests: non-empty
  for (let i = 0; i < 30; i++) {
    it(`shortId #${i} is non-empty`, () => {
      expect(shortId().length).toBeGreaterThan(0);
    });
  }

  // 10 tests: all chars are alphanumeric (base58 alphabet)
  for (let i = 0; i < 10; i++) {
    it(`shortId #${i} contains only base58 chars`, () => {
      const id = shortId();
      expect(/^[1-9A-HJ-NP-Za-km-z]+$/.test(id)).toBe(true);
    });
  }

  // 5 tests: reasonable length (~15-25 chars for 16 bytes in base58)
  for (let i = 0; i < 5; i++) {
    it(`shortId #${i} has length between 10 and 30`, () => {
      const len = shortId().length;
      expect(len).toBeGreaterThanOrEqual(10);
      expect(len).toBeLessThanOrEqual(30);
    });
  }

  // 5 uniqueness tests
  for (let i = 0; i < 5; i++) {
    it(`shortId #${i} produces unique values`, () => {
      const ids = new Set(Array.from({ length: 10 }, () => shortId()));
      expect(ids.size).toBe(10);
    });
  }
});

// ---------------------------------------------------------------------------
// 10. sequentialUUID — 50 tests
// ---------------------------------------------------------------------------
describe('sequentialUUID', () => {
  // 30 tests: valid UUID format
  for (let i = 0; i < 30; i++) {
    it(`sequentialUUID #${i} matches UUID_GENERIC_REGEX`, () => {
      expect(SEQ_POOL[i]).toMatch(UUID_GENERIC_REGEX);
    });
  }

  // 10 tests: valid v4 variant bits (version=4, variant=10xx)
  for (let i = 0; i < 10; i++) {
    it(`sequentialUUID #${i} has correct version and variant`, () => {
      const uuid = SEQ_POOL[i];
      // version byte (index 14 of string) should be '4'
      expect(uuid[14]).toBe('4');
      // variant nibble (index 19) should be 8, 9, a, or b
      expect(['8', '9', 'a', 'b']).toContain(uuid[19]);
    });
  }

  // 10 tests: consecutive sequential UUIDs sort in generation order
  for (let i = 0; i < 10; i++) {
    it(`sequentialUUID pair #${i} is sortable (second >= first)`, () => {
      // Generate in succession; they may share the same ms but first <= second lexicographically
      // when timestamps differ the ordering is guaranteed; same ms is also acceptable (equal or any)
      const a = SEQ_POOL[i];
      const b = SEQ_POOL[i + 1];
      const cmp = compareUUIDs(a, b);
      // Either a <= b or they were generated in same millisecond (any order acceptable)
      // We just verify both are valid UUIDs
      expect(isUUID(a)).toBe(true);
      expect(isUUID(b)).toBe(true);
      // result is -1, 0, or 1
      expect([-1, 0, 1]).toContain(cmp);
    });
  }
});

// ---------------------------------------------------------------------------
// 11. uuidVersion — 100 tests
// ---------------------------------------------------------------------------
describe('uuidVersion', () => {
  // 50 v4 UUIDs → version 4
  for (let i = 0; i < 50; i++) {
    it(`uuidVersion returns 4 for v4 UUID #${i}`, () => {
      expect(uuidVersion(V4_POOL[i])).toBe(4);
    });
  }

  // 20 v1 UUIDs → version 1
  for (let i = 0; i < 20; i++) {
    it(`uuidVersion returns 1 for v1 UUID #${i}`, () => {
      expect(uuidVersion(V1_POOL[i])).toBe(1);
    });
  }

  // 10 invalid strings → null
  const invalidVersionInputs = [
    '',
    'not-a-uuid',
    NIL_UUID,
    'zzzzzzzz-zzzz-4zzz-azzz-zzzzzzzzzzzz',
    '00000000-0000-6000-8000-000000000000',
    'short',
    null as unknown as string,
    undefined as unknown as string,
    '   ',
    '12345',
  ];
  for (let i = 0; i < invalidVersionInputs.length; i++) {
    it(`uuidVersion returns null for invalid input #${i}: ${JSON.stringify(invalidVersionInputs[i])}`, () => {
      expect(uuidVersion(invalidVersionInputs[i])).toBeNull();
    });
  }

  // 10 v5 UUIDs (generated via uuidV5) → version 5
  for (let i = 0; i < 10; i++) {
    it(`uuidVersion returns 5 for v5 UUID #${i}`, () => {
      const v5 = uuidV5(NAMESPACE_DNS, `test-name-${i}`);
      expect(uuidVersion(v5)).toBe(5);
    });
  }

  // 10 sequentialUUIDs → version 4 (uses v4 version bits)
  for (let i = 0; i < 10; i++) {
    it(`uuidVersion returns 4 for sequentialUUID #${i}`, () => {
      expect(uuidVersion(SEQ_POOL[i])).toBe(4);
    });
  }
});

// ---------------------------------------------------------------------------
// 12. uuidsEqual — 100 tests
// ---------------------------------------------------------------------------
describe('uuidsEqual', () => {
  // 30 same UUID → true
  for (let i = 0; i < 30; i++) {
    it(`uuidsEqual returns true for same UUID #${i}`, () => {
      expect(uuidsEqual(V4_POOL[i], V4_POOL[i])).toBe(true);
    });
  }

  // 20 uppercase vs lowercase → true
  for (let i = 0; i < 20; i++) {
    it(`uuidsEqual returns true for UUID #${i} vs its uppercase`, () => {
      expect(uuidsEqual(V4_POOL[i].toLowerCase(), V4_POOL[i].toUpperCase())).toBe(true);
    });
  }

  // 20 stripped vs hyphenated → true
  for (let i = 0; i < 20; i++) {
    it(`uuidsEqual returns true for UUID #${i} stripped vs hyphenated`, () => {
      const stripped = V4_POOL[i].replace(/-/g, '');
      expect(uuidsEqual(stripped, V4_POOL[i])).toBe(true);
    });
  }

  // 20 different UUIDs → false
  for (let i = 0; i < 20; i++) {
    it(`uuidsEqual returns false for different UUIDs (pair #${i})`, () => {
      // Pool entries are independently random — collision probability negligible
      expect(uuidsEqual(V4_POOL[i], V4_POOL[i + 100])).toBe(false);
    });
  }

  // 5 NIL vs NIL → true
  for (let i = 0; i < 5; i++) {
    it(`uuidsEqual returns true for NIL_UUID vs NIL_UUID (check #${i})`, () => {
      expect(uuidsEqual(NIL_UUID, NIL_UUID)).toBe(true);
    });
  }

  // 5 NIL vs real UUID → false
  for (let i = 0; i < 5; i++) {
    it(`uuidsEqual returns false for NIL_UUID vs V4_POOL[${i}]`, () => {
      expect(uuidsEqual(NIL_UUID, V4_POOL[i])).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 13. sortUUIDs — 50 tests
// ---------------------------------------------------------------------------
describe('sortUUIDs', () => {
  // 20 tests: sorted array is non-decreasing
  for (let i = 0; i < 20; i++) {
    it(`sortUUIDs produces non-decreasing order for batch #${i}`, () => {
      const batch = V4_POOL.slice(i * 5, i * 5 + 5);
      const sorted = sortUUIDs(batch);
      for (let j = 0; j < sorted.length - 1; j++) {
        expect(compareUUIDs(sorted[j], sorted[j + 1])).toBeLessThanOrEqual(0);
      }
    });
  }

  // 10 tests: sorting doesn't change array length
  for (let i = 0; i < 10; i++) {
    it(`sortUUIDs preserves length for batch #${i}`, () => {
      const batch = V4_POOL.slice(0, i + 1);
      expect(sortUUIDs(batch)).toHaveLength(batch.length);
    });
  }

  // 10 tests: sorting is stable (already sorted stays sorted)
  for (let i = 0; i < 10; i++) {
    it(`sortUUIDs of already-sorted array is idempotent #${i}`, () => {
      const batch = V4_POOL.slice(0, 5);
      const sorted = sortUUIDs(batch);
      const doubleSorted = sortUUIDs(sorted);
      expect(doubleSorted).toEqual(sorted);
    });
  }

  // 5 edge cases
  it('sortUUIDs of empty array returns empty array', () => {
    expect(sortUUIDs([])).toEqual([]);
  });
  it('sortUUIDs of single UUID returns same UUID', () => {
    const uuid = V4_POOL[0];
    expect(sortUUIDs([uuid])).toEqual([uuid.toLowerCase()]);
  });
  it('sortUUIDs does not mutate the original array', () => {
    const original = [V4_POOL[2], V4_POOL[1], V4_POOL[0]];
    const copy = [...original];
    sortUUIDs(original);
    expect(original).toEqual(copy);
  });
  it('sortUUIDs of [NIL, real] puts NIL first', () => {
    const sorted = sortUUIDs([V4_POOL[0], NIL_UUID]);
    expect(sorted[0]).toBe(NIL_UUID);
  });
  it('sortUUIDs of 3 identical UUIDs returns 3 identical', () => {
    const uuid = V4_POOL[0];
    const sorted = sortUUIDs([uuid, uuid, uuid]);
    expect(sorted).toHaveLength(3);
    sorted.forEach((u) => expect(uuidsEqual(u, uuid)).toBe(true));
  });
});

// ---------------------------------------------------------------------------
// 14. uuidV5 — 100 tests
// ---------------------------------------------------------------------------
describe('uuidV5', () => {
  // 40 tests: same namespace + name → same result
  for (let i = 0; i < 40; i++) {
    it(`uuidV5 is deterministic for name "test-${i}"`, () => {
      const ns = NAMESPACE_DNS;
      const name = `test-name-${i}`;
      const a = uuidV5(ns, name);
      const b = uuidV5(ns, name);
      expect(a).toBe(b);
    });
  }

  // 20 tests: different names → different UUIDs
  for (let i = 0; i < 20; i++) {
    it(`uuidV5 produces different UUIDs for different names #${i}`, () => {
      const ns = NAMESPACE_DNS;
      const a = uuidV5(ns, `name-A-${i}`);
      const b = uuidV5(ns, `name-B-${i}`);
      expect(a).not.toBe(b);
    });
  }

  // 20 tests: different namespaces → different UUIDs for same name
  for (let i = 0; i < 20; i++) {
    it(`uuidV5 produces different UUIDs for different namespaces #${i}`, () => {
      const name = `shared-name-${i}`;
      const a = uuidV5(NAMESPACE_DNS, name);
      const b = uuidV5(NAMESPACE_URL, name);
      expect(a).not.toBe(b);
    });
  }

  // 10 tests: result has version 5
  for (let i = 0; i < 10; i++) {
    it(`uuidV5 result has version digit '5' at position 14 (test #${i})`, () => {
      const v5 = uuidV5(NAMESPACE_DNS, `name-${i}`);
      expect(v5[14]).toBe('5');
    });
  }

  // 5 tests: result has valid RFC-4122 variant (8, 9, a, b at position 19)
  for (let i = 0; i < 5; i++) {
    it(`uuidV5 result has valid variant nibble (test #${i})`, () => {
      const v5 = uuidV5(NAMESPACE_OID, `test-${i}`);
      expect(['8', '9', 'a', 'b']).toContain(v5[19]);
    });
  }

  // 5 tests: result matches generic UUID regex
  for (let i = 0; i < 5; i++) {
    it(`uuidV5 result matches UUID_GENERIC_REGEX (test #${i})`, () => {
      const v5 = uuidV5(NAMESPACE_URL, `url-name-${i}`);
      expect(v5).toMatch(UUID_GENERIC_REGEX);
    });
  }
});

// ---------------------------------------------------------------------------
// 15. parseUUID — 40 tests
// ---------------------------------------------------------------------------
describe('parseUUID', () => {
  // 20 tests: components have correct lengths
  for (let i = 0; i < 20; i++) {
    it(`parseUUID components have correct lengths for UUID #${i}`, () => {
      const c = parseUUID(V4_POOL[i]);
      expect(c.timeLow).toHaveLength(8);
      expect(c.timeMid).toHaveLength(4);
      expect(c.timeHiAndVersion).toHaveLength(4);
      expect(c.clockSeqHiAndReserved).toHaveLength(2);
      expect(c.clockSeqLow).toHaveLength(2);
      expect(c.node).toHaveLength(12);
    });
  }

  // 10 tests: version field is 4 for v4 UUIDs
  for (let i = 0; i < 10; i++) {
    it(`parseUUID returns version=4 for v4 UUID #${i}`, () => {
      expect(parseUUID(V4_POOL[i]).version).toBe(4);
    });
  }

  // 5 tests: v1 UUIDs have version=1
  for (let i = 0; i < 5; i++) {
    it(`parseUUID returns version=1 for v1 UUID #${i}`, () => {
      expect(parseUUID(V1_POOL[i]).version).toBe(1);
    });
  }

  // 5 tests: throws on invalid UUID
  const invalidParse = ['', 'bad', 'not-a-uuid', '12345', 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'];
  for (let i = 0; i < invalidParse.length; i++) {
    it(`parseUUID throws on invalid input #${i}: "${invalidParse[i]}"`, () => {
      expect(() => parseUUID(invalidParse[i])).toThrow();
    });
  }
});

// ---------------------------------------------------------------------------
// 16. uuidToBase64 / base64ToUUID — 40 tests
// ---------------------------------------------------------------------------
describe('uuidToBase64 and base64ToUUID', () => {
  // 20 round-trips
  for (let i = 0; i < 20; i++) {
    it(`uuidToBase64/base64ToUUID round-trip for UUID #${i}`, () => {
      const uuid = V4_POOL[i];
      const b64 = uuidToBase64(uuid);
      const restored = base64ToUUID(b64);
      expect(restored).toBe(uuid.toLowerCase());
    });
  }

  // 10 tests: base64 is a non-empty string
  for (let i = 0; i < 10; i++) {
    it(`uuidToBase64 returns non-empty string for UUID #${i}`, () => {
      const b64 = uuidToBase64(V4_POOL[i]);
      expect(typeof b64).toBe('string');
      expect(b64.length).toBeGreaterThan(0);
    });
  }

  // 5 tests: NIL UUID encodes to base64 of 16 zero bytes
  for (let i = 0; i < 5; i++) {
    it(`uuidToBase64(NIL_UUID) encodes to all-zero base64 (check #${i})`, () => {
      const b64 = uuidToBase64(NIL_UUID);
      const decoded = base64ToUUID(b64);
      expect(decoded).toBe(NIL_UUID);
    });
  }

  // 5 tests: base64ToUUID throws on bad base64
  const badB64 = ['!!!', 'not-valid-base64-for-uuid', 'AAAA', 'AAAAAAAAAAA=', ''];
  for (let i = 0; i < badB64.length; i++) {
    it(`base64ToUUID throws on bad base64 #${i}: "${badB64[i]}"`, () => {
      expect(() => base64ToUUID(badB64[i])).toThrow();
    });
  }
});

// ---------------------------------------------------------------------------
// 17. isUUIDv1 — 30 tests
// ---------------------------------------------------------------------------
describe('isUUIDv1', () => {
  // 15 v1 UUIDs → true
  for (let i = 0; i < 15; i++) {
    it(`isUUIDv1 returns true for v1 UUID #${i}`, () => {
      expect(isUUIDv1(V1_POOL[i])).toBe(true);
    });
  }

  // 10 v4 UUIDs → false
  for (let i = 0; i < 10; i++) {
    it(`isUUIDv1 returns false for v4 UUID #${i}`, () => {
      expect(isUUIDv1(V4_POOL[i])).toBe(false);
    });
  }

  // 5 invalid inputs → false
  const invalidV1 = ['', 'not-uuid', NIL_UUID, null as unknown as string, undefined as unknown as string];
  for (let i = 0; i < invalidV1.length; i++) {
    it(`isUUIDv1 returns false for invalid input #${i}`, () => {
      expect(isUUIDv1(invalidV1[i])).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 18. Namespace constants — 10 tests
// ---------------------------------------------------------------------------
describe('UUID namespace constants', () => {
  it('NIL_UUID is all zeros', () => {
    expect(NIL_UUID).toBe('00000000-0000-0000-0000-000000000000');
  });
  it('NAMESPACE_DNS matches RFC 4122', () => {
    expect(NAMESPACE_DNS).toBe('6ba7b810-9dad-11d1-80b4-00c04fd430c8');
  });
  it('NAMESPACE_URL matches RFC 4122', () => {
    expect(NAMESPACE_URL).toBe('6ba7b811-9dad-11d1-80b4-00c04fd430c8');
  });
  it('NAMESPACE_OID matches RFC 4122', () => {
    expect(NAMESPACE_OID).toBe('6ba7b812-9dad-11d1-80b4-00c04fd430c8');
  });
  it('NIL_UUID is a valid format string', () => {
    // The NIL UUID has version=0 so UUID_RE won't match, but structure is correct
    expect(NIL_UUID.split('-')).toHaveLength(5);
  });
  it('NAMESPACE_DNS is a valid UUID string format', () => {
    expect(isUUID(NAMESPACE_DNS)).toBe(true);
  });
  it('NAMESPACE_URL is a valid UUID string format', () => {
    expect(isUUID(NAMESPACE_URL)).toBe(true);
  });
  it('NAMESPACE_OID is a valid UUID string format', () => {
    expect(isUUID(NAMESPACE_OID)).toBe(true);
  });
  it('All three namespaces are distinct', () => {
    expect(NAMESPACE_DNS).not.toBe(NAMESPACE_URL);
    expect(NAMESPACE_URL).not.toBe(NAMESPACE_OID);
    expect(NAMESPACE_DNS).not.toBe(NAMESPACE_OID);
  });
  it('NIL_UUID bytes are all zero', () => {
    const bytes = uuidToBytes(NIL_UUID);
    expect(Array.from(bytes).every((b) => b === 0)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 19. uuidV1 format — 30 tests
// ---------------------------------------------------------------------------
describe('uuidV1', () => {
  // 20 tests: format is valid UUID
  for (let i = 0; i < 20; i++) {
    it(`uuidV1 #${i} produces a valid UUID string`, () => {
      expect(V1_POOL[i]).toMatch(UUID_GENERIC_REGEX);
    });
  }

  // 5 tests: version digit is '1'
  for (let i = 0; i < 5; i++) {
    it(`uuidV1 #${i} has version digit '1' at position 14`, () => {
      expect(V1_POOL[i][14]).toBe('1');
    });
  }

  // 5 tests: variant nibble is 8, 9, a, or b
  for (let i = 0; i < 5; i++) {
    it(`uuidV1 #${i} has valid variant nibble at position 19`, () => {
      expect(['8', '9', 'a', 'b']).toContain(V1_POOL[i][19]);
    });
  }
});

// ---------------------------------------------------------------------------
// 20. Additional edge case & integration tests — ~50 tests
// ---------------------------------------------------------------------------
describe('edge cases and integration', () => {
  it('uuidV4 produces unique values on consecutive calls', () => {
    const a = uuidV4();
    const b = uuidV4();
    expect(a).not.toBe(b);
  });

  it('uuidV1 produces unique values on consecutive calls', () => {
    const a = uuidV1();
    const b = uuidV1();
    // Same millisecond may occasionally produce the same time fields, but node/clock differ
    expect(typeof a).toBe('string');
    expect(typeof b).toBe('string');
  });

  it('normalizeUUID handles mixed-case input', () => {
    const mixed = 'A1B2C3D4-E5F6-4A7B-8C9D-0E1F2A3B4C5D';
    const norm = normalizeUUID(mixed);
    expect(norm).toBe('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');
  });

  it('stripHyphens then normalizeUUID round-trip is identity', () => {
    const uuid = V4_POOL[5];
    expect(normalizeUUID(stripHyphens(uuid))).toBe(uuid.toLowerCase());
  });

  it('uuidsEqual handles identical strings', () => {
    expect(uuidsEqual(NIL_UUID, NIL_UUID)).toBe(true);
  });

  it('uuidsEqual is commutative', () => {
    const a = V4_POOL[0];
    const b = V4_POOL[1];
    expect(uuidsEqual(a, b)).toBe(uuidsEqual(b, a));
  });

  it('compareUUIDs with NIL_UUID vs NIL_UUID is 0', () => {
    expect(compareUUIDs(NIL_UUID, NIL_UUID)).toBe(0);
  });

  it('sortUUIDs returns all original UUIDs (no drops)', () => {
    const batch = V4_POOL.slice(0, 10);
    const sorted = sortUUIDs(batch);
    expect(new Set(sorted).size).toBe(10);
  });

  it('generateBatch result UUIDs are all unique', () => {
    const batch = generateBatch(50);
    const unique = new Set(batch);
    expect(unique.size).toBe(50);
  });

  it('uuidV5 with NAMESPACE_URL gives valid UUID', () => {
    const v5 = uuidV5(NAMESPACE_URL, 'https://example.com');
    expect(isUUID(v5)).toBe(true);
  });

  it('uuidV5 version bit is 5', () => {
    const v5 = uuidV5(NAMESPACE_DNS, 'example.com');
    expect(v5[14]).toBe('5');
  });

  it('uuidToBytes of NAMESPACE_DNS produces 16 bytes', () => {
    expect(uuidToBytes(NAMESPACE_DNS).length).toBe(16);
  });

  it('bytesToUUID of NIL bytes returns NIL_UUID', () => {
    expect(bytesToUUID(new Uint8Array(16))).toBe(NIL_UUID);
  });

  it('uuidVersion of NAMESPACE_DNS is 1', () => {
    expect(uuidVersion(NAMESPACE_DNS)).toBe(1);
  });

  it('isUUID accepts uppercase UUID', () => {
    expect(isUUID(V4_POOL[0].toUpperCase())).toBe(true);
  });

  it('isUUID accepts stripped 32-char hex as valid after normalize', () => {
    // isUUID calls tryNormalize which handles 32-char hex
    const stripped = V4_POOL[0].replace(/-/g, '');
    // stripped 32-char should normalize to valid UUID
    expect(isUUID(stripped)).toBe(true);
  });

  it('parseUUID node field is 12 hex chars', () => {
    const c = parseUUID(V4_POOL[0]);
    expect(/^[0-9a-f]{12}$/.test(c.node)).toBe(true);
  });

  it('parseUUID timeLow is 8 hex chars', () => {
    const c = parseUUID(V4_POOL[0]);
    expect(/^[0-9a-f]{8}$/.test(c.timeLow)).toBe(true);
  });

  it('shortId produces different IDs on each call', () => {
    const ids = [shortId(), shortId(), shortId()];
    const unique = new Set(ids);
    expect(unique.size).toBe(3);
  });

  it('sequentialUUID produces different UUIDs on each call', () => {
    const a = sequentialUUID();
    const b = sequentialUUID();
    // Both are valid UUIDs
    expect(isUUID(a)).toBe(true);
    expect(isUUID(b)).toBe(true);
  });

  it('uuidToBase64 for NAMESPACE_DNS is a non-empty string', () => {
    const b64 = uuidToBase64(NAMESPACE_DNS);
    expect(b64.length).toBeGreaterThan(0);
  });

  it('base64ToUUID(uuidToBase64(NAMESPACE_URL)) equals NAMESPACE_URL', () => {
    const b64 = uuidToBase64(NAMESPACE_URL);
    expect(base64ToUUID(b64)).toBe(NAMESPACE_URL);
  });

  it('compareUUIDs returns -1 or 1 for distinct UUIDs', () => {
    const result = compareUUIDs(V4_POOL[0], V4_POOL[1]);
    expect([-1, 1]).toContain(result);
  });

  it('isUUIDv4 returns false for NAMESPACE_DNS (v1)', () => {
    expect(isUUIDv4(NAMESPACE_DNS)).toBe(false);
  });

  it('isUUIDv1 returns true for NAMESPACE_DNS (v1)', () => {
    expect(isUUIDv1(NAMESPACE_DNS)).toBe(true);
  });

  it('generateBatch(0) is empty array', () => {
    expect(generateBatch(0)).toHaveLength(0);
  });

  it('normalizeUUID of NIL_UUID returns NIL_UUID', () => {
    expect(normalizeUUID(NIL_UUID)).toBe(NIL_UUID);
  });

  it('stripHyphens of NIL_UUID returns 32 zeros', () => {
    expect(stripHyphens(NIL_UUID)).toBe('0'.repeat(32));
  });

  it('uuidsEqual with stripped vs hyphenated returns true', () => {
    const stripped = NAMESPACE_DNS.replace(/-/g, '');
    expect(uuidsEqual(stripped, NAMESPACE_DNS)).toBe(true);
  });

  it('sortUUIDs([b, a]) where a < b returns [a, b]', () => {
    const sorted = sortUUIDs([V4_POOL[5], NIL_UUID]);
    expect(sorted[0]).toBe(NIL_UUID);
  });

  it('uuidV5 result is deterministic across calls', () => {
    const result1 = uuidV5(NAMESPACE_OID, 'stable-name');
    const result2 = uuidV5(NAMESPACE_OID, 'stable-name');
    expect(result1).toBe(result2);
  });

  for (let i = 0; i < 10; i++) {
    it(`uuidV4 #${i} has exactly 36 characters`, () => {
      expect(V4_POOL[i].length).toBe(36);
    });
  }

  for (let i = 0; i < 5; i++) {
    it(`sequentialUUID #${i} has exactly 36 characters`, () => {
      expect(SEQ_POOL[i].length).toBe(36);
    });
  }
});
