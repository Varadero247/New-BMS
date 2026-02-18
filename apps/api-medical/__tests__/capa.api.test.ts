import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    medCapa: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
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

import capaRouter from '../src/routes/capa';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as any;

const app = express();
app.use(express.json());
app.use('/api/capa', capaRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Medical CAPA API Routes', () => {
  const mockCapa = {
    id: '00000000-0000-0000-0000-000000000001',
    refNumber: 'CAPA-2601-0001',
    title: 'Fix device failure',
    capaType: 'CORRECTIVE',
    source: 'COMPLAINT',
    sourceRef: 'CMP-001',
    description: 'Device fails under stress',
    deviceName: 'Device A',
    deviceId: 'DEV-001',
    severity: 'MAJOR',
    status: 'OPEN',
    createdBy: 'user-1',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('GET /api/capa', () => {
    it('should return list of CAPAs with pagination', async () => {
      mockPrisma.medCapa.findMany.mockResolvedValue([mockCapa]);
      mockPrisma.medCapa.count.mockResolvedValue(1);

      const res = await request(app).get('/api/capa');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrisma.medCapa.findMany.mockResolvedValue([mockCapa]);
      mockPrisma.medCapa.count.mockResolvedValue(1);

      const res = await request(app).get('/api/capa?status=OPEN');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should support search', async () => {
      mockPrisma.medCapa.findMany.mockResolvedValue([mockCapa]);
      mockPrisma.medCapa.count.mockResolvedValue(1);

      const res = await request(app).get('/api/capa?search=device');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.medCapa.findMany.mockRejectedValue(new Error('DB error'));
      mockPrisma.medCapa.count.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/capa');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/capa/stats', () => {
    it('should return CAPA statistics', async () => {
      mockPrisma.medCapa.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(2);
      mockPrisma.medCapa.groupBy
        .mockResolvedValueOnce([{ status: 'OPEN', _count: { id: 5 } }])
        .mockResolvedValueOnce([{ capaType: 'CORRECTIVE', _count: { id: 8 } }])
        .mockResolvedValueOnce([{ severity: 'MAJOR', _count: { id: 3 } }]);

      const res = await request(app).get('/api/capa/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('overdue');
      expect(res.body.data).toHaveProperty('byStatus');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.medCapa.count.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/capa/stats');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/capa/:id', () => {
    it('should return a single CAPA', async () => {
      mockPrisma.medCapa.findUnique.mockResolvedValue(mockCapa);

      const res = await request(app).get('/api/capa/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when CAPA not found', async () => {
      mockPrisma.medCapa.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/capa/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when CAPA is soft-deleted', async () => {
      mockPrisma.medCapa.findUnique.mockResolvedValue({ ...mockCapa, deletedAt: new Date() });

      const res = await request(app).get('/api/capa/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.medCapa.findUnique.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/capa/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/capa', () => {
    const validBody = {
      title: 'Fix device failure',
      source: 'COMPLAINT',
      description: 'Device fails under stress',
    };

    it('should create a new CAPA', async () => {
      mockPrisma.medCapa.count.mockResolvedValue(0);
      mockPrisma.medCapa.create.mockResolvedValue(mockCapa);

      const res = await request(app).post('/api/capa').send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({ title: 'Fix device failure' });
    });

    it('should return 400 for invalid input (missing title)', async () => {
      const res = await request(app)
        .post('/api/capa')
        .send({ source: 'COMPLAINT', description: 'Some description' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid source enum', async () => {
      const res = await request(app)
        .post('/api/capa')
        .send({ title: 'Test', source: 'INVALID_SOURCE', description: 'desc' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.medCapa.count.mockResolvedValue(0);
      mockPrisma.medCapa.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/capa').send(validBody);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/capa/:id', () => {
    it('should update a CAPA', async () => {
      mockPrisma.medCapa.findUnique.mockResolvedValue(mockCapa);
      const updated = { ...mockCapa, status: 'INVESTIGATION' };
      mockPrisma.medCapa.update.mockResolvedValue(updated);

      const res = await request(app)
        .put('/api/capa/00000000-0000-0000-0000-000000000001')
        .send({ status: 'INVESTIGATION' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('INVESTIGATION');
    });

    it('should return 404 when CAPA not found', async () => {
      mockPrisma.medCapa.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/capa/00000000-0000-0000-0000-000000000099')
        .send({ status: 'CLOSED' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid status enum', async () => {
      mockPrisma.medCapa.findUnique.mockResolvedValue(mockCapa);

      const res = await request(app)
        .put('/api/capa/00000000-0000-0000-0000-000000000001')
        .send({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.medCapa.findUnique.mockResolvedValue(mockCapa);
      mockPrisma.medCapa.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/capa/00000000-0000-0000-0000-000000000001')
        .send({ title: 'Updated' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/capa/:id', () => {
    it('should soft delete a CAPA', async () => {
      mockPrisma.medCapa.findUnique.mockResolvedValue(mockCapa);
      mockPrisma.medCapa.update.mockResolvedValue({ ...mockCapa, deletedAt: new Date() });

      const res = await request(app).delete('/api/capa/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(204);
    });

    it('should return 404 when CAPA not found', async () => {
      mockPrisma.medCapa.findUnique.mockResolvedValue(null);

      const res = await request(app).delete('/api/capa/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.medCapa.findUnique.mockResolvedValue(mockCapa);
      mockPrisma.medCapa.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete('/api/capa/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});
