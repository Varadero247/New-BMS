import { authenticate, requireRole, optionalAuth } from '../src/middleware';
import { generateToken } from '../src/jwt';
import type { AuthRequest } from '../src/types';

// Mock prisma
jest.mock('@ims/database', () => ({
  prisma: {
    session: {
      findFirst: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from '@ims/database';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-that-is-at-least-64-characters-long-for-testing-purposes';

    mockReq = {
      headers: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    it('should reject request without authorization header', async () => {
      await authenticate(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No token provided' },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request without Bearer prefix', async () => {
      mockReq.headers = { authorization: 'Basic token123' };

      await authenticate(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No token provided' },
      });
    });

    it('should reject invalid token', async () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      await authenticate(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'TOKEN_INVALID', message: 'Invalid or expired token' },
      });
    });

    it('should reject when session not found', async () => {
      const token = generateToken({ userId: 'user-123', email: 'test@test.com', role: 'USER' });
      mockReq.headers = { authorization: `Bearer ${token}` };
      (mockPrisma.session.findFirst as jest.Mock).mockResolvedValue(null);

      await authenticate(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'SESSION_EXPIRED', message: 'Session has expired or been revoked' },
      });
    });

    it('should reject when user is inactive', async () => {
      const token = generateToken({ userId: 'user-123', email: 'test@test.com', role: 'USER' });
      mockReq.headers = { authorization: `Bearer ${token}` };

      (mockPrisma.session.findFirst as jest.Mock).mockResolvedValue({
        id: 'session-123',
        userId: 'user-123',
        token,
        user: { id: 'user-123', isActive: false },
      });
      (mockPrisma.session.delete as jest.Mock).mockResolvedValue({});

      await authenticate(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockPrisma.session.delete).toHaveBeenCalledWith({ where: { id: 'session-123' } });
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'USER_INACTIVE', message: 'Account has been deactivated' },
      });
    });

    it('should authenticate valid request', async () => {
      const token = generateToken({ userId: 'user-123', email: 'test@test.com', role: 'USER' });
      mockReq.headers = { authorization: `Bearer ${token}` };

      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        role: 'USER',
        isActive: true,
      };

      const mockSession = {
        id: 'session-123',
        userId: 'user-123',
        token,
        user: mockUser,
      };

      (mockPrisma.session.findFirst as jest.Mock).mockResolvedValue(mockSession);
      (mockPrisma.session.update as jest.Mock).mockResolvedValue({});

      await authenticate(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBe(mockUser);
      expect(mockReq.sessionId).toBe('session-123');
      expect(mockReq.token).toBe(token);
    });

    it('should update lastActivityAt on successful auth', async () => {
      const token = generateToken({ userId: 'user-123', email: 'test@test.com', role: 'USER' });
      mockReq.headers = { authorization: `Bearer ${token}` };

      (mockPrisma.session.findFirst as jest.Mock).mockResolvedValue({
        id: 'session-123',
        userId: 'user-123',
        token,
        user: { id: 'user-123', isActive: true },
      });
      (mockPrisma.session.update as jest.Mock).mockResolvedValue({});

      await authenticate(mockReq as AuthRequest, mockRes, mockNext);

      // Wait for the fire-and-forget update
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockPrisma.session.update).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        data: { lastActivityAt: expect.any(Date) },
      });
    });

    it('should handle lastActivityAt update failure silently', async () => {
      const token = generateToken({ userId: 'user-123', email: 'test@test.com', role: 'USER' });
      mockReq.headers = { authorization: `Bearer ${token}` };

      (mockPrisma.session.findFirst as jest.Mock).mockResolvedValue({
        id: 'session-123',
        userId: 'user-123',
        token,
        user: { id: 'user-123', isActive: true },
      });
      (mockPrisma.session.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      await authenticate(mockReq as AuthRequest, mockRes, mockNext);

      // Wait for the fire-and-forget update
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should still authenticate successfully
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      const token = generateToken({ userId: 'user-123', email: 'test@test.com', role: 'USER' });
      mockReq.headers = { authorization: `Bearer ${token}` };

      (mockPrisma.session.findFirst as jest.Mock).mockRejectedValue(
        new Error('DB connection failed')
      );

      await authenticate(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication failed' },
      });
    });
  });

  describe('requireRole', () => {
    it('should reject when user not authenticated', () => {
      const middleware = requireRole('ADMIN');

      middleware(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    });

    it('should reject when user has wrong role', () => {
      mockReq.user = { id: 'user-123', role: 'USER' } as unknown;
      const middleware = requireRole('ADMIN');

      middleware(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
    });

    it('should allow when user has correct role', () => {
      mockReq.user = { id: 'user-123', role: 'ADMIN' } as unknown;
      const middleware = requireRole('ADMIN');

      middleware(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should allow when user has one of multiple roles', () => {
      mockReq.user = { id: 'user-123', role: 'MANAGER' } as unknown;
      const middleware = requireRole('ADMIN', 'MANAGER');

      middleware(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject when user has none of multiple roles', () => {
      mockReq.user = { id: 'user-123', role: 'USER' } as unknown;
      const middleware = requireRole('ADMIN', 'MANAGER');

      middleware(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('optionalAuth', () => {
    it('should continue without auth when no header present', () => {
      optionalAuth(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
    });

    it('should continue without auth when no Bearer prefix', () => {
      mockReq.headers = { authorization: 'Basic token' };

      optionalAuth(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should authenticate when Bearer token present', async () => {
      const token = generateToken({ userId: 'user-123', email: 'test@test.com', role: 'USER' });
      mockReq.headers = { authorization: `Bearer ${token}` };

      (mockPrisma.session.findFirst as jest.Mock).mockResolvedValue({
        id: 'session-123',
        userId: 'user-123',
        token,
        user: { id: 'user-123', isActive: true },
      });
      (mockPrisma.session.update as jest.Mock).mockResolvedValue({});

      await optionalAuth(mockReq as AuthRequest, mockRes, mockNext);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockNext).toHaveBeenCalled();
    });
  });
});

// ─── Additional coverage ──────────────────────────────────────────────────────────────────────────

describe('Auth Middleware — additional coverage', () => {
  let localReq: Partial<AuthRequest>;
  let localRes: any;
  let localNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-that-is-at-least-64-characters-long-for-testing-purposes';
    localReq = { headers: {} };
    localRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    localNext = jest.fn();
  });

  it('authenticate rejects empty Bearer token string', async () => {
    localReq.headers = { authorization: 'Bearer ' };
    await authenticate(localReq as AuthRequest, localRes, localNext);
    expect(localRes.status).toHaveBeenCalledWith(401);
    expect(localNext).not.toHaveBeenCalled();
  });

  it('requireRole returns a function (middleware factory)', () => {
    const middleware = requireRole('ADMIN');
    expect(typeof middleware).toBe('function');
  });

  it('requireRole with a single role allows exact match', () => {
    localReq.user = { id: 'u', role: 'VIEWER' } as unknown;
    const middleware = requireRole('VIEWER');
    middleware(localReq as AuthRequest, localRes, localNext);
    expect(localNext).toHaveBeenCalled();
    expect(localRes.status).not.toHaveBeenCalled();
  });
});

describe('Auth Middleware — extended edge cases', () => {
  let localReq: Partial<AuthRequest>;
  let localRes: any;
  let localNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-that-is-at-least-64-characters-long-for-testing-purposes';
    localReq = { headers: {} };
    localRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    localNext = jest.fn();
  });

  it('authenticate sets req.token to the raw token string on success', async () => {
    const token = generateToken({ userId: 'user-456', email: 'x@x.com', role: 'USER' });
    localReq.headers = { authorization: `Bearer ${token}` };
    (mockPrisma.session.findFirst as jest.Mock).mockResolvedValue({
      id: 'session-456',
      userId: 'user-456',
      token,
      user: { id: 'user-456', isActive: true },
    });
    (mockPrisma.session.update as jest.Mock).mockResolvedValue({});
    await authenticate(localReq as AuthRequest, localRes, localNext);
    expect(localReq.token).toBe(token);
  });

  it('authenticate sets req.sessionId on success', async () => {
    const token = generateToken({ userId: 'user-789', email: 'y@y.com', role: 'USER' });
    localReq.headers = { authorization: `Bearer ${token}` };
    (mockPrisma.session.findFirst as jest.Mock).mockResolvedValue({
      id: 'session-789',
      userId: 'user-789',
      token,
      user: { id: 'user-789', isActive: true },
    });
    (mockPrisma.session.update as jest.Mock).mockResolvedValue({});
    await authenticate(localReq as AuthRequest, localRes, localNext);
    expect(localReq.sessionId).toBe('session-789');
  });

  it('requireRole 403 response has correct error code FORBIDDEN', () => {
    localReq.user = { id: 'u', role: 'USER' } as unknown;
    const middleware = requireRole('ADMIN');
    middleware(localReq as AuthRequest, localRes, localNext);
    expect(localRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'FORBIDDEN' }),
      })
    );
  });

  it('optionalAuth does not set req.user when no authorization header', () => {
    optionalAuth(localReq as AuthRequest, localRes, localNext);
    expect(localReq.user).toBeUndefined();
    expect(localNext).toHaveBeenCalled();
  });

  it('authenticate rejects DIGEST authorization scheme', async () => {
    localReq.headers = { authorization: 'Digest credentials' };
    await authenticate(localReq as AuthRequest, localRes, localNext);
    expect(localRes.status).toHaveBeenCalledWith(401);
    expect(localNext).not.toHaveBeenCalled();
  });

  it('authenticate calls session.findFirst with the token', async () => {
    const token = generateToken({ userId: 'user-999', email: 'z@z.com', role: 'USER' });
    localReq.headers = { authorization: `Bearer ${token}` };
    (mockPrisma.session.findFirst as jest.Mock).mockResolvedValue(null);
    await authenticate(localReq as AuthRequest, localRes, localNext);
    expect(mockPrisma.session.findFirst).toHaveBeenCalledTimes(1);
  });

  it('requireRole allows SUPERADMIN when SUPERADMIN and ADMIN are both in roles list', () => {
    localReq.user = { id: 'u', role: 'SUPERADMIN' } as unknown;
    const middleware = requireRole('ADMIN', 'SUPERADMIN');
    middleware(localReq as AuthRequest, localRes, localNext);
    expect(localNext).toHaveBeenCalled();
    expect(localRes.status).not.toHaveBeenCalled();
  });

  it('authenticate 401 response has success: false', async () => {
    localReq.headers = {};
    await authenticate(localReq as AuthRequest, localRes, localNext);
    expect(localRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it('authenticate deletes session when user is inactive', async () => {
    const token = generateToken({ userId: 'user-inactive', email: 'i@i.com', role: 'USER' });
    localReq.headers = { authorization: `Bearer ${token}` };
    (mockPrisma.session.findFirst as jest.Mock).mockResolvedValue({
      id: 'session-inactive',
      userId: 'user-inactive',
      token,
      user: { id: 'user-inactive', isActive: false },
    });
    (mockPrisma.session.delete as jest.Mock).mockResolvedValue({});
    await authenticate(localReq as AuthRequest, localRes, localNext);
    expect(mockPrisma.session.delete).toHaveBeenCalledWith({ where: { id: 'session-inactive' } });
  });
});

// ── Auth Middleware — final coverage ──────────────────────────────────────────

describe('Auth Middleware — final coverage', () => {
  let localReq: Partial<AuthRequest>;
  let localRes: any;
  let localNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-that-is-at-least-64-characters-long-for-testing-purposes';
    localReq = { headers: {} };
    localRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    localNext = jest.fn();
  });

  it('authenticate returns 401 SESSION_EXPIRED when session.findFirst returns null', async () => {
    const token = generateToken({ userId: 'user-ses', email: 'ses@test.com', role: 'USER' });
    localReq.headers = { authorization: `Bearer ${token}` };
    (mockPrisma.session.findFirst as jest.Mock).mockResolvedValue(null);
    await authenticate(localReq as AuthRequest, localRes, localNext);
    expect(localRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'SESSION_EXPIRED' }),
      })
    );
  });

  it('requireRole returns 401 when user is undefined', () => {
    localReq.user = undefined;
    const middleware = requireRole('ADMIN');
    middleware(localReq as AuthRequest, localRes, localNext);
    expect(localRes.status).toHaveBeenCalledWith(401);
    expect(localRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      })
    );
  });

  it('optionalAuth calls next() and leaves user undefined when header is missing', () => {
    localReq.headers = {};
    optionalAuth(localReq as AuthRequest, localRes, localNext);
    expect(localNext).toHaveBeenCalled();
    expect(localReq.user).toBeUndefined();
  });

  it('authenticate response body has error.message field', async () => {
    localReq.headers = { authorization: 'Bearer invalid-tok' };
    await authenticate(localReq as AuthRequest, localRes, localNext);
    const jsonArg = localRes.json.mock.calls[0][0];
    expect(jsonArg.error).toHaveProperty('message');
  });

  it('requireRole with three allowed roles allows first in list', () => {
    localReq.user = { id: 'u', role: 'ADMIN' } as unknown;
    const middleware = requireRole('ADMIN', 'MANAGER', 'VIEWER');
    middleware(localReq as AuthRequest, localRes, localNext);
    expect(localNext).toHaveBeenCalled();
  });

  it('requireRole with three allowed roles allows last in list', () => {
    localReq.user = { id: 'u', role: 'VIEWER' } as unknown;
    const middleware = requireRole('ADMIN', 'MANAGER', 'VIEWER');
    middleware(localReq as AuthRequest, localRes, localNext);
    expect(localNext).toHaveBeenCalled();
  });
});

