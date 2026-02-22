import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgGovernanceMetric: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
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

import governanceRouter from '../src/routes/governance';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/governance', governanceRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockGovernance = {
  id: '00000000-0000-0000-0000-000000000001',
  category: 'BOARD',
  metric: 'Board Independence',
  value: '75%',
  periodStart: new Date('2026-01-01'),
  periodEnd: new Date('2026-03-31'),
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

describe('GET /api/governance', () => {
  it('should return paginated governance metrics', async () => {
    (prisma.esgGovernanceMetric.findMany as jest.Mock).mockResolvedValue([mockGovernance]);
    (prisma.esgGovernanceMetric.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/governance');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by category', async () => {
    (prisma.esgGovernanceMetric.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgGovernanceMetric.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/governance?category=BOARD');
    expect(prisma.esgGovernanceMetric.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: 'BOARD' }) })
    );
  });

  it('should handle pagination', async () => {
    (prisma.esgGovernanceMetric.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgGovernanceMetric.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/governance?page=2&limit=5');
    expect(prisma.esgGovernanceMetric.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  it('should return empty list', async () => {
    (prisma.esgGovernanceMetric.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgGovernanceMetric.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/governance');
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/governance', () => {
  it('should create a governance metric', async () => {
    (prisma.esgGovernanceMetric.create as jest.Mock).mockResolvedValue(mockGovernance);

    const res = await request(app).post('/api/governance').send({
      category: 'BOARD',
      metric: 'Board Independence',
      value: '75%',
      periodStart: '2026-01-01',
      periodEnd: '2026-03-31',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing fields', async () => {
    const res = await request(app).post('/api/governance').send({
      category: 'BOARD',
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid category', async () => {
    const res = await request(app).post('/api/governance').send({
      category: 'INVALID',
      metric: 'Test',
      value: 'test',
      periodStart: '2026-01-01',
      periodEnd: '2026-03-31',
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/governance/:id', () => {
  it('should return a single governance metric', async () => {
    (prisma.esgGovernanceMetric.findFirst as jest.Mock).mockResolvedValue(mockGovernance);

    const res = await request(app).get('/api/governance/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 when not found', async () => {
    (prisma.esgGovernanceMetric.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/governance/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/governance/:id', () => {
  it('should update a governance metric', async () => {
    (prisma.esgGovernanceMetric.findFirst as jest.Mock).mockResolvedValue(mockGovernance);
    (prisma.esgGovernanceMetric.update as jest.Mock).mockResolvedValue({
      ...mockGovernance,
      value: '80%',
    });

    const res = await request(app)
      .put('/api/governance/00000000-0000-0000-0000-000000000001')
      .send({ value: '80%' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgGovernanceMetric.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/governance/00000000-0000-0000-0000-000000000099')
      .send({ value: '80%' });
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid data', async () => {
    const res = await request(app)
      .put('/api/governance/00000000-0000-0000-0000-000000000001')
      .send({ category: 'INVALID' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/governance/:id', () => {
  it('should soft delete a governance metric', async () => {
    (prisma.esgGovernanceMetric.findFirst as jest.Mock).mockResolvedValue(mockGovernance);
    (prisma.esgGovernanceMetric.update as jest.Mock).mockResolvedValue({
      ...mockGovernance,
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/governance/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgGovernanceMetric.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/governance/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/governance/policies', () => {
  it('should return policy register', async () => {
    (prisma.esgGovernanceMetric.findMany as jest.Mock).mockResolvedValue([
      { ...mockGovernance, category: 'COMPLIANCE', metric: 'Anti-Bribery Policy' },
    ]);

    const res = await request(app).get('/api/governance/policies');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('GET /api/governance/ethics', () => {
  it('should return ethics data', async () => {
    (prisma.esgGovernanceMetric.findMany as jest.Mock).mockResolvedValue([
      { ...mockGovernance, category: 'ETHICS', metric: 'Whistleblower Reports' },
    ]);

    const res = await request(app).get('/api/governance/ethics');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    (prisma.esgGovernanceMetric.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/governance');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    (prisma.esgGovernanceMetric.findFirst as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/governance/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    (prisma.esgGovernanceMetric.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgGovernanceMetric.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/governance').send({ category: 'BOARD', metric: 'Board Independence', value: '75%', periodStart: '2026-01-01', periodEnd: '2026-03-31' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    (prisma.esgGovernanceMetric.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.esgGovernanceMetric.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/governance/00000000-0000-0000-0000-000000000001').send({ value: '80%' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    (prisma.esgGovernanceMetric.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.esgGovernanceMetric.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/governance/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── Additional coverage: pagination, filters, response shapes ────────────────

describe('Governance — extended coverage', () => {
  it('GET /api/governance returns correct totalPages for multi-page result', async () => {
    (prisma.esgGovernanceMetric.findMany as jest.Mock).mockResolvedValue([mockGovernance]);
    (prisma.esgGovernanceMetric.count as jest.Mock).mockResolvedValue(30);

    const res = await request(app).get('/api/governance?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination.totalPages).toBe(3);
    expect(res.body.pagination.total).toBe(30);
  });

  it('GET /api/governance passes correct skip for page 4', async () => {
    (prisma.esgGovernanceMetric.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgGovernanceMetric.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/governance?page=4&limit=5');
    expect(prisma.esgGovernanceMetric.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 15, take: 5 })
    );
  });

  it('GET /api/governance filters by category param and wires it into where clause', async () => {
    (prisma.esgGovernanceMetric.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgGovernanceMetric.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/governance?category=ETHICS');
    expect(prisma.esgGovernanceMetric.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: 'ETHICS' }) })
    );
  });

  it('GET /api/governance returns success:true with empty data array', async () => {
    (prisma.esgGovernanceMetric.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgGovernanceMetric.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/governance');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('GET /api/governance/:id returns data with expected fields', async () => {
    (prisma.esgGovernanceMetric.findFirst as jest.Mock).mockResolvedValue(mockGovernance);

    const res = await request(app).get('/api/governance/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('category');
    expect(res.body.data).toHaveProperty('metric');
    expect(res.body.data).toHaveProperty('value');
  });

  it('GET /api/governance/policies returns 500 on DB error', async () => {
    (prisma.esgGovernanceMetric.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/governance/policies');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/governance/ethics returns 500 on DB error', async () => {
    (prisma.esgGovernanceMetric.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/governance/ethics');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/governance returns 400 when periodEnd is missing', async () => {
    const res = await request(app).post('/api/governance').send({
      category: 'BOARD',
      metric: 'Board Independence',
      value: '75%',
      periodStart: '2026-01-01',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
