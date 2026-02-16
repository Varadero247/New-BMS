import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    traceabilityMatrix: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    traceabilityLink: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

import traceabilityRouter from '../src/routes/traceability';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as any;

const app = express();
app.use(express.json());
app.use('/api/traceability', traceabilityRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Medical Traceability API Routes', () => {
  const mockMatrix = {
    id: 'matrix-uuid-1',
    refNumber: 'TRC-2601-0001',
    title: 'Device A Traceability Matrix',
    deviceId: 'DEV-001',
    deviceName: 'Device A',
    version: '1.0',
    status: 'DRAFT',
    scope: 'Full design lifecycle',
    preparedBy: 'John Engineer',
    reviewedBy: null,
    notes: null,
    createdBy: 'user-1',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { links: 0 },
  };

  const mockLink = {
    id: 'link-uuid-1',
    matrixId: 'matrix-uuid-1',
    userNeedRef: 'UN-001',
    userNeedDesc: 'Device must operate at 37°C',
    designInputRef: 'DI-001',
    designInputDesc: 'Thermal specification',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('GET /api/traceability', () => {
    it('should return list of traceability matrices with pagination', async () => {
      mockPrisma.traceabilityMatrix.findMany.mockResolvedValue([mockMatrix]);
      mockPrisma.traceabilityMatrix.count.mockResolvedValue(1);

      const res = await request(app).get('/api/traceability');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrisma.traceabilityMatrix.findMany.mockResolvedValue([mockMatrix]);
      mockPrisma.traceabilityMatrix.count.mockResolvedValue(1);

      const res = await request(app).get('/api/traceability?status=DRAFT');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by deviceName', async () => {
      mockPrisma.traceabilityMatrix.findMany.mockResolvedValue([mockMatrix]);
      mockPrisma.traceabilityMatrix.count.mockResolvedValue(1);

      const res = await request(app).get('/api/traceability?deviceName=Device+A');

      expect(res.status).toBe(200);
    });

    it('should support search', async () => {
      mockPrisma.traceabilityMatrix.findMany.mockResolvedValue([]);
      mockPrisma.traceabilityMatrix.count.mockResolvedValue(0);

      const res = await request(app).get('/api/traceability?search=device');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.traceabilityMatrix.findMany.mockRejectedValue(new Error('DB error'));
      mockPrisma.traceabilityMatrix.count.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/traceability');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/traceability/:id', () => {
    it('should return a matrix with links', async () => {
      mockPrisma.traceabilityMatrix.findUnique.mockResolvedValue({ ...mockMatrix, links: [mockLink] });

      const res = await request(app).get('/api/traceability/matrix-uuid-1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('matrix-uuid-1');
    });

    it('should return 404 when matrix not found', async () => {
      mockPrisma.traceabilityMatrix.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/traceability/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when matrix is soft-deleted', async () => {
      mockPrisma.traceabilityMatrix.findUnique.mockResolvedValue({ ...mockMatrix, deletedAt: new Date() });

      const res = await request(app).get('/api/traceability/matrix-uuid-1');

      expect(res.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.traceabilityMatrix.findUnique.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/traceability/matrix-uuid-1');

      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/traceability', () => {
    const validBody = {
      title: 'New Traceability Matrix',
      deviceName: 'Device B',
      preparedBy: 'Jane Engineer',
    };

    it('should create a new traceability matrix', async () => {
      mockPrisma.traceabilityMatrix.count.mockResolvedValue(0);
      mockPrisma.traceabilityMatrix.create.mockResolvedValue(mockMatrix);

      const res = await request(app).post('/api/traceability').send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/traceability')
        .send({ title: 'Missing deviceName' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.traceabilityMatrix.count.mockResolvedValue(0);
      mockPrisma.traceabilityMatrix.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/traceability').send(validBody);

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/traceability/:id', () => {
    it('should update a traceability matrix', async () => {
      mockPrisma.traceabilityMatrix.findUnique.mockResolvedValue(mockMatrix);
      const updated = { ...mockMatrix, status: 'IN_REVIEW' };
      mockPrisma.traceabilityMatrix.update.mockResolvedValue(updated);

      const res = await request(app)
        .put('/api/traceability/matrix-uuid-1')
        .send({ status: 'IN_REVIEW' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when matrix not found', async () => {
      mockPrisma.traceabilityMatrix.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/traceability/nonexistent')
        .send({ status: 'APPROVED' });

      expect(res.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.traceabilityMatrix.findUnique.mockResolvedValue(mockMatrix);
      mockPrisma.traceabilityMatrix.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/traceability/matrix-uuid-1')
        .send({ title: 'Updated' });

      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/traceability/:id', () => {
    it('should soft delete a traceability matrix', async () => {
      mockPrisma.traceabilityMatrix.findUnique.mockResolvedValue(mockMatrix);
      mockPrisma.traceabilityMatrix.update.mockResolvedValue({ ...mockMatrix, deletedAt: new Date() });

      const res = await request(app).delete('/api/traceability/matrix-uuid-1');

      expect(res.status).toBe(204);
    });

    it('should return 404 when matrix not found', async () => {
      mockPrisma.traceabilityMatrix.findUnique.mockResolvedValue(null);

      const res = await request(app).delete('/api/traceability/nonexistent');

      expect(res.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.traceabilityMatrix.findUnique.mockResolvedValue(mockMatrix);
      mockPrisma.traceabilityMatrix.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete('/api/traceability/matrix-uuid-1');

      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/traceability/:id/links', () => {
    const validLink = {
      userNeedRef: 'UN-001',
      userNeedDesc: 'Device must operate at 37°C',
    };

    it('should add a traceability link', async () => {
      mockPrisma.traceabilityMatrix.findUnique.mockResolvedValue(mockMatrix);
      mockPrisma.traceabilityLink.create.mockResolvedValue(mockLink);

      const res = await request(app)
        .post('/api/traceability/matrix-uuid-1/links')
        .send(validLink);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when matrix not found', async () => {
      mockPrisma.traceabilityMatrix.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/traceability/nonexistent/links')
        .send(validLink);

      expect(res.status).toBe(404);
    });

    it('should return 400 for missing required fields', async () => {
      mockPrisma.traceabilityMatrix.findUnique.mockResolvedValue(mockMatrix);

      const res = await request(app)
        .post('/api/traceability/matrix-uuid-1/links')
        .send({ userNeedRef: 'UN-001' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.traceabilityMatrix.findUnique.mockResolvedValue(mockMatrix);
      mockPrisma.traceabilityLink.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .post('/api/traceability/matrix-uuid-1/links')
        .send(validLink);

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/traceability/:id/links/:linkId', () => {
    it('should update a traceability link', async () => {
      mockPrisma.traceabilityLink.findUnique.mockResolvedValue(mockLink);
      const updated = { ...mockLink, status: 'VERIFIED' };
      mockPrisma.traceabilityLink.update.mockResolvedValue(updated);

      const res = await request(app)
        .put('/api/traceability/matrix-uuid-1/links/link-uuid-1')
        .send({ status: 'VERIFIED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when link not found', async () => {
      mockPrisma.traceabilityLink.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/traceability/matrix-uuid-1/links/nonexistent')
        .send({ status: 'VERIFIED' });

      expect(res.status).toBe(404);
    });

    it('should return 404 when link belongs to different matrix', async () => {
      mockPrisma.traceabilityLink.findUnique.mockResolvedValue({ ...mockLink, matrixId: 'other-matrix' });

      const res = await request(app)
        .put('/api/traceability/matrix-uuid-1/links/link-uuid-1')
        .send({ status: 'VERIFIED' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/traceability/:id/links/:linkId', () => {
    it('should delete a traceability link', async () => {
      mockPrisma.traceabilityLink.findUnique.mockResolvedValue(mockLink);
      mockPrisma.traceabilityLink.delete.mockResolvedValue(mockLink);

      const res = await request(app)
        .delete('/api/traceability/matrix-uuid-1/links/link-uuid-1');

      expect(res.status).toBe(204);
    });

    it('should return 404 when link not found', async () => {
      mockPrisma.traceabilityLink.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/traceability/matrix-uuid-1/links/nonexistent');

      expect(res.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.traceabilityLink.findUnique.mockResolvedValue(mockLink);
      mockPrisma.traceabilityLink.delete.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .delete('/api/traceability/matrix-uuid-1/links/link-uuid-1');

      expect(res.status).toBe(500);
    });
  });
});
