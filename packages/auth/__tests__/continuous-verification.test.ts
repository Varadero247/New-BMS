// Mock verifyToken so tests don't need real JWT_SECRET
jest.mock('../src/jwt', () => ({
  verifyToken: jest.fn(),
}));

import { continuousVerification, InMemoryRevocationList } from '../src/continuous-verification';
import { verifyToken } from '../src/jwt';
import type { Request, Response, NextFunction } from 'express';

const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeReq(authHeader?: string): Request {
  return {
    headers: {
      authorization: authHeader,
    },
  } as unknown as Request;
}

function makeRes(): Response & { statusCode: number; body: unknown } {
  return {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: unknown) {
      this.body = data;
      return this;
    },
  } as Response & { statusCode: number; body: unknown };
}

// ── Basic middleware behaviour ──────────────────────────────────────────────────

describe('continuousVerification() middleware', () => {
  it('calls next() when no Authorization header is present', async () => {
    const mw = continuousVerification();
    const next = jest.fn();
    await mw(makeReq(), makeRes(), next as unknown as NextFunction);
    expect(next).toHaveBeenCalled();
  });

  it('calls next() when Authorization is not Bearer', async () => {
    const mw = continuousVerification();
    const next = jest.fn();
    await mw(makeReq('Basic abc123'), makeRes(), next as unknown as NextFunction);
    expect(next).toHaveBeenCalled();
  });

  it('calls next() when verifyToken throws (malformed token)', async () => {
    mockVerifyToken.mockImplementationOnce(() => { throw new Error('invalid'); });
    const mw = continuousVerification();
    const next = jest.fn();
    await mw(makeReq('Bearer bad.token'), makeRes(), next as unknown as NextFunction);
    expect(next).toHaveBeenCalled();
  });

  it('calls next() when token is valid and no callbacks configured', async () => {
    mockVerifyToken.mockReturnValueOnce({ userId: 'u-1', role: 'admin' } as never);
    const mw = continuousVerification();
    const next = jest.fn();
    await mw(makeReq('Bearer valid.token'), makeRes(), next as unknown as NextFunction);
    expect(next).toHaveBeenCalled();
  });
});

// ── isUserActive callback ──────────────────────────────────────────────────────

