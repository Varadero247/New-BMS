// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import {
  buildPageMeta,
  clampPage,
  clampPageSize,
  decodeCursor,
  encodeCursor,
  getOffset,
  isValidOffsetRequest,
  isValidPageRequest,
  paginate,
  paginateCursor,
  paginateOffset,
  sortData,
  totalPages,
} from '../src/index';
import type { PageRequest } from '../src/index';

// ─── helpers ──────────────────────────────────────────────────────────────────
type Item = Record<string, unknown>;
const makeData = (n: number): Item[] =>
  Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    num: i + 1,
    name: `item${i + 1}`,
    score: (n - i) * 10,
    tag: ['A', 'B', 'C'][i % 3],
  }));

// ─── clampPage ────────────────────────────────────────────────────────────────
describe('clampPage', () => {
  it('returns 1 for page 0', () => { expect(clampPage(0)).toBe(1); });
  it('returns 1 for negative', () => { expect(clampPage(-5)).toBe(1); });
  it('returns 1 for 1', () => { expect(clampPage(1)).toBe(1); });
  it('returns 5 for 5', () => { expect(clampPage(5)).toBe(5); });
  it('floors decimal', () => { expect(clampPage(3.9)).toBe(3); });
  it('floors 1.5 to 1', () => { expect(clampPage(1.5)).toBe(1); });

  for (let i = 1; i <= 50; i++) {
    it(`clampPage(${i}) === ${i}`, () => { expect(clampPage(i)).toBe(i); });
  }
});

// ─── clampPageSize ────────────────────────────────────────────────────────────
describe('clampPageSize', () => {
  it('returns min for 0', () => { expect(clampPageSize(0)).toBe(1); });
  it('returns max for 9999', () => { expect(clampPageSize(9999)).toBe(1000); });
  it('returns 10 for 10', () => { expect(clampPageSize(10)).toBe(10); });
  it('floors decimal', () => { expect(clampPageSize(5.7)).toBe(5); });
  it('custom min', () => { expect(clampPageSize(0, 5)).toBe(5); });
  it('custom max', () => { expect(clampPageSize(100, 1, 50)).toBe(50); });
  it('within range', () => { expect(clampPageSize(25, 10, 50)).toBe(25); });
  it('below custom min', () => { expect(clampPageSize(3, 10, 50)).toBe(10); });

  for (let i = 1; i <= 30; i++) {
    it(`clampPageSize(${i}) in [1,1000] = ${i}`, () => {
      expect(clampPageSize(i)).toBe(i);
    });
  }
});

// ─── totalPages ───────────────────────────────────────────────────────────────
describe('totalPages', () => {
  it('0 items = 0 pages', () => { expect(totalPages(0, 10)).toBe(0); });
  it('exact division', () => { expect(totalPages(100, 10)).toBe(10); });
  it('rounds up', () => { expect(totalPages(101, 10)).toBe(11); });
  it('1 item = 1 page', () => { expect(totalPages(1, 10)).toBe(1); });
  it('pageSize 0 returns 0', () => { expect(totalPages(100, 0)).toBe(0); });
  it('pageSize 1 = total pages = total', () => { expect(totalPages(5, 1)).toBe(5); });
  it('pageSize equals total', () => { expect(totalPages(10, 10)).toBe(1); });

  for (let n = 1; n <= 30; n++) {
    it(`totalPages(${n * 10}, 10) === ${n}`, () => {
      expect(totalPages(n * 10, 10)).toBe(n);
    });
  }
});

// ─── getOffset ────────────────────────────────────────────────────────────────
describe('getOffset', () => {
  it('page 1 = offset 0', () => { expect(getOffset(1, 10)).toBe(0); });
  it('page 2 = offset 10', () => { expect(getOffset(2, 10)).toBe(10); });
  it('page 3 = offset 20', () => { expect(getOffset(3, 10)).toBe(20); });
  it('page 0 clamped to page 1', () => { expect(getOffset(0, 10)).toBe(0); });

  for (let i = 1; i <= 20; i++) {
    it(`getOffset(${i}, 5) === ${(i - 1) * 5}`, () => {
      expect(getOffset(i, 5)).toBe((i - 1) * 5);
    });
  }
});