// ── Auth Middleware — comprehensive coverage ──────────────────────────────────

describe('Auth Middleware — comprehensive coverage', () => {
  let localReq: Partial<AuthRequest>;
  let localRes: any;
  let localNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-that-is-at-least-64-characters-long-for-testing-purposes';
    localReq = { headers: {} };
    localRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    localNext = jest.fn();
  });

  it('authenticate sets req.user to the user object from session', async () => {
    const token = generateToken({ userId: 'user-setuser', email: 'su@su.com', role: 'USER' });
    localReq.headers = { authorization: `Bearer ${token}` };
    const mockUser = { id: 'user-setuser', isActive: true, email: 'su@su.com' };
    (mockPrisma.session.findFirst as jest.Mock).mockResolvedValue({
      id: 'sess-setuser',
      userId: 'user-setuser',
      token,
      user: mockUser,
    });
    (mockPrisma.session.update as jest.Mock).mockResolvedValue({});
    await authenticate(localReq as AuthRequest, localRes, localNext);
    expect(localReq.user).toBe(mockUser);
  });

  it('authenticate 401 response shape is { success, error: { code, message } }', async () => {
    localReq.headers = {};
    await authenticate(localReq as AuthRequest, localRes, localNext);
    const jsonArg = localRes.json.mock.calls[0][0];
    expect(jsonArg).toHaveProperty('success', false);
    expect(jsonArg.error).toHaveProperty('code');
    expect(jsonArg.error).toHaveProperty('message');
  });

  it('requireRole does not call next when user role is case-mismatched', () => {
    localReq.user = { id: 'u', role: 'admin' } as unknown; // lowercase
    const middleware = requireRole('ADMIN'); // uppercase expected
    middleware(localReq as AuthRequest, localRes, localNext);
    expect(localNext).not.toHaveBeenCalled();
    expect(localRes.status).toHaveBeenCalledWith(403);
  });

  it('optionalAuth continues without user when authorization scheme is Basic', () => {
    localReq.headers = { authorization: 'Basic base64creds' };
    optionalAuth(localReq as AuthRequest, localRes, localNext);
    expect(localNext).toHaveBeenCalled();
    expect(localReq.user).toBeUndefined();
  });

  it('authenticate handles malformed JWT gracefully with 401', async () => {
    localReq.headers = { authorization: 'Bearer not.a.jwt' };
    await authenticate(localReq as AuthRequest, localRes, localNext);
    expect(localRes.status).toHaveBeenCalledWith(401);
    expect(localNext).not.toHaveBeenCalled();
  });
});
