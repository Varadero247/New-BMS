import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    qualRisk: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => '30000000-0000-4000-a000-000000000123'),
}));

import { prisma } from '../src/prisma';
import risksRoutes from '../src/routes/risks';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Quality Risks API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/risks', risksRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/risks', () => {
    const mockRisks = [
      {
        id: '10000000-0000-4000-a000-000000000001',
        referenceNumber: 'QMS-RSK-2026-001',
        process: 'OPERATIONS',
        riskDescription: 'Equipment failure risk',
        riskFactor: 20,
        riskLevel: 'HIGH',
        status: 'OPEN',
        likelihood: 4,
        probabilityRating: 4,
        consequenceRating: 5,
      },
      {
        id: '10000000-0000-4000-a000-000000000002',
        referenceNumber: 'QMS-RSK-2026-002',
        process: 'HR',
        riskDescription: 'Staff turnover risk',
        riskFactor: 8,
        riskLevel: 'MEDIUM',
        status: 'MONITORED',
        likelihood: 2,
        probabilityRating: 2,
        consequenceRating: 4,
      },
    ];

    it('should return list of risks with pagination', async () => {
      (mockPrisma.qualRisk.findMany as jest.Mock).mockResolvedValueOnce(mockRisks);
      (mockPrisma.qualRisk.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app).get('/api/risks').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.qualRisk.findMany as jest.Mock).mockResolvedValueOnce([mockRisks[0]]);
      (mockPrisma.qualRisk.count as jest.Mock).mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/risks?page=2&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(2);
      expect(response.body.data.limit).toBe(10);
      expect(response.body.data.totalPages).toBe(10);
    });

    it('should filter by riskLevel', async () => {
      (mockPrisma.qualRisk.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualRisk.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/risks?riskLevel=HIGH').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualRisk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            riskLevel: 'HIGH',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.qualRisk.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualRisk.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/risks?status=OPEN').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualRisk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'OPEN',
          }),
        })
      );
    });

    it('should filter by process', async () => {
      (mockPrisma.qualRisk.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualRisk.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/risks?process=OPERATIONS').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualRisk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            process: 'OPERATIONS',
          }),
        })
      );
    });

    it('should filter by search on riskDescription', async () => {
      (mockPrisma.qualRisk.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualRisk.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/risks?search=equipment').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualRisk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            riskDescription: { contains: 'equipment', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should order by riskFactor descending', async () => {
      (mockPrisma.qualRisk.findMany as jest.Mock).mockResolvedValueOnce(mockRisks);
      (mockPrisma.qualRisk.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app).get('/api/risks').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualRisk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { riskFactor: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualRisk.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/risks').set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/risks/:id', () => {
    const mockRisk = {
      id: '10000000-0000-4000-a000-000000000001',
      referenceNumber: 'QMS-RSK-2026-001',
      process: 'OPERATIONS',
      riskDescription: 'Equipment failure risk',
      riskFactor: 20,
      riskLevel: 'HIGH',
    };

    it('should return a single risk', async () => {
      (mockPrisma.qualRisk.findUnique as jest.Mock).mockResolvedValueOnce(mockRisk);

      const response = await request(app)
        .get('/api/risks/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('10000000-0000-4000-a000-000000000001');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff risk', async () => {
      (mockPrisma.qualRisk.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/risks/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualRisk.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/risks/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/risks', () => {
    const createPayload = {
      process: 'OPERATIONS',
      riskDescription: 'New operational risk',
      likelihood: 3,
      lossOfContracts: 2,
      harmToUser: 4,
      unableToMeetTerms: 1,
      violationOfRegulations: 3,
      reputationImpact: 2,
      costOfCorrection: 3,
    };

    it('should create a risk successfully', async () => {
      (mockPrisma.qualRisk.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualRisk.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'QMS-RSK-2026-001',
        ...createPayload,
        probabilityRating: 3,
        consequenceRating: 4,
        riskFactor: 12,
        riskLevel: 'MEDIUM',
        status: 'OPEN',
      });

      const response = await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.riskDescription).toBe('New operational risk');
    });

    it('should calculate risk fields (riskFactor = likelihood * max consequence)', async () => {
      (mockPrisma.qualRisk.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualRisk.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        riskFactor: 12,
        riskLevel: 'MEDIUM',
      });

      await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.qualRisk.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          probabilityRating: 3,
          consequenceRating: 4,
          riskFactor: 12,
          riskLevel: 'MEDIUM',
        }),
      });
    });

    it('should generate a reference number on create', async () => {
      (mockPrisma.qualRisk.count as jest.Mock).mockResolvedValueOnce(3);
      (mockPrisma.qualRisk.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'QMS-RSK-2026-004',
        ...createPayload,
      });

      await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.qualRisk.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          referenceNumber: expect.stringContaining('QMS-RSK-'),
        }),
      });
    });

    it('should return 400 for missing process', async () => {
      const response = await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send({ riskDescription: 'No process' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing riskDescription', async () => {
      const response = await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send({ process: 'OPERATIONS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid process enum', async () => {
      const response = await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send({ process: 'INVALID', riskDescription: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for likelihood out of range', async () => {
      const response = await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, likelihood: 10 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualRisk.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualRisk.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/risks/:id', () => {
    const existingRisk = {
      id: '10000000-0000-4000-a000-000000000001',
      process: 'OPERATIONS',
      riskDescription: 'Existing risk',
      likelihood: 3,
      lossOfContracts: 2,
      harmToUser: 4,
      unableToMeetTerms: 1,
      violationOfRegulations: 3,
      reputationImpact: 2,
      costOfCorrection: 3,
      probabilityRating: 3,
      consequenceRating: 4,
      riskFactor: 12,
      riskLevel: 'MEDIUM',
      status: 'OPEN',
    };

    it('should update a risk successfully', async () => {
      (mockPrisma.qualRisk.findUnique as jest.Mock).mockResolvedValueOnce(existingRisk);
      (mockPrisma.qualRisk.update as jest.Mock).mockResolvedValueOnce({
        ...existingRisk,
        riskDescription: 'Updated risk description',
      });

      const response = await request(app)
        .put('/api/risks/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ riskDescription: 'Updated risk description' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should recalculate risk fields on update', async () => {
      (mockPrisma.qualRisk.findUnique as jest.Mock).mockResolvedValueOnce(existingRisk);
      (mockPrisma.qualRisk.update as jest.Mock).mockResolvedValueOnce({
        ...existingRisk,
        likelihood: 5,
        probabilityRating: 5,
        riskFactor: 20,
        riskLevel: 'HIGH',
      });

      await request(app)
        .put('/api/risks/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ likelihood: 5 });

      expect(mockPrisma.qualRisk.update).toHaveBeenCalledWith({
        where: { id: '10000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          probabilityRating: 5,
          consequenceRating: 4,
          riskFactor: 20,
          riskLevel: 'HIGH',
        }),
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff risk', async () => {
      (mockPrisma.qualRisk.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/risks/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ riskDescription: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status value', async () => {
      (mockPrisma.qualRisk.findUnique as jest.Mock).mockResolvedValueOnce(existingRisk);

      const response = await request(app)
        .put('/api/risks/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualRisk.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/risks/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ riskDescription: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/risks/:id', () => {
    it('should delete a risk successfully', async () => {
      (mockPrisma.qualRisk.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '10000000-0000-4000-a000-000000000001',
      });
      (mockPrisma.qualRisk.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/risks/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.qualRisk.update).toHaveBeenCalledWith({
        where: { id: '10000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff risk', async () => {
      (mockPrisma.qualRisk.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/risks/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualRisk.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/risks/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('Quality Risks API — additional edge cases', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/risks', risksRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/risks — response shape includes success and items array', async () => {
    (mockPrisma.qualRisk.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.qualRisk.count as jest.Mock).mockResolvedValueOnce(0);

    const response = await request(app).get('/api/risks').set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.items)).toBe(true);
  });

  it('PUT /api/risks/:id — 500 on update database error after successful findUnique', async () => {
    (mockPrisma.qualRisk.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '10000000-0000-4000-a000-000000000001',
      process: 'OPERATIONS',
      likelihood: 3,
      lossOfContracts: 2,
      harmToUser: 4,
      unableToMeetTerms: 1,
      violationOfRegulations: 3,
      reputationImpact: 2,
      costOfCorrection: 3,
      probabilityRating: 3,
      consequenceRating: 4,
    });
    (mockPrisma.qualRisk.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const response = await request(app)
      .put('/api/risks/10000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ riskDescription: 'Trigger error' });

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/risks — riskLevel is CRITICAL when riskFactor >= 25', async () => {
    (mockPrisma.qualRisk.count as jest.Mock).mockResolvedValueOnce(0);
    (mockPrisma.qualRisk.create as jest.Mock).mockResolvedValueOnce({
      id: '30000000-0000-4000-a000-000000000123',
      referenceNumber: 'QMS-RSK-2026-001',
      riskFactor: 25,
      riskLevel: 'CRITICAL',
      status: 'OPEN',
    });

    const response = await request(app)
      .post('/api/risks')
      .set('Authorization', 'Bearer token')
      .send({
        process: 'OPERATIONS',
        riskDescription: 'Critical operational risk',
        likelihood: 5,
        lossOfContracts: 5,
        harmToUser: 5,
        unableToMeetTerms: 5,
        violationOfRegulations: 5,
        reputationImpact: 5,
        costOfCorrection: 5,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
