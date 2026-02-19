/**
 * RBAC ownership middleware tests
 * Tests: requireRole, checkOwnership, scopeToUser
 */
import { Request, Response, NextFunction } from 'express';
import { requireRole, checkOwnership, scopeToUser, PrismaModelDelegate } from '../src/ownership';

// Mock request factory
function mockReq(overrides: Record<string, unknown> = {}): Request {
  return {
    params: {},
    headers: {},
    ...overrides,
  } as unknown as Request;
}

function mockRes(): { status: jest.Mock; json: jest.Mock; res: Response } {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  return { status, json, res: { status, json } as unknown as Response };
}

let next: jest.Mock;

beforeEach(() => {
  next = jest.fn();
});

// ── requireRole ────────────────────────────────────────────────────────────
describe('requireRole', () => {
  it('allows ADMIN to access ADMIN route', () => {
    const req = mockReq({ user: { id: '1', role: 'ADMIN', email: 'a@b.com' } });
    const { res } = mockRes();
    requireRole('ADMIN')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('rejects USER from ADMIN route with 403', () => {
    const req = mockReq({ user: { id: '1', role: 'USER', email: 'a@b.com' } });
    const { status } = mockRes();
    requireRole('ADMIN')(req, { status } as unknown as Response, next);
    expect(status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects VIEWER from USER route with 403', () => {
    const req = mockReq({ user: { id: '1', role: 'VIEWER', email: 'a@b.com' } });
    const { status } = mockRes();
    requireRole('USER')(req, { status } as unknown as Response, next);
    expect(status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows MANAGER to access USER route', () => {
    const req = mockReq({ user: { id: '1', role: 'MANAGER', email: 'a@b.com' } });
    const { res } = mockRes();
    requireRole('USER')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('allows ADMIN to access MANAGER route', () => {
    const req = mockReq({ user: { id: '1', role: 'ADMIN', email: 'a@b.com' } });
    const { res } = mockRes();
    requireRole('MANAGER')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('allows USER to access USER route', () => {
    const req = mockReq({ user: { id: '1', role: 'USER', email: 'a@b.com' } });
    const { res } = mockRes();
    requireRole('USER')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('allows VIEWER to access VIEWER route', () => {
    const req = mockReq({ user: { id: '1', role: 'VIEWER', email: 'a@b.com' } });
    const { res } = mockRes();
    requireRole('VIEWER')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 when no user on request', () => {
    const req = mockReq();
    const { status } = mockRes();
    requireRole('USER')(req, { status } as unknown as Response, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 with INSUFFICIENT_ROLE code', () => {
    const req = mockReq({ user: { id: '1', role: 'USER', email: 'a@b.com' } });
    const { status, json } = mockRes();
    requireRole('ADMIN')(req, { status } as unknown as Response, next);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'INSUFFICIENT_ROLE' }),
      })
    );
  });

  it('returns 401 with AUTHENTICATION_REQUIRED code', () => {
    const req = mockReq();
    const { status, json } = mockRes();
    requireRole('USER')(req, { status } as unknown as Response, next);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'AUTHENTICATION_REQUIRED' }),
      })
    );
  });
});

// ── checkOwnership ─────────────────────────────────────────────────────────
describe('checkOwnership', () => {
  const mockModel = (record: Record<string, unknown> | null) => ({
    findUnique: jest.fn().mockResolvedValue(record),
  });

  it('allows owner to access their own record', async () => {
    const userId = 'user-123';
    const req = mockReq({
      user: { id: userId, role: 'USER', email: 'a@b.com' },
      params: { id: 'record-456' },
    });
    const { res } = mockRes();
    const middleware = checkOwnership(mockModel({ createdBy: userId }) as unknown as PrismaModelDelegate);
    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('blocks non-owner with 403', async () => {
    const req = mockReq({
      user: { id: 'user-999', role: 'USER', email: 'a@b.com' },
      params: { id: 'record-456' },
    });
    const { status } = mockRes();
    const middleware = checkOwnership(mockModel({ createdBy: 'user-123' }) as unknown as PrismaModelDelegate);
    await middleware(req, { status } as unknown as Response, next);
    expect(status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows ADMIN to access any record', async () => {
    const req = mockReq({
      user: { id: 'admin-1', role: 'ADMIN', email: 'admin@ims.local' },
      params: { id: 'record-456' },
    });
    const { res } = mockRes();
    const model = mockModel({ createdBy: 'user-123' });
    const middleware = checkOwnership(model as PrismaModelDelegate);
    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    // ADMIN bypass means findUnique is never called
    expect(model.findUnique).not.toHaveBeenCalled();
  });

  it('allows MANAGER to bypass ownership check', async () => {
    const req = mockReq({
      user: { id: 'mgr-1', role: 'MANAGER', email: 'm@b.com' },
      params: { id: 'record-456' },
    });
    const { res } = mockRes();
    const model = mockModel({ createdBy: 'other-user' });
    const middleware = checkOwnership(model as PrismaModelDelegate);
    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(model.findUnique).not.toHaveBeenCalled();
  });

  it('returns 404 when record not found', async () => {
    const req = mockReq({
      user: { id: 'user-1', role: 'USER', email: 'a@b.com' },
      params: { id: 'nonexistent' },
    });
    const { status, json } = mockRes();
    const middleware = checkOwnership(mockModel(null) as unknown as PrismaModelDelegate);
    await middleware(req, { status } as unknown as Response, next);
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'RECORD_NOT_FOUND' }),
      })
    );
  });

  it('returns 401 when no user on request', async () => {
    const req = mockReq({ params: { id: 'record-456' } });
    const { status } = mockRes();
    const middleware = checkOwnership(mockModel({ createdBy: 'user-1' }) as unknown as PrismaModelDelegate);
    await middleware(req, { status } as unknown as Response, next);
    expect(status).toHaveBeenCalledWith(401);
  });

  it('returns 403 with OWNERSHIP_REQUIRED code', async () => {
    const req = mockReq({
      user: { id: 'user-999', role: 'USER', email: 'a@b.com' },
      params: { id: 'record-456' },
    });
    const { status, json } = mockRes();
    const middleware = checkOwnership(mockModel({ createdBy: 'user-123' }) as unknown as PrismaModelDelegate);
    await middleware(req, { status } as unknown as Response, next);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'OWNERSHIP_REQUIRED' }),
      })
    );
  });

  it('uses custom ownerField when specified', async () => {
    const userId = 'user-123';
    const req = mockReq({
      user: { id: userId, role: 'USER', email: 'a@b.com' },
      params: { id: 'record-456' },
    });
    const { res } = mockRes();
    const model = mockModel({ ownerId: userId });
    const middleware = checkOwnership(model as unknown as PrismaModelDelegate, 'ownerId');
    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(model.findUnique).toHaveBeenCalledWith({
      where: { id: 'record-456' },
      select: { ownerId: true },
    });
  });

  it('returns 500 on database error', async () => {
    const req = mockReq({
      user: { id: 'user-1', role: 'USER', email: 'a@b.com' },
      params: { id: 'record-456' },
    });
    const { status, json } = mockRes();
    const model = { findUnique: jest.fn().mockRejectedValue(new Error('DB error')) };
    const middleware = checkOwnership(model as PrismaModelDelegate);
    await middleware(req, { status } as unknown as Response, next);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'OWNERSHIP_CHECK_FAILED' }),
      })
    );
  });

  it('VIEWER cannot bypass ownership check', async () => {
    const req = mockReq({
      user: { id: 'viewer-1', role: 'VIEWER', email: 'v@b.com' },
      params: { id: 'record-456' },
    });
    const { status } = mockRes();
    const model = mockModel({ createdBy: 'user-123' });
    const middleware = checkOwnership(model as PrismaModelDelegate);
    await middleware(req, { status } as unknown as Response, next);
    expect(status).toHaveBeenCalledWith(403);
    expect(model.findUnique).toHaveBeenCalled();
  });
});

