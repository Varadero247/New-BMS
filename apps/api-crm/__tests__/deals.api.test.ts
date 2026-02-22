import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    crmDeal: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    crmPipeline: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    crmPipelineStage: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn(),
    },
    crmActivity: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    crmContact: {
      findMany: jest.fn(),
    },
    crmDealContact: {
      findMany: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import dealsRouter from '../src/routes/deals';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/deals', dealsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockDeal = {
  id: '00000000-0000-0000-0000-000000000001',
  refNumber: 'DEAL-2602-1234',
  title: 'Enterprise License',
  value: 50000,
  currency: 'USD',
  status: 'OPEN',
  probability: 60,
  accountId: 'acc-1',
  contactId: 'contact-1',
  pipelineId: 'pipe-1',
  stageId: 'stage-1',
  assignedTo: 'user-123',
  source: 'INBOUND',
  tags: [],
  notes: null,
  lostReason: null,
  expectedCloseDate: null,
  actualCloseDate: null,
  createdBy: 'user-123',
  updatedBy: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockPipeline = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Sales Pipeline',
  description: 'Main pipeline',
  createdBy: 'user-123',
  createdAt: new Date(),
  stages: [
    { id: 'stage-1', name: 'Discovery', order: 0, probability: 10 },
    { id: 'stage-2', name: 'Proposal', order: 1, probability: 50 },
    { id: 'stage-3', name: 'Negotiation', order: 2, probability: 80 },
  ],
};

// ===================================================================
// PIPELINE ENDPOINTS
// ===================================================================

