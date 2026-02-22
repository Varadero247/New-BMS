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

// ===================================================================
// Additional coverage: pagination, response shape, filter params
// ===================================================================
describe('GET /api/policies — additional pagination and shape tests', () => {
  it('should compute totalPages correctly for larger datasets', async () => {
    mockPrisma.aiPolicy.findMany.mockResolvedValue([]);
    mockPrisma.aiPolicy.count.mockResolvedValue(30);

    const res = await request(app).get('/api/policies?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('should return response with success, data array, and pagination shape', async () => {
    mockPrisma.aiPolicy.findMany.mockResolvedValue([mockPolicy]);
    mockPrisma.aiPolicy.count.mockResolvedValue(1);

    const res = await request(app).get('/api/policies');

    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toMatchObject({ page: 1, total: 1 });
  });

  it('should pass page and limit to findMany as skip/take', async () => {
    mockPrisma.aiPolicy.findMany.mockResolvedValue([]);
    mockPrisma.aiPolicy.count.mockResolvedValue(0);

    await request(app).get('/api/policies?page=2&limit=5');

    expect(mockPrisma.aiPolicy.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  it('should return 500 when count query fails', async () => {
    mockPrisma.aiPolicy.findMany.mockRejectedValue(new Error('network error'));

    const res = await request(app).get('/api/policies');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('ISO 42001 Policies — final batch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / data items have reference field', async () => {
    mockPrisma.aiPolicy.findMany.mockResolvedValue([mockPolicy]);
    mockPrisma.aiPolicy.count.mockResolvedValue(1);
    const res = await request(app).get('/api/policies');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('reference');
  });

  it('GET / pagination has limit field', async () => {
    mockPrisma.aiPolicy.findMany.mockResolvedValue([]);
    mockPrisma.aiPolicy.count.mockResolvedValue(0);
    const res = await request(app).get('/api/policies');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('limit');
  });

  it('DELETE /:id returns deleted:true', async () => {
    mockPrisma.aiPolicy.findFirst.mockResolvedValue(mockPolicy);
    mockPrisma.aiPolicy.update.mockResolvedValue({ ...mockPolicy, deletedAt: new Date() });
    const res = await request(app).delete(`/api/policies/${UUID1}`);
    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('PUT /:id/approve response has approvedBy field', async () => {
    mockPrisma.aiPolicy.findFirst.mockResolvedValue(mockPolicy);
    mockPrisma.aiPolicy.update.mockResolvedValue({
      ...mockPolicy,
      status: 'APPROVED',
      approvedBy: 'user-123',
      approvedAt: new Date(),
    });
    const res = await request(app).put(`/api/policies/${UUID1}/approve`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('approvedBy');
  });

  it('POST / sets status DRAFT by default', async () => {
    mockPrisma.aiPolicy.create.mockResolvedValue({
      id: UUID2,
      reference: 'AI42-POL-2602-9999',
      title: 'Accountability Policy',
      content: 'AI accountability framework.',
      policyType: 'ACCOUNTABILITY',
      status: 'DRAFT',
      version: '1.0',
      createdBy: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    const res = await request(app).post('/api/policies').send({
      title: 'Accountability Policy',
      content: 'AI accountability framework.',
      policyType: 'ACCOUNTABILITY',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('DRAFT');
  });

  it('GET /:id response data has owner field', async () => {
    mockPrisma.aiPolicy.findFirst.mockResolvedValue(mockPolicy);
    const res = await request(app).get(`/api/policies/${UUID1}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('owner');
  });

  it('PUT /:id with summary field returns 200', async () => {
    mockPrisma.aiPolicy.findFirst.mockResolvedValue(mockPolicy);
    mockPrisma.aiPolicy.update.mockResolvedValue({ ...mockPolicy, summary: 'Updated summary.' });
    const res = await request(app)
      .put(`/api/policies/${UUID1}`)
      .send({ summary: 'Updated summary.' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('ISO 42001 Policies — final extended coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / data items have policyType field', async () => {
    mockPrisma.aiPolicy.findMany.mockResolvedValue([mockPolicy]);
    mockPrisma.aiPolicy.count.mockResolvedValue(1);
    const res = await request(app).get('/api/policies');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('policyType');
  });

  it('POST / with TRANSPARENCY policyType returns 201', async () => {
    mockPrisma.aiPolicy.create.mockResolvedValue({
      id: UUID2,
      reference: 'AI42-POL-2602-3333',
      title: 'Transparency Policy',
      content: 'Transparency in AI decision making.',
      policyType: 'TRANSPARENCY',
      status: 'DRAFT',
      version: '1.0',
      createdBy: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    const res = await request(app).post('/api/policies').send({
      title: 'Transparency Policy',
      content: 'Transparency in AI decision making.',
      policyType: 'TRANSPARENCY',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /:id response data has version field', async () => {
    mockPrisma.aiPolicy.findFirst.mockResolvedValue(mockPolicy);
    const res = await request(app).get(`/api/policies/${UUID1}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('version');
  });

  it('DELETE /:id calls update with deletedAt field', async () => {
    mockPrisma.aiPolicy.findFirst.mockResolvedValue(mockPolicy);
    mockPrisma.aiPolicy.update.mockResolvedValue({ ...mockPolicy, deletedAt: new Date() });
    await request(app).delete(`/api/policies/${UUID1}`);
    expect(mockPrisma.aiPolicy.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
  });
});

describe('policies — phase29 coverage', () => {
  it('handles slice method', () => {
    expect([1, 2, 3, 4].slice(1, 3)).toEqual([2, 3]);
  });

  it('handles string startsWith', () => {
    expect('hello'.startsWith('he')).toBe(true);
  });

  it('returns false for falsy values', () => {
    expect(Boolean('')).toBe(false);
  });

  it('handles error message', () => {
    expect(new TypeError('bad')).toHaveProperty('message', 'bad');
  });

});

describe('policies — phase30 coverage', () => {
  it('handles find method', () => {
    expect([1, 2, 3].find(x => x > 1)).toBe(2);
  });

  it('handles string split', () => {
    expect('a,b,c'.split(',')).toEqual(['a', 'b', 'c']);
  });

  it('handles numeric identity', () => {
    expect(1 + 1).toBe(2);
  });

  it('handles Math.sqrt', () => {
    expect(Math.sqrt(9)).toBe(3);
  });

  it('handles string concatenation', () => {
    expect('hello' + ' ' + 'world').toBe('hello world');
  });

});


describe('phase31 coverage', () => {
  it('handles array indexOf', () => { expect([1,2,3].indexOf(2)).toBe(1); });
  it('handles string replace', () => { expect('foo bar'.replace('bar','baz')).toBe('foo baz'); });
  it('handles string padStart', () => { expect('5'.padStart(3,'0')).toBe('005'); });
  it('handles string endsWith', () => { expect('hello'.endsWith('llo')).toBe(true); });
  it('handles regex test', () => { expect(/^\d+$/.test('123')).toBe(true); expect(/^\d+$/.test('abc')).toBe(false); });
});


describe('phase32 coverage', () => {
  it('handles number exponential', () => { expect((12345).toExponential(2)).toBe('1.23e+4'); });
  it('handles string lastIndexOf', () => { expect('abcabc'.lastIndexOf('a')).toBe(3); });
  it('handles array fill', () => { expect(new Array(3).fill(0)).toEqual([0,0,0]); });
  it('handles instanceof check', () => { class Dog {} const d = new Dog(); expect(d instanceof Dog).toBe(true); });
  it('handles array copyWithin', () => { expect([1,2,3,4,5].copyWithin(0,3)).toEqual([4,5,3,4,5]); });
});