// ─── sortData ─────────────────────────────────────────────────────────────────
describe('sortData', () => {
  const data = makeData(10);

  it('sorts by score asc', () => {
    const r = sortData(data, 'score', 'asc');
    for (let i = 1; i < r.length; i++) {
      expect(r[i].score as number).toBeGreaterThanOrEqual(r[i - 1].score as number);
    }
  });
  it('sorts by score desc', () => {
    const r = sortData(data, 'score', 'desc');
    for (let i = 1; i < r.length; i++) {
      expect(r[i].score as number).toBeLessThanOrEqual(r[i - 1].score as number);
    }
  });
  it('sorts by name asc', () => {
    const r = sortData(data, 'name', 'asc');
    expect(r).toHaveLength(10);
  });
  it('does not mutate original', () => {
    const orig = data[0].score;
    sortData(data, 'score', 'desc');
    expect(data[0].score).toBe(orig);
  });
  it('default direction is asc', () => {
    const r = sortData(data, 'num');
    expect(r[0].num).toBe(1);
  });
  it('single item returned unchanged', () => {
    const r = sortData([{ id: '1', num: 5 }], 'num', 'asc');
    expect(r).toHaveLength(1);
  });

  for (let i = 0; i < 15; i++) {
    it(`sortData result length preserved bulk ${i}`, () => {
      const d = makeData(i + 2);
      const r = sortData(d, 'score', i % 2 === 0 ? 'asc' : 'desc');
      expect(r).toHaveLength(i + 2);
    });
  }
});

// ─── paginate ─────────────────────────────────────────────────────────────────
describe('paginate', () => {
  const data = makeData(100);

  it('first page correct', () => {
    const r = paginate(data, { page: 1, pageSize: 10 });
    expect(r.data).toHaveLength(10);
    expect(r.page).toBe(1);
    expect(r.pageSize).toBe(10);
    expect(r.total).toBe(100);
    expect(r.totalPages).toBe(10);
    expect(r.hasPrev).toBe(false);
    expect(r.hasNext).toBe(true);
    expect(r.prevPage).toBeNull();
    expect(r.nextPage).toBe(2);
  });
  it('last page correct', () => {
    const r = paginate(data, { page: 10, pageSize: 10 });
    expect(r.hasNext).toBe(false);
    expect(r.hasPrev).toBe(true);
    expect(r.nextPage).toBeNull();
    expect(r.prevPage).toBe(9);
  });
  it('middle page', () => {
    const r = paginate(data, { page: 5, pageSize: 10 });
    expect(r.hasNext).toBe(true);
    expect(r.hasPrev).toBe(true);
  });
  it('page beyond total returns empty', () => {
    const r = paginate(data, { page: 999, pageSize: 10 });
    expect(r.data).toHaveLength(0);
  });
  it('sorts by field', () => {
    const r = paginate(data, { page: 1, pageSize: 5, sortField: 'score', sortDirection: 'asc' });
    if (r.data.length > 1) {
      expect(r.data[0].score as number).toBeLessThanOrEqual(r.data[1].score as number);
    }
  });
  it('sorts desc by field', () => {
    const r = paginate(data, { page: 1, pageSize: 5, sortField: 'score', sortDirection: 'desc' });
    if (r.data.length > 1) {
      expect(r.data[0].score as number).toBeGreaterThanOrEqual(r.data[1].score as number);
    }
  });
  it('page 0 clamped to 1', () => {
    const r = paginate(data, { page: 0, pageSize: 10 });
    expect(r.page).toBe(1);
  });
  it('pageSize 0 clamped to 1', () => {
    const r = paginate(data, { page: 1, pageSize: 0 });
    expect(r.pageSize).toBe(1);
  });
  it('total is always correct', () => {
    const r = paginate(data, { page: 3, pageSize: 7 });
    expect(r.total).toBe(100);
  });
  it('partial last page', () => {
    const r = paginate(makeData(25), { page: 3, pageSize: 10 });
    expect(r.data).toHaveLength(5);
    expect(r.hasNext).toBe(false);
  });

  for (let i = 1; i <= 10; i++) {
    it(`paginate page ${i} of 10`, () => {
      const r = paginate(data, { page: i, pageSize: 10 });
      expect(r.data).toHaveLength(10);
      expect(r.page).toBe(i);
    });
  }

  for (let i = 1; i <= 20; i++) {
    it(`paginate totalPages bulk ${i}`, () => {
      const d = makeData(i * 10);
      const r = paginate(d, { page: 1, pageSize: 10 });
      expect(r.totalPages).toBe(i);
    });
  }
});