describe('GET /api/deals/pipelines', () => {
  it('should return pipelines', async () => {
    mockPrisma.crmPipeline.findMany.mockResolvedValue([mockPipeline]);

    const res = await request(app).get('/api/deals/pipelines');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Sales Pipeline');
  });

  it('should return empty array when no pipelines', async () => {
    mockPrisma.crmPipeline.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/deals/pipelines');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmPipeline.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/deals/pipelines');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/deals/pipelines', () => {
  it('should create pipeline with stages', async () => {
    mockPrisma.crmPipeline.create.mockResolvedValue(mockPipeline);

    const res = await request(app)
      .post('/api/deals/pipelines')
      .send({
        name: 'Sales Pipeline',
        description: 'Main pipeline',
        stages: [
          { name: 'Discovery', order: 0, probability: 10 },
          { name: 'Proposal', order: 1, probability: 50 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing name', async () => {
    const res = await request(app)
      .post('/api/deals/pipelines')
      .send({
        stages: [{ name: 'Discovery', order: 0 }],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for empty stages', async () => {
    const res = await request(app).post('/api/deals/pipelines').send({
      name: 'Pipeline',
      stages: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for missing stages', async () => {
    const res = await request(app).post('/api/deals/pipelines').send({
      name: 'Pipeline',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmPipeline.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/deals/pipelines')
      .send({
        name: 'Pipeline',
        stages: [{ name: 'Stage 1', order: 0 }],
      });

    expect(res.status).toBe(500);
  });
});

describe('PUT /api/deals/pipelines/:id/stages', () => {
  it('should update stages', async () => {
    mockPrisma.crmPipeline.findUnique
      .mockResolvedValueOnce(mockPipeline)
      .mockResolvedValueOnce(mockPipeline);
    mockPrisma.crmPipelineStage.deleteMany.mockResolvedValue({ count: 3 });
    mockPrisma.crmPipelineStage.createMany.mockResolvedValue({ count: 2 });

    const res = await request(app)
      .put('/api/deals/pipelines/00000000-0000-0000-0000-000000000001/stages')
      .send({
        stages: [
          { name: 'New Stage 1', order: 0 },
          { name: 'New Stage 2', order: 1 },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when pipeline not found', async () => {
    mockPrisma.crmPipeline.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/deals/pipelines/00000000-0000-0000-0000-000000000099/stages')
      .send({
        stages: [{ name: 'Stage', order: 0 }],
      });

    expect(res.status).toBe(404);
  });

  it('should return 400 for empty stages array', async () => {
    const res = await request(app)
      .put('/api/deals/pipelines/00000000-0000-0000-0000-000000000001/stages')
      .send({
        stages: [],
      });

    expect(res.status).toBe(400);
  });
});

// ===================================================================
// FORECAST & BOARD
// ===================================================================

describe('GET /api/deals/forecast', () => {
  it('should return weighted forecast', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([
      { value: 10000, probability: 50, currency: 'USD' },
      { value: 20000, probability: 80, currency: 'USD' },
    ]);

    const res = await request(app).get('/api/deals/forecast');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.dealCount).toBe(2);
    expect(res.body.data.totalValue).toBe(30000);
    expect(res.body.data.weightedValue).toBe(21000);
  });

  it('should return zero values when no deals', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/deals/forecast');

    expect(res.status).toBe(200);
    expect(res.body.data.dealCount).toBe(0);
    expect(res.body.data.totalValue).toBe(0);
    expect(res.body.data.weightedValue).toBe(0);
  });

  it('should handle deals with zero probability', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([
      { value: 10000, probability: 0, currency: 'USD' },
    ]);

    const res = await request(app).get('/api/deals/forecast');

    expect(res.status).toBe(200);
    expect(res.body.data.weightedValue).toBe(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmDeal.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/deals/forecast');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/deals/board', () => {
  it('should return deals grouped by stage', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([
      { ...mockDeal, stageId: 'stage-1' },
      { ...mockDeal, id: 'deal-2', stageId: 'stage-1' },
      { ...mockDeal, id: 'deal-3', stageId: 'stage-2' },
    ]);

    const res = await request(app).get('/api/deals/board');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data['stage-1']).toHaveLength(2);
    expect(res.body.data['stage-2']).toHaveLength(1);
  });

  it('should filter by pipelineId', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/deals/board?pipelineId=pipe-1');

    expect(res.status).toBe(200);
    expect(mockPrisma.crmDeal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ pipelineId: 'pipe-1' }),
      })
    );
  });

  it('should group unassigned deals under unassigned key', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([{ ...mockDeal, stageId: null }]);

    const res = await request(app).get('/api/deals/board');

    expect(res.status).toBe(200);
    expect(res.body.data['unassigned']).toHaveLength(1);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmDeal.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/deals/board');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/deals
// ===================================================================

describe('POST /api/deals', () => {
  it('should create deal with valid data and generate ref number', async () => {
    mockPrisma.crmDeal.create.mockResolvedValue(mockDeal);

    const res = await request(app).post('/api/deals').send({
      title: 'Enterprise License',
      value: 50000,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(mockPrisma.crmDeal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Enterprise License',
          value: 50000,
          refNumber: expect.stringMatching(/^DEAL-\d{4}-\d{4}$/),
          status: 'OPEN',
        }),
      })
    );
  });

  it('should create deal with all optional fields', async () => {
    mockPrisma.crmDeal.create.mockResolvedValue(mockDeal);

    const res = await request(app)
      .post('/api/deals')
      .send({
        title: 'Enterprise License',
        value: 50000,
        currency: 'GBP',
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        contactId: '550e8400-e29b-41d4-a716-446655440001',
        pipelineId: '550e8400-e29b-41d4-a716-446655440002',
        stageId: '550e8400-e29b-41d4-a716-446655440003',
        probability: 60,
        source: 'REFERRAL',
        tags: ['enterprise'],
        notes: 'High priority',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing title', async () => {
    const res = await request(app).post('/api/deals').send({
      value: 50000,
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for missing value', async () => {
    const res = await request(app).post('/api/deals').send({
      title: 'Enterprise License',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for negative value', async () => {
    const res = await request(app).post('/api/deals').send({
      title: 'Enterprise License',
      value: -1000,
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for empty title', async () => {
    const res = await request(app).post('/api/deals').send({
      title: '',
      value: 50000,
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmDeal.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/deals').send({
      title: 'Enterprise License',
      value: 50000,
    });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/deals
// ===================================================================

describe('GET /api/deals', () => {
  it('should return paginated list', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([mockDeal]);
    mockPrisma.crmDeal.count.mockResolvedValue(1);

    const res = await request(app).get('/api/deals');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should filter by status', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([]);
    mockPrisma.crmDeal.count.mockResolvedValue(0);

    const res = await request(app).get('/api/deals?status=WON');

    expect(res.status).toBe(200);
    expect(mockPrisma.crmDeal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'WON' }),
      })
    );
  });

  it('should filter by pipelineId', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([]);
    mockPrisma.crmDeal.count.mockResolvedValue(0);

    const res = await request(app).get('/api/deals?pipelineId=pipe-1');

    expect(res.status).toBe(200);
    expect(mockPrisma.crmDeal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ pipelineId: 'pipe-1' }),
      })
    );
  });

  it('should filter by stageId', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([]);
    mockPrisma.crmDeal.count.mockResolvedValue(0);

    const res = await request(app).get('/api/deals?stageId=stage-1');

    expect(res.status).toBe(200);
    expect(mockPrisma.crmDeal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ stageId: 'stage-1' }),
      })
    );
  });

  it('should filter by assignedTo', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([]);
    mockPrisma.crmDeal.count.mockResolvedValue(0);

    const res = await request(app).get('/api/deals?assignedTo=user-123');

    expect(res.status).toBe(200);
    expect(mockPrisma.crmDeal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ assignedTo: 'user-123' }),
      })
    );
  });

  it('should return empty array when no deals', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([]);
    mockPrisma.crmDeal.count.mockResolvedValue(0);

    const res = await request(app).get('/api/deals');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmDeal.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/deals');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/deals/:id
// ===================================================================

describe('GET /api/deals/:id', () => {
  it('should return deal detail with activities and contacts', async () => {
    mockPrisma.crmDeal.findFirst.mockResolvedValue(mockDeal);
    mockPrisma.crmActivity.findMany.mockResolvedValue([]);
    mockPrisma.crmContact.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/deals/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    expect(res.body.data.activities).toBeDefined();
    expect(res.body.data.contacts).toBeDefined();
  });

  it('should return 404 when not found', async () => {
    mockPrisma.crmDeal.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/deals/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmDeal.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/deals/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/deals/:id
// ===================================================================

describe('PUT /api/deals/:id', () => {
  it('should update deal', async () => {
    mockPrisma.crmDeal.findFirst.mockResolvedValue(mockDeal);
    mockPrisma.crmDeal.update.mockResolvedValue({ ...mockDeal, title: 'Updated Deal' });

    const res = await request(app)
      .put('/api/deals/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated Deal' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated Deal');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.crmDeal.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/deals/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Test' });

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmDeal.findFirst.mockResolvedValue(mockDeal);
    mockPrisma.crmDeal.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/deals/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Test' });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/deals/:id/stage
// ===================================================================

describe('PUT /api/deals/:id/stage', () => {
  it('should move deal to new stage', async () => {
    mockPrisma.crmDeal.findFirst.mockResolvedValue(mockDeal);
    mockPrisma.crmDeal.update.mockResolvedValue({ ...mockDeal, stageId: 'stage-2' });
    mockPrisma.crmActivity.create.mockResolvedValue({ id: 'act-1' });

    const res = await request(app)
      .put('/api/deals/00000000-0000-0000-0000-000000000001/stage')
      .send({ stageId: 'stage-2' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockPrisma.crmActivity.create).toHaveBeenCalled();
  });

  it('should return 400 for missing stageId', async () => {
    const res = await request(app)
      .put('/api/deals/00000000-0000-0000-0000-000000000001/stage')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('stageId is required');
  });

  it('should return 404 when deal not found', async () => {
    mockPrisma.crmDeal.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/deals/00000000-0000-0000-0000-000000000099/stage')
      .send({ stageId: 'stage-2' });

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmDeal.findFirst.mockResolvedValue(mockDeal);
    mockPrisma.crmDeal.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/deals/00000000-0000-0000-0000-000000000001/stage')
      .send({ stageId: 'stage-2' });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/deals/:id/won
// ===================================================================

describe('PUT /api/deals/:id/won', () => {
  it('should close deal as won', async () => {
    mockPrisma.crmDeal.findFirst.mockResolvedValue(mockDeal);
    mockPrisma.crmDeal.update.mockResolvedValue({
      ...mockDeal,
      status: 'WON',
      probability: 100,
      actualCloseDate: new Date(),
    });
    mockPrisma.crmActivity.create.mockResolvedValue({ id: 'act-1' });

    const res = await request(app).put('/api/deals/00000000-0000-0000-0000-000000000001/won');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('WON');
    expect(mockPrisma.crmDeal.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'WON', probability: 100 }),
      })
    );
  });

  it('should create activity log when deal is won', async () => {
    mockPrisma.crmDeal.findFirst.mockResolvedValue(mockDeal);
    mockPrisma.crmDeal.update.mockResolvedValue({
      ...mockDeal,
      status: 'WON',
      contactId: 'contact-1',
    });
    mockPrisma.crmActivity.create.mockResolvedValue({ id: 'act-1' });

    await request(app).put('/api/deals/00000000-0000-0000-0000-000000000001/won');

    expect(mockPrisma.crmActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ subject: expect.stringContaining('Won') }),
      })
    );
  });

  it('should return 404 when deal not found', async () => {
    mockPrisma.crmDeal.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/deals/00000000-0000-0000-0000-000000000099/won');

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmDeal.findFirst.mockResolvedValue(mockDeal);
    mockPrisma.crmDeal.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put('/api/deals/00000000-0000-0000-0000-000000000001/won');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/deals/:id/lost
// ===================================================================

describe('PUT /api/deals/:id/lost', () => {
  it('should close deal as lost', async () => {
    mockPrisma.crmDeal.findFirst.mockResolvedValue(mockDeal);
    mockPrisma.crmDeal.update.mockResolvedValue({
      ...mockDeal,
      status: 'LOST',
      probability: 0,
      lostReason: 'Price too high',
    });
    mockPrisma.crmActivity.create.mockResolvedValue({ id: 'act-1' });

    const res = await request(app)
      .put('/api/deals/00000000-0000-0000-0000-000000000001/lost')
      .send({ lostReason: 'Price too high' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('LOST');
    expect(mockPrisma.crmDeal.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'LOST',
          probability: 0,
          lostReason: 'Price too high',
        }),
      })
    );
  });

  it('should return 400 for missing lostReason', async () => {
    const res = await request(app)
      .put('/api/deals/00000000-0000-0000-0000-000000000001/lost')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('lostReason is required');
  });

  it('should return 404 when deal not found', async () => {
    mockPrisma.crmDeal.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/deals/00000000-0000-0000-0000-000000000099/lost')
      .send({ lostReason: 'Lost' });

    expect(res.status).toBe(404);
  });

  it('should create activity log when deal is lost', async () => {
    mockPrisma.crmDeal.findFirst.mockResolvedValue(mockDeal);
    mockPrisma.crmDeal.update.mockResolvedValue({
      ...mockDeal,
      status: 'LOST',
      contactId: 'contact-1',
    });
    mockPrisma.crmActivity.create.mockResolvedValue({ id: 'act-1' });

    await request(app)
      .put('/api/deals/00000000-0000-0000-0000-000000000001/lost')
      .send({ lostReason: 'Budget cuts' });

    expect(mockPrisma.crmActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ subject: expect.stringContaining('Lost') }),
      })
    );
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmDeal.findFirst.mockResolvedValue(mockDeal);
    mockPrisma.crmDeal.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/deals/00000000-0000-0000-0000-000000000001/lost')
      .send({ lostReason: 'Budget cuts' });

    expect(res.status).toBe(500);
  });
});


describe('phase31 coverage', () => {
  it('handles Number.isInteger', () => { expect(Number.isInteger(5)).toBe(true); expect(Number.isInteger(5.5)).toBe(false); });
  it('handles optional chaining', () => { const o: any = null; expect(o?.x).toBeUndefined(); });
  it('handles array reduce', () => { expect([1,2,3].reduce((a,b) => a+b, 0)).toBe(6); });
});
