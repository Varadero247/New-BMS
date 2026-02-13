import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    aiRiskAssessment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    aiSystem: {
      findFirst: jest.fn(),
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

import riskAssessmentsRouter from '../src/routes/risk-assessments';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/risk-assessments', riskAssessmentsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const UUID1 = '00000000-0000-0000-0000-000000000001';
const UUID2 = '00000000-0000-0000-0000-000000000002';

const mockSystem = {
  id: UUID1,
  name: 'Test AI System',
  reference: 'AI42-SYS-2602-1111',
  riskTier: 'HIGH',
  deletedAt: null,
};

const mockRisk = {
  id: UUID2,
  reference: 'AI42-RSK-2602-2222',
  systemId: UUID1,
  title: 'Bias in hiring recommendations',
  description: 'Model may exhibit gender bias in candidate scoring',
  category: 'BIAS_DISCRIMINATION',
  likelihood: 'POSSIBLE',
  impact: 'MAJOR',
  riskScore: 12,
  riskLevel: 'HIGH',
  status: 'IDENTIFIED',
  existingControls: 'Manual review of top candidates',
  proposedMitigations: 'Implement fairness constraints',
  riskOwner: 'Jane Doe',
  reviewDate: new Date('2026-06-01'),
  notes: null,
  createdBy: 'user-123',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  deletedAt: null,
  system: { id: UUID1, name: 'Test AI System', reference: 'AI42-SYS-2602-1111' },
};

// ===================================================================
// GET /api/risk-assessments — List risk assessments
// ===================================================================
describe('GET /api/risk-assessments', () => {
  it('should return a paginated list of risk assessments', async () => {
    (prisma as any).aiRiskAssessment.findMany.mockResolvedValue([mockRisk]);
    (prisma as any).aiRiskAssessment.count.mockResolvedValue(1);

    const res = await request(app).get('/api/risk-assessments');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should return empty list when no risks exist', async () => {
    (prisma as any).aiRiskAssessment.findMany.mockResolvedValue([]);
    (prisma as any).aiRiskAssessment.count.mockResolvedValue(0);

    const res = await request(app).get('/api/risk-assessments');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should filter by category', async () => {
    (prisma as any).aiRiskAssessment.findMany.mockResolvedValue([]);
    (prisma as any).aiRiskAssessment.count.mockResolvedValue(0);

    const res = await request(app).get('/api/risk-assessments?category=BIAS_DISCRIMINATION');

    expect(res.status).toBe(200);
    expect((prisma as any).aiRiskAssessment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: 'BIAS_DISCRIMINATION' }),
      })
    );
  });

  it('should filter by status', async () => {
    (prisma as any).aiRiskAssessment.findMany.mockResolvedValue([]);
    (prisma as any).aiRiskAssessment.count.mockResolvedValue(0);

    const res = await request(app).get('/api/risk-assessments?status=IDENTIFIED');

    expect(res.status).toBe(200);
    expect((prisma as any).aiRiskAssessment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'IDENTIFIED' }),
      })
    );
  });

  it('should filter by systemId', async () => {
    (prisma as any).aiRiskAssessment.findMany.mockResolvedValue([]);
    (prisma as any).aiRiskAssessment.count.mockResolvedValue(0);

    const res = await request(app).get(`/api/risk-assessments?systemId=${UUID1}`);

    expect(res.status).toBe(200);
    expect((prisma as any).aiRiskAssessment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ systemId: UUID1 }),
      })
    );
  });

  it('should support search query', async () => {
    (prisma as any).aiRiskAssessment.findMany.mockResolvedValue([]);
    (prisma as any).aiRiskAssessment.count.mockResolvedValue(0);

    const res = await request(app).get('/api/risk-assessments?search=bias');

    expect(res.status).toBe(200);
    expect((prisma as any).aiRiskAssessment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ title: expect.objectContaining({ contains: 'bias' }) }),
          ]),
        }),
      })
    );
  });

  it('should return 500 on database error', async () => {
    (prisma as any).aiRiskAssessment.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/risk-assessments');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// POST /api/risk-assessments — Create risk assessment
// ===================================================================
describe('POST /api/risk-assessments', () => {
  const validPayload = {
    systemId: UUID1,
    title: 'Privacy Risk Assessment',
    description: 'Assessment of data privacy risks',
    category: 'PRIVACY_DATA_PROTECTION',
    likelihood: 'LIKELY',
    impact: 'MAJOR',
  };

  it('should create a risk assessment successfully', async () => {
    (prisma as any).aiSystem.findFirst.mockResolvedValue(mockSystem);
    (prisma as any).aiRiskAssessment.create.mockResolvedValue({
      id: UUID2,
      reference: 'AI42-RSK-2602-3333',
      ...validPayload,
      riskScore: 16,
      riskLevel: 'HIGH',
      status: 'IDENTIFIED',
      createdBy: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      system: { id: UUID1, name: 'Test AI System', reference: 'AI42-SYS-2602-1111' },
    });

    const res = await request(app).post('/api/risk-assessments').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Privacy Risk Assessment');
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app).post('/api/risk-assessments').send({
      title: 'Incomplete',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for invalid systemId (not UUID)', async () => {
    const res = await request(app).post('/api/risk-assessments').send({
      ...validPayload,
      systemId: 'not-a-uuid',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 404 when AI system not found', async () => {
    (prisma as any).aiSystem.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/risk-assessments').send(validPayload);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 for invalid category', async () => {
    const res = await request(app).post('/api/risk-assessments').send({
      ...validPayload,
      category: 'INVALID_CATEGORY',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error during creation', async () => {
    (prisma as any).aiSystem.findFirst.mockResolvedValue(mockSystem);
    (prisma as any).aiRiskAssessment.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/risk-assessments').send(validPayload);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// GET /api/risk-assessments/:id — Get single risk assessment
// ===================================================================
describe('GET /api/risk-assessments/:id', () => {
  it('should return a risk assessment when found', async () => {
    (prisma as any).aiRiskAssessment.findFirst.mockResolvedValue(mockRisk);

    const res = await request(app).get(`/api/risk-assessments/${UUID2}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(UUID2);
    expect(res.body.data.title).toBe('Bias in hiring recommendations');
  });

  it('should return 404 when risk assessment not found', async () => {
    (prisma as any).aiRiskAssessment.findFirst.mockResolvedValue(null);

    const res = await request(app).get(`/api/risk-assessments/${UUID1}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).aiRiskAssessment.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(`/api/risk-assessments/${UUID2}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// PUT /api/risk-assessments/:id — Update risk assessment
// ===================================================================
describe('PUT /api/risk-assessments/:id', () => {
  it('should update a risk assessment successfully', async () => {
    (prisma as any).aiRiskAssessment.findFirst.mockResolvedValue(mockRisk);
    (prisma as any).aiRiskAssessment.update.mockResolvedValue({
      ...mockRisk,
      status: 'MITIGATED',
      system: { id: UUID1, name: 'Test AI System', reference: 'AI42-SYS-2602-1111' },
    });

    const res = await request(app)
      .put(`/api/risk-assessments/${UUID2}`)
      .send({ status: 'MITIGATED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when updating non-existent risk', async () => {
    (prisma as any).aiRiskAssessment.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/risk-assessments/${UUID1}`)
      .send({ status: 'ASSESSED' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid update data', async () => {
    const res = await request(app)
      .put(`/api/risk-assessments/${UUID2}`)
      .send({ category: 'NOT_VALID' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error during update', async () => {
    (prisma as any).aiRiskAssessment.findFirst.mockResolvedValue(mockRisk);
    (prisma as any).aiRiskAssessment.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put(`/api/risk-assessments/${UUID2}`)
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// DELETE /api/risk-assessments/:id — Soft delete risk assessment
// ===================================================================
describe('DELETE /api/risk-assessments/:id', () => {
  it('should soft delete a risk assessment', async () => {
    (prisma as any).aiRiskAssessment.findFirst.mockResolvedValue(mockRisk);
    (prisma as any).aiRiskAssessment.update.mockResolvedValue({
      ...mockRisk,
      deletedAt: new Date(),
    });

    const res = await request(app).delete(`/api/risk-assessments/${UUID2}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 when deleting non-existent risk', async () => {
    (prisma as any).aiRiskAssessment.findFirst.mockResolvedValue(null);

    const res = await request(app).delete(`/api/risk-assessments/${UUID1}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error during delete', async () => {
    (prisma as any).aiRiskAssessment.findFirst.mockResolvedValue(mockRisk);
    (prisma as any).aiRiskAssessment.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete(`/api/risk-assessments/${UUID2}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
