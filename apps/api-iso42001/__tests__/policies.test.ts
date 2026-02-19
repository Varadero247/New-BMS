import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    aiPolicy: {
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

import policiesRouter from '../src/routes/policies';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/policies', policiesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const UUID1 = '00000000-0000-0000-0000-000000000001';
const UUID2 = '00000000-0000-0000-0000-000000000002';

const mockPolicy = {
  id: UUID1,
  reference: 'AI42-POL-2602-1234',
  title: 'AI Ethics Policy',
  content: 'This policy establishes ethical guidelines for AI development and deployment...',
  policyType: 'ETHICS',
  status: 'DRAFT',
  summary: 'Core AI ethics guidelines',
  scope: 'All AI systems',
  version: '1.0',
  effectiveDate: new Date('2026-03-01'),
  reviewDate: new Date('2027-03-01'),
  approvedBy: null,
  approvedAt: null,
  owner: 'Chief AI Officer',
  department: 'AI Governance',
  notes: null,
  organisationId: 'org-1',
  createdBy: 'user-123',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  deletedAt: null,
};

// ===================================================================
// GET /api/policies — List policies
// ===================================================================
describe('GET /api/policies', () => {
  it('should return a paginated list of policies', async () => {
    mockPrisma.aiPolicy.findMany.mockResolvedValue([mockPolicy]);
    mockPrisma.aiPolicy.count.mockResolvedValue(1);

    const res = await request(app).get('/api/policies');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('AI Ethics Policy');
    expect(res.body.pagination.total).toBe(1);
  });

  it('should return empty list when no policies exist', async () => {
    mockPrisma.aiPolicy.findMany.mockResolvedValue([]);
    mockPrisma.aiPolicy.count.mockResolvedValue(0);

    const res = await request(app).get('/api/policies');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should filter by status', async () => {
    mockPrisma.aiPolicy.findMany.mockResolvedValue([]);
    mockPrisma.aiPolicy.count.mockResolvedValue(0);

    const res = await request(app).get('/api/policies?status=APPROVED');

    expect(res.status).toBe(200);
    expect(mockPrisma.aiPolicy.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'APPROVED' }),
      })
    );
  });

  it('should filter by policyType', async () => {
    mockPrisma.aiPolicy.findMany.mockResolvedValue([]);
    mockPrisma.aiPolicy.count.mockResolvedValue(0);

    const res = await request(app).get('/api/policies?policyType=ETHICS');

    expect(res.status).toBe(200);
    expect(mockPrisma.aiPolicy.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ policyType: 'ETHICS' }),
      })
    );
  });

  it('should support search query', async () => {
    mockPrisma.aiPolicy.findMany.mockResolvedValue([]);
    mockPrisma.aiPolicy.count.mockResolvedValue(0);

    const res = await request(app).get('/api/policies?search=ethics');

    expect(res.status).toBe(200);
    expect(mockPrisma.aiPolicy.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ title: expect.objectContaining({ contains: 'ethics' }) }),
          ]),
        }),
      })
    );
  });

  it('should return 500 on database error', async () => {
    mockPrisma.aiPolicy.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/policies');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// POST /api/policies — Create policy
// ===================================================================
describe('POST /api/policies', () => {
  const validPayload = {
    title: 'Data Governance Policy',
    content: 'This policy establishes data governance principles for all AI systems...',
    policyType: 'DATA_MANAGEMENT',
  };

  it('should create a policy successfully', async () => {
    mockPrisma.aiPolicy.create.mockResolvedValue({
      id: UUID2,
      reference: 'AI42-POL-2602-5678',
      ...validPayload,
      status: 'DRAFT',
      version: '1.0',
      createdBy: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const res = await request(app).post('/api/policies').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Data Governance Policy');
  });

  it('should return 400 for missing title', async () => {
    const res = await request(app).post('/api/policies').send({
      content: 'Some content',
      policyType: 'ETHICS',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for missing content', async () => {
    const res = await request(app).post('/api/policies').send({
      title: 'Test Policy',
      policyType: 'ETHICS',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for missing policyType', async () => {
    const res = await request(app).post('/api/policies').send({
      title: 'Test Policy',
      content: 'Some content',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid policyType', async () => {
    const res = await request(app).post('/api/policies').send({
      title: 'Test Policy',
      content: 'Content',
      policyType: 'INVALID_TYPE',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.aiPolicy.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/policies').send(validPayload);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// GET /api/policies/:id — Get single policy
// ===================================================================
describe('GET /api/policies/:id', () => {
  it('should return a policy when found', async () => {
    mockPrisma.aiPolicy.findFirst.mockResolvedValue(mockPolicy);

    const res = await request(app).get(`/api/policies/${UUID1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(UUID1);
    expect(res.body.data.title).toBe('AI Ethics Policy');
  });

  it('should return 404 when policy not found', async () => {
    mockPrisma.aiPolicy.findFirst.mockResolvedValue(null);

    const res = await request(app).get(`/api/policies/${UUID2}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.aiPolicy.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(`/api/policies/${UUID1}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// PUT /api/policies/:id — Update policy
// ===================================================================
describe('PUT /api/policies/:id', () => {
  it('should update a policy successfully', async () => {
    mockPrisma.aiPolicy.findFirst.mockResolvedValue(mockPolicy);
    mockPrisma.aiPolicy.update.mockResolvedValue({
      ...mockPolicy,
      title: 'Updated AI Ethics Policy',
    });

    const res = await request(app)
      .put(`/api/policies/${UUID1}`)
      .send({ title: 'Updated AI Ethics Policy' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated AI Ethics Policy');
  });

  it('should return 404 when updating non-existent policy', async () => {
    mockPrisma.aiPolicy.findFirst.mockResolvedValue(null);

    const res = await request(app).put(`/api/policies/${UUID2}`).send({ title: 'Updated' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid update data', async () => {
    const res = await request(app)
      .put(`/api/policies/${UUID1}`)
      .send({ policyType: 'NOT_REAL_TYPE' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error during update', async () => {
    mockPrisma.aiPolicy.findFirst.mockResolvedValue(mockPolicy);
    mockPrisma.aiPolicy.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put(`/api/policies/${UUID1}`).send({ title: 'Updated' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// PUT /api/policies/:id/approve — Approve policy
// ===================================================================
describe('PUT /api/policies/:id/approve', () => {
  it('should approve a policy successfully', async () => {
    mockPrisma.aiPolicy.findFirst.mockResolvedValue(mockPolicy);
    mockPrisma.aiPolicy.update.mockResolvedValue({
      ...mockPolicy,
      status: 'APPROVED',
      approvedBy: 'user-123',
      approvedAt: new Date(),
    });

    const res = await request(app).put(`/api/policies/${UUID1}/approve`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('APPROVED');
    expect(res.body.data.approvedBy).toBe('user-123');
  });

  it('should return 404 when approving non-existent policy', async () => {
    mockPrisma.aiPolicy.findFirst.mockResolvedValue(null);

    const res = await request(app).put(`/api/policies/${UUID2}/approve`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when policy is already approved', async () => {
    mockPrisma.aiPolicy.findFirst.mockResolvedValue({
      ...mockPolicy,
      status: 'APPROVED',
    });

    const res = await request(app).put(`/api/policies/${UUID1}/approve`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ALREADY_APPROVED');
  });

  it('should return 500 on database error during approval', async () => {
    mockPrisma.aiPolicy.findFirst.mockResolvedValue(mockPolicy);
    mockPrisma.aiPolicy.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put(`/api/policies/${UUID1}/approve`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// DELETE /api/policies/:id — Soft delete policy
// ===================================================================
describe('DELETE /api/policies/:id', () => {
  it('should soft delete a policy', async () => {
    mockPrisma.aiPolicy.findFirst.mockResolvedValue(mockPolicy);
    mockPrisma.aiPolicy.update.mockResolvedValue({
      ...mockPolicy,
      deletedAt: new Date(),
    });

    const res = await request(app).delete(`/api/policies/${UUID1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 when deleting non-existent policy', async () => {
    mockPrisma.aiPolicy.findFirst.mockResolvedValue(null);

    const res = await request(app).delete(`/api/policies/${UUID2}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error during delete', async () => {
    mockPrisma.aiPolicy.findFirst.mockResolvedValue(mockPolicy);
    mockPrisma.aiPolicy.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete(`/api/policies/${UUID1}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
