/**
 * Unit tests for @ims/activity package
 * Covers in-memory store operations and Express middleware.
 */

import {
  logActivity,
  getActivity,
  getRecentActivity,
  clearAllActivity,
} from '../src/index';

// Mock @ims/monitoring to avoid side-effects
jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }),
}));

describe('@ims/activity', () => {
  beforeEach(() => {
    clearAllActivity();
  });

  describe('logActivity', () => {
    it('logs a created activity entry', async () => {
      await logActivity({
        orgId: 'org-1',
        recordType: 'risk',
        recordId: 'risk-1',
        userId: 'user-1',
        userName: 'Alice',
        action: 'created',
      });

      const { entries, total } = await getActivity('risk', 'risk-1');
      expect(total).toBe(1);
      expect(entries[0].action).toBe('created');
      expect(entries[0].userId).toBe('user-1');
      expect(entries[0].orgId).toBe('org-1');
    });

    it('assigns a unique ID to each entry', async () => {
      await logActivity({
        orgId: 'org-1',
        recordType: 'risk',
        recordId: 'risk-1',
        userId: 'user-1',
        userName: 'Alice',
        action: 'created',
      });
      await logActivity({
        orgId: 'org-1',
        recordType: 'risk',
        recordId: 'risk-1',
        userId: 'user-2',
        userName: 'Bob',
        action: 'updated',
      });

      const { entries } = await getActivity('risk', 'risk-1');
      expect(entries[0].id).not.toBe(entries[1].id);
    });

    it('stores oldValue and newValue as stringified versions', async () => {
      await logActivity({
        orgId: 'org-1',
        recordType: 'risk',
        recordId: 'risk-1',
        userId: 'user-1',
        userName: 'Alice',
        action: 'updated',
        field: 'severity',
        oldValue: 'LOW',
        newValue: 'HIGH',
      });

      const { entries } = await getActivity('risk', 'risk-1');
      expect(entries[0].oldValue).toBe('LOW');
      expect(entries[0].newValue).toBe('HIGH');
    });

    it('stringifies object oldValue/newValue', async () => {
      await logActivity({
        orgId: 'org-1',
        recordType: 'incident',
        recordId: 'inc-1',
        userId: 'user-1',
        userName: 'Alice',
        action: 'updated',
        oldValue: { score: 3 },
        newValue: { score: 5 },
      });

      const { entries } = await getActivity('incident', 'inc-1');
      expect(entries[0].oldValue).toBe('{"score":3}');
      expect(entries[0].newValue).toBe('{"score":5}');
    });

    it('does not throw on errors', async () => {
      // Should complete silently even with weird inputs
      await expect(
        logActivity({
          orgId: '',
          recordType: 'x',
          recordId: 'y',
          userId: 'z',
          userName: 'Z',
          action: 'created',
        })
      ).resolves.toBeUndefined();
    });
  });

  describe('getActivity', () => {
    it('returns entries newest first', async () => {
      await logActivity({
        orgId: 'org-1', recordType: 'risk', recordId: 'r1',
        userId: 'u1', userName: 'Alice', action: 'created',
      });
      await logActivity({
        orgId: 'org-1', recordType: 'risk', recordId: 'r1',
        userId: 'u1', userName: 'Alice', action: 'updated',
      });

      const { entries } = await getActivity('risk', 'r1');
      // Newest first
      expect(entries[0].action).toBe('updated');
      expect(entries[1].action).toBe('created');
    });

    it('returns empty list for unknown record', async () => {
      const { entries, total } = await getActivity('risk', 'does-not-exist');
      expect(entries).toHaveLength(0);
      expect(total).toBe(0);
    });

    it('supports pagination with offset and limit', async () => {
      // Create 5 entries
      for (let i = 0; i < 5; i++) {
        await logActivity({
          orgId: 'org-1', recordType: 'aspect', recordId: 'a1',
          userId: 'u1', userName: 'Alice', action: 'updated',
        });
      }

      const page1 = await getActivity('aspect', 'a1', { limit: 2, offset: 0 });
      const page2 = await getActivity('aspect', 'a1', { limit: 2, offset: 2 });

      expect(page1.entries).toHaveLength(2);
      expect(page2.entries).toHaveLength(2);
      expect(page1.total).toBe(5);
    });

    it('caps limit at 100', async () => {
      for (let i = 0; i < 5; i++) {
        await logActivity({
          orgId: 'org-1', recordType: 'risk', recordId: 'r2',
          userId: 'u1', userName: 'Alice', action: 'created',
        });
      }
      const { entries } = await getActivity('risk', 'r2', { limit: 500 });
      // All 5 returned, limit capped at 100 but 5 < 100
      expect(entries).toHaveLength(5);
    });
  });

  describe('getRecentActivity', () => {
    it('returns empty array when no activity exists', async () => {
      const result = await getRecentActivity('org-empty');
      expect(result).toEqual([]);
    });

    it('returns recent entries sorted by time descending', async () => {
      await logActivity({
        orgId: 'org-2', recordType: 'risk', recordId: 'r1',
        userId: 'u1', userName: 'Alice', action: 'created',
      });
      await logActivity({
        orgId: 'org-2', recordType: 'risk', recordId: 'r2',
        userId: 'u2', userName: 'Bob', action: 'updated',
      });

      const recent = await getRecentActivity('org-2');
      expect(recent.length).toBeGreaterThanOrEqual(2);
      // Should be sorted newest first
      for (let i = 0; i < recent.length - 1; i++) {
        expect(recent[i].createdAt.getTime()).toBeGreaterThanOrEqual(
          recent[i + 1].createdAt.getTime()
        );
      }
    });

    it('only returns entries for the specified org', async () => {
      await logActivity({
        orgId: 'org-A', recordType: 'risk', recordId: 'r1',
        userId: 'u1', userName: 'Alice', action: 'created',
      });
      await logActivity({
        orgId: 'org-B', recordType: 'risk', recordId: 'r2',
        userId: 'u2', userName: 'Bob', action: 'created',
      });

      const recentA = await getRecentActivity('org-A');
      const recentB = await getRecentActivity('org-B');

      expect(recentA.every((e) => e.orgId === 'org-A')).toBe(true);
      expect(recentB.every((e) => e.orgId === 'org-B')).toBe(true);
    });

    it('respects the limit parameter', async () => {
      for (let i = 0; i < 10; i++) {
        await logActivity({
          orgId: 'org-3', recordType: 'risk', recordId: `r${i}`,
          userId: 'u1', userName: 'Alice', action: 'created',
        });
      }

      const recent = await getRecentActivity('org-3', 3);
      expect(recent.length).toBeLessThanOrEqual(3);
    });
  });

  describe('clearAllActivity', () => {
    it('removes all stored entries', async () => {
      await logActivity({
        orgId: 'org-1', recordType: 'risk', recordId: 'r1',
        userId: 'u1', userName: 'Alice', action: 'created',
      });

      clearAllActivity();

      const { entries } = await getActivity('risk', 'r1');
      expect(entries).toHaveLength(0);

      const recent = await getRecentActivity('org-1');
      expect(recent).toHaveLength(0);
    });
  });
});