// ── scopeToUser ────────────────────────────────────────────────────────────
describe('scopeToUser', () => {
  it('sets ownerFilter to empty object for ADMIN', () => {
    const req = mockReq({
      user: { id: 'admin-1', role: 'ADMIN', email: 'a@b.com' },
    });
    const { res } = mockRes();
    scopeToUser(req, res, next);
    expect((req as { ownerFilter?: Record<string, string> }).ownerFilter).toEqual({});
    expect(next).toHaveBeenCalled();
  });

  it('sets ownerFilter to createdBy for USER', () => {
    const userId = 'user-123';
    const req = mockReq({
      user: { id: userId, role: 'USER', email: 'u@b.com' },
    });
    const { res } = mockRes();
    scopeToUser(req, res, next);
    expect((req as { ownerFilter?: Record<string, string> }).ownerFilter).toEqual({ createdBy: userId });
    expect(next).toHaveBeenCalled();
  });

  it('sets ownerFilter to empty for MANAGER', () => {
    const req = mockReq({
      user: { id: 'mgr-1', role: 'MANAGER', email: 'm@b.com' },
    });
    const { res } = mockRes();
    scopeToUser(req, res, next);
    expect((req as { ownerFilter?: Record<string, string> }).ownerFilter).toEqual({});
    expect(next).toHaveBeenCalled();
  });

  it('sets ownerFilter with createdBy for VIEWER', () => {
    const userId = 'viewer-1';
    const req = mockReq({
      user: { id: userId, role: 'VIEWER', email: 'v@b.com' },
    });
    const { res } = mockRes();
    scopeToUser(req, res, next);
    expect((req as { ownerFilter?: Record<string, string> }).ownerFilter).toEqual({ createdBy: userId });
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 when no user on request', () => {
    const req = mockReq();
    const { status, json } = mockRes();
    scopeToUser(req, { status } as unknown as Response, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'AUTHENTICATION_REQUIRED' }),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
