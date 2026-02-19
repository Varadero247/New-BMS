import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsAudit: {
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

import auditsRouter from '../src/routes/audits';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/audits', auditsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/audits', () => {
  it('should return audits with pagination', async () => {
    mockPrisma.fsAudit.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Internal Audit' },
    ]);
    mockPrisma.fsAudit.count.mockResolvedValue(1);

    const res = await request(app).get('/api/audits');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by type', async () => {
    mockPrisma.fsAudit.findMany.mockResolvedValue([]);
    mockPrisma.fsAudit.count.mockResolvedValue(0);

    await request(app).get('/api/audits?type=INTERNAL');
    expect(mockPrisma.fsAudit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'INTERNAL' }) })
    );
  });

  it('should filter by status', async () => {
    mockPrisma.fsAudit.findMany.mockResolvedValue([]);
    mockPrisma.fsAudit.count.mockResolvedValue(0);

    await request(app).get('/api/audits?status=PLANNED');
    expect(mockPrisma.fsAudit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'PLANNED' }) })
    );
  });

  it('should handle database errors', async () => {
    mockPrisma.fsAudit.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/audits');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/audits', () => {
  it('should create an audit', async () => {
    const input = {
      title: 'Internal Audit',
      type: 'INTERNAL',
      auditor: 'John',
      scheduledDate: '2026-03-01',
    };
    mockPrisma.fsAudit.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...input,
    });

    const res = await request(app).post('/api/audits').send(input);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/audits').send({ title: 'Test' });
    expect(res.status).toBe(400);
  });

  it('should handle database errors', async () => {
    mockPrisma.fsAudit.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/audits').send({
      title: 'Audit',
      type: 'INTERNAL',
      auditor: 'John',
      scheduledDate: '2026-03-01',
    });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/audits/:id', () => {
  it('should return an audit by id', async () => {
    mockPrisma.fsAudit.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Internal Audit',
    });

    const res = await request(app).get('/api/audits/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent audit', async () => {
    mockPrisma.fsAudit.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/audits/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/audits/:id', () => {
  it('should update an audit', async () => {
    mockPrisma.fsAudit.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsAudit.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });

    const res = await request(app)
      .put('/api/audits/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent audit', async () => {
    mockPrisma.fsAudit.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/audits/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Test' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/audits/:id', () => {
  it('should soft delete an audit', async () => {
    mockPrisma.fsAudit.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsAudit.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).delete('/api/audits/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent audit', async () => {
    mockPrisma.fsAudit.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/audits/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/audits/:id/complete', () => {
  it('should complete an audit', async () => {
    mockPrisma.fsAudit.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'IN_PROGRESS',
    });
    mockPrisma.fsAudit.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'COMPLETED',
      completedDate: new Date(),
    });

    const res = await request(app)
      .put('/api/audits/00000000-0000-0000-0000-000000000001/complete')
      .send({ score: 85 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject completing an already completed audit', async () => {
    mockPrisma.fsAudit.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'COMPLETED',
    });

    const res = await request(app)
      .put('/api/audits/00000000-0000-0000-0000-000000000001/complete')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ALREADY_COMPLETED');
  });

  it('should return 404 for non-existent audit', async () => {
    mockPrisma.fsAudit.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/audits/00000000-0000-0000-0000-000000000099/complete')
      .send({});
    expect(res.status).toBe(404);
  });
});
