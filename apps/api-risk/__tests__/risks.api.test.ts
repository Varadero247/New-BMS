import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    riskRegister: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    riskAppetiteStatement: { findFirst: jest.fn() },
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
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/risks';
import { prisma } from '../src/prisma';
const app = express();
app.use(express.json());
app.use('/api/risks', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/risks', () => {
  it('should return risks', async () => {
    (prisma as any).riskRegister.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Test' },
    ]);
    (prisma as any).riskRegister.count.mockResolvedValue(1);
    const res = await request(app).get('/api/risks');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should filter by category', async () => {
    (prisma as any).riskRegister.findMany.mockResolvedValue([]);
    (prisma as any).riskRegister.count.mockResolvedValue(0);
    const res = await request(app).get('/api/risks?category=HEALTH_SAFETY');
    expect(res.status).toBe(200);
  });

  it('should search by title', async () => {
    (prisma as any).riskRegister.findMany.mockResolvedValue([]);
    (prisma as any).riskRegister.count.mockResolvedValue(0);
    const res = await request(app).get('/api/risks?search=fire');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/risks/:id', () => {
  it('should return 404 if not found', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/risks/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
  it('should return item by id with relations', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      riskControls: [],
      keyRiskIndicators: [],
      treatmentActions: [],
      reviews: [],
    });
    const res = await request(app).get('/api/risks/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

describe('POST /api/risks', () => {
  it('should create with auto-calculated scores', async () => {
    (prisma as any).riskRegister.count.mockResolvedValue(0);
    (prisma as any).riskRegister.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New',
      inherentScore: 9,
      inherentRiskLevel: 'HIGH',
    });
    (prisma as any).riskAppetiteStatement.findFirst.mockResolvedValue(null);
    const res = await request(app).post('/api/risks').send({
      title: 'New',
      category: 'OPERATIONAL',
      likelihood: 'POSSIBLE',
      consequence: 'MODERATE',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should accept numeric likelihood/consequence', async () => {
    (prisma as any).riskRegister.count.mockResolvedValue(0);
    (prisma as any).riskRegister.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      inherentScore: 12,
    });
    (prisma as any).riskAppetiteStatement.findFirst.mockResolvedValue(null);
    const res = await request(app).post('/api/risks').send({
      title: 'Numeric test',
      category: 'FINANCIAL',
      inherentLikelihood: 3,
      inherentConsequence: 4,
    });
    expect(res.status).toBe(201);
  });
});

describe('PUT /api/risks/:id', () => {
  it('should update', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      category: 'OPERATIONAL',
      residualScore: 8,
    });
    (prisma as any).riskRegister.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });
    (prisma as any).riskAppetiteStatement.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/risks/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });

  it('should auto-check appetite status on update', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      category: 'HEALTH_SAFETY',
      residualScore: 12,
    });
    (prisma as any).riskAppetiteStatement.findFirst.mockResolvedValue({
      maximumTolerableScore: 6,
      acceptableResidualScore: 4,
    });
    (prisma as any).riskRegister.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      appetiteStatus: 'EXCEEDS',
    });
    const res = await request(app)
      .put('/api/risks/00000000-0000-0000-0000-000000000001')
      .send({ residualLikelihoodNum: 3, residualConsequenceNum: 4 });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/risks/:id', () => {
  it('should soft delete', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).riskRegister.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/risks/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when risk not found', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/risks/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).riskRegister.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/risks/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/risks - error paths', () => {
  it('should return 500 on database error', async () => {
    (prisma as any).riskRegister.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/risks');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/risks/:id - error paths', () => {
  it('should return 404 when risk not found', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/risks/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
  });

  it('should return 500 on database update error', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      category: 'OPERATIONAL',
      residualScore: 8,
    });
    (prisma as any).riskRegister.update.mockRejectedValue(new Error('DB error'));
    (prisma as any).riskAppetiteStatement.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/risks/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/risks/register', () => {
  it('should return full register with relations', async () => {
    (prisma as any).riskRegister.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001' },
    ]);
    (prisma as any).riskRegister.count.mockResolvedValue(1);
    const res = await request(app).get('/api/risks/register');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
  });
});

