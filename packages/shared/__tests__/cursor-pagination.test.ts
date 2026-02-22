/**
 * Tests for cursor-based pagination utilities.
 * Covers: parseCursorParams, buildCursorQuery, formatCursorResult.
 */

import { parseCursorParams, buildCursorQuery, formatCursorResult } from '../src/cursor-pagination';

// ── parseCursorParams ──────────────────────────────────────────────────────────

describe('parseCursorParams', () => {
  it('returns defaults when query is empty', () => {
    const params = parseCursorParams({});
    expect(params).toEqual({
      cursor: undefined,
      limit: 20,
      direction: 'desc',
      sortBy: 'createdAt',
    });
  });

  it('parses a cursor string', () => {
    const params = parseCursorParams({ cursor: 'cursor-abc-123' });
    expect(params.cursor).toBe('cursor-abc-123');
  });

  it('ignores empty cursor string', () => {
    const params = parseCursorParams({ cursor: '' });
    expect(params.cursor).toBeUndefined();
  });

  it('parses limit within 1–100', () => {
    expect(parseCursorParams({ limit: '50' }).limit).toBe(50);
  });

  it('clamps limit to 1 when below minimum', () => {
    expect(parseCursorParams({ limit: '0' }).limit).toBe(1);
    expect(parseCursorParams({ limit: '-5' }).limit).toBe(1);
  });

  it('clamps limit to 100 when above maximum', () => {
    expect(parseCursorParams({ limit: '999' }).limit).toBe(100);
    expect(parseCursorParams({ limit: '101' }).limit).toBe(100);
  });

  it('defaults limit to 20 when non-numeric', () => {
    expect(parseCursorParams({ limit: 'abc' }).limit).toBe(20);
    expect(parseCursorParams({ limit: '' }).limit).toBe(20);
  });

  it('parses direction=asc', () => {
    expect(parseCursorParams({ direction: 'asc' }).direction).toBe('asc');
  });

  it('defaults direction to desc for unknown values', () => {
    expect(parseCursorParams({ direction: 'random' }).direction).toBe('desc');
    expect(parseCursorParams({}).direction).toBe('desc');
  });

  it('parses custom sortBy field', () => {
    expect(parseCursorParams({ sortBy: 'updatedAt' }).sortBy).toBe('updatedAt');
  });

  it('defaults sortBy to createdAt when empty or missing', () => {
    expect(parseCursorParams({ sortBy: '' }).sortBy).toBe('createdAt');
    expect(parseCursorParams({}).sortBy).toBe('createdAt');
  });

  it('parses all fields together', () => {
    const params = parseCursorParams({
      cursor: 'c-xyz',
      limit: '10',
      direction: 'asc',
      sortBy: 'name',
    });
    expect(params).toEqual({
      cursor: 'c-xyz',
      limit: 10,
      direction: 'asc',
      sortBy: 'name',
    });
  });
});

// ── buildCursorQuery ───────────────────────────────────────────────────────────

describe('buildCursorQuery', () => {
  it('returns take = limit + 1 (extra item for hasMore detection)', () => {
    const query = buildCursorQuery({ cursor: undefined, limit: 20, direction: 'desc', sortBy: 'createdAt' });
    expect(query.take).toBe(21);
  });

  it('returns correct orderBy for direction and sortBy', () => {
    const query = buildCursorQuery({ cursor: undefined, limit: 10, direction: 'asc', sortBy: 'updatedAt' });
    expect(query.orderBy).toEqual({ updatedAt: 'asc' });
  });

  it('omits cursor and skip when no cursor provided', () => {
    const query = buildCursorQuery({ cursor: undefined, limit: 10, direction: 'desc', sortBy: 'createdAt' });
    expect(query.cursor).toBeUndefined();
    expect(query.skip).toBeUndefined();
  });

  it('sets cursor and skip=1 when cursor provided', () => {
    const query = buildCursorQuery({ cursor: 'item-99', limit: 10, direction: 'desc', sortBy: 'createdAt' });
    expect(query.cursor).toEqual({ id: 'item-99' });
    expect(query.skip).toBe(1);
  });

  it('uses limit + 1 consistently with any limit', () => {
    expect(buildCursorQuery({ cursor: undefined, limit: 1, direction: 'desc', sortBy: 'id' }).take).toBe(2);
    expect(buildCursorQuery({ cursor: undefined, limit: 100, direction: 'desc', sortBy: 'id' }).take).toBe(101);
  });
});

// ── formatCursorResult ─────────────────────────────────────────────────────────