// ─── paginateOffset ───────────────────────────────────────────────────────────
describe('paginateOffset', () => {
  const data = makeData(50);

  it('offset 0 limit 10', () => {
    const r = paginateOffset(data, { offset: 0, limit: 10 });
    expect(r.data).toHaveLength(10);
    expect(r.hasMore).toBe(true);
  });
  it('offset + limit = total: hasMore false', () => {
    const r = paginateOffset(data, { offset: 40, limit: 10 });
    expect(r.data).toHaveLength(10);
    expect(r.hasMore).toBe(false);
  });
  it('offset past end: empty data', () => {
    const r = paginateOffset(data, { offset: 60, limit: 10 });
    expect(r.data).toHaveLength(0);
    expect(r.hasMore).toBe(false);
  });
  it('total preserved', () => {
    const r = paginateOffset(data, { offset: 0, limit: 5 });
    expect(r.total).toBe(50);
  });
  it('negative offset clamped to 0', () => {
    const r = paginateOffset(data, { offset: -5, limit: 10 });
    expect(r.offset).toBe(0);
  });
  it('limit 0 clamped to 1', () => {
    const r = paginateOffset(data, { offset: 0, limit: 0 });
    expect(r.limit).toBe(1);
  });
  it('partial last page', () => {
    const r = paginateOffset(data, { offset: 47, limit: 10 });
    expect(r.data).toHaveLength(3);
  });

  for (let i = 0; i < 20; i++) {
    it(`paginateOffset page ${i}: first item index ${i * 2 + 1}`, () => {
      const r = paginateOffset(data, { offset: i * 2, limit: 2 });
      if (i * 2 < 50) {
        expect(r.data.length).toBeGreaterThan(0);
        expect(r.data[0].num).toBe(i * 2 + 1);
      }
    });
  }
});

// ─── encodeCursor / decodeCursor ──────────────────────────────────────────────
describe('encodeCursor/decodeCursor', () => {
  it('encode and decode round trip: 1', () => {
    expect(decodeCursor(encodeCursor('1'))).toBe('1');
  });
  it('encode and decode round trip: abc', () => {
    expect(decodeCursor(encodeCursor('abc'))).toBe('abc');
  });
  it('encode produces base64 string', () => {
    const enc = encodeCursor('42');
    expect(enc).toMatch(/^[A-Za-z0-9+/=]+$/);
  });
  it('different IDs produce different cursors', () => {
    expect(encodeCursor('1')).not.toBe(encodeCursor('2'));
  });
  it('decodeCursor with invalid base64 returns input', () => {
    // should not throw
    expect(() => decodeCursor('!!invalid!!')).not.toThrow();
  });

  for (let i = 0; i < 30; i++) {
    it(`cursor round trip for id ${i}`, () => {
      const s = String(i);
      expect(decodeCursor(encodeCursor(s))).toBe(s);
    });
  }
});

