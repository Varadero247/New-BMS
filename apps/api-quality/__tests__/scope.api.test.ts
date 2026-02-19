import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    qualDocument: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {},
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock('@ims/rbac', () => ({
  requirePermission: () => (_req: any, _res: any, next: any) => next(),
  PermissionLevel: { NONE: 0, VIEW: 1, CREATE: 2, EDIT: 3, DELETE: 4, APPROVE: 5, FULL: 6 },
}));

import scopeRouter from '../src/routes/scope';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/scope', scopeRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Quality Scope API Routes', () => {
  const mockScopeDoc = {
    id: 'doc-uuid-2',
    referenceNumber: 'QMS-SCP-2601-001',
    title: 'QMS Scope',
    documentType: 'POLICY',
    scope: 'Our QMS covers all manufacturing and delivery processes.',
    purpose: 'Define the organizational scope.',
    keyChanges: JSON.stringify({
      exclusions: 'Design activities at partner sites',
      boundaries: 'ISO 9001:2015 clause 4.3',
      applicableStandards: 'ISO 9001:2015',
    }),
    version: '1.0',
    status: 'APPROVED',
    author: 'user-1',
    approvedBy: null,
    effectiveDate: new Date('2026-01-01').toISOString(),
    nextReviewDate: new Date('2027-01-01').toISOString(),
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('GET /api/scope', () => {
    it('should return the current QMS scope', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(mockScopeDoc);

      const res = await request(app).get('/api/scope');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('scope');
      expect(res.body.data).toHaveProperty('version');
      expect(res.body.data).toHaveProperty('status');
      expect(res.body.data).toHaveProperty('exclusions');
      expect(res.body.data).toHaveProperty('applicableStandards');
    });

    it('should return empty defaults when no scope document exists', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/scope');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeNull();
      expect(res.body.data.scope).toBe('');
      expect(res.body.data.version).toBe('1.0');
      expect(res.body.data.status).toBe('DRAFT');
    });

    it('should handle missing keyChanges gracefully', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue({ ...mockScopeDoc, keyChanges: null });

      const res = await request(app).get('/api/scope');

      expect(res.status).toBe(200);
      expect(res.body.data.exclusions).toBe('');
      expect(res.body.data.applicableStandards).toBe('');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualDocument.findFirst.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/scope');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/scope', () => {
    const validBody = {
      scope: 'Our QMS covers all manufacturing and delivery processes.',
      purpose: 'Define the organizational scope.',
      exclusions: 'Design activities at partner sites',
      boundaries: 'ISO 9001:2015 clause 4.3',
      applicableStandards: 'ISO 9001:2015',
      version: '1.1',
      status: 'APPROVED',
    };

    it('should create a new scope document when none exists', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(null);
      mockPrisma.qualDocument.count.mockResolvedValue(0);
      mockPrisma.qualDocument.create.mockResolvedValue(mockScopeDoc);

      const res = await request(app).put('/api/scope').send(validBody);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('scope');
    });

    it('should update an existing scope document', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(mockScopeDoc);
      const updated = { ...mockScopeDoc, scope: validBody.scope };
      mockPrisma.qualDocument.update.mockResolvedValue(updated);

      const res = await request(app).put('/api/scope').send(validBody);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing scope field', async () => {
      const res = await request(app).put('/api/scope').send({ version: '1.0' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid status', async () => {
      const res = await request(app)
        .put('/api/scope')
        .send({ scope: 'Test scope', status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
    });

    it('should return 500 on database error during create', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(null);
      mockPrisma.qualDocument.count.mockResolvedValue(0);
      mockPrisma.qualDocument.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).put('/api/scope').send(validBody);

      expect(res.status).toBe(500);
    });

    it('should return 500 on database error during update', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(mockScopeDoc);
      mockPrisma.qualDocument.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app).put('/api/scope').send(validBody);

      expect(res.status).toBe(500);
    });
  });
});
