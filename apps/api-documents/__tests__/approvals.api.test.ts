import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    docApproval: {
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
    mockPrisma.docApproval.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Test' },
    ]);
    mockPrisma.docApproval.count.mockResolvedValue(1);
    const res = await request(app).get('/api/approvals');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns empty list when no approvals exist', async () => {
    mockPrisma.docApproval.findMany.mockResolvedValue([]);
    mockPrisma.docApproval.count.mockResolvedValue(0);
    const res = await request(app).get('/api/approvals');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('findMany and count are each called once', async () => {
    mockPrisma.docApproval.findMany.mockResolvedValue([]);
    mockPrisma.docApproval.count.mockResolvedValue(0);
    await request(app).get('/api/approvals');
    expect(mockPrisma.docApproval.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.docApproval.count).toHaveBeenCalledTimes(1);
  });
});

describe('GET /api/approvals/:id', () => {
  it('should return 404 if not found', async () => {
    mockPrisma.docApproval.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/approvals/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    mockPrisma.docApproval.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).get('/api/approvals/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

describe('POST /api/approvals', () => {
  it('should create', async () => {
    mockPrisma.docApproval.count.mockResolvedValue(0);
    mockPrisma.docApproval.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New',
    });
    const res = await request(app)
      .post('/api/approvals')
      .send({ documentId: 'doc-1', approver: 'user-1' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/approvals/:id', () => {
  it('should update', async () => {
    mockPrisma.docApproval.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.docApproval.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });
    const res = await request(app)
      .put('/api/approvals/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });

  it('returns 404 if approval not found on update', async () => {
    mockPrisma.docApproval.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/approvals/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/approvals/:id', () => {
  it('should soft delete', async () => {
    mockPrisma.docApproval.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.docApproval.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/approvals/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 if approval not found on delete', async () => {
    mockPrisma.docApproval.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/approvals/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.docApproval.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/approvals');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.docApproval.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/approvals/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.docApproval.count.mockResolvedValue(0);
    mockPrisma.docApproval.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/approvals').send({ documentId: '00000000-0000-0000-0000-000000000001', approver: 'user-1' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.docApproval.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.docApproval.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/approvals/00000000-0000-0000-0000-000000000001').send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.docApproval.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.docApproval.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/approvals/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── Additional coverage ─────────────────────────────────────────────────────

describe('Approvals — additional coverage', () => {
  it('returns 401 when authenticate rejects the request', async () => {
    const { authenticate: mockAuth } = require('@ims/auth');
    (mockAuth as jest.Mock).mockImplementationOnce(
      (_req: any, res: any, _next: any) => {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No token' } });
      }
    );
    const res = await request(app).get('/api/approvals');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 400 with INVALID_ID for non-UUID in GET /:id', async () => {
    const res = await request(app).get('/api/approvals/not-a-valid-uuid');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_ID');
  });

  it('returns 400 with INVALID_ID for non-UUID in PUT /:id', async () => {
    const res = await request(app).put('/api/approvals/bad-id').send({ approver: 'user-x' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_ID');
  });

  it('returns 400 with INVALID_ID for non-UUID in DELETE /:id', async () => {
    const res = await request(app).delete('/api/approvals/not-a-uuid');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_ID');
  });

  it('POST with APPROVED status returns 201 and correct status in data', async () => {
    mockPrisma.docApproval.count.mockResolvedValue(0);
    mockPrisma.docApproval.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000005',
      documentId: 'doc-5',
      approver: 'manager@example.com',
      status: 'APPROVED',
    });
    const res = await request(app)
      .post('/api/approvals')
      .send({ documentId: 'doc-5', approver: 'manager@example.com', status: 'APPROVED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('APPROVED');
  });
});