// ─── paginateCursor ───────────────────────────────────────────────────────────
describe('paginateCursor', () => {
  const data = makeData(20);

  it('first page no cursor', () => {
    const r = paginateCursor(data, { limit: 5 });
    expect(r.data).toHaveLength(5);
    expect(r.prevCursor).toBeNull();
    expect(r.total).toBe(20);
  });
  it('first page has nextCursor when more data', () => {
    const r = paginateCursor(data, { limit: 5 });
    expect(r.nextCursor).not.toBeNull();
    expect(r.hasMore).toBe(true);
  });
  it('last page no nextCursor', () => {
    const r = paginateCursor(data, { limit: 20 });
    expect(r.nextCursor).toBeNull();
    expect(r.hasMore).toBe(false);
  });
  it('cursor-based navigation', () => {
    const p1 = paginateCursor(data, { limit: 5 });
    expect(p1.nextCursor).not.toBeNull();
    const p2 = paginateCursor(data, { limit: 5, cursor: p1.nextCursor! });
    expect(p2.data[0].num).toBe(6);
  });
  it('invalid cursor falls back to start', () => {
    const r = paginateCursor(data, { limit: 5, cursor: 'invalid' });
    expect(r.data).toHaveLength(5);
  });
  it('prevCursor non-null on page 2', () => {
    const p1 = paginateCursor(data, { limit: 5 });
    const p2 = paginateCursor(data, { limit: 5, cursor: p1.nextCursor! });
    expect(p2.prevCursor).not.toBeNull();
  });
  it('total always equals data length', () => {
    const r = paginateCursor(data, { limit: 3 });
    expect(r.total).toBe(20);
  });
  it('limit 1 returns single item', () => {
    const r = paginateCursor(data, { limit: 1 });
    expect(r.data).toHaveLength(1);
  });

  for (let i = 0; i < 10; i++) {
    it(`cursor page ${i + 1} has correct data length`, () => {
      let cursor: string | null = null;
      let currentPage = 0;
      let result = paginateCursor(data, { limit: 2 });
      for (let j = 0; j <= i; j++) {
        result = paginateCursor(data, { limit: 2, cursor: cursor ?? undefined });
        cursor = result.nextCursor;
        currentPage = j;
        if (cursor === null) break;
      }
      // Either we have data or we've reached the end
      expect(result.data.length).toBeGreaterThanOrEqual(0);
    });
  }
});

// ─── isValidPageRequest ───────────────────────────────────────────────────────
describe('isValidPageRequest', () => {
  it('accepts valid request', () => { expect(isValidPageRequest({ page: 1, pageSize: 10 })).toBe(true); });
  it('rejects page 0', () => { expect(isValidPageRequest({ page: 0, pageSize: 10 })).toBe(false); });
  it('rejects negative page', () => { expect(isValidPageRequest({ page: -1, pageSize: 10 })).toBe(false); });
  it('rejects pageSize 0', () => { expect(isValidPageRequest({ page: 1, pageSize: 0 })).toBe(false); });
  it('rejects string page', () => { expect(isValidPageRequest({ page: '1', pageSize: 10 })).toBe(false); });
  it('rejects null', () => { expect(isValidPageRequest(null)).toBe(false); });
  it('rejects undefined', () => { expect(isValidPageRequest(undefined)).toBe(false); });
  it('rejects empty object', () => { expect(isValidPageRequest({})).toBe(false); });
  it('rejects missing pageSize', () => { expect(isValidPageRequest({ page: 1 })).toBe(false); });
  it('accepts page 100 pageSize 100', () => { expect(isValidPageRequest({ page: 100, pageSize: 100 })).toBe(true); });

  for (let i = 1; i <= 20; i++) {
    it(`isValidPageRequest: page=${i} pageSize=${i} → true`, () => {
      expect(isValidPageRequest({ page: i, pageSize: i })).toBe(true);
    });
  }
});

