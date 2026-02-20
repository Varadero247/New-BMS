import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    customerReq: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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

jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));

import { prisma } from '../src/prisma';
import router from '../src/routes/customer-reqs';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/customer-reqs', router);

const REQ_ID = '00000000-0000-4000-a000-000000000001';

const mockReq = {
  id: REQ_ID,
  refNumber: 'CSR-2601-0001',
  customer: 'Ford Motor Company',
  requirementTitle: 'PPAP Level 3 Submission',
  requirementRef: 'Ford Q1-2023',
  category: 'QUALITY',
  description: 'All new parts must have PPAP Level 3 submission before SOP',
  complianceStatus: 'COMPLIANT',
  deletedAt: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/customer-reqs', () => {
  it('returns list of customer requirements', async () => {
    (mockPrisma.customerReq.findMany as jest.Mock).mockResolvedValue([mockReq]);
    (mockPrisma.customerReq.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/customer-reqs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });

  it('filters by customer, category, and complianceStatus', async () => {
    (mockPrisma.customerReq.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.customerReq.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get(
      '/api/customer-reqs?customer=Ford&category=QUALITY&complianceStatus=COMPLIANT'
    );
    expect(res.status).toBe(200);
  });

  it('supports search query', async () => {
    (mockPrisma.customerReq.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.customerReq.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/customer-reqs?search=PPAP');
    expect(res.status).toBe(200);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.customerReq.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/customer-reqs');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/customer-reqs/customers', () => {
  it('returns list of distinct customers', async () => {
    (mockPrisma.customerReq.findMany as jest.Mock).mockResolvedValue([
      { customer: 'Ford Motor Company' },
      { customer: 'General Motors' },
    ]);

    const res = await request(app).get('/api/customer-reqs/customers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.customerReq.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/customer-reqs/customers');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/customer-reqs/compliance-summary', () => {
  it('returns compliance summary statistics', async () => {
    (mockPrisma.customerReq.count as jest.Mock).mockResolvedValue(20);
    (mockPrisma.customerReq.groupBy as jest.Mock).mockResolvedValue([
      { complianceStatus: 'COMPLIANT', _count: { id: 15 } },
      { complianceStatus: 'NON_COMPLIANT', _count: { id: 5 } },
    ]);

    const res = await request(app).get('/api/customer-reqs/compliance-summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('byStatus');
    expect(res.body.data).toHaveProperty('byCustomer');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.customerReq.count as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/customer-reqs/compliance-summary');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/customer-reqs/:id', () => {
  it('returns a single customer requirement', async () => {
    (mockPrisma.customerReq.findUnique as jest.Mock).mockResolvedValue(mockReq);

    const res = await request(app).get(`/api/customer-reqs/${REQ_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(REQ_ID);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.customerReq.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(`/api/customer-reqs/${REQ_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 404 when soft-deleted', async () => {
    (mockPrisma.customerReq.findUnique as jest.Mock).mockResolvedValue({
      ...mockReq,
      deletedAt: new Date(),
    });

    const res = await request(app).get(`/api/customer-reqs/${REQ_ID}`);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/customer-reqs', () => {
  const validBody = {
    customer: 'Ford Motor Company',
    requirementTitle: 'PPAP Level 3 Submission',
    description: 'All new parts must have PPAP Level 3 submission before SOP',
  };

  it('creates customer requirement successfully', async () => {
    (mockPrisma.customerReq.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.customerReq.create as jest.Mock).mockResolvedValue(mockReq);

    const res = await request(app).post('/api/customer-reqs').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('refNumber');
  });

  it('returns 400 on validation error', async () => {
    const res = await request(app).post('/api/customer-reqs').send({ customer: 'Ford' });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.customerReq.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.customerReq.create as jest.Mock).mockRejectedValue(new Error('fail'));

    const res = await request(app).post('/api/customer-reqs').send(validBody);
    expect(res.status).toBe(500);
  });
});

describe('PUT /api/customer-reqs/:id', () => {
  it('updates customer requirement successfully', async () => {
    (mockPrisma.customerReq.findUnique as jest.Mock).mockResolvedValue(mockReq);
    (mockPrisma.customerReq.update as jest.Mock).mockResolvedValue({
      ...mockReq,
      complianceStatus: 'NON_COMPLIANT',
    });

    const res = await request(app)
      .put(`/api/customer-reqs/${REQ_ID}`)
      .send({ complianceStatus: 'NON_COMPLIANT' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.customerReq.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/customer-reqs/${REQ_ID}`)
      .send({ complianceStatus: 'COMPLIANT' });
    expect(res.status).toBe(404);
  });

  it('returns 400 on validation error', async () => {
    (mockPrisma.customerReq.findUnique as jest.Mock).mockResolvedValue(mockReq);

    const res = await request(app)
      .put(`/api/customer-reqs/${REQ_ID}`)
      .send({ complianceStatus: 'INVALID_STATUS' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/customer-reqs/:id', () => {
  it('soft deletes customer requirement', async () => {
    (mockPrisma.customerReq.findUnique as jest.Mock).mockResolvedValue(mockReq);
    (mockPrisma.customerReq.update as jest.Mock).mockResolvedValue({
      ...mockReq,
      deletedAt: new Date(),
    });

    const res = await request(app).delete(`/api/customer-reqs/${REQ_ID}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.customerReq.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete(`/api/customer-reqs/${REQ_ID}`);
    expect(res.status).toBe(404);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.customerReq.findUnique as jest.Mock).mockResolvedValue(mockReq);
    (mockPrisma.customerReq.update as jest.Mock).mockRejectedValue(new Error('fail'));

    const res = await request(app).delete(`/api/customer-reqs/${REQ_ID}`);
    expect(res.status).toBe(500);
  });
});
