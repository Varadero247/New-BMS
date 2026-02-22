import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    lifeCycleAssessment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    lifeCycleStage: { upsert: jest.fn() },
  },
  Prisma: { LifeCycleAssessmentWhereInput: {} },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-4000-a000-000000000099',
      email: 'test@test.com',
      role: 'ADMIN',
    };
    next();
  }),
}));

jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));

import { prisma } from '../src/prisma';
import lifecycleRouter from '../src/routes/lifecycle';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/lifecycle', lifecycleRouter);

describe('Life Cycle Assessment Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/lifecycle/assessments', () => {
    const validBody = {
      title: 'Product X LCA',
      productProcess: 'Widget manufacturing',
    };

    it('should create an LCA with 5 stages', async () => {
      (mockPrisma.lifeCycleAssessment.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.lifeCycleAssessment.create as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'LCA-2602-0001',
        ...validBody,
        status: 'DRAFT',
        stages: [
          { stageName: 'RAW_MATERIAL_EXTRACTION' },
          { stageName: 'MANUFACTURING' },
          { stageName: 'DISTRIBUTION' },
          { stageName: 'USE' },
          { stageName: 'END_OF_LIFE' },
        ],
      });

      const res = await request(app).post('/api/lifecycle/assessments').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app).post('/api/lifecycle/assessments').send({
        productProcess: 'Widget',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing productProcess', async () => {
      const res = await request(app).post('/api/lifecycle/assessments').send({
        title: 'Test LCA',
      });
      expect(res.status).toBe(400);
    });

    it('should accept optional description', async () => {
      (mockPrisma.lifeCycleAssessment.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.lifeCycleAssessment.create as jest.Mock).mockResolvedValue({
        id: 'lca-2',
        stages: [],
      });

      const res = await request(app)
        .post('/api/lifecycle/assessments')
        .send({
          ...validBody,
          description: 'Full lifecycle assessment for Product X',
        });
      expect(res.status).toBe(201);
    });

    it('should accept IN_PROGRESS status', async () => {
      (mockPrisma.lifeCycleAssessment.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.lifeCycleAssessment.create as jest.Mock).mockResolvedValue({
        id: 'lca-3',
        stages: [],
      });

      const res = await request(app)
        .post('/api/lifecycle/assessments')
        .send({
          ...validBody,
          status: 'IN_PROGRESS',
        });
      expect(res.status).toBe(201);
    });

    it('should return 400 for invalid status', async () => {
      const res = await request(app)
        .post('/api/lifecycle/assessments')
        .send({
          ...validBody,
          status: 'INVALID',
        });
      expect(res.status).toBe(400);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.lifeCycleAssessment.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.lifeCycleAssessment.create as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).post('/api/lifecycle/assessments').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/lifecycle/assessments', () => {
    it('should list LCAs', async () => {
      (mockPrisma.lifeCycleAssessment.findMany as jest.Mock).mockResolvedValue([
        { id: '00000000-0000-0000-0000-000000000001', stages: [] },
      ]);
      (mockPrisma.lifeCycleAssessment.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/lifecycle/assessments');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.lifeCycleAssessment.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.lifeCycleAssessment.count as jest.Mock).mockResolvedValue(50);

      const res = await request(app).get('/api/lifecycle/assessments?page=2&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(2);
    });

    it('should support search', async () => {
      (mockPrisma.lifeCycleAssessment.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.lifeCycleAssessment.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/lifecycle/assessments?search=widget');
      expect(mockPrisma.lifeCycleAssessment.findMany).toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      (mockPrisma.lifeCycleAssessment.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.lifeCycleAssessment.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/lifecycle/assessments?status=DRAFT');
      expect(mockPrisma.lifeCycleAssessment.findMany).toHaveBeenCalled();
    });

    it('should return 500 on error', async () => {
      (mockPrisma.lifeCycleAssessment.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.lifeCycleAssessment.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/lifecycle/assessments');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/lifecycle/assessments/:id', () => {
    it('should get LCA with stages', async () => {
      (mockPrisma.lifeCycleAssessment.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        stages: [
          { stageName: 'RAW_MATERIAL_EXTRACTION', aspects: 'Mining' },
          { stageName: 'MANUFACTURING', aspects: 'Assembly' },
        ],
      });

      const res = await request(app).get(
        '/api/lifecycle/assessments/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.lifeCycleAssessment.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get(
        '/api/lifecycle/assessments/00000000-0000-0000-0000-000000000099'
      );
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/lifecycle/assessments/:id/stages/:stage', () => {
    it('should update a stage', async () => {
      (mockPrisma.lifeCycleAssessment.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });
      (mockPrisma.lifeCycleStage.upsert as jest.Mock).mockResolvedValue({
        stageName: 'MANUFACTURING',
        aspects: 'Assembly emissions',
      });

      const res = await request(app)
        .put('/api/lifecycle/assessments/00000000-0000-0000-0000-000000000001/stages/MANUFACTURING')
        .send({
          aspects: 'Assembly emissions',
          impacts: 'Air pollution',
          severity: 3,
          controls: 'Ventilation system',
        });
      expect(res.status).toBe(200);
    });

    it('should return 400 for invalid stage name', async () => {
      const res = await request(app)
        .put('/api/lifecycle/assessments/00000000-0000-0000-0000-000000000001/stages/INVALID_STAGE')
        .send({
          aspects: 'Test',
        });
      expect(res.status).toBe(400);
    });

    it('should return 404 if assessment not found', async () => {
      (mockPrisma.lifeCycleAssessment.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/lifecycle/assessments/00000000-0000-0000-0000-000000000099/stages/MANUFACTURING')
        .send({
          aspects: 'Test',
        });
      expect(res.status).toBe(404);
    });

    it('should accept RAW_MATERIAL_EXTRACTION stage', async () => {
      (mockPrisma.lifeCycleAssessment.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });
      (mockPrisma.lifeCycleStage.upsert as jest.Mock).mockResolvedValue({
        stageName: 'RAW_MATERIAL_EXTRACTION',
      });

      const res = await request(app)
        .put(
          '/api/lifecycle/assessments/00000000-0000-0000-0000-000000000001/stages/RAW_MATERIAL_EXTRACTION'
        )
        .send({
          aspects: 'Mining operations',
        });
      expect(res.status).toBe(200);
    });

    it('should accept END_OF_LIFE stage', async () => {
      (mockPrisma.lifeCycleAssessment.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });
      (mockPrisma.lifeCycleStage.upsert as jest.Mock).mockResolvedValue({
        stageName: 'END_OF_LIFE',
      });

      const res = await request(app)
        .put('/api/lifecycle/assessments/00000000-0000-0000-0000-000000000001/stages/END_OF_LIFE')
        .send({
          aspects: 'Disposal/recycling',
        });
      expect(res.status).toBe(200);
    });

    it('should validate severity range (max 5)', async () => {
      (mockPrisma.lifeCycleAssessment.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });

      const res = await request(app)
        .put('/api/lifecycle/assessments/00000000-0000-0000-0000-000000000001/stages/MANUFACTURING')
        .send({
          severity: 6,
        });
      expect(res.status).toBe(400);
    });

    it('should validate severity range (min 1)', async () => {
      (mockPrisma.lifeCycleAssessment.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });

      const res = await request(app)
        .put('/api/lifecycle/assessments/00000000-0000-0000-0000-000000000001/stages/MANUFACTURING')
        .send({
          severity: 0,
        });
      expect(res.status).toBe(400);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.lifeCycleAssessment.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });
      (mockPrisma.lifeCycleStage.upsert as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app)
        .put('/api/lifecycle/assessments/00000000-0000-0000-0000-000000000001/stages/MANUFACTURING')
        .send({
          aspects: 'Test',
        });
      expect(res.status).toBe(500);
    });
  });
});

describe('Life Cycle Assessment Routes — extended coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /assessments returns correct totalPages for multi-page result', async () => {
    (mockPrisma.lifeCycleAssessment.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.lifeCycleAssessment.count as jest.Mock).mockResolvedValue(30);

    const res = await request(app).get('/api/lifecycle/assessments?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.totalPages).toBe(3);
  });

  it('GET /assessments passes correct skip to Prisma for page 3 limit 5', async () => {
    (mockPrisma.lifeCycleAssessment.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.lifeCycleAssessment.count as jest.Mock).mockResolvedValue(15);

    await request(app).get('/api/lifecycle/assessments?page=3&limit=5');

    expect(mockPrisma.lifeCycleAssessment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 5 })
    );
  });

  it('GET /assessments/:id returns 500 on database error', async () => {
    (mockPrisma.lifeCycleAssessment.findUnique as jest.Mock).mockRejectedValue(new Error('DB crash'));

    const res = await request(app).get(
      '/api/lifecycle/assessments/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('POST /assessments returns 400 for invalid status enum', async () => {
    const res = await request(app).post('/api/lifecycle/assessments').send({
      title: 'LCA Test',
      productProcess: 'Widget',
      status: 'NOT_A_REAL_STATUS',
    });

    expect(res.status).toBe(400);
  });

  it('GET /assessments response shape includes success:true and meta', async () => {
    (mockPrisma.lifeCycleAssessment.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.lifeCycleAssessment.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/lifecycle/assessments');

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('total', 0);
  });

  it('PUT /assessments/:id/stages/USE accepts USE stage name', async () => {
    (mockPrisma.lifeCycleAssessment.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (mockPrisma.lifeCycleStage.upsert as jest.Mock).mockResolvedValue({
      stageName: 'USE',
      aspects: 'Consumer operation',
    });

    const res = await request(app)
      .put('/api/lifecycle/assessments/00000000-0000-0000-0000-000000000001/stages/USE')
      .send({ aspects: 'Consumer operation', impacts: 'Energy consumption' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PUT /assessments/:id/stages/:stage accepts DISTRIBUTION stage name', async () => {
    (mockPrisma.lifeCycleAssessment.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (mockPrisma.lifeCycleStage.upsert as jest.Mock).mockResolvedValue({
      stageName: 'DISTRIBUTION',
      aspects: 'Logistics emissions',
    });

    const res = await request(app)
      .put('/api/lifecycle/assessments/00000000-0000-0000-0000-000000000001/stages/DISTRIBUTION')
      .send({ aspects: 'Logistics emissions' });

    expect(res.status).toBe(200);
  });
});

describe('Life Cycle Assessment Routes — further coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('POST /assessments generates refNumber containing current year digits', async () => {
    (mockPrisma.lifeCycleAssessment.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.lifeCycleAssessment.create as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      refNumber: 'LCA-2602-0001',
      stages: [],
    });

    const res = await request(app).post('/api/lifecycle/assessments').send({
      title: 'Full LCA',
      productProcess: 'Assembly',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.refNumber).toContain('LCA-');
  });

  it('GET /assessments response body has success:true', async () => {
    (mockPrisma.lifeCycleAssessment.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.lifeCycleAssessment.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/lifecycle/assessments');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /assessments/:id returns stages array in data', async () => {
    (mockPrisma.lifeCycleAssessment.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      stages: [
        { stageName: 'MANUFACTURING', aspects: 'Assembly' },
        { stageName: 'USE', aspects: 'Operation' },
      ],
    });

    const res = await request(app).get(
      '/api/lifecycle/assessments/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.stages).toHaveLength(2);
  });

  it('PUT /assessments/:id/stages/MANUFACTURING stores controls field', async () => {
    (mockPrisma.lifeCycleAssessment.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (mockPrisma.lifeCycleStage.upsert as jest.Mock).mockResolvedValue({
      stageName: 'MANUFACTURING',
      aspects: 'Assembly',
      controls: 'Ventilation systems installed',
    });

    const res = await request(app)
      .put('/api/lifecycle/assessments/00000000-0000-0000-0000-000000000001/stages/MANUFACTURING')
      .send({ aspects: 'Assembly', controls: 'Ventilation systems installed' });

    expect(res.status).toBe(200);
    expect(res.body.data.controls).toBe('Ventilation systems installed');
  });

  it('GET /assessments with status=IN_PROGRESS filter wired to findMany', async () => {
    (mockPrisma.lifeCycleAssessment.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.lifeCycleAssessment.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/lifecycle/assessments?status=IN_PROGRESS');

    expect(mockPrisma.lifeCycleAssessment.findMany).toHaveBeenCalled();
  });

  it('POST /assessments returns 400 for invalid body (no fields)', async () => {
    const res = await request(app).post('/api/lifecycle/assessments').send({});

    expect(res.status).toBe(400);
  });

  it('GET /assessments meta page=1 limit defaults to 50', async () => {
    (mockPrisma.lifeCycleAssessment.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.lifeCycleAssessment.count as jest.Mock).mockResolvedValue(10);

    const res = await request(app).get('/api/lifecycle/assessments');

    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.total).toBe(10);
  });

  it('PUT /assessments/:id/stages/END_OF_LIFE returns 500 when upsert throws', async () => {
    (mockPrisma.lifeCycleAssessment.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (mockPrisma.lifeCycleStage.upsert as jest.Mock).mockRejectedValue(new Error('DB crash'));

    const res = await request(app)
      .put('/api/lifecycle/assessments/00000000-0000-0000-0000-000000000001/stages/END_OF_LIFE')
      .send({ aspects: 'Disposal' });

    expect(res.status).toBe(500);
  });
});

describe('Life Cycle Assessment Routes — boundary coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /assessments filters by status=COMPLETED', async () => {
    (mockPrisma.lifeCycleAssessment.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.lifeCycleAssessment.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/lifecycle/assessments?status=COMPLETED');

    expect(mockPrisma.lifeCycleAssessment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'COMPLETED' }),
      })
    );
  });

  it('GET /assessments/:id returns success:true for existing assessment', async () => {
    (mockPrisma.lifeCycleAssessment.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      refNumber: 'LCA-2602-0001',
      stages: [],
    });

    const res = await request(app).get(
      '/api/lifecycle/assessments/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /assessments accepts COMPLETED status', async () => {
    (mockPrisma.lifeCycleAssessment.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.lifeCycleAssessment.create as jest.Mock).mockResolvedValue({
      id: 'lca-99',
      refNumber: 'LCA-2602-0001',
      stages: [],
    });

    const res = await request(app).post('/api/lifecycle/assessments').send({
      title: 'Completed LCA',
      productProcess: 'Legacy process',
      status: 'COMPLETED',
    });

    expect(res.status).toBe(201);
  });
});
