import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    energyAudit: {
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
    req.user = { id: '00000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import auditsRouter from '../src/routes/audits';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/audits', auditsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/audits', () => {
  it('should return paginated audits', async () => {
    (prisma.energyAudit.findMany as jest.Mock).mockResolvedValue([{ id: 'e8000000-0000-4000-a000-000000000001', title: 'Q1 Audit' }]);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/audits');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by type', async () => {
    (prisma.energyAudit.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/audits?type=INTERNAL');

    expect(prisma.energyAudit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'INTERNAL' }),
      })
    );
  });

  it('should filter by status', async () => {
    (prisma.energyAudit.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/audits?status=PLANNED');

    expect(prisma.energyAudit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PLANNED' }),
      })
    );
  });

  it('should handle errors', async () => {
    (prisma.energyAudit.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
    (prisma.energyAudit.count as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/audits');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/audits', () => {
  const validBody = {
    title: 'Annual Energy Audit 2025',
    type: 'INTERNAL',
    auditor: 'John Smith',
    scheduledDate: '2025-06-15',
    facility: 'Building A',
  };

  it('should create an audit', async () => {
    (prisma.energyAudit.create as jest.Mock).mockResolvedValue({ id: 'new-id', ...validBody, status: 'PLANNED' });

    const res = await request(app).post('/api/audits').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Annual Energy Audit 2025');
  });

  it('should reject invalid body', async () => {
    const res = await request(app).post('/api/audits').send({ title: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/audits/:id', () => {
  it('should return an audit', async () => {
    (prisma.energyAudit.findFirst as jest.Mock).mockResolvedValue({ id: 'e8000000-0000-4000-a000-000000000001', title: 'Audit 1' });

    const res = await request(app).get('/api/audits/e8000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('e8000000-0000-4000-a000-000000000001');
  });

  it('should return 404 if not found', async () => {
    (prisma.energyAudit.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/audits/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/audits/:id', () => {
  it('should update an audit', async () => {
    (prisma.energyAudit.findFirst as jest.Mock).mockResolvedValue({ id: 'e8000000-0000-4000-a000-000000000001' });
    (prisma.energyAudit.update as jest.Mock).mockResolvedValue({ id: 'e8000000-0000-4000-a000-000000000001', title: 'Updated Audit' });

    const res = await request(app).put('/api/audits/e8000000-0000-4000-a000-000000000001').send({ title: 'Updated Audit' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Audit');
  });

  it('should return 404 if not found', async () => {
    (prisma.energyAudit.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put('/api/audits/00000000-0000-0000-0000-000000000099').send({ title: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/audits/:id', () => {
  it('should soft delete an audit', async () => {
    (prisma.energyAudit.findFirst as jest.Mock).mockResolvedValue({ id: 'e8000000-0000-4000-a000-000000000001' });
    (prisma.energyAudit.update as jest.Mock).mockResolvedValue({ id: 'e8000000-0000-4000-a000-000000000001' });

    const res = await request(app).delete('/api/audits/e8000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyAudit.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/audits/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/audits/:id/complete', () => {
  it('should complete an audit', async () => {
    (prisma.energyAudit.findFirst as jest.Mock).mockResolvedValue({ id: 'e8000000-0000-4000-a000-000000000001', status: 'IN_PROGRESS', score: null, findings: null, recommendations: null });
    (prisma.energyAudit.update as jest.Mock).mockResolvedValue({ id: 'e8000000-0000-4000-a000-000000000001', status: 'COMPLETED', score: 85 });

    const res = await request(app).put('/api/audits/e8000000-0000-4000-a000-000000000001/complete').send({ score: 85, findings: ['Finding 1'] });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });

  it('should reject if already completed', async () => {
    (prisma.energyAudit.findFirst as jest.Mock).mockResolvedValue({ id: 'e8000000-0000-4000-a000-000000000001', status: 'COMPLETED' });

    const res = await request(app).put('/api/audits/e8000000-0000-4000-a000-000000000001/complete');

    expect(res.status).toBe(400);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyAudit.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put('/api/audits/00000000-0000-0000-0000-000000000099/complete');

    expect(res.status).toBe(404);
  });
});
