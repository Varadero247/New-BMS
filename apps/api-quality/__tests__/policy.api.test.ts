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
}));

import policyRouter from '../src/routes/policy';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as any;

const app = express();
app.use(express.json());
app.use('/api/policy', policyRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Quality Policy API Routes', () => {
  const mockPolicyDoc = {
    id: 'doc-uuid-1',
    referenceNumber: 'QMS-POL-2601-001',
    title: 'Quality Policy',
    documentType: 'POLICY',
    scope: 'We are committed to quality excellence.',
    purpose: 'This policy defines our quality objectives.',
    keyChanges: JSON.stringify({
      commitments: 'Customer focus, process improvement',
      objectives: 'Achieve 99% customer satisfaction',
      applicability: 'All departments',
    }),
    version: '2.0',
    status: 'APPROVED',
    author: 'user-1',
    approvedBy: 'Director',
    effectiveDate: new Date('2026-01-01').toISOString(),
    nextReviewDate: new Date('2027-01-01').toISOString(),
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('GET /api/policy', () => {
    it('should return the current quality policy', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(mockPolicyDoc);

      const res = await request(app).get('/api/policy');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('policyStatement');
      expect(res.body.data).toHaveProperty('version');
      expect(res.body.data).toHaveProperty('status');
      expect(res.body.data).toHaveProperty('commitments');
    });

    it('should return empty defaults when no policy exists', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/policy');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeNull();
      expect(res.body.data.policyStatement).toBe('');
      expect(res.body.data.version).toBe('1.0');
      expect(res.body.data.status).toBe('DRAFT');
    });

    it('should handle missing keyChanges gracefully', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue({ ...mockPolicyDoc, keyChanges: null });

      const res = await request(app).get('/api/policy');

      expect(res.status).toBe(200);
      expect(res.body.data.commitments).toBe('');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualDocument.findFirst.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/policy');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/policy', () => {
    const validBody = {
      policyStatement: 'We are committed to delivering high-quality products.',
      purpose: 'Define quality direction.',
      commitments: 'Customer focus',
      objectives: 'Achieve 99% satisfaction',
      applicability: 'All departments',
      version: '2.1',
      status: 'APPROVED',
    };

    it('should create a new policy when none exists', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(null);
      mockPrisma.qualDocument.count.mockResolvedValue(0);
      mockPrisma.qualDocument.create.mockResolvedValue(mockPolicyDoc);

      const res = await request(app).put('/api/policy').send(validBody);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('policyStatement');
    });

    it('should update an existing policy', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(mockPolicyDoc);
      const updated = { ...mockPolicyDoc, scope: validBody.policyStatement };
      mockPrisma.qualDocument.update.mockResolvedValue(updated);

      const res = await request(app).put('/api/policy').send(validBody);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing policyStatement', async () => {
      const res = await request(app).put('/api/policy').send({ version: '1.0' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid status', async () => {
      const res = await request(app)
        .put('/api/policy')
        .send({ policyStatement: 'Test policy', status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
    });

    it('should return 500 on database error during create', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(null);
      mockPrisma.qualDocument.count.mockResolvedValue(0);
      mockPrisma.qualDocument.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).put('/api/policy').send(validBody);

      expect(res.status).toBe(500);
    });

    it('should return 500 on database error during update', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(mockPolicyDoc);
      mockPrisma.qualDocument.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app).put('/api/policy').send(validBody);

      expect(res.status).toBe(500);
    });
  });
});