describe('continuousVerification() with isUserActive', () => {
  beforeEach(() => {
    mockVerifyToken.mockReturnValue({ userId: 'u-1', email: 'a@b.com', role: 'admin' } as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls next() when isUserActive returns true', async () => {
    const isUserActive = jest.fn().mockResolvedValue(true);
    const mw = continuousVerification({ isUserActive });
    const next = jest.fn();
    await mw(makeReq('Bearer tok'), makeRes(), next as unknown as NextFunction);
    expect(isUserActive).toHaveBeenCalledWith('u-1');
    expect(next).toHaveBeenCalled();
  });

  it('responds 401 ACCOUNT_INACTIVE when isUserActive returns false', async () => {
    const isUserActive = jest.fn().mockResolvedValue(false);
    const mw = continuousVerification({ isUserActive });
    const next = jest.fn();
    const res = makeRes();
    await mw(makeReq('Bearer tok'), res, next as unknown as NextFunction);
    expect(res.statusCode).toBe(401);
    expect((res.body as { error: string }).error).toBe('ACCOUNT_INACTIVE');
    expect(next).not.toHaveBeenCalled();
  });

  it('passes userId (not sub) when payload has userId', async () => {
    const isUserActive = jest.fn().mockResolvedValue(true);
    const mw = continuousVerification({ isUserActive });
    const next = jest.fn();
    await mw(makeReq('Bearer tok'), makeRes(), next as unknown as NextFunction);
    expect(isUserActive).toHaveBeenCalledWith('u-1');
  });

  it('passes sub as userId when payload has no userId', async () => {
    mockVerifyToken.mockReturnValueOnce({ sub: 'sub-99', role: 'user' } as never);
    const isUserActive = jest.fn().mockResolvedValue(true);
    const mw = continuousVerification({ isUserActive });
    const next = jest.fn();
    await mw(makeReq('Bearer tok'), makeRes(), next as unknown as NextFunction);
    expect(isUserActive).toHaveBeenCalledWith('sub-99');
  });

  it('returns 401 TOKEN_INVALID when payload has no userId or sub', async () => {
    mockVerifyToken.mockReturnValueOnce({ role: 'admin' } as never);
    const mw = continuousVerification();
    const next = jest.fn();
    const res = makeRes();
    await mw(makeReq('Bearer tok'), res, next as unknown as NextFunction);
    expect(res.statusCode).toBe(401);
    expect((res.body as { error: string }).error).toBe('TOKEN_INVALID');
    expect(next).not.toHaveBeenCalled();
  });
});

// ── isTokenRevoked callback ───────────────────────────────────────────────────

describe('continuousVerification() with isTokenRevoked', () => {
  beforeEach(() => {
    mockVerifyToken.mockReturnValue({ userId: 'u-1', email: 'a@b.com', role: 'admin' } as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls next() when token is not revoked', async () => {
    const isTokenRevoked = jest.fn().mockResolvedValue(false);
    const mw = continuousVerification({ isTokenRevoked });
    const next = jest.fn();
    await mw(makeReq('Bearer tok'), makeRes(), next as unknown as NextFunction);
    expect(isTokenRevoked).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('responds 401 TOKEN_REVOKED when token is revoked', async () => {
    const isTokenRevoked = jest.fn().mockResolvedValue(true);
    const mw = continuousVerification({ isTokenRevoked });
    const next = jest.fn();
    const res = makeRes();
    await mw(makeReq('Bearer tok'), res, next as unknown as NextFunction);
    expect(res.statusCode).toBe(401);
    expect((res.body as { error: string }).error).toBe('TOKEN_REVOKED');
    expect(next).not.toHaveBeenCalled();
  });

  it('passes both token and userId to isTokenRevoked', async () => {
    const isTokenRevoked = jest.fn().mockResolvedValue(false);
    const mw = continuousVerification({ isTokenRevoked });
    const next = jest.fn();
    await mw(makeReq('Bearer my-token'), makeRes(), next as unknown as NextFunction);
    expect(isTokenRevoked).toHaveBeenCalledWith('my-token', 'u-1');
  });

  it('runs both isUserActive and isTokenRevoked in order', async () => {
    const calls: string[] = [];
    const isUserActive = jest.fn().mockImplementation(async () => { calls.push('active'); return true; });
    const isTokenRevoked = jest.fn().mockImplementation(async () => { calls.push('revoked'); return false; });
    const mw = continuousVerification({ isUserActive, isTokenRevoked });
    const next = jest.fn();
    await mw(makeReq('Bearer tok'), makeRes(), next as unknown as NextFunction);
    expect(calls).toEqual(['active', 'revoked']);
  });
});

// ── InMemoryRevocationList ────────────────────────────────────────────────────

describe('InMemoryRevocationList', () => {
  let list: InMemoryRevocationList;

  beforeEach(() => {
    list = new InMemoryRevocationList();
  });

  it('starts empty', () => {
    expect(list.size).toBe(0);
  });

  it('isRevoked returns false for unknown token', () => {
    expect(list.isRevoked('tok')).toBe(false);
  });

  it('revoke() then isRevoked() returns true', () => {
    list.revoke('tok-123');
    expect(list.isRevoked('tok-123')).toBe(true);
  });

  it('clear() removes the token', () => {
    list.revoke('tok-123');
    list.clear('tok-123');
    expect(list.isRevoked('tok-123')).toBe(false);
  });

  it('size reflects the number of revoked tokens', () => {
    list.revoke('a');
    list.revoke('b');
    expect(list.size).toBe(2);
    list.clear('a');
    expect(list.size).toBe(1);
  });

  it('revoking the same token twice does not grow size', () => {
    list.revoke('tok');
    list.revoke('tok');
    expect(list.size).toBe(1);
  });
});

describe('Continuous Verification — additional coverage', () => {
  it('InMemoryRevocationList has initial size 0 when empty', () => {
    const list = new InMemoryRevocationList();
    expect(list.size).toBe(0);
  });
});
