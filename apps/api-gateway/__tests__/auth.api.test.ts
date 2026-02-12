import express from 'express';
import request from 'supertest';
import { z } from 'zod';

// Mock all external dependencies
jest.mock('@ims/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  generateToken: jest.fn().mockReturnValue('mock-access-token'),
  generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
  verifyRefreshToken: jest.fn().mockReturnValue({ userId: '20000000-0000-4000-a000-000000000123' }),
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  comparePassword: jest.fn(),
  validatePasswordStrength: jest.fn().mockReturnValue({ valid: true, errors: [] }),
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock('../src/middleware/rate-limiter', () => ({
  authLimiter: (req: any, res: any, next: any) => next(),
  registerLimiter: (req: any, res: any, next: any) => next(),
  passwordResetLimiter: (req: any, res: any, next: any) => next(),
}));

jest.mock('../src/middleware/account-lockout', () => ({
  getAccountLockoutManager: () => ({
    recordFailedAttempt: jest.fn().mockResolvedValue({ locked: false, remainingAttempts: 4 }),
    getRemainingAttempts: jest.fn().mockResolvedValue(4),
    getLockoutTimeRemaining: jest.fn().mockResolvedValue(1800),
    reset: jest.fn().mockResolvedValue(undefined),
    isLocked: jest.fn().mockResolvedValue(false),
  }),
  checkAccountLockout: () => (req: any, res: any, next: any) => next(),
}));

import { prisma } from '@ims/database';
import { comparePassword, hashPassword, generateToken, generateRefreshToken, verifyRefreshToken, authenticate } from '@ims/auth';
import authRoutes from '../src/routes/auth';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockComparePassword = comparePassword as jest.Mock;
const mockHashPassword = hashPassword as jest.Mock;
const mockGenerateToken = generateToken as jest.Mock;
const mockGenerateRefreshToken = generateRefreshToken as jest.Mock;
const mockVerifyRefreshToken = verifyRefreshToken as jest.Mock;

describe('Auth API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    const loginPayload = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: '20000000-0000-4000-a000-000000000123',
      email: 'test@example.com',
      password: 'hashed-password',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      department: 'IT',
      jobTitle: 'Developer',
      isActive: true,
    };

    it('should login successfully with valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser as any);
      mockComparePassword.mockResolvedValueOnce(true);
      mockPrisma.session.create.mockResolvedValueOnce({} as any);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginPayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('expiresAt');
      expect(response.body.data).toHaveProperty('refreshExpiresAt');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(loginPayload.email);
    });

    it('should return 401 for invalid email', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginPayload);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 401 for invalid password', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser as any);
      mockComparePassword.mockResolvedValueOnce(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginPayload);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(response.body.error).toHaveProperty('remainingAttempts');
    });

    it('should return 401 for inactive user', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ ...mockUser, isActive: false } as any);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginPayload);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid-email', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should create a session on successful login', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser as any);
      mockComparePassword.mockResolvedValueOnce(true);
      mockPrisma.session.create.mockResolvedValueOnce({} as any);

      await request(app)
        .post('/api/auth/login')
        .send(loginPayload);

      expect(mockPrisma.session.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUser.id,
          token: 'mock-access-token',
        }),
      });
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.user.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginPayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/auth/register', () => {
    const registerPayload = {
      email: 'newuser@example.com',
      password: 'Password123!',
      firstName: 'New',
      lastName: 'User',
    };

    it('should register successfully with valid data', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        email: registerPayload.email,
        firstName: registerPayload.firstName,
        lastName: registerPayload.lastName,
        role: 'USER',
      } as any);
      mockPrisma.session.create.mockResolvedValueOnce({} as any);

      const response = await request(app)
        .post('/api/auth/register')
        .send(registerPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('expiresAt');
      expect(response.body.data).toHaveProperty('refreshExpiresAt');
      expect(response.body.data).toHaveProperty('user');
    });

    it('should return 409 if user already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing-user' } as any);

      const response = await request(app)
        .post('/api/auth/register')
        .send(registerPayload);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_EXISTS');
    });

    it('should return 400 for password less than 8 characters', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...registerPayload, password: 'short' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing firstName', async () => {
      const { firstName, ...payload } = registerPayload;

      const response = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing lastName', async () => {
      const { lastName, ...payload } = registerPayload;

      const response = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should hash the password before storing', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        email: registerPayload.email,
        role: 'USER',
      } as any);
      mockPrisma.session.create.mockResolvedValueOnce({} as any);

      await request(app)
        .post('/api/auth/register')
        .send(registerPayload);

      expect(mockHashPassword).toHaveBeenCalledWith(registerPayload.password);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          password: 'hashed-password',
        }),
      });
    });

    it('should accept optional fields', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        email: registerPayload.email,
        role: 'USER',
      } as any);
      mockPrisma.session.create.mockResolvedValueOnce({} as any);

      const payload = {
        ...registerPayload,
        phone: '+1234567890',
        department: 'Engineering',
        jobTitle: 'Developer',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(response.status).toBe(201);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phone: '+1234567890',
          department: 'Engineering',
          jobTitle: 'Developer',
        }),
      });
    });
  });

  describe('POST /api/auth/refresh', () => {
    const mockUser = {
      id: '20000000-0000-4000-a000-000000000123',
      email: 'test@example.com',
      role: 'USER',
      isActive: true,
    };

    it('should refresh tokens successfully with valid refresh token', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser as any);
      mockPrisma.session.create.mockResolvedValueOnce({} as any);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'valid-refresh-token' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('expiresAt');
      expect(response.body.data).toHaveProperty('refreshExpiresAt');
    });

    it('should return 401 for inactive user', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ ...mockUser, isActive: false } as any);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'valid-refresh-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_INACTIVE');
    });

    it('should return 401 for 00000000-0000-4000-a000-ffffffffffff user', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'valid-refresh-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_INACTIVE');
    });

    it('should return 400 for missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 401 for invalid refresh token', async () => {
      // Import jwt to use its error classes
      const jwt = require('jsonwebtoken');
      mockVerifyRefreshToken.mockImplementationOnce(() => {
        throw new jwt.JsonWebTokenError('invalid token');
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });

    it('should return 401 for expired refresh token', async () => {
      const jwt = require('jsonwebtoken');
      mockVerifyRefreshToken.mockImplementationOnce(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'expired-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });

    it('should create a new session on successful refresh', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser as any);
      mockPrisma.session.create.mockResolvedValueOnce({} as any);

      await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'valid-refresh-token' });

      expect(mockPrisma.session.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUser.id,
          token: 'mock-access-token',
        }),
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      mockPrisma.session.deleteMany.mockResolvedValueOnce({ count: 1 });

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer mock-jwt-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should delete the session on logout', async () => {
      mockPrisma.session.deleteMany.mockResolvedValueOnce({ count: 1 });

      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer mock-jwt-token');

      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: { token: 'mock-jwt-token' },
      });
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user info', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer mock-jwt-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should return success for valid email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return success even for nonexistent email (prevent enumeration)', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