describe('formatCursorResult', () => {
  function makeItems(count: number): { id: string }[] {
    return Array.from({ length: count }, (_, i) => ({ id: `item-${i + 1}` }));
  }

  const params = { cursor: undefined, limit: 5, direction: 'desc' as const, sortBy: 'createdAt' };

  it('returns data trimmed to limit when hasMore', () => {
    // 6 items fetched with limit=5 → 6 = limit+1 → hasMore=true
    const result = formatCursorResult(makeItems(6), params);
    expect(result.data).toHaveLength(5);
  });

  it('sets hasMore=true when extra item exists', () => {
    const result = formatCursorResult(makeItems(6), params);
    expect(result.meta.hasMore).toBe(true);
  });

  it('sets hasMore=false when fewer or equal items than limit', () => {
    expect(formatCursorResult(makeItems(5), params).meta.hasMore).toBe(false);
    expect(formatCursorResult(makeItems(3), params).meta.hasMore).toBe(false);
    expect(formatCursorResult(makeItems(0), params).meta.hasMore).toBe(false);
  });

  it('sets nextCursor to last item id when hasMore=true', () => {
    const items = makeItems(6);
    const result = formatCursorResult(items, params);
    // Last item in trimmed data is item-5
    expect(result.meta.nextCursor).toBe('item-5');
  });

  it('sets nextCursor=null when no more items', () => {
    const result = formatCursorResult(makeItems(3), params);
    expect(result.meta.nextCursor).toBeNull();
  });

  it('sets prevCursor to the incoming cursor', () => {
    const paramsWithCursor = { ...params, cursor: 'prev-cursor-id' };
    const result = formatCursorResult(makeItems(3), paramsWithCursor);
    expect(result.meta.prevCursor).toBe('prev-cursor-id');
  });

  it('sets prevCursor=null when no cursor (first page)', () => {
    const result = formatCursorResult(makeItems(3), params);
    expect(result.meta.prevCursor).toBeNull();
  });

  it('sets count to the number of returned items', () => {
    expect(formatCursorResult(makeItems(6), params).meta.count).toBe(5);
    expect(formatCursorResult(makeItems(3), params).meta.count).toBe(3);
    expect(formatCursorResult(makeItems(0), params).meta.count).toBe(0);
  });

  it('sets limit to the requested limit', () => {
    expect(formatCursorResult(makeItems(3), params).meta.limit).toBe(5);
  });

  it('handles empty results gracefully', () => {
    const result = formatCursorResult([], params);
    expect(result.data).toEqual([]);
    expect(result.meta.hasMore).toBe(false);
    expect(result.meta.nextCursor).toBeNull();
    expect(result.meta.count).toBe(0);
    expect(result.meta.prevCursor).toBeNull();
  });

  it('preserves prevCursor from incoming cursor even when data is empty', () => {
    const paramsWithCursor = { ...params, cursor: 'last-page-cursor' };
    const result = formatCursorResult([], paramsWithCursor);
    expect(result.data).toEqual([]);
    expect(result.meta.hasMore).toBe(false);
    expect(result.meta.nextCursor).toBeNull();
    expect(result.meta.prevCursor).toBe('last-page-cursor');
  });

  it('parseCursorParams handles numeric limit value (not string)', () => {
    // parseInt(50, 10) = 50 — numbers coerce correctly
    expect(parseCursorParams({ limit: 50 as unknown as string }).limit).toBe(50);
  });

  it('works with typed items beyond id field', () => {
    const typedItems = [
      { id: 'a1', name: 'Alice', value: 42 },
      { id: 'a2', name: 'Bob', value: 7 },
    ];
    const result = formatCursorResult(typedItems, { ...params, limit: 3 });
    expect(result.data).toHaveLength(2);
    expect(result.data[0].name).toBe('Alice');
  });
});

// ── Integration: parseCursorParams → buildCursorQuery → formatCursorResult ─────

describe('cursor pagination integration', () => {
  it('full pipeline with no cursor produces correct first-page result', () => {
    const params = parseCursorParams({ limit: '3', direction: 'asc', sortBy: 'id' });
    const query = buildCursorQuery(params);
    // Simulate db returning limit+1 items (4)
    const dbItems = [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
      { id: 'd' }, // extra
    ];
    const result = formatCursorResult(dbItems, params);

    expect(query.take).toBe(4);
    expect(query.orderBy).toEqual({ id: 'asc' });
    expect(result.data).toHaveLength(3);
    expect(result.meta.hasMore).toBe(true);
    expect(result.meta.nextCursor).toBe('c');
    expect(result.meta.prevCursor).toBeNull();
  });

  it('full pipeline with cursor produces correct second-page result', () => {
    const params = parseCursorParams({ limit: '3', cursor: 'c', direction: 'asc', sortBy: 'id' });
    const query = buildCursorQuery(params);
    // Simulate db returning exactly limit items (no extra → no more pages)
    const dbItems = [{ id: 'd' }, { id: 'e' }, { id: 'f' }];
    const result = formatCursorResult(dbItems, params);

    expect(query.cursor).toEqual({ id: 'c' });
    expect(query.skip).toBe(1);
    expect(result.data).toHaveLength(3);
    expect(result.meta.hasMore).toBe(false);
    expect(result.meta.nextCursor).toBeNull();
    expect(result.meta.prevCursor).toBe('c');
  });
});

describe('cursor-pagination — additional coverage', () => {
  it('parseCursorParams direction=desc is preserved', () => {
    const params = parseCursorParams({ direction: 'desc' });
    expect(params.direction).toBe('desc');
  });

  it('buildCursorQuery sets correct orderBy direction for desc', () => {
    const query = buildCursorQuery({ cursor: undefined, limit: 5, direction: 'desc', sortBy: 'name' });
    expect(query.orderBy).toEqual({ name: 'desc' });
  });

  it('formatCursorResult limit=1 with 2 items shows hasMore=true and 1 item', () => {
    const params = { cursor: undefined, limit: 1, direction: 'desc' as const, sortBy: 'createdAt' };
    const result = formatCursorResult([{ id: 'x1' }, { id: 'x2' }], params);
    expect(result.data).toHaveLength(1);
    expect(result.meta.hasMore).toBe(true);
    expect(result.meta.nextCursor).toBe('x1');
  });

  it('parseCursorParams returns exact limit=100 when limit="100"', () => {
    expect(parseCursorParams({ limit: '100' }).limit).toBe(100);
  });

  it('buildCursorQuery with limit=50 returns take=51', () => {
    const query = buildCursorQuery({ cursor: undefined, limit: 50, direction: 'asc', sortBy: 'createdAt' });
    expect(query.take).toBe(51);
  });
});