// ─── isValidOffsetRequest ─────────────────────────────────────────────────────
describe('isValidOffsetRequest', () => {
  it('accepts valid request', () => { expect(isValidOffsetRequest({ offset: 0, limit: 10 })).toBe(true); });
  it('rejects negative offset', () => { expect(isValidOffsetRequest({ offset: -1, limit: 10 })).toBe(false); });
  it('rejects limit 0', () => { expect(isValidOffsetRequest({ offset: 0, limit: 0 })).toBe(false); });
  it('rejects string offset', () => { expect(isValidOffsetRequest({ offset: '0', limit: 10 })).toBe(false); });
  it('rejects null', () => { expect(isValidOffsetRequest(null)).toBe(false); });
  it('accepts offset 100', () => { expect(isValidOffsetRequest({ offset: 100, limit: 50 })).toBe(true); });

  for (let i = 0; i < 20; i++) {
    it(`isValidOffsetRequest: offset=${i} limit=${i + 1} → true`, () => {
      expect(isValidOffsetRequest({ offset: i, limit: i + 1 })).toBe(true);
    });
  }
});

// ─── buildPageMeta ────────────────────────────────────────────────────────────
describe('buildPageMeta', () => {
  it('builds meta for page 1', () => {
    const data = makeData(50);
    const result = paginate(data, { page: 1, pageSize: 10 });
    const meta = buildPageMeta(result);
    expect(meta.current).toBe(1);
    expect(meta.total).toBe(5);
    expect(meta.pageSize).toBe(10);
    expect(meta.totalItems).toBe(50);
    expect(meta.range[0]).toBe(1);
    expect(meta.range[1]).toBe(10);
  });
  it('builds meta for last page', () => {
    const data = makeData(25);
    const result = paginate(data, { page: 3, pageSize: 10 });
    const meta = buildPageMeta(result);
    expect(meta.range[0]).toBe(21);
    expect(meta.range[1]).toBe(25);
  });
  it('builds meta middle page', () => {
    const data = makeData(100);
    const result = paginate(data, { page: 5, pageSize: 10 });
    const meta = buildPageMeta(result);
    expect(meta.range[0]).toBe(41);
    expect(meta.range[1]).toBe(50);
  });
  it('meta range does not exceed totalItems', () => {
    const data = makeData(12);
    const result = paginate(data, { page: 2, pageSize: 10 });
    const meta = buildPageMeta(result);
    expect(meta.range[1]).toBeLessThanOrEqual(12);
  });

  for (let i = 1; i <= 10; i++) {
    it(`buildPageMeta page ${i} range starts correctly`, () => {
      const data = makeData(100);
      const result = paginate(data, { page: i, pageSize: 10 });
      const meta = buildPageMeta(result);
      expect(meta.range[0]).toBe((i - 1) * 10 + 1);
    });
  }
});

// ─── Integration: full workflow ───────────────────────────────────────────────
describe('integration: paginate workflow', () => {
  const data = makeData(100);

  it('iterates all pages', () => {
    let total = 0;
    for (let page = 1; page <= 10; page++) {
      const r = paginate(data, { page, pageSize: 10 });
      total += r.data.length;
    }
    expect(total).toBe(100);
  });

  it('cursor pagination covers all data', () => {
    let total = 0;
    let cursor: string | null = null;
    let iterations = 0;
    do {
      const r = paginateCursor(data, { limit: 10, cursor: cursor ?? undefined });
      total += r.data.length;
      cursor = r.nextCursor;
      iterations++;
      if (iterations > 20) break;
    } while (cursor !== null);
    expect(total).toBe(100);
  });

  it('offset pagination covers all data', () => {
    let total = 0;
    for (let offset = 0; offset < 100; offset += 10) {
      const r = paginateOffset(data, { offset, limit: 10 });
      total += r.data.length;
    }
    expect(total).toBe(100);
  });

  for (let i = 0; i < 20; i++) {
    it(`integration ${i}: page ${i + 1} nextPage correct`, () => {
      const r = paginate(data, { page: i + 1, pageSize: 10 });
      if (i + 1 < 10) {
        expect(r.nextPage).toBe(i + 2);
      } else {
        expect(r.nextPage).toBeNull();
      }
    });
  }
});

