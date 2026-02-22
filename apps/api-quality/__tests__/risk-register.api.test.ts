import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    qualRiskRegister: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
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

import riskRegisterRouter from '../src/routes/risk-register';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/risk-register', riskRegisterRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Quality Risk Register API Routes', () => {
  const mockRisk = {
    id: '00000000-0000-0000-0000-000000000001',
    referenceNumber: 'QMS-RR-2026-001',
    title: 'Supplier quality failure',
    description: 'Key supplier may fail quality requirements',
    category: 'Supply Chain',
    likelihood: 'POSSIBLE',
    impact: 'MAJOR',
    riskScore: 12,
    residualScore: null,
    status: 'OPEN',
    owner: 'Supply Manager',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('GET /api/risk-register/heatmap', () => {
    it('should return risk heatmap data', async () => {
      mockPrisma.qualRiskRegister.findMany.mockResolvedValue([
        {
          id: '00000000-0000-0000-0000-000000000001',
          referenceNumber: 'QMS-RR-2026-001',
          title: 'Supplier failure',
          likelihood: 'POSSIBLE',
          impact: 'MAJOR',
          riskScore: 12,
          status: 'OPEN',
        },
      ]);

      const res = await request(app).get('/api/risk-register/heatmap');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualRiskRegister.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/risk-register/heatmap');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/risk-register/stats', () => {
    it('should return risk register statistics', async () => {
      mockPrisma.qualRiskRegister.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(6)
        .mockResolvedValueOnce(3);
      mockPrisma.qualRiskRegister.groupBy.mockResolvedValue([
        { status: 'OPEN', _count: { id: 6 } },
      ]);

      const res = await request(app).get('/api/risk-register/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('open');
      expect(res.body.data).toHaveProperty('mitigated');
      expect(res.body.data).toHaveProperty('byStatus');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualRiskRegister.count.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/risk-register/stats');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/risk-register', () => {
    it('should return list of risks with pagination', async () => {
      mockPrisma.qualRiskRegister.findMany.mockResolvedValue([mockRisk]);
      mockPrisma.qualRiskRegister.count.mockResolvedValue(1);

      const res = await request(app).get('/api/risk-register');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrisma.qualRiskRegister.findMany.mockResolvedValue([mockRisk]);
      mockPrisma.qualRiskRegister.count.mockResolvedValue(1);

      const res = await request(app).get('/api/risk-register?status=OPEN');

      expect(res.status).toBe(200);
    });

    it('should filter by likelihood', async () => {
      mockPrisma.qualRiskRegister.findMany.mockResolvedValue([mockRisk]);
      mockPrisma.qualRiskRegister.count.mockResolvedValue(1);

      const res = await request(app).get('/api/risk-register?likelihood=POSSIBLE');

      expect(res.status).toBe(200);
    });

    it('should filter by impact', async () => {
      mockPrisma.qualRiskRegister.findMany.mockResolvedValue([mockRisk]);
      mockPrisma.qualRiskRegister.count.mockResolvedValue(1);

      const res = await request(app).get('/api/risk-register?impact=MAJOR');

      expect(res.status).toBe(200);
    });

    it('should support search', async () => {
      mockPrisma.qualRiskRegister.findMany.mockResolvedValue([mockRisk]);
      mockPrisma.qualRiskRegister.count.mockResolvedValue(1);

      const res = await request(app).get('/api/risk-register?search=supplier');

      expect(res.status).toBe(200);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualRiskRegister.findMany.mockRejectedValue(new Error('DB error'));
      mockPrisma.qualRiskRegister.count.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/risk-register');

      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/risk-register', () => {
    const validBody = {
      title: 'Supplier quality failure',
      description: 'Key supplier may fail quality requirements',
      likelihood: 'POSSIBLE',
      impact: 'MAJOR',
    };

    it('should create a new risk with calculated riskScore', async () => {
      mockPrisma.qualRiskRegister.count.mockResolvedValue(0);
      mockPrisma.qualRiskRegister.create.mockResolvedValue(mockRisk);

      const res = await request(app).post('/api/risk-register').send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/risk-register')
        .send({ title: 'Missing description' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid likelihood', async () => {
      const res = await request(app)
        .post('/api/risk-register')
        .send({ ...validBody, likelihood: 'INVALID' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid impact', async () => {
      const res = await request(app)
        .post('/api/risk-register')
        .send({ ...validBody, impact: 'INVALID' });

      expect(res.status).toBe(400);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualRiskRegister.count.mockResolvedValue(0);
      mockPrisma.qualRiskRegister.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/risk-register').send(validBody);

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/risk-register/:id', () => {
    it('should return a single risk', async () => {
      mockPrisma.qualRiskRegister.findFirst.mockResolvedValue(mockRisk);

      const res = await request(app).get('/api/risk-register/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when risk not found', async () => {
      mockPrisma.qualRiskRegister.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/risk-register/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualRiskRegister.findFirst.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/risk-register/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/risk-register/:id', () => {
    it('should update a risk and recalculate score', async () => {
      mockPrisma.qualRiskRegister.findFirst.mockResolvedValue(mockRisk);
      const updated = { ...mockRisk, status: 'MITIGATED', riskScore: 6 };
      mockPrisma.qualRiskRegister.update.mockResolvedValue(updated);

      const res = await request(app)
        .put('/api/risk-register/00000000-0000-0000-0000-000000000001')
        .send({ status: 'MITIGATED', likelihood: 'UNLIKELY', impact: 'MODERATE' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when risk not found', async () => {
      mockPrisma.qualRiskRegister.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/risk-register/00000000-0000-0000-0000-000000000099')
        .send({ status: 'MITIGATED' });

      expect(res.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualRiskRegister.findFirst.mockResolvedValue(mockRisk);
      mockPrisma.qualRiskRegister.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/risk-register/00000000-0000-0000-0000-000000000001')
        .send({ title: 'Updated' });

      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/risk-register/:id', () => {
    it('should soft delete a risk', async () => {
      mockPrisma.qualRiskRegister.findFirst.mockResolvedValue(mockRisk);
      mockPrisma.qualRiskRegister.update.mockResolvedValue({ ...mockRisk, deletedAt: new Date() });

      const res = await request(app).delete(
        '/api/risk-register/00000000-0000-0000-0000-000000000001'
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted).toBe(true);
    });

    it('should return 404 when risk not found', async () => {
      mockPrisma.qualRiskRegister.findFirst.mockResolvedValue(null);

      const res = await request(app).delete(
        '/api/risk-register/00000000-0000-0000-0000-000000000099'
      );

      expect(res.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualRiskRegister.findFirst.mockResolvedValue(mockRisk);
      mockPrisma.qualRiskRegister.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete(
        '/api/risk-register/00000000-0000-0000-0000-000000000001'
      );

      expect(res.status).toBe(500);
    });
  });
});

describe('Quality Risk Register API Routes — extended coverage', () => {
  const mockRisk = {
    id: '00000000-0000-0000-0000-000000000001',
    referenceNumber: 'QMS-RR-2026-001',
    title: 'Supplier quality failure',
    description: 'Key supplier may fail quality requirements',
    category: 'Supply Chain',
    likelihood: 'POSSIBLE',
    impact: 'MAJOR',
    riskScore: 12,
    residualScore: null,
    status: 'OPEN',
    owner: 'Supply Manager',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('GET /api/risk-register includes totalPages when count > limit', async () => {
    mockPrisma.qualRiskRegister.findMany.mockResolvedValue([mockRisk]);
    mockPrisma.qualRiskRegister.count.mockResolvedValue(50);
    const res = await request(app).get('/api/risk-register?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(50);
    expect(res.body.pagination.totalPages).toBeGreaterThanOrEqual(5);
  });

  it('GET /api/risk-register filters by category param', async () => {
    mockPrisma.qualRiskRegister.findMany.mockResolvedValue([mockRisk]);
    mockPrisma.qualRiskRegister.count.mockResolvedValue(1);
    const res = await request(app).get('/api/risk-register?category=Supply+Chain');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/risk-register response has success:true and referenceNumber', async () => {
    mockPrisma.qualRiskRegister.count.mockResolvedValue(0);
    mockPrisma.qualRiskRegister.create.mockResolvedValue(mockRisk);
    const res = await request(app).post('/api/risk-register').send({
      title: 'New risk',
      description: 'Risk desc',
      likelihood: 'POSSIBLE',
      impact: 'MAJOR',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('referenceNumber');
  });

  it('GET /api/risk-register/heatmap response has success:true with array', async () => {
    mockPrisma.qualRiskRegister.findMany.mockResolvedValue([mockRisk]);
    const res = await request(app).get('/api/risk-register/heatmap');
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/risk-register/stats error code is not present on success', async () => {
    mockPrisma.qualRiskRegister.count
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1);
    mockPrisma.qualRiskRegister.groupBy.mockResolvedValue([]);
    const res = await request(app).get('/api/risk-register/stats');
    expect(res.status).toBe(200);
    expect(res.body.error).toBeUndefined();
  });

  it('DELETE /api/risk-register/:id returns deleted:true in data', async () => {
    mockPrisma.qualRiskRegister.findFirst.mockResolvedValue(mockRisk);
    mockPrisma.qualRiskRegister.update.mockResolvedValue({ ...mockRisk, deletedAt: new Date() });
    const res = await request(app).delete('/api/risk-register/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('PUT /api/risk-register/:id returns 400 for invalid likelihood', async () => {
    mockPrisma.qualRiskRegister.findFirst.mockResolvedValue(mockRisk);
    const res = await request(app)
      .put('/api/risk-register/00000000-0000-0000-0000-000000000001')
      .send({ likelihood: 'INVALID_VALUE' });
    expect(res.status).toBe(400);
  });

  it('POST /api/risk-register returns 400 for missing title', async () => {
    const res = await request(app)
      .post('/api/risk-register')
      .send({ description: 'No title given', likelihood: 'POSSIBLE', impact: 'MAJOR' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/risk-register response has success:true and pagination', async () => {
    mockPrisma.qualRiskRegister.findMany.mockResolvedValue([]);
    mockPrisma.qualRiskRegister.count.mockResolvedValue(0);
    const res = await request(app).get('/api/risk-register');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('pagination');
  });

  it('PUT /api/risk-register/:id returns 400 for invalid impact value', async () => {
    mockPrisma.qualRiskRegister.findFirst.mockResolvedValue(mockRisk);
    const res = await request(app)
      .put('/api/risk-register/00000000-0000-0000-0000-000000000001')
      .send({ impact: 'SUPER_BAD' });
    expect(res.status).toBe(400);
  });

  it('GET /api/risk-register/stats returns byStatus array in data', async () => {
    mockPrisma.qualRiskRegister.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);
    mockPrisma.qualRiskRegister.groupBy.mockResolvedValue([
      { status: 'OPEN', _count: { id: 2 } },
      { status: 'MITIGATED', _count: { id: 1 } },
    ]);
    const res = await request(app).get('/api/risk-register/stats');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.byStatus)).toBe(true);
  });
});
