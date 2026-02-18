import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('@ims/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    auditLog: {
      findMany: jest.fn(),
    },
    session: {
      findMany: jest.fn(),
    },
    erasureRequest: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    dataRetentionPolicy: {
      findMany: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'admin-1', email: 'admin@ims.local', role: 'ADMIN' };
    next();
  }),
  requireRole: jest.fn((..._roles: string[]) => (_req: any, _res: any, next: any) => next()),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import { prisma } from '@ims/database';
import gdprRoutes from '../src/routes/gdpr';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Sample data
const mockUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
  department: 'Engineering',
  jobTitle: 'Developer',
  role: 'USER',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAuditLog = {
  id: 'audit-1',
  userId: 'user-1',
  action: 'LOGIN',
  entity: 'User',
  entityId: 'user-1',
  ipAddress: '127.0.0.1',
  createdAt: new Date(),
};

const mockSession = {
  id: 'session-1',
  userId: 'user-1',
  lastActivityAt: new Date(),
  userAgent: 'Mozilla/5.0',
  ipAddress: '127.0.0.1',
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 86400000),
};

const mockErasureRequest = {
  id: '00000000-0000-0000-0000-000000000001',
  userId: 'user-1',
  userEmail: 'john@example.com',
  reason: 'No longer need account',
  status: 'PENDING',
  processedBy: null,
  processedAt: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRetentionPolicy = {
  id: 'policy-1',
  dataCategory: 'audit_logs',
  module: 'health-safety',
  retentionDays: 2555,
  action: 'ARCHIVE',
  legalBasis: 'Legal obligation (Art 6(1)(c))',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('GDPR API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/gdpr', gdprRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // GET /api/v1/gdpr/data-export/:userId
  // =========================================================================
  describe('GET /api/v1/gdpr/data-export/:userId', () => {
    it('should export user data successfully', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockPrisma.auditLog.findMany as jest.Mock).mockResolvedValue([mockAuditLog]);
      (mockPrisma.session.findMany as jest.Mock).mockResolvedValue([mockSession]);

      const response = await request(app)
        .get('/api/v1/gdpr/data-export/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('exportDate');
      expect(response.body.data).toHaveProperty('dataSubject');
      expect(response.body.data.dataSubject.email).toBe('john@example.com');
      expect(response.body.data.auditLogs.count).toBe(1);
      expect(response.body.data.sessions.count).toBe(1);
    });

    it('should not include password in data export', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockPrisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.session.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/gdpr/data-export/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.dataSubject).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/gdpr/data-export/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/v1/gdpr/data-export/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('should include empty arrays when user has no audit logs or sessions', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockPrisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.session.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/gdpr/data-export/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.auditLogs.count).toBe(0);
      expect(response.body.data.auditLogs.records).toEqual([]);
      expect(response.body.data.sessions.count).toBe(0);
    });
  });

  // =========================================================================
  // POST /api/v1/gdpr/erasure-request
  // =========================================================================
  describe('POST /api/v1/gdpr/erasure-request', () => {
    const validBody = {
      userId: 'user-1',
      userEmail: 'john@example.com',
      reason: 'No longer need account',
    };

    it('should create an erasure request', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockPrisma.erasureRequest.create as jest.Mock).mockResolvedValue(mockErasureRequest);

      const response = await request(app)
        .post('/api/v1/gdpr/erasure-request')
        .set('Authorization', 'Bearer token')
        .send(validBody);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe('user-1');
      expect(response.body.data.status).toBe('PENDING');
    });

    it('should reject missing userId', async () => {
      const response = await request(app)
        .post('/api/v1/gdpr/erasure-request')
        .set('Authorization', 'Bearer token')
        .send({ userEmail: 'john@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/gdpr/erasure-request')
        .set('Authorization', 'Bearer token')
        .send({ userId: 'user-1', userEmail: 'not-an-email' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when user does not exist', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/gdpr/erasure-request')
        .set('Authorization', 'Bearer token')
        .send(validBody);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should allow erasure request without reason', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockPrisma.erasureRequest.create as jest.Mock).mockResolvedValue({
        ...mockErasureRequest,
        reason: null,
      });

      const response = await request(app)
        .post('/api/v1/gdpr/erasure-request')
        .set('Authorization', 'Bearer token')
        .send({ userId: 'user-1', userEmail: 'john@example.com' });

      expect(response.status).toBe(201);
    });

    it('should handle database errors on create', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockPrisma.erasureRequest.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .post('/api/v1/gdpr/erasure-request')
        .set('Authorization', 'Bearer token')
        .send(validBody);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =========================================================================
  // GET /api/v1/gdpr/erasure-request
  // =========================================================================
  describe('GET /api/v1/gdpr/erasure-request', () => {
    it('should list all erasure requests', async () => {
      (mockPrisma.erasureRequest.findMany as jest.Mock).mockResolvedValue([mockErasureRequest]);
      (mockPrisma.erasureRequest.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/v1/gdpr/erasure-request')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.total).toBe(1);
    });

    it('should filter by status', async () => {
      (mockPrisma.erasureRequest.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.erasureRequest.count as jest.Mock).mockResolvedValue(0);

      await request(app)
        .get('/api/v1/gdpr/erasure-request?status=PENDING')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.erasureRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PENDING' }),
        })
      );
    });

    it('should paginate results', async () => {
      (mockPrisma.erasureRequest.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.erasureRequest.count as jest.Mock).mockResolvedValue(50);

      const response = await request(app)
        .get('/api/v1/gdpr/erasure-request?page=2&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.body.meta).toEqual({
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5,
      });
    });

    it('should handle database errors', async () => {
      (mockPrisma.erasureRequest.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/v1/gdpr/erasure-request')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
    });
  });

  // =========================================================================
  // PUT /api/v1/gdpr/erasure-request/:id
  // =========================================================================
  describe('PUT /api/v1/gdpr/erasure-request/:id', () => {
    it('should process an erasure request', async () => {
      (mockPrisma.erasureRequest.findUnique as jest.Mock).mockResolvedValue(mockErasureRequest);
      (mockPrisma.erasureRequest.update as jest.Mock).mockResolvedValue({
        ...mockErasureRequest,
        status: 'IN_PROGRESS',
        processedBy: 'admin-1',
      });

      const response = await request(app)
        .put('/api/v1/gdpr/erasure-request/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('IN_PROGRESS');
    });

    it('should complete an erasure request with processedAt', async () => {
      (mockPrisma.erasureRequest.findUnique as jest.Mock).mockResolvedValue(mockErasureRequest);
      (mockPrisma.erasureRequest.update as jest.Mock).mockResolvedValue({
        ...mockErasureRequest,
        status: 'COMPLETED',
        processedBy: 'admin-1',
        processedAt: new Date(),
      });

      const response = await request(app)
        .put('/api/v1/gdpr/erasure-request/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'COMPLETED', notes: 'All data erased' });

      expect(response.status).toBe(200);
      expect(mockPrisma.erasureRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'COMPLETED',
            processedAt: expect.any(Date),
          }),
        })
      );
    });

    it('should reject an erasure request', async () => {
      (mockPrisma.erasureRequest.findUnique as jest.Mock).mockResolvedValue(mockErasureRequest);
      (mockPrisma.erasureRequest.update as jest.Mock).mockResolvedValue({
        ...mockErasureRequest,
        status: 'REJECTED',
        processedBy: 'admin-1',
        processedAt: new Date(),
        notes: 'Legal hold prevents erasure',
      });

      const response = await request(app)
        .put('/api/v1/gdpr/erasure-request/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'REJECTED', notes: 'Legal hold prevents erasure' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('REJECTED');
    });

    it('should return 404 for non-existent erasure request', async () => {
      (mockPrisma.erasureRequest.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/v1/gdpr/erasure-request/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token')
        .send({ status: 'COMPLETED' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for already completed request', async () => {
      (mockPrisma.erasureRequest.findUnique as jest.Mock).mockResolvedValue({
        ...mockErasureRequest,
        status: 'COMPLETED',
      });

      const response = await request(app)
        .put('/api/v1/gdpr/erasure-request/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'COMPLETED' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('ALREADY_PROCESSED');
    });

    it('should reject invalid status', async () => {
      const response = await request(app)
        .put('/api/v1/gdpr/erasure-request/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.erasureRequest.findUnique as jest.Mock).mockResolvedValue(mockErasureRequest);
      (mockPrisma.erasureRequest.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .put('/api/v1/gdpr/erasure-request/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'COMPLETED' });

      expect(response.status).toBe(500);
    });
  });

  // =========================================================================
  // GET /api/v1/gdpr/retention-policies
  // =========================================================================
  describe('GET /api/v1/gdpr/retention-policies', () => {
    it('should list retention policies', async () => {
      (mockPrisma.dataRetentionPolicy.findMany as jest.Mock).mockResolvedValue([mockRetentionPolicy]);
      (mockPrisma.dataRetentionPolicy.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/v1/gdpr/retention-policies')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].dataCategory).toBe('audit_logs');
    });

    it('should filter by module', async () => {
      (mockPrisma.dataRetentionPolicy.findMany as jest.Mock).mockResolvedValue([mockRetentionPolicy]);
      (mockPrisma.dataRetentionPolicy.count as jest.Mock).mockResolvedValue(1);

      await request(app)
        .get('/api/v1/gdpr/retention-policies?module=health-safety')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.dataRetentionPolicy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ module: 'health-safety' }),
        })
      );
    });

    it('should filter by isActive', async () => {
      (mockPrisma.dataRetentionPolicy.findMany as jest.Mock).mockResolvedValue([mockRetentionPolicy]);
      (mockPrisma.dataRetentionPolicy.count as jest.Mock).mockResolvedValue(1);

      await request(app)
        .get('/api/v1/gdpr/retention-policies?isActive=true')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.dataRetentionPolicy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        })
      );
    });

    it('should handle empty results', async () => {
      (mockPrisma.dataRetentionPolicy.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.dataRetentionPolicy.count as jest.Mock).mockResolvedValue(0);

      const response = await request(app)
        .get('/api/v1/gdpr/retention-policies')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(0);
    });

    it('should handle database errors', async () => {
      (mockPrisma.dataRetentionPolicy.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/v1/gdpr/retention-policies')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
    });
  });

  // =========================================================================
  // POST /api/v1/gdpr/retention-policies
  // =========================================================================
  describe('POST /api/v1/gdpr/retention-policies', () => {
    const validBody = {
      dataCategory: 'audit_logs',
      module: 'health-safety',
      retentionDays: 2555,
      action: 'ARCHIVE',
      legalBasis: 'Legal obligation (Art 6(1)(c))',
    };

    it('should create a retention policy', async () => {
      (mockPrisma.dataRetentionPolicy.upsert as jest.Mock).mockResolvedValue(mockRetentionPolicy);

      const response = await request(app)
        .post('/api/v1/gdpr/retention-policies')
        .set('Authorization', 'Bearer token')
        .send(validBody);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.dataCategory).toBe('audit_logs');
    });

    it('should reject missing dataCategory', async () => {
      const response = await request(app)
        .post('/api/v1/gdpr/retention-policies')
        .set('Authorization', 'Bearer token')
        .send({ ...validBody, dataCategory: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject missing module', async () => {
      const response = await request(app)
        .post('/api/v1/gdpr/retention-policies')
        .set('Authorization', 'Bearer token')
        .send({ ...validBody, module: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid retention days (zero)', async () => {
      const response = await request(app)
        .post('/api/v1/gdpr/retention-policies')
        .set('Authorization', 'Bearer token')
        .send({ ...validBody, retentionDays: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid action', async () => {
      const response = await request(app)
        .post('/api/v1/gdpr/retention-policies')
        .set('Authorization', 'Bearer token')
        .send({ ...validBody, action: 'INVALID_ACTION' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors on upsert', async () => {
      (mockPrisma.dataRetentionPolicy.upsert as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .post('/api/v1/gdpr/retention-policies')
        .set('Authorization', 'Bearer token')
        .send(validBody);

      expect(response.status).toBe(500);
    });
  });

  // =========================================================================
  // GET /api/v1/gdpr/data-map
  // =========================================================================
  describe('GET /api/v1/gdpr/data-map', () => {
    it('should return the data map', async () => {
      (mockPrisma.dataRetentionPolicy.findMany as jest.Mock).mockResolvedValue([mockRetentionPolicy]);

      const response = await request(app)
        .get('/api/v1/gdpr/data-map')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('modules');
      expect(response.body.data).toHaveProperty('totalModules');
      expect(response.body.data).toHaveProperty('totalPersonalFields');
      expect(response.body.data).toHaveProperty('lastUpdated');
      expect(response.body.data.totalModules).toBeGreaterThan(0);
      expect(response.body.data.totalPersonalFields).toBeGreaterThan(0);
    });

    it('should include retention policies per module', async () => {
      (mockPrisma.dataRetentionPolicy.findMany as jest.Mock).mockResolvedValue([mockRetentionPolicy]);

      const response = await request(app)
        .get('/api/v1/gdpr/data-map')
        .set('Authorization', 'Bearer token');

      const hsModule = response.body.data.modules.find((m: any) => m.module === 'health-safety');
      expect(hsModule).toBeDefined();
      expect(hsModule.retentionPolicies).toHaveLength(1);
      expect(hsModule.retentionPolicies[0].dataCategory).toBe('audit_logs');
    });

    it('should work when no retention policies exist', async () => {
      (mockPrisma.dataRetentionPolicy.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/gdpr/data-map')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.modules).toBeDefined();
      response.body.data.modules.forEach((m: any) => {
        expect(m.retentionPolicies).toEqual([]);
      });
    });

    it('should handle database errors', async () => {
      (mockPrisma.dataRetentionPolicy.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/v1/gdpr/data-map')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
    });
  });
});
