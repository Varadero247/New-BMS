import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    aiImpactAssessment: {
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

import impactAssessmentsRouter from '../src/routes/impact-assessments';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/impact-assessments', impactAssessmentsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const UUID1 = '00000000-0000-0000-0000-000000000001';
const UUID2 = '00000000-0000-0000-0000-000000000002';

const mockSystem = {
  id: UUID1,
  name: 'Credit Scoring AI',
  reference: 'AI42-SYS-2602-5555',
  riskTier: 'HIGH',
  deletedAt: null,
};

const mockAssessment = {
  id: UUID2,
  reference: 'AI42-IMP-2602-6666',
  systemId: UUID1,
  title: 'Credit Scoring Impact Assessment',
  description: 'Assessment of societal and individual impact of AI-driven credit scoring',
  impactLevel: 'HIGH',
  status: 'DRAFT',
  assessmentType: 'INITIAL',
  scope: 'All consumer credit decisions',
  methodology: 'EU AI Act conformity assessment framework',
  findings: 'Potential for discriminatory outcomes based on protected characteristics',
  humanRightsImpact: 'Risk of unfair denial of financial services',
  environmentalImpact: null,
  socialImpact: 'Community-level effects on credit access',
  economicImpact: 'Efficiency gains vs. fairness tradeoffs',
  mitigationMeasures: 'Bias testing, regular audits, human override capability',
  residualRisk: 'Low after mitigations',
  assessor: 'AI Ethics Team',
  reviewDate: new Date('2026-08-01'),
  approvedBy: null,
  approvedAt: null,
  notes: null,
  organisationId: 'org-1',
  createdBy: 'user-123',
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-15'),
  deletedAt: null,
  system: { id: UUID1, name: 'Credit Scoring AI', reference: 'AI42-SYS-2602-5555', riskTier: 'HIGH' },
};

// ===================================================================
// GET /api/impact-assessments — List impact assessments
// ===================================================================
describe('GET /api/impact-assessments', () => {
  it('should return a paginated list of impact assessments', async () => {
    (prisma as any).aiImpactAssessment.findMany.mockResolvedValue([mockAssessment]);
    (prisma as any).aiImpactAssessment.count.mockResolvedValue(1);

    const res = await request(app).get('/api/impact-assessments');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should return empty list when no assessments exist', async () => {
    (prisma as any).aiImpactAssessment.findMany.mockResolvedValue([]);
    (prisma as any).aiImpactAssessment.count.mockResolvedValue(0);

    const res = await request(app).get('/api/impact-assessments');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should filter by systemId', async () => {
    (prisma as any).aiImpactAssessment.findMany.mockResolvedValue([]);
    (prisma as any).aiImpactAssessment.count.mockResolvedValue(0);

    const res = await request(app).get(`/api/impact-assessments?systemId=${UUID1}`);

    expect(res.status).toBe(200);
    expect((prisma as any).aiImpactAssessment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ systemId: UUID1 }),
      })
    );
  });

  it('should filter by impactLevel', async () => {
    (prisma as any).aiImpactAssessment.findMany.mockResolvedValue([]);
    (prisma as any).aiImpactAssessment.count.mockResolvedValue(0);

    const res = await request(app).get('/api/impact-assessments?impactLevel=HIGH');

    expect(res.status).toBe(200);
    expect((prisma as any).aiImpactAssessment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ impactLevel: 'HIGH' }),
      })
    );
  });

  it('should filter by status', async () => {
    (prisma as any).aiImpactAssessment.findMany.mockResolvedValue([]);
    (prisma as any).aiImpactAssessment.count.mockResolvedValue(0);

    const res = await request(app).get('/api/impact-assessments?status=APPROVED');

    expect(res.status).toBe(200);
    expect((prisma as any).aiImpactAssessment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'APPROVED' }),
      })
    );
  });

  it('should support search query', async () => {
    (prisma as any).aiImpactAssessment.findMany.mockResolvedValue([]);
    (prisma as any).aiImpactAssessment.count.mockResolvedValue(0);

    const res = await request(app).get('/api/impact-assessments?search=credit');

    expect(res.status).toBe(200);
    expect((prisma as any).aiImpactAssessment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ title: expect.objectContaining({ contains: 'credit' }) }),
          ]),
        }),
      })
    );
  });

  it('should return 500 on database error', async () => {
    (prisma as any).aiImpactAssessment.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/impact-assessments');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// POST /api/impact-assessments — Create impact assessment
// ===================================================================
describe('POST /api/impact-assessments', () => {
  const validPayload = {
    systemId: UUID1,
    title: 'Hiring AI Impact Assessment',
    description: 'Assessment of AI-driven hiring tool',
    impactLevel: 'SIGNIFICANT',
    humanRightsImpact: 'Risk of discrimination',
  };

  it('should create an impact assessment successfully', async () => {
    (prisma as any).aiSystem.findFirst.mockResolvedValue(mockSystem);
    (prisma as any).aiImpactAssessment.create.mockResolvedValue({
      id: UUID2,
      reference: 'AI42-IMP-2602-7777',
      ...validPayload,
      status: 'DRAFT',
      createdBy: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      system: { id: UUID1, name: 'Credit Scoring AI', reference: 'AI42-SYS-2602-5555' },
    });

    const res = await request(app).post('/api/impact-assessments').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Hiring AI Impact Assessment');
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app).post('/api/impact-assessments').send({
      description: 'Only description provided',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for invalid systemId', async () => {
    const res = await request(app).post('/api/impact-assessments').send({
      ...validPayload,
      systemId: 'not-a-uuid',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 404 when AI system not found', async () => {
    (prisma as any).aiSystem.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/impact-assessments').send(validPayload);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error during creation', async () => {
    (prisma as any).aiSystem.findFirst.mockResolvedValue(mockSystem);
    (prisma as any).aiImpactAssessment.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/impact-assessments').send(validPayload);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// GET /api/impact-assessments/:id — Get single impact assessment
// ===================================================================
describe('GET /api/impact-assessments/:id', () => {
  it('should return an impact assessment when found', async () => {
    (prisma as any).aiImpactAssessment.findFirst.mockResolvedValue(mockAssessment);

    const res = await request(app).get(`/api/impact-assessments/${UUID2}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(UUID2);
    expect(res.body.data.title).toBe('Credit Scoring Impact Assessment');
  });

  it('should return 404 when impact assessment not found', async () => {
    (prisma as any).aiImpactAssessment.findFirst.mockResolvedValue(null);

    const res = await request(app).get(`/api/impact-assessments/${UUID1}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).aiImpactAssessment.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(`/api/impact-assessments/${UUID2}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// PUT /api/impact-assessments/:id — Update impact assessment
// ===================================================================
describe('PUT /api/impact-assessments/:id', () => {
  it('should update an impact assessment successfully', async () => {
    (prisma as any).aiImpactAssessment.findFirst.mockResolvedValue(mockAssessment);
    (prisma as any).aiImpactAssessment.update.mockResolvedValue({
      ...mockAssessment,
      impactLevel: 'UNACCEPTABLE',
      system: { id: UUID1, name: 'Credit Scoring AI', reference: 'AI42-SYS-2602-5555' },
    });

    const res = await request(app)
      .put(`/api/impact-assessments/${UUID2}`)
      .send({ impactLevel: 'UNACCEPTABLE' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when updating non-existent assessment', async () => {
    (prisma as any).aiImpactAssessment.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/impact-assessments/${UUID1}`)
      .send({ title: 'Updated' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid update data', async () => {
    const res = await request(app)
      .put(`/api/impact-assessments/${UUID2}`)
      .send({ impactLevel: 'EXTREMELY_HIGH' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error during update', async () => {
    (prisma as any).aiImpactAssessment.findFirst.mockResolvedValue(mockAssessment);
    (prisma as any).aiImpactAssessment.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put(`/api/impact-assessments/${UUID2}`)
      .send({ title: 'Updated' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// PUT /api/impact-assessments/:id/approve — Approve impact assessment
// ===================================================================
describe('PUT /api/impact-assessments/:id/approve', () => {
  it('should approve an impact assessment successfully', async () => {
    (prisma as any).aiImpactAssessment.findFirst.mockResolvedValue(mockAssessment);
    (prisma as any).aiImpactAssessment.update.mockResolvedValue({
      ...mockAssessment,
      status: 'APPROVED',
      approvedBy: 'user-123',
      approvedAt: new Date(),
      system: { id: UUID1, name: 'Credit Scoring AI', reference: 'AI42-SYS-2602-5555' },
    });

    const res = await request(app).put(`/api/impact-assessments/${UUID2}/approve`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('APPROVED');
    expect(res.body.data.approvedBy).toBe('user-123');
  });

  it('should return 404 when approving non-existent assessment', async () => {
    (prisma as any).aiImpactAssessment.findFirst.mockResolvedValue(null);

    const res = await request(app).put(`/api/impact-assessments/${UUID1}/approve`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 when assessment is already approved', async () => {
    (prisma as any).aiImpactAssessment.findFirst.mockResolvedValue({
      ...mockAssessment,
      status: 'APPROVED',
    });

    const res = await request(app).put(`/api/impact-assessments/${UUID2}/approve`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ALREADY_APPROVED');
  });

  it('should return 500 on database error during approval', async () => {
    (prisma as any).aiImpactAssessment.findFirst.mockResolvedValue(mockAssessment);
    (prisma as any).aiImpactAssessment.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put(`/api/impact-assessments/${UUID2}/approve`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// DELETE /api/impact-assessments/:id — Soft delete impact assessment
// ===================================================================
describe('DELETE /api/impact-assessments/:id', () => {
  it('should soft delete an impact assessment', async () => {
    (prisma as any).aiImpactAssessment.findFirst.mockResolvedValue(mockAssessment);
    (prisma as any).aiImpactAssessment.update.mockResolvedValue({
      ...mockAssessment,
      deletedAt: new Date(),
    });

    const res = await request(app).delete(`/api/impact-assessments/${UUID2}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 when deleting non-existent assessment', async () => {
    (prisma as any).aiImpactAssessment.findFirst.mockResolvedValue(null);

    const res = await request(app).delete(`/api/impact-assessments/${UUID1}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error during delete', async () => {
    (prisma as any).aiImpactAssessment.findFirst.mockResolvedValue(mockAssessment);
    (prisma as any).aiImpactAssessment.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete(`/api/impact-assessments/${UUID2}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
