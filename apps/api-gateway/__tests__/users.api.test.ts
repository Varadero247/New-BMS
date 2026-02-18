import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('@ims/database', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

let mockUser = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = mockUser;
    next();
  }),
  requireRole:
    (...roles: string[]) =>
    (req: any, res: any, next: any) => {
      if (roles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
        });
      }
    },
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
}));

import { prisma } from '@ims/database';
import usersRoutes from '../src/routes/users';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Users API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/users', usersRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
  });

  describe('GET /api/users', () => {
    const mockUsers = [
      {
        id: '20000000-0000-4000-a000-000000000001',
        email: 'user1@test.com',
        firstName: 'User',
        lastName: 'One',
        role: 'USER',
      },
      {
        id: '20000000-0000-4000-a000-000000000002',
        email: 'user2@test.com',
        firstName: 'User',
        lastName: 'Two',
        role: 'MANAGER',
      },
    ];

    it('should return list of users for admin', async () => {
      mockUser = {
        id: '51000000-0000-4000-a000-000000000123',
        email: 'admin@test.com',
        role: 'ADMIN',
      };
      mockPrisma.user.findMany.mockResolvedValueOnce(mockUsers as any);
      mockPrisma.user.count.mockResolvedValueOnce(2);

      const response = await request(app).get('/api/users').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toHaveProperty('total', 2);
    });

    it('should return list of users for manager', async () => {
      mockUser = { id: 'manager-123', email: 'manager@test.com', role: 'MANAGER' };
      mockPrisma.user.findMany.mockResolvedValueOnce(mockUsers as any);
      mockPrisma.user.count.mockResolvedValueOnce(2);

      const response = await request(app).get('/api/users').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 403 for regular user', async () => {
      mockUser = {
        id: '20000000-0000-4000-a000-000000000123',
        email: 'user@test.com',
        role: 'USER',
      };

      const response = await request(app).get('/api/users').set('Authorization', 'Bearer token');

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should support pagination', async () => {
      mockUser = {
        id: '51000000-0000-4000-a000-000000000123',
        email: 'admin@test.com',
        role: 'ADMIN',
      };
      mockPrisma.user.findMany.mockResolvedValueOnce(mockUsers as any);
      mockPrisma.user.count.mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/users?page=2&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(10);
    });

    it('should support search filter', async () => {
      mockUser = {
        id: '51000000-0000-4000-a000-000000000123',
        email: 'admin@test.com',
        role: 'ADMIN',
      };
      mockPrisma.user.findMany.mockResolvedValueOnce([]);
      mockPrisma.user.count.mockResolvedValueOnce(0);

      await request(app).get('/api/users?search=john').set('Authorization', 'Bearer token');

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        })
      );
    });

    it('should support role filter', async () => {
      mockUser = {
        id: '51000000-0000-4000-a000-000000000123',
        email: 'admin@test.com',
        role: 'ADMIN',
      };
      mockPrisma.user.findMany.mockResolvedValueOnce([]);
      mockPrisma.user.count.mockResolvedValueOnce(0);

      await request(app).get('/api/users?role=MANAGER').set('Authorization', 'Bearer token');

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: 'MANAGER',
          }),
        })
      );
    });
  });

  describe('GET /api/users/:id', () => {
    const mockUserData = {
      id: '20000000-0000-4000-a000-000000000123',
      email: 'user@test.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
    };

    it('should return user data for own profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUserData as any);

      const response = await request(app)
        .get('/api/users/20000000-0000-4000-a000-000000000123')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('20000000-0000-4000-a000-000000000123');
    });

    it('should return user data for admin viewing other user', async () => {
      mockUser = {
        id: '51000000-0000-4000-a000-000000000123',
        email: 'admin@test.com',
        role: 'ADMIN',
      };
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUserData as any);

      const response = await request(app)
        .get('/api/users/20000000-0000-4000-a000-000000000123')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 403 when user tries to view other user', async () => {
      mockUser = {
        id: '55000000-0000-4000-a000-000000000001',
        email: 'other@test.com',
        role: 'USER',
      };

      const response = await request(app)
        .get('/api/users/20000000-0000-4000-a000-000000000123')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff user', async () => {
      mockUser = {
        id: '51000000-0000-4000-a000-000000000123',
        email: 'admin@test.com',
        role: 'ADMIN',
      };
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/users/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/users', () => {
    const createUserPayload = {
      email: 'newuser@test.com',
      password: 'Password123!',
      firstName: 'New',
      lastName: 'User',
    };

    it('should create user for admin', async () => {
      mockUser = {
        id: '51000000-0000-4000-a000-000000000123',
        email: 'admin@test.com',
        role: 'ADMIN',
      };
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...createUserPayload,
        role: 'USER',
      } as any);

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer token')
        .send(createUserPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(createUserPayload.email);
    });

    it('should return 403 for non-admin', async () => {
      mockUser = {
        id: '20000000-0000-4000-a000-000000000123',
        email: 'user@test.com',
        role: 'USER',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer token')
        .send(createUserPayload);

      expect(response.status).toBe(403);
    });

    it('should return 409 for duplicate email', async () => {
      mockUser = {
        id: '51000000-0000-4000-a000-000000000123',
        email: 'admin@test.com',
        role: 'ADMIN',
      };
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing' } as any);

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer token')
        .send(createUserPayload);

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('USER_EXISTS');
    });

    it('should return 400 for invalid data', async () => {
      mockUser = {
        id: '51000000-0000-4000-a000-000000000123',
        email: 'admin@test.com',
        role: 'ADMIN',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer token')
        .send({ email: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should allow setting role', async () => {
      mockUser = {
        id: '51000000-0000-4000-a000-000000000123',
        email: 'admin@test.com',
        role: 'ADMIN',
      };
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        role: 'MANAGER',
      } as any);

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer token')
        .send({ ...createUserPayload, role: 'MANAGER' });

      expect(response.status).toBe(201);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update own profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: '20000000-0000-4000-a000-000000000123',
      } as any);
      mockPrisma.user.update.mockResolvedValueOnce({
        id: '20000000-0000-4000-a000-000000000123',
        firstName: 'Updated',
      } as any);

      const response = await request(app)
        .patch('/api/users/20000000-0000-4000-a000-000000000123')
        .set('Authorization', 'Bearer token')
        .send({ firstName: 'Updated' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should allow admin to update any user', async () => {
      mockUser = {
        id: '51000000-0000-4000-a000-000000000123',
        email: 'admin@test.com',
        role: 'ADMIN',
      };
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: '55000000-0000-4000-a000-000000000001',
      } as any);
      mockPrisma.user.update.mockResolvedValueOnce({
        id: '55000000-0000-4000-a000-000000000001',
        firstName: 'Updated',
      } as any);

      const response = await request(app)
        .patch('/api/users/55000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ firstName: 'Updated' });

      expect(response.status).toBe(200);
    });

    it('should return 403 when updating other user as non-admin', async () => {
      mockUser = {
        id: '20000000-0000-4000-a000-000000000123',
        email: 'user@test.com',
        role: 'USER',
      };

      const response = await request(app)
        .patch('/api/users/55000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ firstName: 'Updated' });

      expect(response.status).toBe(403);
    });

    it('should not allow non-admin to change role', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: '20000000-0000-4000-a000-000000000123',
      } as any);
      mockPrisma.user.update.mockResolvedValueOnce({
        id: '20000000-0000-4000-a000-000000000123',
        role: 'USER',
      } as any);

      await request(app)
        .patch('/api/users/20000000-0000-4000-a000-000000000123')
        .set('Authorization', 'Bearer token')
        .send({ role: 'ADMIN', firstName: 'Test' });

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ role: 'ADMIN' }),
        })
      );
    });

    it('should allow admin to change role', async () => {
      mockUser = {
        id: '51000000-0000-4000-a000-000000000123',
        email: 'admin@test.com',
        role: 'ADMIN',
      };
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: '20000000-0000-4000-a000-000000000123',
      } as any);
      mockPrisma.user.update.mockResolvedValueOnce({
        id: '20000000-0000-4000-a000-000000000123',
        role: 'MANAGER',
      } as any);

      await request(app)
        .patch('/api/users/20000000-0000-4000-a000-000000000123')
        .set('Authorization', 'Bearer token')
        .send({ role: 'MANAGER' });

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: 'MANAGER' }),
        })
      );
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user for admin', async () => {
      mockUser = {
        id: '51000000-0000-4000-a000-000000000123',
        email: 'admin@test.com',
        role: 'ADMIN',
      };
      mockPrisma.user.delete.mockResolvedValueOnce({} as any);

      const response = await request(app)
        .delete('/api/users/55000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
    });

    it('should return 403 for non-admin', async () => {
      mockUser = {
        id: '20000000-0000-4000-a000-000000000123',
        email: 'user@test.com',
        role: 'USER',
      };

      const response = await request(app)
        .delete('/api/users/55000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(403);
    });

    it('should not allow admin to delete self', async () => {
      mockUser = {
        id: '51000000-0000-4000-a000-000000000123',
        email: 'admin@test.com',
        role: 'ADMIN',
      };

      const response = await request(app)
        .delete('/api/users/51000000-0000-4000-a000-000000000123')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('CANNOT_DELETE_SELF');
    });
  });
});
