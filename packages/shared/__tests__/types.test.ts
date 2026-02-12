/**
 * Shared utility tests
 * Tests: parsePagination, parsePaginationWithTake, paginationMeta
 */
import { parsePagination, paginationMeta, parsePaginationWithTake } from '../src';
import type { PaginatedResponse, AuthUser } from '../src';

describe('parsePagination', () => {
  it('returns defaults when no query params provided', () => {
    const result = parsePagination({});
    expect(result).toEqual({ page: 1, limit: 20, skip: 0 });
  });

  it('calculates correct skip for page 2', () => {
    const result = parsePagination({ page: '2', limit: '10' });
    expect(result.skip).toBe(10);
    expect(result.limit).toBe(10);
  });

  it('caps limit at 100', () => {
    const result = parsePagination({ limit: '999' });
    expect(result.limit).toBe(100);
  });

  it('enforces minimum page of 1', () => {
    const result = parsePagination({ page: '0' });
    expect(result.page).toBe(1);
    expect(result.skip).toBe(0);
  });

  it('handles negative page gracefully', () => {
    const result = parsePagination({ page: '-5' });
    expect(result.page).toBe(1);
  });

  it('handles string number input', () => {
    const result = parsePagination({ page: '3', limit: '25' });
    expect(result.skip).toBe(50);
  });

  it('handles NaN input gracefully', () => {
    const result = parsePagination({ page: 'abc', limit: 'xyz' });
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });
});

describe('parsePaginationWithTake', () => {
  it('returns defaults with take alias', () => {
    const result = parsePaginationWithTake({});
    expect(result).toEqual({ page: 1, limit: 20, skip: 0, take: 20 });
  });

  it('take equals limit', () => {
    const result = parsePaginationWithTake({ page: '2', limit: '15' });
    expect(result.take).toBe(15);
    expect(result.take).toBe(result.limit);
    expect(result.skip).toBe(15);
  });

  it('caps limit/take at 100', () => {
    const result = parsePaginationWithTake({ limit: '500' });
    expect(result.take).toBe(100);
    expect(result.limit).toBe(100);
  });

  it('enforces minimum page of 1', () => {
    const result = parsePaginationWithTake({ page: '0' });
    expect(result.page).toBe(1);
    expect(result.skip).toBe(0);
  });
});

describe('paginationMeta', () => {
  it('calculates totalPages correctly', () => {
    const meta = paginationMeta(1, 20, 100);
    expect(meta).toEqual({ page: 1, limit: 20, total: 100, totalPages: 5 });
  });

  it('rounds up totalPages', () => {
    const meta = paginationMeta(1, 20, 45);
    expect(meta.totalPages).toBe(3);
  });

  it('handles zero total', () => {
    const meta = paginationMeta(1, 20, 0);
    expect(meta.totalPages).toBe(0);
  });

  it('handles single page', () => {
    const meta = paginationMeta(1, 20, 15);
    expect(meta.totalPages).toBe(1);
  });
});

describe('Type definitions', () => {
  it('PaginatedResponse has correct shape', () => {
    const response: PaginatedResponse<{ id: string }> = {
      success: true,
      data: [{ id: '1' }],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    };
    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(1);
    expect(response.meta.totalPages).toBe(1);
  });

  it('AuthUser has correct shape', () => {
    const user: AuthUser = {
      id: 'user-123',
      email: 'test@ims.local',
      role: 'ADMIN',
    };
    expect(user.role).toBe('ADMIN');
    expect(user.organisationId).toBeUndefined();
  });

  it('AuthUser accepts all valid roles', () => {
    const roles: AuthUser['role'][] = ['ADMIN', 'MANAGER', 'USER', 'VIEWER'];
    roles.forEach((role) => {
      const user: AuthUser = { id: '1', email: 'test@ims.local', role };
      expect(user.role).toBe(role);
    });
  });
});