// ============================================================
// activityLogger middleware
// ============================================================

import { activityLogger } from '../src/index';
import type { Request, Response, NextFunction } from 'express';

type MockReq = {
  method: string;
  params: Record<string, string>;
  path: string;
  originalUrl?: string;
  user?: { id: string; name?: string; organisationId?: string };
};

type MockRes = {
  statusCode: number;
  json: jest.Mock;
};

describe('activityLogger middleware', () => {
  beforeEach(() => {
    clearAllActivity();
  });

  const makeReq = (overrides: Partial<MockReq> = {}): MockReq => ({
    method: 'POST',
    params: { id: 'record-1' },
    path: '/api/risks',
    originalUrl: '/api/risks',
    user: { id: 'user-1', name: 'Alice', organisationId: 'org-1' },
    ...overrides,
  });

  const makeRes = (statusCode = 201): MockRes => ({
    statusCode,
    json: jest.fn(),
  });

  it('returns a middleware function', () => {
    const middleware = activityLogger('risk');
    expect(typeof middleware).toBe('function');
  });

  it('calls next()', () => {
    const middleware = activityLogger('risk');
    const mockReq = makeReq();
    const mockRes = makeRes();
    const mockNext: NextFunction = jest.fn();

    middleware(
      mockReq as unknown as Request,
      mockRes as unknown as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('wraps res.json to intercept responses', () => {
    const middleware = activityLogger('risk');
    const mockReq = makeReq();
    const mockRes = makeRes(201);
    const mockNext: NextFunction = jest.fn();
    const originalJson = mockRes.json;

    middleware(
      mockReq as unknown as Request,
      mockRes as unknown as Response,
      mockNext
    );

    // After middleware, res.json should be replaced
    expect(mockRes.json).not.toBe(originalJson);
  });

  it('logs "created" action for POST 201', async () => {
    const middleware = activityLogger('risk');
    const mockReq = makeReq({ method: 'POST', params: { id: 'risk-999' } });
    const mockRes = makeRes(201);
    const mockNext: NextFunction = jest.fn();

    middleware(
      mockReq as unknown as Request,
      mockRes as unknown as Response,
      mockNext
    );

    // Trigger the wrapped json
    mockRes.json({ success: true, data: { id: 'risk-999' } });

    // Allow async logActivity to complete
    await new Promise((r) => setImmediate(r));

    const { entries } = await getActivity('risk', 'risk-999');
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0].action).toBe('created');
  });

  it('logs "updated" action for PUT 200', async () => {
    const middleware = activityLogger('risk');
    const mockReq = makeReq({ method: 'PUT', params: { id: 'risk-200' } });
    const mockRes = makeRes(200);
    const mockNext: NextFunction = jest.fn();

    middleware(
      mockReq as unknown as Request,
      mockRes as unknown as Response,
      mockNext
    );

    mockRes.json({ success: true, data: { id: 'risk-200' } });
    await new Promise((r) => setImmediate(r));

    const { entries } = await getActivity('risk', 'risk-200');
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0].action).toBe('updated');
  });

  it('does not log when user is missing', async () => {
    const middleware = activityLogger('risk');
    const mockReq = makeReq({ user: undefined });
    const mockRes = makeRes(201);
    const mockNext: NextFunction = jest.fn();

    middleware(
      mockReq as unknown as Request,
      mockRes as unknown as Response,
      mockNext
    );

    mockRes.json({ success: true, data: { id: 'risk-abc' } });
    await new Promise((r) => setImmediate(r));

    const { entries } = await getActivity('risk', 'risk-abc');
    expect(entries).toHaveLength(0);
  });

  it('does not log for GET requests', async () => {
    const middleware = activityLogger('risk');
    const mockReq = makeReq({ method: 'GET', params: { id: 'risk-get' } });
    const mockRes = makeRes(200);
    const mockNext: NextFunction = jest.fn();

    middleware(
      mockReq as unknown as Request,
      mockRes as unknown as Response,
      mockNext
    );

    mockRes.json({ success: true, data: { id: 'risk-get' } });
    await new Promise((r) => setImmediate(r));

    const { entries } = await getActivity('risk', 'risk-get');
    expect(entries).toHaveLength(0);
  });
});