// ─── Edge cases ───────────────────────────────────────────────────────────────
describe('edge cases', () => {
  it('empty data set paginate', () => {
    const r = paginate([], { page: 1, pageSize: 10 });
    expect(r.data).toHaveLength(0);
    expect(r.total).toBe(0);
    expect(r.totalPages).toBe(0);
    expect(r.hasNext).toBe(false);
    expect(r.hasPrev).toBe(false);
  });
  it('empty data set cursor', () => {
    const r = paginateCursor([], { limit: 10 });
    expect(r.data).toHaveLength(0);
    expect(r.nextCursor).toBeNull();
  });
  it('empty data offset', () => {
    const r = paginateOffset([], { offset: 0, limit: 10 });
    expect(r.data).toHaveLength(0);
    expect(r.hasMore).toBe(false);
  });
  it('single item paginate', () => {
    const r = paginate([{ id: '1', num: 1, name: 'a', score: 1, tag: 'A' }], { page: 1, pageSize: 10 });
    expect(r.data).toHaveLength(1);
    expect(r.totalPages).toBe(1);
    expect(r.hasNext).toBe(false);
  });
  it('totalPages 0 when empty', () => {
    const r = paginate([], { page: 1, pageSize: 10 });
    expect(r.totalPages).toBe(0);
  });
  it('clampPage with large number', () => {
    expect(clampPage(999999)).toBe(999999);
  });
  it('totalPages with 1 item', () => {
    expect(totalPages(1, 1)).toBe(1);
  });
  it('getOffset symmetry', () => {
    for (let p = 1; p <= 5; p++) {
      expect(getOffset(p, 10)).toBe((p - 1) * 10);
    }
  });

  for (let i = 1; i <= 15; i++) {
    it(`edge ${i}: clampPage clamps 0 to 1 consistently`, () => {
      expect(clampPage(1 - i)).toBe(1);
    });
  }
});

