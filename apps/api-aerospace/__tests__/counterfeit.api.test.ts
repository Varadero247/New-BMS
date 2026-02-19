import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    aeroCounterfeitReport: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    aeroSuspectPart: {
      findMany: jest.fn(),
      create: jest.fn(),
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

jest.mock('@ims/service-auth', () => ({
  scopeToUser: (_req: any, _res: any, next: any) => next(),
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
}));

import router from '../src/routes/counterfeit';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/counterfeit', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Aerospace Counterfeit Parts API', () => {
  // =============================================
  // GET / - List counterfeit reports
  // =============================================
  describe('GET /api/counterfeit', () => {
    it('should return paginated list of counterfeit reports', async () => {
      mockPrisma.aeroCounterfeitReport.findMany.mockResolvedValueOnce([
        {
          id: '00000000-0000-0000-0000-000000000001',
          refNumber: 'AERO-CF-2026-001',
          title: 'Suspect IC Chips',
          partNumber: 'IC-123',
          status: 'OPEN',
        },
      ]);
      mockPrisma.aeroCounterfeitReport.count.mockResolvedValueOnce(1);

      const res = await request(app).get('/api/counterfeit').set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toMatchObject({ page: 1, limit: 20, total: 1, totalPages: 1 });
    });

    it('should filter by status', async () => {
      mockPrisma.aeroCounterfeitReport.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroCounterfeitReport.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/counterfeit?status=CONFIRMED')
        .set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroCounterfeitReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'CONFIRMED' }) })
      );
    });

    it('should filter by disposition', async () => {
      mockPrisma.aeroCounterfeitReport.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroCounterfeitReport.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/counterfeit?disposition=QUARANTINE')
        .set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroCounterfeitReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ disposition: 'QUARANTINE' }) })
      );
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroCounterfeitReport.findMany.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/counterfeit').set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // GET /:id
  // =============================================
  describe('GET /api/counterfeit/:id', () => {
    it('should return a single counterfeit report', async () => {
      mockPrisma.aeroCounterfeitReport.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'AERO-CF-2026-001',
        title: 'Suspect IC Chips',
        deletedAt: null,
      });

      const res = await request(app)
        .get('/api/counterfeit/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroCounterfeitReport.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/api/counterfeit/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when soft-deleted', async () => {
      mockPrisma.aeroCounterfeitReport.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const res = await request(app)
        .get('/api/counterfeit/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // =============================================
  // POST / - Create counterfeit report
  // =============================================
  describe('POST /api/counterfeit', () => {
    const validPayload = {
      title: 'Suspect Resistors',
      partNumber: 'RES-470K',
      dateDiscovered: '2026-02-01',
      discrepancyDescription: 'Incorrect resistance values, suspected counterfeit markings',
    };

    it('should create a counterfeit report successfully', async () => {
      mockPrisma.aeroCounterfeitReport.count.mockResolvedValueOnce(0);
      mockPrisma.aeroCounterfeitReport.create.mockResolvedValueOnce({
        id: 'cf-new',
        refNumber: 'AERO-CF-2026-001',
        ...validPayload,
        status: 'OPEN',
      });

      const res = await request(app)
        .post('/api/counterfeit')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('OPEN');
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/counterfeit')
        .set('Authorization', 'Bearer token')
        .send({ partNumber: 'PN-1', dateDiscovered: '2026-01-01', discrepancyDescription: 'desc' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when partNumber is missing', async () => {
      const res = await request(app)
        .post('/api/counterfeit')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', dateDiscovered: '2026-01-01', discrepancyDescription: 'desc' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when dateDiscovered is missing', async () => {
      const res = await request(app)
        .post('/api/counterfeit')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', partNumber: 'PN-1', discrepancyDescription: 'desc' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when discrepancyDescription is missing', async () => {
      const res = await request(app)
        .post('/api/counterfeit')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', partNumber: 'PN-1', dateDiscovered: '2026-01-01' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroCounterfeitReport.count.mockResolvedValueOnce(0);
      mockPrisma.aeroCounterfeitReport.create.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .post('/api/counterfeit')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // PUT /:id - Update counterfeit report
  // =============================================
  describe('PUT /api/counterfeit/:id', () => {
    const existing = {
      id: '00000000-0000-0000-0000-000000000001',
      status: 'OPEN',
      deletedAt: null,
    };

    it('should update a counterfeit report', async () => {
      mockPrisma.aeroCounterfeitReport.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.aeroCounterfeitReport.update.mockResolvedValueOnce({
        ...existing,
        status: 'CONFIRMED',
      });

      const res = await request(app)
        .put('/api/counterfeit/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'CONFIRMED', investigationFindings: 'Confirmed counterfeit markings' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroCounterfeitReport.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/counterfeit/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token')
        .send({ status: 'CONFIRMED' });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status', async () => {
      mockPrisma.aeroCounterfeitReport.findUnique.mockResolvedValueOnce(existing);

      const res = await request(app)
        .put('/api/counterfeit/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // =============================================
  // DELETE /:id
  // =============================================
  describe('DELETE /api/counterfeit/:id', () => {
    it('should soft-delete a counterfeit report', async () => {
      mockPrisma.aeroCounterfeitReport.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      mockPrisma.aeroCounterfeitReport.update.mockResolvedValueOnce({});

      const res = await request(app)
        .delete('/api/counterfeit/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(204);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroCounterfeitReport.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .delete('/api/counterfeit/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // =============================================
  // GET /suspect-parts
  // =============================================
  describe('GET /api/counterfeit/suspect-parts', () => {
    it('should list suspect parts', async () => {
      mockPrisma.aeroSuspectPart.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroSuspectPart.count.mockResolvedValueOnce(0);
      const res = await request(app)
        .get('/api/counterfeit/suspect-parts')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // =============================================
  // POST /suspect-parts
  // =============================================
  describe('POST /api/counterfeit/suspect-parts', () => {
    const validPayload = {
      partNumber: 'IC-7805',
      nomenclature: 'Voltage Regulator IC',
      manufacturer: 'Unknown',
      riskLevel: 'HIGH',
    };

    it('should add a suspect part to the database', async () => {
      mockPrisma.aeroSuspectPart.count.mockResolvedValueOnce(0);
      mockPrisma.aeroSuspectPart.create.mockResolvedValueOnce({
        id: 'sp-new',
        refNumber: 'AERO-SPT-2026-001',
        ...validPayload,
      });

      const res = await request(app)
        .post('/api/counterfeit/suspect-parts')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 when partNumber is missing', async () => {
      const res = await request(app)
        .post('/api/counterfeit/suspect-parts')
        .set('Authorization', 'Bearer token')
        .send({ nomenclature: 'Test IC' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when nomenclature is missing', async () => {
      const res = await request(app)
        .post('/api/counterfeit/suspect-parts')
        .set('Authorization', 'Bearer token')
        .send({ partNumber: 'PN-1' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroSuspectPart.count.mockResolvedValueOnce(0);
      mockPrisma.aeroSuspectPart.create.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .post('/api/counterfeit/suspect-parts')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