describe('GET /api/risks/heatmap', () => {
  it('should return 5x5 heatmap data', async () => {
    (prisma as any).riskRegister.findMany.mockResolvedValue([
      {
        id: '00000000-0000-0000-0000-000000000001',
        residualLikelihoodNum: 3,
        residualConsequenceNum: 4,
        title: 'Test',
        referenceNumber: 'RISK-2026-0001',
      },
    ]);
    const res = await request(app).get('/api/risks/heatmap');
    expect(res.status).toBe(200);
    expect(res.body.data.heatmapData).toHaveLength(25);
    const cell34 = res.body.data.heatmapData.find(
      (c: any) => c.likelihood === 3 && c.consequence === 4
    );
    expect(cell34.count).toBe(1);
  });
});

describe('GET /api/risks/overdue-review', () => {
  it('should return overdue risks', async () => {
    (prisma as any).riskRegister.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', nextReviewDate: '2025-01-01' },
    ]);
    const res = await request(app).get('/api/risks/overdue-review');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/risks/exceeds-appetite', () => {
  it('should return risks exceeding appetite', async () => {
    (prisma as any).riskRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/risks/exceeds-appetite');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/risks/by-category', () => {
  it('should return category breakdown', async () => {
    (prisma as any).riskRegister.groupBy.mockResolvedValue([
      { category: 'HEALTH_SAFETY', _count: 3 },
    ]);
    const res = await request(app).get('/api/risks/by-category');
    expect(res.status).toBe(200);
    expect(res.body.data[0].category).toBe('HEALTH_SAFETY');
  });
});

describe('GET /api/risks/aggregate', () => {
  it('should aggregate by category', async () => {
    (prisma as any).riskRegister.groupBy.mockResolvedValue([{ category: 'FINANCIAL', _count: 2 }]);
    const res = await request(app).get('/api/risks/aggregate?groupBy=category');
    expect(res.status).toBe(200);
  });
});

describe('POST /api/risks/from-coshh/:coshhId', () => {
  it('should create risk from COSHH', async () => {
    (prisma as any).riskRegister.count.mockResolvedValue(0);
    (prisma as any).riskRegister.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      sourceModule: 'CHEMICAL_COSHH',
    });
    const res = await request(app)
      .post('/api/risks/from-coshh/00000000-0000-0000-0000-000000000001')
      .send({
        id: '00000000-0000-0000-0000-000000000001',
        chemicalName: 'Benzene',
        activity: 'Lab work',
        inherentLikelihood: 3,
        inherentSeverity: 4,
      });
    expect(res.status).toBe(201);
  });

  it('should require body data', async () => {
    const res = await request(app)
      .post('/api/risks/from-coshh/00000000-0000-0000-0000-000000000001')
      .send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /api/risks/from-fra/:fraId', () => {
  it('should create risk from FRA', async () => {
    (prisma as any).riskRegister.count.mockResolvedValue(0);
    (prisma as any).riskRegister.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      sourceModule: 'FIRE_EMERGENCY',
    });
    const res = await request(app)
      .post('/api/risks/from-fra/00000000-0000-0000-0000-000000000001')
      .send({
        id: '00000000-0000-0000-0000-000000000001',
        premisesName: 'HQ',
        likelihoodRating: 3,
        consequenceRating: 4,
      });
    expect(res.status).toBe(201);
  });
});

describe('POST /api/risks/from-incident/:id', () => {
  it('should create risk from incident', async () => {
    (prisma as any).riskRegister.count.mockResolvedValue(0);
    (prisma as any).riskRegister.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      sourceModule: 'HEALTH_SAFETY',
    });
    const res = await request(app)
      .post('/api/risks/from-incident/00000000-0000-0000-0000-000000000001')
      .send({
        id: '00000000-0000-0000-0000-000000000001',
        title: 'Slip and fall',
        severity: 'MAJOR',
      });
    expect(res.status).toBe(201);
  });
});

describe('POST /api/risks/from-audit/:id', () => {
  it('should create risk from audit finding', async () => {
    (prisma as any).riskRegister.count.mockResolvedValue(0);
    (prisma as any).riskRegister.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      sourceModule: 'AUDIT_MOD',
      category: 'COMPLIANCE',
    });
    const res = await request(app)
      .post('/api/risks/from-audit/00000000-0000-0000-0000-000000000001')
      .send({ id: '00000000-0000-0000-0000-000000000001', title: 'Missing documentation' });
    expect(res.status).toBe(201);
  });
});