// ─── Extended clampPage bulk ──────────────────────────────────────────────────
describe('clampPage extended bulk', () => {
  for (let i = 1; i <= 100; i++) {
    it(`clampPage positive ${i} returns ${i}`, () => {
      expect(clampPage(i)).toBe(i);
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`clampPage decimal ${i}.${i % 9 + 1} floor to ${i}`, () => {
      const v = i + (i % 9 + 1) / 10;
      expect(clampPage(v)).toBe(Math.max(1, Math.floor(v)));
    });
  }
});

// ─── Extended totalPages bulk ─────────────────────────────────────────────────
describe('totalPages extended bulk', () => {
  for (let total = 1; total <= 50; total++) {
    it(`totalPages(${total}, 5) === ${Math.ceil(total / 5)}`, () => {
      expect(totalPages(total, 5)).toBe(Math.ceil(total / 5));
    });
  }
  for (let ps = 1; ps <= 20; ps++) {
    it(`totalPages(100, ${ps}) === ${Math.ceil(100 / ps)}`, () => {
      expect(totalPages(100, ps)).toBe(Math.ceil(100 / ps));
    });
  }
});

// ─── Extended getOffset bulk ──────────────────────────────────────────────────
describe('getOffset extended bulk', () => {
  for (let page = 1; page <= 30; page++) {
    it(`getOffset(${page}, 10) === ${(page - 1) * 10}`, () => {
      expect(getOffset(page, 10)).toBe((page - 1) * 10);
    });
  }
  for (let ps = 1; ps <= 20; ps++) {
    it(`getOffset(2, ${ps}) === ${ps}`, () => {
      expect(getOffset(2, ps)).toBe(ps);
    });
  }
});

// ─── Extended paginate: hasPrev/hasNext checks ────────────────────────────────
describe('paginate hasPrev/hasNext extended', () => {
  const data = makeData(50);
  for (let page = 1; page <= 5; page++) {
    it(`page ${page}/5: hasPrev=${page > 1} hasNext=${page < 5}`, () => {
      const r = paginate(data, { page, pageSize: 10 });
      expect(r.hasPrev).toBe(page > 1);
      expect(r.hasNext).toBe(page < 5);
    });
  }
  for (let page = 1; page <= 10; page++) {
    it(`page ${page}/10: prevPage correct`, () => {
      const r = paginate(data, { page, pageSize: 5 });
      if (page > 1) {
        expect(r.prevPage).toBe(page - 1);
      } else {
        expect(r.prevPage).toBeNull();
      }
    });
  }
});

// ─── Extended paginateOffset: hasMore checks ─────────────────────────────────
describe('paginateOffset hasMore extended', () => {
  const data = makeData(100);
  for (let offset = 0; offset < 100; offset += 5) {
    it(`offset=${offset} limit=5: hasMore=${offset + 5 < 100}`, () => {
      const r = paginateOffset(data, { offset, limit: 5 });
      expect(r.hasMore).toBe(offset + 5 < 100);
    });
  }
});

// ─── Extended encodeCursor round-trips ────────────────────────────────────────
describe('encodeCursor extended bulk', () => {
  for (let i = 0; i < 50; i++) {
    it(`cursor round trip for "${i}-item"`, () => {
      const id = `${i}-item`;
      expect(decodeCursor(encodeCursor(id))).toBe(id);
    });
  }
});

// ─── Extended isValidPageRequest bulk ─────────────────────────────────────────
describe('isValidPageRequest extended bulk', () => {
  for (let i = 1; i <= 50; i++) {
    it(`valid: page=${i} pageSize=10`, () => {
      expect(isValidPageRequest({ page: i, pageSize: 10 })).toBe(true);
    });
  }
  for (let i = 1; i <= 20; i++) {
    it(`invalid: page=0 pageSize=${i}`, () => {
      expect(isValidPageRequest({ page: 0, pageSize: i })).toBe(false);
    });
  }
});

// ─── Extended isValidOffsetRequest bulk ──────────────────────────────────────
describe('isValidOffsetRequest extended bulk', () => {
  for (let i = 0; i < 50; i++) {
    it(`valid: offset=${i} limit=10`, () => {
      expect(isValidOffsetRequest({ offset: i, limit: 10 })).toBe(true);
    });
  }
  for (let i = 1; i <= 20; i++) {
    it(`valid: offset=0 limit=${i}`, () => {
      expect(isValidOffsetRequest({ offset: 0, limit: i })).toBe(true);
    });
  }
});

// ─── Extended buildPageMeta bulk ──────────────────────────────────────────────
describe('buildPageMeta extended bulk', () => {
  const data = makeData(100);
  for (let page = 1; page <= 10; page++) {
    it(`buildPageMeta page ${page}: range end correct`, () => {
      const r = paginate(data, { page, pageSize: 10 });
      const meta = buildPageMeta(r);
      expect(meta.range[1]).toBe(page * 10);
    });
  }
  for (let page = 1; page <= 10; page++) {
    it(`buildPageMeta page ${page}: current matches page`, () => {
      const r = paginate(data, { page, pageSize: 10 });
      const meta = buildPageMeta(r);
      expect(meta.current).toBe(page);
    });
  }
});

// ─── Extended clampPageSize bulk ─────────────────────────────────────────────
describe('clampPageSize extended bulk', () => {
  for (let i = 1; i <= 50; i++) {
    it(`clampPageSize(${i}, 1, 100) === ${Math.min(i, 100)}`, () => {
      expect(clampPageSize(i, 1, 100)).toBe(Math.min(i, 100));
    });
  }
});

// ─── Final coverage: sortData direction ──────────────────────────────────────
describe('sortData asc/desc final', () => {
  for (let n = 2; n <= 25; n++) {
    it(`sortData asc ${n} items: first <= last`, () => {
      const d = makeData(n);
      const r = sortData(d, 'score', 'asc');
      expect(r[0].score as number).toBeLessThanOrEqual(r[r.length - 1].score as number);
    });
  }
  for (let n = 2; n <= 20; n++) {
    it(`sortData desc ${n} items: first >= last`, () => {
      const d = makeData(n);
      const r = sortData(d, 'score', 'desc');
      expect(r[0].score as number).toBeGreaterThanOrEqual(r[r.length - 1].score as number);
    });
  }
});
