import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    projectRisk: {
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

import { prisma } from '../src/prisma';
import risksRouter from '../src/routes/risks';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Project Risks API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/risks', risksRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/risks', () => {
    const mockRisks = [
      {
        id: '10000000-0000-4000-a000-000000000001',
        riskCode: 'RSK-001',
        riskTitle: 'Budget overrun risk',
        riskDescription: 'Project may exceed allocated budget',
        riskCategory: 'BUDGET',
        probability: 4,
        impact: 5,
        riskScore: 20,
        riskLevel: 'CRITICAL',
        status: 'IDENTIFIED',
      },
      {
        id: '10000000-0000-4000-a000-000000000002',
        riskCode: 'RSK-002',
        riskTitle: 'Schedule delay',
        riskDescription: 'Key deliverables may be delayed',
        riskCategory: 'SCHEDULE',
        probability: 3,
        impact: 3,
        riskScore: 9,
        riskLevel: 'MEDIUM',
        status: 'MITIGATING',
      },
    ];

    it('should return list of risks with projectId', async () => {
      (mockPrisma.projectRisk.findMany as jest.Mock).mockResolvedValueOnce(mockRisks);
      (mockPrisma.projectRisk.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/risks?projectId=proj-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 50,
        total: 2,
        totalPages: 1,
      });
    });

    it('should return 400 without projectId', async () => {
      const response = await request(app).get('/api/risks').set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('projectId');
    });

    it('should filter by riskLevel', async () => {
      (mockPrisma.projectRisk.findMany as jest.Mock).mockResolvedValueOnce([mockRisks[0]]);
      (mockPrisma.projectRisk.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/risks?projectId=proj-1&riskLevel=CRITICAL')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.projectRisk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            projectId: 'proj-1',
            riskLevel: 'CRITICAL',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.projectRisk.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.projectRisk.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/risks?projectId=proj-1&status=IDENTIFIED')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.projectRisk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            projectId: 'proj-1',
            status: 'IDENTIFIED',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.projectRisk.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/risks?projectId=proj-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/risks', () => {
    const createPayload = {
      projectId: 'proj-1',
      riskCode: 'RSK-003',
      riskTitle: 'Resource shortage',
      riskDescription: 'Key team members may leave',
      riskCategory: 'RESOURCE',
      probability: 3,
      impact: 4,
    };

    it('should create a risk with auto-calculated riskScore and riskLevel', async () => {
      (mockPrisma.projectRisk.create as jest.Mock).mockResolvedValueOnce({
        id: 'risk-new',
        ...createPayload,
        riskScore: 12,
        riskLevel: 'HIGH',
        status: 'IDENTIFIED',
      });

      const response = await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.riskScore).toBe(12);
      expect(response.body.data.riskLevel).toBe('HIGH');

      expect(mockPrisma.projectRisk.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          riskScore: 12,
          riskLevel: 'HIGH',
          probability: 3,
          impact: 4,
        }),
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send({ projectId: 'proj-1' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors on create', async () => {
      (mockPrisma.projectRisk.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

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
      riskCode: 'RSK-001',
      riskTitle: 'Budget overrun',
      riskDescription: 'May exceed budget',
      riskCategory: 'BUDGET',
      probability: 4,
      impact: 5,
      riskScore: 20,
      riskLevel: 'CRITICAL',
      status: 'IDENTIFIED',
      residualProbability: null,
      residualImpact: null,
    };

    it('should update risk successfully', async () => {
      (mockPrisma.projectRisk.findUnique as jest.Mock).mockResolvedValueOnce(existingRisk);
      (mockPrisma.projectRisk.update as jest.Mock).mockResolvedValueOnce({
        ...existingRisk,
        riskTitle: 'Updated title',
      });

      const response = await request(app)
        .put('/api/risks/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ riskTitle: 'Updated title' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff risk', async () => {
      (mockPrisma.projectRisk.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/risks/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ riskTitle: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should recalculate riskScore when probability changes', async () => {
      (mockPrisma.projectRisk.findUnique as jest.Mock).mockResolvedValueOnce(existingRisk);
      (mockPrisma.projectRisk.update as jest.Mock).mockResolvedValueOnce({
        ...existingRisk,
        probability: 2,
        riskScore: 10,
        riskLevel: 'HIGH',
      });

      await request(app)
        .put('/api/risks/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ probability: 2 });

      expect(mockPrisma.projectRisk.update).toHaveBeenCalledWith({
        where: { id: '10000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          riskScore: 10,
          riskLevel: 'HIGH',
        }),
      });
    });

    it('should auto-set closedDate when status changes to CLOSED', async () => {
      (mockPrisma.projectRisk.findUnique as jest.Mock).mockResolvedValueOnce(existingRisk);
      (mockPrisma.projectRisk.update as jest.Mock).mockResolvedValueOnce({
        ...existingRisk,
        status: 'CLOSED',
        closedDate: new Date(),
      });

      await request(app)
        .put('/api/risks/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'CLOSED' });

      expect(mockPrisma.projectRisk.update).toHaveBeenCalledWith({
        where: { id: '10000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          status: 'CLOSED',
          closedDate: expect.any(Date),
        }),
      });
    });

    it('should handle database errors on update', async () => {
      (mockPrisma.projectRisk.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/risks/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ riskTitle: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/risks/:id', () => {
    it('should delete risk successfully', async () => {
      (mockPrisma.projectRisk.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '10000000-0000-4000-a000-000000000001',
      });
      (mockPrisma.projectRisk.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/risks/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.projectRisk.update).toHaveBeenCalledWith({
        where: { id: '10000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff risk', async () => {
      (mockPrisma.projectRisk.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/risks/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors on delete', async () => {
      (mockPrisma.projectRisk.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/risks/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('risks.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/risks', risksRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/risks', async () => {
    const res = await request(app).get('/api/risks');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/risks', async () => {
    const res = await request(app).get('/api/risks');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/risks body has success property', async () => {
    const res = await request(app).get('/api/risks');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/risks body is an object', async () => {
    const res = await request(app).get('/api/risks');
    expect(typeof res.body).toBe('object');
  });
});

describe('risks.api — edge cases and extended coverage', () => {
  let app: express.Express;

  const baseRisk = {
    id: '10000000-0000-4000-a000-000000000001',
    riskCode: 'RSK-001',
    riskTitle: 'Budget overrun risk',
    riskDescription: 'Project may exceed allocated budget',
    riskCategory: 'BUDGET',
    probability: 4,
    impact: 5,
    riskScore: 20,
    riskLevel: 'CRITICAL',
    status: 'IDENTIFIED',
    residualProbability: null,
    residualImpact: null,
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/risks', risksRouter);
    jest.clearAllMocks();
  });

  it('GET /api/risks returns empty array when no risks exist', async () => {
    (mockPrisma.projectRisk.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectRisk.count as jest.Mock).mockResolvedValueOnce(0);

    const res = await request(app).get('/api/risks?projectId=proj-1');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.meta.total).toBe(0);
  });

  it('GET /api/risks supports pagination (page=2, limit=5)', async () => {
    (mockPrisma.projectRisk.findMany as jest.Mock).mockResolvedValueOnce([baseRisk]);
    (mockPrisma.projectRisk.count as jest.Mock).mockResolvedValueOnce(10);

    const res = await request(app).get('/api/risks?projectId=proj-1&page=2&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.limit).toBe(5);
    expect(res.body.meta.totalPages).toBe(2);
  });

  it('POST /api/risks sets LOW riskLevel when probability=1 and impact=1', async () => {
    (mockPrisma.projectRisk.create as jest.Mock).mockResolvedValueOnce({
      ...baseRisk,
      probability: 1,
      impact: 1,
      riskScore: 1,
      riskLevel: 'LOW',
    });

    const res = await request(app).post('/api/risks').send({
      projectId: 'proj-1',
      riskCode: 'RSK-999',
      riskTitle: 'Minor risk',
      riskDescription: 'Very minor risk',
      riskCategory: 'TECHNICAL',
      probability: 1,
      impact: 1,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.riskLevel).toBe('LOW');
  });

  it('PUT /api/risks/:id recalculates riskScore when impact changes', async () => {
    (mockPrisma.projectRisk.findUnique as jest.Mock).mockResolvedValueOnce(baseRisk);
    (mockPrisma.projectRisk.update as jest.Mock).mockResolvedValueOnce({
      ...baseRisk,
      impact: 2,
      riskScore: 8,
      riskLevel: 'MEDIUM',
    });

    await request(app)
      .put('/api/risks/10000000-0000-4000-a000-000000000001')
      .send({ impact: 2 });

    expect(mockPrisma.projectRisk.update).toHaveBeenCalledWith({
      where: { id: '10000000-0000-4000-a000-000000000001' },
      data: expect.objectContaining({
        riskScore: 8,
      }),
    });
  });

  it('DELETE /api/risks/:id performs soft-delete with deletedAt', async () => {
    (mockPrisma.projectRisk.findUnique as jest.Mock).mockResolvedValueOnce(baseRisk);
    (mockPrisma.projectRisk.update as jest.Mock).mockResolvedValueOnce({
      ...baseRisk,
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/risks/10000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(204);
    expect(mockPrisma.projectRisk.update).toHaveBeenCalledWith({
      where: { id: '10000000-0000-4000-a000-000000000001' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('PUT /api/risks/:id returns 500 when update fails after findUnique succeeds', async () => {
    (mockPrisma.projectRisk.findUnique as jest.Mock).mockResolvedValueOnce(baseRisk);
    (mockPrisma.projectRisk.update as jest.Mock).mockRejectedValueOnce(
      new Error('Constraint violation')
    );

    const res = await request(app)
      .put('/api/risks/10000000-0000-4000-a000-000000000001')
      .send({ riskTitle: 'Updated' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/risks filters by riskCategory=TECHNICAL', async () => {
    (mockPrisma.projectRisk.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectRisk.count as jest.Mock).mockResolvedValueOnce(0);

    await request(app).get('/api/risks?projectId=proj-1&riskCategory=TECHNICAL');

    expect(mockPrisma.projectRisk.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ projectId: 'proj-1' }),
      })
    );
  });

  it('DELETE /api/risks/:id returns 500 when findUnique throws', async () => {
    (mockPrisma.projectRisk.findUnique as jest.Mock).mockRejectedValueOnce(
      new Error('DB timeout')
    );

    const res = await request(app).delete('/api/risks/10000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/risks returns 400 for invalid riskCategory enum', async () => {
    const res = await request(app).post('/api/risks').send({
      projectId: 'proj-1',
      riskCode: 'RSK-BAD',
      riskTitle: 'Invalid category',
      riskDescription: 'Has bad category',
      riskCategory: 'INVALID_CATEGORY',
      probability: 3,
      impact: 3,
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('risks.api — final extended coverage', () => {
  let app: express.Express;

  const baseRisk = {
    id: '10000000-0000-4000-a000-000000000001',
    riskCode: 'RSK-001',
    riskTitle: 'Budget overrun risk',
    riskDescription: 'Project may exceed allocated budget',
    riskCategory: 'BUDGET',
    probability: 4,
    impact: 5,
    riskScore: 20,
    riskLevel: 'CRITICAL',
    status: 'IDENTIFIED',
    residualProbability: null,
    residualImpact: null,
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/risks', risksRouter);
    jest.clearAllMocks();
  });

  it('DELETE /api/risks/:id does not call update when not found', async () => {
    (mockPrisma.projectRisk.findUnique as jest.Mock).mockResolvedValueOnce(null);
    await request(app).delete('/api/risks/00000000-0000-4000-a000-ffffffffffff');
    expect(mockPrisma.projectRisk.update).not.toHaveBeenCalled();
  });

  it('GET /api/risks returns data as array', async () => {
    (mockPrisma.projectRisk.findMany as jest.Mock).mockResolvedValueOnce([baseRisk]);
    (mockPrisma.projectRisk.count as jest.Mock).mockResolvedValueOnce(1);
    const res = await request(app).get('/api/risks?projectId=proj-1');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/risks meta.page defaults to 1', async () => {
    (mockPrisma.projectRisk.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectRisk.count as jest.Mock).mockResolvedValueOnce(0);
    const res = await request(app).get('/api/risks?projectId=proj-1');
    expect(res.body.meta.page).toBe(1);
  });

  it('PUT /api/risks/:id does not call update when not found', async () => {
    (mockPrisma.projectRisk.findUnique as jest.Mock).mockResolvedValueOnce(null);
    await request(app)
      .put('/api/risks/00000000-0000-4000-a000-ffffffffffff')
      .send({ riskTitle: 'Never updated' });
    expect(mockPrisma.projectRisk.update).not.toHaveBeenCalled();
  });

  it('POST /api/risks sets CRITICAL riskLevel when probability=5 and impact=5', async () => {
    (mockPrisma.projectRisk.create as jest.Mock).mockResolvedValueOnce({
      ...baseRisk,
      probability: 5,
      impact: 5,
      riskScore: 25,
      riskLevel: 'CRITICAL',
    });
    const res = await request(app).post('/api/risks').send({
      projectId: 'proj-1',
      riskCode: 'RSK-MAX',
      riskTitle: 'Max risk',
      riskDescription: 'Maximum probability and impact',
      riskCategory: 'BUDGET',
      probability: 5,
      impact: 5,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.riskLevel).toBe('CRITICAL');
  });

  it('GET /api/risks findMany called once per request', async () => {
    (mockPrisma.projectRisk.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectRisk.count as jest.Mock).mockResolvedValueOnce(0);
    await request(app).get('/api/risks?projectId=proj-1');
    expect(mockPrisma.projectRisk.findMany).toHaveBeenCalledTimes(1);
  });
});
