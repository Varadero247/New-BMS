import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    portalApproval: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
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

import portalApprovalsRouter from '../src/routes/portal-approvals';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/portal/approvals', portalApprovalsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/portal/approvals', () => {
  it('should list approvals', async () => {
    const items = [
      { id: '00000000-0000-0000-0000-000000000001', type: 'ORDER', status: 'PENDING' },
    ];
    mockPrisma.portalApproval.findMany.mockResolvedValue(items);
    mockPrisma.portalApproval.count.mockResolvedValue(1);

    const res = await request(app).get('/api/portal/approvals');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    mockPrisma.portalApproval.findMany.mockResolvedValue([]);
    mockPrisma.portalApproval.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/approvals?status=PENDING');

    expect(res.status).toBe(200);
  });

  it('should filter by type', async () => {
    mockPrisma.portalApproval.findMany.mockResolvedValue([]);
    mockPrisma.portalApproval.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/approvals?type=DOCUMENT');

    expect(res.status).toBe(200);
  });

  it('should handle server error', async () => {
    mockPrisma.portalApproval.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/portal/approvals');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/portal/approvals', () => {
  it('should create an approval request', async () => {
    const approval = {
      id: '00000000-0000-0000-0000-000000000001',
      type: 'ORDER',
      referenceId: 'ord-1',
      status: 'PENDING',
    };
    mockPrisma.portalApproval.create.mockResolvedValue(approval);

    const res = await request(app)
      .post('/api/portal/approvals')
      .send({ type: 'ORDER', referenceId: 'ord-1' });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('PENDING');
  });

  it('should return 400 for missing type', async () => {
    const res = await request(app).post('/api/portal/approvals').send({ referenceId: 'ord-1' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid type', async () => {
    const res = await request(app)
      .post('/api/portal/approvals')
      .send({ type: 'INVALID', referenceId: 'ord-1' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/portal/approvals/:id/approve', () => {
  it('should approve a pending approval', async () => {
    const approval = { id: '00000000-0000-0000-0000-000000000001', status: 'PENDING', notes: null };
    mockPrisma.portalApproval.findFirst.mockResolvedValue(approval);
    mockPrisma.portalApproval.update.mockResolvedValue({ ...approval, status: 'APPROVED' });

    const res = await request(app)
      .put('/api/portal/approvals/00000000-0000-0000-0000-000000000001/approve')
      .send({});

    expect(res.status).toBe(200);
  });

  it('should return 400 if not pending', async () => {
    mockPrisma.portalApproval.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'APPROVED',
    });

    const res = await request(app)
      .put('/api/portal/approvals/00000000-0000-0000-0000-000000000001/approve')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATE');
  });

  it('should return 404 if not found', async () => {
    mockPrisma.portalApproval.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/portal/approvals/00000000-0000-0000-0000-000000000099/approve')
      .send({});

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/portal/approvals/:id/reject', () => {
  it('should reject a pending approval', async () => {
    const approval = { id: '00000000-0000-0000-0000-000000000001', status: 'PENDING', notes: null };
    mockPrisma.portalApproval.findFirst.mockResolvedValue(approval);
    mockPrisma.portalApproval.update.mockResolvedValue({ ...approval, status: 'REJECTED' });

    const res = await request(app)
      .put('/api/portal/approvals/00000000-0000-0000-0000-000000000001/reject')
      .send({ notes: 'Not acceptable' });

    expect(res.status).toBe(200);
  });

  it('should return 400 if not pending for reject', async () => {
    mockPrisma.portalApproval.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'REJECTED',
    });

    const res = await request(app)
      .put('/api/portal/approvals/00000000-0000-0000-0000-000000000001/reject')
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 404 if not found for reject', async () => {
    mockPrisma.portalApproval.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/portal/approvals/00000000-0000-0000-0000-000000000099/reject')
      .send({});

    expect(res.status).toBe(404);
  });
});
