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

      (mockPrisma.session.findFirst as jest.Mock).mockRejectedValue(new Error('DB connection failed'));

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
      mockReq.user = { id: 'user-123', role: 'USER' } as any;
      const middleware = requireRole('ADMIN');

      middleware(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
    });

    it('should allow when user has correct role', () => {
      mockReq.user = { id: 'user-123', role: 'ADMIN' } as any;
      const middleware = requireRole('ADMIN');

      middleware(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should allow when user has one of multiple roles', () => {
      mockReq.user = { id: 'user-123', role: 'MANAGER' } as any;
      const middleware = requireRole('ADMIN', 'MANAGER');

      middleware(mockReq as AuthRequest, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject when user has none of multiple roles', () => {
      mockReq.user = { id: 'user-123', role: 'USER' } as any;
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
