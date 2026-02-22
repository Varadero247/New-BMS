import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    contApproval: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
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
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/approvals';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/approvals', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/approvals', () => {
  it('should return approvals', async () => {
    mockPrisma.contApproval.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Test' },
    ]);
    mockPrisma.contApproval.count.mockResolvedValue(1);
    const res = await request(app).get('/api/approvals');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns empty list when no approvals exist', async () => {
    mockPrisma.contApproval.findMany.mockResolvedValue([]);
    mockPrisma.contApproval.count.mockResolvedValue(0);
    const res = await request(app).get('/api/approvals');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('findMany and count are each called once', async () => {
    mockPrisma.contApproval.findMany.mockResolvedValue([]);
    mockPrisma.contApproval.count.mockResolvedValue(0);
    await request(app).get('/api/approvals');
    expect(mockPrisma.contApproval.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.contApproval.count).toHaveBeenCalledTimes(1);
  });
});

describe('GET /api/approvals/:id', () => {
  it('should return 404 if not found', async () => {
    mockPrisma.contApproval.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/approvals/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    mockPrisma.contApproval.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).get('/api/approvals/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

describe('POST /api/approvals', () => {
  it('should create', async () => {
    mockPrisma.contApproval.count.mockResolvedValue(0);
    mockPrisma.contApproval.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New',
    });
    const res = await request(app)
      .post('/api/approvals')
      .send({ contractId: 'contract-1', approver: 'user-1' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/approvals/:id', () => {
  it('should update', async () => {
    mockPrisma.contApproval.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.contApproval.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });
    const res = await request(app)
      .put('/api/approvals/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });

  it('returns 404 if approval not found on update', async () => {
    mockPrisma.contApproval.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/approvals/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/approvals/:id', () => {
  it('should soft delete', async () => {
    mockPrisma.contApproval.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.contApproval.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/approvals/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 if approval not found on delete', async () => {
    mockPrisma.contApproval.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/approvals/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.contApproval.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/approvals');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.contApproval.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/approvals/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.contApproval.count.mockResolvedValue(0);
    mockPrisma.contApproval.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/approvals')
      .send({ contractId: 'contract-1', approver: 'user-1' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.contApproval.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.contApproval.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/approvals/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.contApproval.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.contApproval.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/approvals/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── additional coverage ─────────────────────────────────────────────────────

describe('approvals route — additional coverage', () => {
  it('auth enforcement: unauthenticated request receives 401', async () => {
    const { authenticate: mockAuth } = require('@ims/auth');
    (mockAuth as jest.Mock).mockImplementationOnce((_req: any, res: any) => {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } });
    });
    const res = await request(app).get('/api/approvals');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET / returns empty data array when no approvals exist', async () => {
    mockPrisma.contApproval.findMany.mockResolvedValue([]);
    mockPrisma.contApproval.count.mockResolvedValue(0);
    const res = await request(app).get('/api/approvals');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });

  it('POST / returns 400 when both required fields are missing', async () => {
    const res = await request(app).post('/api/approvals').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST / returns 400 when approver field is missing but contractId is present', async () => {
    const res = await request(app).post('/api/approvals').send({ contractId: 'contract-1' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST / succeeds with all optional fields populated', async () => {
    mockPrisma.contApproval.count.mockResolvedValue(5);
    mockPrisma.contApproval.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000005',
      contractId: 'contract-1',
      approver: 'approver@example.com',
      status: 'APPROVED',
    });
    const res = await request(app)
      .post('/api/approvals')
      .send({
        contractId: 'contract-1',
        approver: 'approver@example.com',
        approverName: 'Jane Approver',
        status: 'APPROVED',
        comments: 'Looks good',
        decidedAt: '2026-02-20',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000005');
  });
});

describe('approvals.api — pagination and filter coverage', () => {
  it('GET / supports status filter query param', async () => {
    mockPrisma.contApproval.findMany.mockResolvedValue([]);
    mockPrisma.contApproval.count.mockResolvedValue(0);
    const res = await request(app).get('/api/approvals?status=PENDING');
    expect(res.status).toBe(200);
    expect(mockPrisma.contApproval.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'PENDING' }) })
    );
  });

  it('GET / supports search filter query param', async () => {
    mockPrisma.contApproval.findMany.mockResolvedValue([]);
    mockPrisma.contApproval.count.mockResolvedValue(0);
    const res = await request(app).get('/api/approvals?search=john');
    expect(res.status).toBe(200);
    expect(mockPrisma.contApproval.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ approverName: expect.objectContaining({ contains: 'john' }) }) })
    );
  });

  it('GET / returns pagination metadata with total', async () => {
    mockPrisma.contApproval.findMany.mockResolvedValue([]);
    mockPrisma.contApproval.count.mockResolvedValue(40);
    const res = await request(app).get('/api/approvals?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.total).toBe(40);
    expect(res.body.pagination.totalPages).toBe(4);
  });

  it('GET / returns response with success true and data array', async () => {
    mockPrisma.contApproval.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', contractId: 'c-1', approver: 'u-1' },
    ]);
    mockPrisma.contApproval.count.mockResolvedValue(1);
    const res = await request(app).get('/api/approvals');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST / returns 400 when contractId field is missing', async () => {
    const res = await request(app).post('/api/approvals').send({ approver: 'user@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT / updates status field to REJECTED', async () => {
    mockPrisma.contApproval.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.contApproval.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'REJECTED',
    });
    const res = await request(app)
      .put('/api/approvals/00000000-0000-0000-0000-000000000001')
      .send({ status: 'REJECTED', comments: 'Not acceptable' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('REJECTED');
  });

  it('DELETE / returns message in data on success', async () => {
    mockPrisma.contApproval.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.contApproval.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/approvals/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('message');
  });

  it('GET /:id returns NOT_FOUND error code on 404', async () => {
    mockPrisma.contApproval.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/approvals/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET / content-type is application/json', async () => {
    mockPrisma.contApproval.findMany.mockResolvedValue([]);
    mockPrisma.contApproval.count.mockResolvedValue(0);
    const res = await request(app).get('/api/approvals');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});
