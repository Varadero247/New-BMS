import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    aiIncident: {
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

import incidentsRouter from '../src/routes/incidents';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/incidents', incidentsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const UUID1 = '00000000-0000-0000-0000-000000000001';
const UUID2 = '00000000-0000-0000-0000-000000000002';

const mockSystem = {
  id: UUID1,
  name: 'Recommendation Engine',
  reference: 'AI42-SYS-2602-1111',
  riskTier: 'HIGH',
  deletedAt: null,
};

const mockIncident = {
  id: UUID2,
  reference: 'AI42-INC-2602-3333',
  systemId: UUID1,
  title: 'Biased recommendations detected',
  description: 'The recommendation engine showed demographic bias in product suggestions',
  severity: 'HIGH',
  status: 'REPORTED',
  incidentDate: new Date('2026-02-01'),
  category: 'BIAS_INCIDENT',
  affectedParties: 'Customers in region A',
  immediateAction: 'Disabled recommendation for affected demographic',
  reportedBy: 'QA team',
  rootCause: null,
  resolution: null,
  lessonsLearned: null,
  investigator: null,
  findings: null,
  contributingFactors: null,
  investigationStartedAt: null,
  closedAt: null,
  closedBy: null,
  preventiveActions: null,
  notes: null,
  organisationId: 'org-1',
  createdBy: 'user-123',
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
  deletedAt: null,
  system: {
    id: UUID1,
    name: 'Recommendation Engine',
    reference: 'AI42-SYS-2602-1111',
    riskTier: 'HIGH',
  },
};

// ===================================================================
// GET /api/incidents — List incidents
// ===================================================================
describe('GET /api/incidents', () => {
  it('should return a paginated list of incidents', async () => {
    mockPrisma.aiIncident.findMany.mockResolvedValue([mockIncident]);
    mockPrisma.aiIncident.count.mockResolvedValue(1);

    const res = await request(app).get('/api/incidents');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should return empty list when no incidents exist', async () => {
    mockPrisma.aiIncident.findMany.mockResolvedValue([]);
    mockPrisma.aiIncident.count.mockResolvedValue(0);

    const res = await request(app).get('/api/incidents');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should filter by severity', async () => {
    mockPrisma.aiIncident.findMany.mockResolvedValue([]);
    mockPrisma.aiIncident.count.mockResolvedValue(0);

    const res = await request(app).get('/api/incidents?severity=CRITICAL');

    expect(res.status).toBe(200);
    expect(mockPrisma.aiIncident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ severity: 'CRITICAL' }),
      })
    );
  });

  it('should filter by status', async () => {
    mockPrisma.aiIncident.findMany.mockResolvedValue([]);
    mockPrisma.aiIncident.count.mockResolvedValue(0);

    const res = await request(app).get('/api/incidents?status=INVESTIGATING');

    expect(res.status).toBe(200);
    expect(mockPrisma.aiIncident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'INVESTIGATING' }),
      })
    );
  });

  it('should filter by systemId', async () => {
    mockPrisma.aiIncident.findMany.mockResolvedValue([]);
    mockPrisma.aiIncident.count.mockResolvedValue(0);

    const res = await request(app).get(`/api/incidents?systemId=${UUID1}`);

    expect(res.status).toBe(200);
    expect(mockPrisma.aiIncident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ systemId: UUID1 }),
      })
    );
  });

  it('should support search query', async () => {
    mockPrisma.aiIncident.findMany.mockResolvedValue([]);
    mockPrisma.aiIncident.count.mockResolvedValue(0);

    const res = await request(app).get('/api/incidents?search=bias');

    expect(res.status).toBe(200);
    expect(mockPrisma.aiIncident.findMany).toHaveBeenCalledWith(
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
    mockPrisma.aiIncident.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/incidents');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// POST /api/incidents — Create incident
// ===================================================================
describe('POST /api/incidents', () => {
  const validPayload = {
    systemId: UUID1,
    title: 'Data leak through AI output',
    severity: 'CRITICAL',
    incidentDate: '2026-02-10',
    category: 'DATA_BREACH',
  };

  it('should create an incident successfully', async () => {
    mockPrisma.aiSystem.findFirst.mockResolvedValue(mockSystem);
    mockPrisma.aiIncident.create.mockResolvedValue({
      id: UUID2,
      reference: 'AI42-INC-2602-4444',
      ...validPayload,
      status: 'REPORTED',
      createdBy: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      system: { id: UUID1, name: 'Recommendation Engine', reference: 'AI42-SYS-2602-1111' },
    });

    const res = await request(app).post('/api/incidents').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Data leak through AI output');
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app).post('/api/incidents').send({
      title: 'Incomplete incident',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for invalid systemId', async () => {
    const res = await request(app)
      .post('/api/incidents')
      .send({
        ...validPayload,
        systemId: 'not-a-uuid',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid severity', async () => {
    const res = await request(app)
      .post('/api/incidents')
      .send({
        ...validPayload,
        severity: 'EXTREMELY_BAD',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 404 when AI system not found', async () => {
    mockPrisma.aiSystem.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/incidents').send(validPayload);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error during creation', async () => {
    mockPrisma.aiSystem.findFirst.mockResolvedValue(mockSystem);
    mockPrisma.aiIncident.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/incidents').send(validPayload);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// GET /api/incidents/:id — Get single incident
// ===================================================================
describe('GET /api/incidents/:id', () => {
  it('should return an incident when found', async () => {
    mockPrisma.aiIncident.findFirst.mockResolvedValue(mockIncident);

    const res = await request(app).get(`/api/incidents/${UUID2}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(UUID2);
  });

  it('should return 404 when incident not found', async () => {
    mockPrisma.aiIncident.findFirst.mockResolvedValue(null);

    const res = await request(app).get(`/api/incidents/${UUID1}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.aiIncident.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(`/api/incidents/${UUID2}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// PUT /api/incidents/:id — Update incident
// ===================================================================
describe('PUT /api/incidents/:id', () => {
  it('should update an incident successfully', async () => {
    mockPrisma.aiIncident.findFirst.mockResolvedValue(mockIncident);
    mockPrisma.aiIncident.update.mockResolvedValue({
      ...mockIncident,
      severity: 'CRITICAL',
      system: { id: UUID1, name: 'Recommendation Engine', reference: 'AI42-SYS-2602-1111' },
    });

    const res = await request(app).put(`/api/incidents/${UUID2}`).send({ severity: 'CRITICAL' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when updating non-existent incident', async () => {
    mockPrisma.aiIncident.findFirst.mockResolvedValue(null);

    const res = await request(app).put(`/api/incidents/${UUID1}`).send({ title: 'Updated' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid update data', async () => {
    const res = await request(app)
      .put(`/api/incidents/${UUID2}`)
      .send({ severity: 'SUPER_CRITICAL' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// PUT /api/incidents/:id/investigate — Begin investigation
// ===================================================================
describe('PUT /api/incidents/:id/investigate', () => {
  it('should start investigation for an incident', async () => {
    mockPrisma.aiIncident.findFirst.mockResolvedValue(mockIncident);
    mockPrisma.aiIncident.update.mockResolvedValue({
      ...mockIncident,
      status: 'INVESTIGATING',
      investigator: 'Dr. Smith',
      rootCause: 'Training data imbalance',
      system: { id: UUID1, name: 'Recommendation Engine', reference: 'AI42-SYS-2602-1111' },
    });

    const res = await request(app).put(`/api/incidents/${UUID2}/investigate`).send({
      investigator: 'Dr. Smith',
      rootCause: 'Training data imbalance',
      findings: 'Demographic disparity in training data',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('INVESTIGATING');
  });

  it('should return 404 when investigating non-existent incident', async () => {
    mockPrisma.aiIncident.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/incidents/${UUID1}/investigate`)
      .send({ investigator: 'Dr. Smith' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 when investigating a closed incident', async () => {
    mockPrisma.aiIncident.findFirst.mockResolvedValue({
      ...mockIncident,
      status: 'CLOSED',
    });

    const res = await request(app)
      .put(`/api/incidents/${UUID2}/investigate`)
      .send({ investigator: 'Dr. Smith' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ALREADY_CLOSED');
  });

  it('should return 500 on database error during investigation', async () => {
    mockPrisma.aiIncident.findFirst.mockResolvedValue(mockIncident);
    mockPrisma.aiIncident.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put(`/api/incidents/${UUID2}/investigate`)
      .send({ investigator: 'Dr. Smith' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// PUT /api/incidents/:id/close — Close incident
// ===================================================================
describe('PUT /api/incidents/:id/close', () => {
  it('should close an incident with resolution', async () => {
    mockPrisma.aiIncident.findFirst.mockResolvedValue({
      ...mockIncident,
      status: 'INVESTIGATING',
    });
    mockPrisma.aiIncident.update.mockResolvedValue({
      ...mockIncident,
      status: 'CLOSED',
      resolution: 'Retrained model with balanced dataset',
      closedAt: new Date(),
      system: { id: UUID1, name: 'Recommendation Engine', reference: 'AI42-SYS-2602-1111' },
    });

    const res = await request(app).put(`/api/incidents/${UUID2}/close`).send({
      resolution: 'Retrained model with balanced dataset',
      lessonsLearned: 'Need regular bias audits',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CLOSED');
  });

  it('should return 400 when resolution is missing', async () => {
    mockPrisma.aiIncident.findFirst.mockResolvedValue(mockIncident);

    const res = await request(app).put(`/api/incidents/${UUID2}/close`).send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 404 when closing non-existent incident', async () => {
    mockPrisma.aiIncident.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/incidents/${UUID1}/close`)
      .send({ resolution: 'Fixed' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 when incident is already closed', async () => {
    mockPrisma.aiIncident.findFirst.mockResolvedValue({
      ...mockIncident,
      status: 'CLOSED',
    });

    const res = await request(app)
      .put(`/api/incidents/${UUID2}/close`)
      .send({ resolution: 'Fixed again' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ALREADY_CLOSED');
  });

  it('should return 500 on database error during close', async () => {
    mockPrisma.aiIncident.findFirst.mockResolvedValue(mockIncident);
    mockPrisma.aiIncident.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put(`/api/incidents/${UUID2}/close`)
      .send({ resolution: 'Fixed' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// DELETE /api/incidents/:id — Soft delete incident
// ===================================================================
describe('DELETE /api/incidents/:id', () => {
  it('should soft delete an incident', async () => {
    mockPrisma.aiIncident.findFirst.mockResolvedValue(mockIncident);
    mockPrisma.aiIncident.update.mockResolvedValue({
      ...mockIncident,
      deletedAt: new Date(),
    });

    const res = await request(app).delete(`/api/incidents/${UUID2}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 when deleting non-existent incident', async () => {
    mockPrisma.aiIncident.findFirst.mockResolvedValue(null);

    const res = await request(app).delete(`/api/incidents/${UUID1}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error during delete', async () => {
    mockPrisma.aiIncident.findFirst.mockResolvedValue(mockIncident);
    mockPrisma.aiIncident.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete(`/api/incidents/${UUID2}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// Additional coverage
// ===================================================================
describe('ISO 42001 Incidents — additional coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/incidents returns pagination with correct totalPages', async () => {
    mockPrisma.aiIncident.findMany.mockResolvedValue([]);
    mockPrisma.aiIncident.count.mockResolvedValue(40);

    const res = await request(app).get('/api/incidents?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBeGreaterThanOrEqual(4);
  });

  it('PUT /api/incidents/:id returns 500 on DB update error', async () => {
    mockPrisma.aiIncident.findFirst.mockResolvedValue(mockIncident);
    mockPrisma.aiIncident.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put(`/api/incidents/${UUID2}`).send({ severity: 'LOW' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/incidents response body has success:true and data array', async () => {
    mockPrisma.aiIncident.findMany.mockResolvedValue([mockIncident]);
    mockPrisma.aiIncident.count.mockResolvedValue(1);

    const res = await request(app).get('/api/incidents');

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/incidents returns 400 for invalid category', async () => {
    const res = await request(app).post('/api/incidents').send({
      systemId: UUID1,
      title: 'Test incident',
      severity: 'HIGH',
      incidentDate: '2026-02-10',
      category: 'COMPLETELY_INVALID_CATEGORY',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
