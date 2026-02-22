import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    qualOpportunity: {
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
import opportunitiesRoutes from '../src/routes/opportunities';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Quality Opportunities API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/opportunities', opportunitiesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/opportunities', () => {
    const mockOpportunities = [
      {
        id: '23000000-0000-4000-a000-000000000001',
        referenceNumber: 'QMS-OPP-2026-001',
        process: 'MARKETING_SALES',
        opportunityDescription: 'Expand into EU market',
        opportunityScore: 16,
        priorityLevel: 'HIGH',
        status: 'IDENTIFIED',
        likelihood: 4,
        probabilityRating: 4,
        benefitRating: 4,
      },
      {
        id: 'opp-2',
        referenceNumber: 'QMS-OPP-2026-002',
        process: 'IT',
        opportunityDescription: 'Automate testing pipeline',
        opportunityScore: 6,
        priorityLevel: 'LOW',
        status: 'BEING_EXPLOITED',
        likelihood: 3,
        probabilityRating: 3,
        benefitRating: 2,
      },
    ];

    it('should return list of opportunities with pagination', async () => {
      (mockPrisma.qualOpportunity.findMany as jest.Mock).mockResolvedValueOnce(mockOpportunities);
      (mockPrisma.qualOpportunity.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/opportunities')
        .set('Authorization', 'Bearer token');

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
      (mockPrisma.qualOpportunity.findMany as jest.Mock).mockResolvedValueOnce([
        mockOpportunities[0],
      ]);
      (mockPrisma.qualOpportunity.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/opportunities?page=5&limit=5')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(5);
      expect(response.body.data.limit).toBe(5);
      expect(response.body.data.totalPages).toBe(10);
    });

    it('should filter by priorityLevel', async () => {
      (mockPrisma.qualOpportunity.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualOpportunity.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/opportunities?priorityLevel=HIGH')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualOpportunity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            priorityLevel: 'HIGH',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.qualOpportunity.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualOpportunity.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/opportunities?status=IDENTIFIED')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualOpportunity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'IDENTIFIED',
          }),
        })
      );
    });

    it('should filter by process', async () => {
      (mockPrisma.qualOpportunity.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualOpportunity.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/opportunities?process=IT').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualOpportunity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            process: 'IT',
          }),
        })
      );
    });

    it('should filter by search on opportunityDescription', async () => {
      (mockPrisma.qualOpportunity.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualOpportunity.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/opportunities?search=market')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualOpportunity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            opportunityDescription: { contains: 'market', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should order by opportunityScore descending', async () => {
      (mockPrisma.qualOpportunity.findMany as jest.Mock).mockResolvedValueOnce(mockOpportunities);
      (mockPrisma.qualOpportunity.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app).get('/api/opportunities').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualOpportunity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { opportunityScore: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualOpportunity.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/opportunities')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/opportunities/:id', () => {
    const mockOpportunity = {
      id: '23000000-0000-4000-a000-000000000001',
      referenceNumber: 'QMS-OPP-2026-001',
      process: 'MARKETING_SALES',
      opportunityDescription: 'Expand into EU market',
      opportunityScore: 16,
      priorityLevel: 'HIGH',
    };

    it('should return a single opportunity', async () => {
      (mockPrisma.qualOpportunity.findUnique as jest.Mock).mockResolvedValueOnce(mockOpportunity);

      const response = await request(app)
        .get('/api/opportunities/23000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('23000000-0000-4000-a000-000000000001');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff opportunity', async () => {
      (mockPrisma.qualOpportunity.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/opportunities/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualOpportunity.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/opportunities/23000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/opportunities', () => {
    const createPayload = {
      process: 'MARKETING_SALES',
      opportunityDescription: 'New market opportunity',
      likelihood: 4,
      newBusiness: 3,
      expansionOfCurrent: 2,
      satisfyingRegs: 1,
      internalQmsImprovement: 2,
      reputationImprovement: 4,
    };

    it('should create an opportunity successfully', async () => {
      (mockPrisma.qualOpportunity.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualOpportunity.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'QMS-OPP-2026-001',
        ...createPayload,
        probabilityRating: 4,
        benefitRating: 4,
        opportunityScore: 16,
        priorityLevel: 'HIGH',
        status: 'IDENTIFIED',
      });

      const response = await request(app)
        .post('/api/opportunities')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.opportunityDescription).toBe('New market opportunity');
    });

    it('should calculate opportunity fields (score = likelihood * max benefit)', async () => {
      (mockPrisma.qualOpportunity.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualOpportunity.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        opportunityScore: 16,
        priorityLevel: 'HIGH',
      });

      await request(app)
        .post('/api/opportunities')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.qualOpportunity.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          probabilityRating: 4,
          benefitRating: 4,
          opportunityScore: 16,
          priorityLevel: 'HIGH',
        }),
      });
    });

    it('should generate a reference number on create', async () => {
      (mockPrisma.qualOpportunity.count as jest.Mock).mockResolvedValueOnce(2);
      (mockPrisma.qualOpportunity.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'QMS-OPP-2026-003',
        ...createPayload,
      });

      await request(app)
        .post('/api/opportunities')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.qualOpportunity.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          referenceNumber: expect.stringContaining('QMS-OPP-'),
        }),
      });
    });

    it('should return 400 for missing process', async () => {
      const response = await request(app)
        .post('/api/opportunities')
        .set('Authorization', 'Bearer token')
        .send({ opportunityDescription: 'No process' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing opportunityDescription', async () => {
      const response = await request(app)
        .post('/api/opportunities')
        .set('Authorization', 'Bearer token')
        .send({ process: 'IT' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid process enum', async () => {
      const response = await request(app)
        .post('/api/opportunities')
        .set('Authorization', 'Bearer token')
        .send({ process: 'INVALID', opportunityDescription: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for likelihood out of range', async () => {
      const response = await request(app)
        .post('/api/opportunities')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, likelihood: 10 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for newBusiness out of range', async () => {
      const response = await request(app)
        .post('/api/opportunities')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, newBusiness: 10 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualOpportunity.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualOpportunity.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/opportunities')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/opportunities/:id', () => {
    const existingOpportunity = {
      id: '23000000-0000-4000-a000-000000000001',
      process: 'MARKETING_SALES',
      opportunityDescription: 'Existing opportunity',
      likelihood: 4,
      newBusiness: 3,
      expansionOfCurrent: 2,
      satisfyingRegs: 1,
      internalQmsImprovement: 2,
      reputationImprovement: 4,
      probabilityRating: 4,
      benefitRating: 4,
      opportunityScore: 16,
      priorityLevel: 'HIGH',
      status: 'IDENTIFIED',
    };

    it('should update an opportunity successfully', async () => {
      (mockPrisma.qualOpportunity.findUnique as jest.Mock).mockResolvedValueOnce(
        existingOpportunity
      );
      (mockPrisma.qualOpportunity.update as jest.Mock).mockResolvedValueOnce({
        ...existingOpportunity,
        opportunityDescription: 'Updated description',
      });

      const response = await request(app)
        .put('/api/opportunities/23000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ opportunityDescription: 'Updated description' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should recalculate opportunity fields on update', async () => {
      (mockPrisma.qualOpportunity.findUnique as jest.Mock).mockResolvedValueOnce(
        existingOpportunity
      );
      (mockPrisma.qualOpportunity.update as jest.Mock).mockResolvedValueOnce({
        ...existingOpportunity,
        likelihood: 2,
        probabilityRating: 2,
        opportunityScore: 8,
        priorityLevel: 'MEDIUM',
      });

      await request(app)
        .put('/api/opportunities/23000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ likelihood: 2 });

      expect(mockPrisma.qualOpportunity.update).toHaveBeenCalledWith({
        where: { id: '23000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          probabilityRating: 2,
          benefitRating: 4,
          opportunityScore: 8,
          priorityLevel: 'MEDIUM',
        }),
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff opportunity', async () => {
      (mockPrisma.qualOpportunity.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/opportunities/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ opportunityDescription: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status value', async () => {
      (mockPrisma.qualOpportunity.findUnique as jest.Mock).mockResolvedValueOnce(
        existingOpportunity
      );

      const response = await request(app)
        .put('/api/opportunities/23000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualOpportunity.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .put('/api/opportunities/23000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ opportunityDescription: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/opportunities/:id', () => {
    it('should delete an opportunity successfully', async () => {
      (mockPrisma.qualOpportunity.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '23000000-0000-4000-a000-000000000001',
      });
      (mockPrisma.qualOpportunity.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/opportunities/23000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.qualOpportunity.update).toHaveBeenCalledWith({
        where: { id: '23000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff opportunity', async () => {
      (mockPrisma.qualOpportunity.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/opportunities/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualOpportunity.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .delete('/api/opportunities/23000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('Quality Opportunities API — extended edge cases', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/opportunities', opportunitiesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/opportunities — response data has items property', async () => {
    (mockPrisma.qualOpportunity.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.qualOpportunity.count as jest.Mock).mockResolvedValueOnce(0);

    const response = await request(app).get('/api/opportunities').set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('items');
    expect(Array.isArray(response.body.data.items)).toBe(true);
  });

  it('GET /api/opportunities — totalPages is 0 when total is 0', async () => {
    (mockPrisma.qualOpportunity.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.qualOpportunity.count as jest.Mock).mockResolvedValueOnce(0);

    const response = await request(app).get('/api/opportunities').set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.data.total).toBe(0);
  });

  it('PUT /api/opportunities/:id — 500 on update DB error after successful findUnique', async () => {
    (mockPrisma.qualOpportunity.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '23000000-0000-4000-a000-000000000001',
      likelihood: 3,
      newBusiness: 2,
      expansionOfCurrent: 2,
      satisfyingRegs: 1,
      internalQmsImprovement: 2,
      reputationImprovement: 3,
      probabilityRating: 3,
      benefitRating: 3,
      opportunityScore: 9,
      priorityLevel: 'MEDIUM',
      status: 'IDENTIFIED',
    });
    (mockPrisma.qualOpportunity.update as jest.Mock).mockRejectedValueOnce(new Error('write error'));

    const response = await request(app)
      .put('/api/opportunities/23000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ opportunityDescription: 'Trigger error' });

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/opportunities — sets initial status to IDENTIFIED', async () => {
    (mockPrisma.qualOpportunity.count as jest.Mock).mockResolvedValueOnce(0);
    (mockPrisma.qualOpportunity.create as jest.Mock).mockResolvedValueOnce({
      id: '30000000-0000-4000-a000-000000000123',
      referenceNumber: 'QMS-OPP-2026-001',
      process: 'IT',
      opportunityDescription: 'Test opportunity',
      likelihood: 2,
      probabilityRating: 2,
      benefitRating: 2,
      opportunityScore: 4,
      priorityLevel: 'LOW',
      status: 'IDENTIFIED',
    });

    const response = await request(app)
      .post('/api/opportunities')
      .set('Authorization', 'Bearer token')
      .send({
        process: 'IT',
        opportunityDescription: 'Test opportunity',
        likelihood: 2,
        newBusiness: 2,
        expansionOfCurrent: 1,
        satisfyingRegs: 1,
        internalQmsImprovement: 2,
        reputationImprovement: 2,
      });

    expect(response.status).toBe(201);
    expect(mockPrisma.qualOpportunity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'IDENTIFIED' }),
      })
    );
  });

  it('DELETE /api/opportunities/:id — update called with deletedAt', async () => {
    (mockPrisma.qualOpportunity.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '23000000-0000-4000-a000-000000000001',
    });
    (mockPrisma.qualOpportunity.update as jest.Mock).mockResolvedValueOnce({});

    await request(app)
      .delete('/api/opportunities/23000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');

    expect(mockPrisma.qualOpportunity.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
  });

  it('GET /api/opportunities/:id — referenceNumber present in response', async () => {
    (mockPrisma.qualOpportunity.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '23000000-0000-4000-a000-000000000001',
      referenceNumber: 'QMS-OPP-2026-001',
      process: 'IT',
      opportunityDescription: 'Test',
      opportunityScore: 4,
      priorityLevel: 'LOW',
    });

    const response = await request(app)
      .get('/api/opportunities/23000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.data.referenceNumber).toBe('QMS-OPP-2026-001');
  });

  it('POST /api/opportunities — invalid status enum returns 400', async () => {
    const response = await request(app)
      .post('/api/opportunities')
      .set('Authorization', 'Bearer token')
      .send({
        process: 'IT',
        opportunityDescription: 'Test opportunity',
        status: 'INVALID_STATUS',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
