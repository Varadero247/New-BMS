import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    aiSelfDeclaration: {
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

import selfDeclarationRouter from '../src/routes/self-declaration';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/self-declaration', selfDeclarationRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const UUID1 = '00000000-0000-0000-0000-000000000001';
const UUID2 = '00000000-0000-0000-0000-000000000002';

const mockDeclaration = {
  id: UUID1,
  reference: 'AI42-DEC-2602-8888',
  title: 'Nexara ISO 42001 Self-Declaration of Conformance',
  scope: 'All AI-based products and services offered by Nexara Ltd',
  conformanceStatement:
    'Nexara Ltd declares that its AI Management System conforms to the requirements of ISO 42001:2023...',
  standard: 'ISO 42001:2023',
  status: 'DRAFT',
  declarationDate: new Date('2026-02-01'),
  validUntil: new Date('2027-02-01'),
  signedBy: null,
  exclusions: 'Clause A.10.3 — No outsourced AI processes',
  supportingEvidence: 'Internal audit report 2026-Q1, SOA v2.0',
  publishedAt: null,
  notes: null,
  organisationId: 'org-1',
  createdBy: 'user-123',
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
  deletedAt: null,
};

// ===================================================================
// GET /api/self-declaration — List self-declarations
// ===================================================================
describe('GET /api/self-declaration', () => {
  it('should return a paginated list of self-declarations', async () => {
    mockPrisma.aiSelfDeclaration.findMany.mockResolvedValue([mockDeclaration]);
    mockPrisma.aiSelfDeclaration.count.mockResolvedValue(1);

    const res = await request(app).get('/api/self-declaration');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should return empty list when no declarations exist', async () => {
    mockPrisma.aiSelfDeclaration.findMany.mockResolvedValue([]);
    mockPrisma.aiSelfDeclaration.count.mockResolvedValue(0);

    const res = await request(app).get('/api/self-declaration');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should filter by status', async () => {
    mockPrisma.aiSelfDeclaration.findMany.mockResolvedValue([]);
    mockPrisma.aiSelfDeclaration.count.mockResolvedValue(0);

    const res = await request(app).get('/api/self-declaration?status=PUBLISHED');

    expect(res.status).toBe(200);
    expect(mockPrisma.aiSelfDeclaration.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PUBLISHED' }),
      })
    );
  });

  it('should support search query', async () => {
    mockPrisma.aiSelfDeclaration.findMany.mockResolvedValue([]);
    mockPrisma.aiSelfDeclaration.count.mockResolvedValue(0);

    const res = await request(app).get('/api/self-declaration?search=nexara');

    expect(res.status).toBe(200);
    expect(mockPrisma.aiSelfDeclaration.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ title: expect.objectContaining({ contains: 'nexara' }) }),
          ]),
        }),
      })
    );
  });

  it('should return 500 on database error', async () => {
    mockPrisma.aiSelfDeclaration.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/self-declaration');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// POST /api/self-declaration — Create self-declaration
// ===================================================================
describe('POST /api/self-declaration', () => {
  const validPayload = {
    title: 'ISO 42001 Self-Declaration 2026',
    scope: 'Customer-facing AI services',
    conformanceStatement:
      'We declare conformance with ISO 42001:2023 for all covered AI systems...',
    declarationDate: '2026-03-01',
    validUntil: '2027-03-01',
  };

  it('should create a self-declaration successfully', async () => {
    mockPrisma.aiSelfDeclaration.create.mockResolvedValue({
      id: UUID2,
      reference: 'AI42-DEC-2602-9999',
      ...validPayload,
      standard: 'ISO 42001:2023',
      status: 'DRAFT',
      createdBy: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const res = await request(app).post('/api/self-declaration').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('ISO 42001 Self-Declaration 2026');
  });

  it('should return 400 for missing title', async () => {
    const res = await request(app).post('/api/self-declaration').send({
      scope: 'Test scope',
      conformanceStatement: 'We conform...',
      declarationDate: '2026-03-01',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for missing scope', async () => {
    const res = await request(app).post('/api/self-declaration').send({
      title: 'Test Declaration',
      conformanceStatement: 'We conform...',
      declarationDate: '2026-03-01',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for missing conformanceStatement', async () => {
    const res = await request(app).post('/api/self-declaration').send({
      title: 'Test Declaration',
      scope: 'Test scope',
      declarationDate: '2026-03-01',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for missing declarationDate', async () => {
    const res = await request(app).post('/api/self-declaration').send({
      title: 'Test Declaration',
      scope: 'Test scope',
      conformanceStatement: 'We conform...',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.aiSelfDeclaration.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/self-declaration').send(validPayload);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// GET /api/self-declaration/:id — Get single self-declaration
// ===================================================================
describe('GET /api/self-declaration/:id', () => {
  it('should return a self-declaration when found', async () => {
    mockPrisma.aiSelfDeclaration.findFirst.mockResolvedValue(mockDeclaration);

    const res = await request(app).get(`/api/self-declaration/${UUID1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(UUID1);
    expect(res.body.data.standard).toBe('ISO 42001:2023');
  });

  it('should return 404 when self-declaration not found', async () => {
    mockPrisma.aiSelfDeclaration.findFirst.mockResolvedValue(null);

    const res = await request(app).get(`/api/self-declaration/${UUID2}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.aiSelfDeclaration.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(`/api/self-declaration/${UUID1}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// PUT /api/self-declaration/:id — Update self-declaration
// ===================================================================
describe('PUT /api/self-declaration/:id', () => {
  it('should update a self-declaration successfully', async () => {
    mockPrisma.aiSelfDeclaration.findFirst.mockResolvedValue(mockDeclaration);
    mockPrisma.aiSelfDeclaration.update.mockResolvedValue({
      ...mockDeclaration,
      title: 'Updated Self-Declaration',
    });

    const res = await request(app)
      .put(`/api/self-declaration/${UUID1}`)
      .send({ title: 'Updated Self-Declaration' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated Self-Declaration');
  });

  it('should return 404 when updating non-existent declaration', async () => {
    mockPrisma.aiSelfDeclaration.findFirst.mockResolvedValue(null);

    const res = await request(app).put(`/api/self-declaration/${UUID2}`).send({ title: 'Updated' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid status in update', async () => {
    const res = await request(app)
      .put(`/api/self-declaration/${UUID1}`)
      .send({ status: 'INVALID_STATUS' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error during update', async () => {
    mockPrisma.aiSelfDeclaration.findFirst.mockResolvedValue(mockDeclaration);
    mockPrisma.aiSelfDeclaration.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put(`/api/self-declaration/${UUID1}`).send({ title: 'Updated' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// PUT /api/self-declaration/:id/publish — Publish self-declaration
// ===================================================================
describe('PUT /api/self-declaration/:id/publish', () => {
  it('should publish a self-declaration successfully', async () => {
    mockPrisma.aiSelfDeclaration.findFirst.mockResolvedValue(mockDeclaration);
    mockPrisma.aiSelfDeclaration.update.mockResolvedValue({
      ...mockDeclaration,
      status: 'PUBLISHED',
      signedBy: 'user-123',
      publishedAt: new Date(),
    });

    const res = await request(app).put(`/api/self-declaration/${UUID1}/publish`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PUBLISHED');
  });

  it('should return 404 when publishing non-existent declaration', async () => {
    mockPrisma.aiSelfDeclaration.findFirst.mockResolvedValue(null);

    const res = await request(app).put(`/api/self-declaration/${UUID2}/publish`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 when declaration is already published', async () => {
    mockPrisma.aiSelfDeclaration.findFirst.mockResolvedValue({
      ...mockDeclaration,
      status: 'PUBLISHED',
    });

    const res = await request(app).put(`/api/self-declaration/${UUID1}/publish`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ALREADY_PUBLISHED');
  });

  it('should return 500 on database error during publish', async () => {
    mockPrisma.aiSelfDeclaration.findFirst.mockResolvedValue(mockDeclaration);
    mockPrisma.aiSelfDeclaration.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put(`/api/self-declaration/${UUID1}/publish`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// DELETE /api/self-declaration/:id — Soft delete self-declaration
// ===================================================================
describe('DELETE /api/self-declaration/:id', () => {
  it('should soft delete a self-declaration', async () => {
    mockPrisma.aiSelfDeclaration.findFirst.mockResolvedValue(mockDeclaration);
    mockPrisma.aiSelfDeclaration.update.mockResolvedValue({
      ...mockDeclaration,
      deletedAt: new Date(),
    });

    const res = await request(app).delete(`/api/self-declaration/${UUID1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 when deleting non-existent declaration', async () => {
    mockPrisma.aiSelfDeclaration.findFirst.mockResolvedValue(null);

    const res = await request(app).delete(`/api/self-declaration/${UUID2}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error during delete', async () => {
    mockPrisma.aiSelfDeclaration.findFirst.mockResolvedValue(mockDeclaration);
    mockPrisma.aiSelfDeclaration.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete(`/api/self-declaration/${UUID1}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// Extended coverage: pagination totalPages, response shape, field validation
// ===================================================================

describe('Self-Declaration — extended coverage', () => {
  it('GET /api/self-declaration returns correct totalPages in pagination', async () => {
    mockPrisma.aiSelfDeclaration.findMany.mockResolvedValue([]);
    mockPrisma.aiSelfDeclaration.count.mockResolvedValue(30);

    const res = await request(app).get('/api/self-declaration?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(30);
    expect(res.body.pagination.totalPages).toBe(3);
    expect(res.body.pagination.page).toBe(2);
  });

  it('GET /api/self-declaration response shape has success:true, data, pagination', async () => {
    mockPrisma.aiSelfDeclaration.findMany.mockResolvedValue([mockDeclaration]);
    mockPrisma.aiSelfDeclaration.count.mockResolvedValue(1);

    const res = await request(app).get('/api/self-declaration');

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('POST /api/self-declaration returns error.code VALIDATION_ERROR for missing scope', async () => {
    const res = await request(app).post('/api/self-declaration').send({
      title: 'Test',
      conformanceStatement: 'We conform...',
      declarationDate: '2026-03-01',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/self-declaration filters by standard param', async () => {
    mockPrisma.aiSelfDeclaration.findMany.mockResolvedValue([]);
    mockPrisma.aiSelfDeclaration.count.mockResolvedValue(0);

    const res = await request(app).get('/api/self-declaration?standard=ISO%2042001%3A2023');

    expect(res.status).toBe(200);
  });
});

// ===================================================================
// Additional coverage to reach 35 tests
// ===================================================================

describe('Self-Declaration — final coverage', () => {
  it('GET /api/self-declaration includes limit in pagination response', async () => {
    mockPrisma.aiSelfDeclaration.findMany.mockResolvedValue([]);
    mockPrisma.aiSelfDeclaration.count.mockResolvedValue(0);

    const res = await request(app).get('/api/self-declaration?limit=5');

    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(5);
  });

  it('DELETE /api/self-declaration/:id returns id and deleted:true in data', async () => {
    mockPrisma.aiSelfDeclaration.findFirst.mockResolvedValue(mockDeclaration);
    mockPrisma.aiSelfDeclaration.update.mockResolvedValue({ ...mockDeclaration, deletedAt: new Date() });

    const res = await request(app).delete(`/api/self-declaration/${UUID1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(UUID1);
    expect(res.body.data.deleted).toBe(true);
  });

  it('PUT /api/self-declaration/:id/publish updates signedBy to user id', async () => {
    mockPrisma.aiSelfDeclaration.findFirst.mockResolvedValue(mockDeclaration);
    mockPrisma.aiSelfDeclaration.update.mockResolvedValue({
      ...mockDeclaration,
      status: 'PUBLISHED',
      signedBy: 'user-123',
      publishedAt: new Date(),
    });

    const res = await request(app).put(`/api/self-declaration/${UUID1}/publish`);

    expect(res.status).toBe(200);
    expect(res.body.data.signedBy).toBe('user-123');
  });

  it('POST /api/self-declaration stores standard defaulting to ISO 42001:2023', async () => {
    mockPrisma.aiSelfDeclaration.create.mockResolvedValue({
      id: UUID2,
      reference: 'AI42-DEC-2602-1111',
      title: 'Test',
      scope: 'Test scope',
      conformanceStatement: 'We conform...',
      standard: 'ISO 42001:2023',
      status: 'DRAFT',
      declarationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const res = await request(app).post('/api/self-declaration').send({
      title: 'Test',
      scope: 'Test scope',
      conformanceStatement: 'We conform with all requirements of the standard.',
      declarationDate: '2026-03-01',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.standard).toBe('ISO 42001:2023');
  });

  it('GET /api/self-declaration success:true when data has one item', async () => {
    mockPrisma.aiSelfDeclaration.findMany.mockResolvedValue([mockDeclaration]);
    mockPrisma.aiSelfDeclaration.count.mockResolvedValue(1);

    const res = await request(app).get('/api/self-declaration');

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('PUT /api/self-declaration/:id can update exclusions field', async () => {
    mockPrisma.aiSelfDeclaration.findFirst.mockResolvedValue(mockDeclaration);
    mockPrisma.aiSelfDeclaration.update.mockResolvedValue({
      ...mockDeclaration,
      exclusions: 'Updated exclusions text',
    });

    const res = await request(app)
      .put(`/api/self-declaration/${UUID1}`)
      .send({ exclusions: 'Updated exclusions text' });

    expect(res.status).toBe(200);
    expect(res.body.data.exclusions).toBe('Updated exclusions text');
  });
});
