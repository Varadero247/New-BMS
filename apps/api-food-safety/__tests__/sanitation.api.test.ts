import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsSanitation: {
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

import sanitationRouter from '../src/routes/sanitation';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/sanitation', sanitationRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/sanitation', () => {
  it('should return sanitation tasks with pagination', async () => {
    (prisma as any).fsSanitation.findMany.mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001', area: 'Kitchen' }]);
    (prisma as any).fsSanitation.count.mockResolvedValue(1);

    const res = await request(app).get('/api/sanitation');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    (prisma as any).fsSanitation.findMany.mockResolvedValue([]);
    (prisma as any).fsSanitation.count.mockResolvedValue(0);

    await request(app).get('/api/sanitation?status=SCHEDULED');
    expect((prisma as any).fsSanitation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'SCHEDULED' }) })
    );
  });

  it('should filter by frequency', async () => {
    (prisma as any).fsSanitation.findMany.mockResolvedValue([]);
    (prisma as any).fsSanitation.count.mockResolvedValue(0);

    await request(app).get('/api/sanitation?frequency=DAILY');
    expect((prisma as any).fsSanitation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ frequency: 'DAILY' }) })
    );
  });

  it('should handle database errors', async () => {
    (prisma as any).fsSanitation.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/sanitation');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/sanitation', () => {
  it('should create a sanitation task', async () => {
    const created = { id: '00000000-0000-0000-0000-000000000001', area: 'Kitchen', procedure: 'Deep clean' };
    (prisma as any).fsSanitation.create.mockResolvedValue(created);

    const res = await request(app).post('/api/sanitation').send({
      area: 'Kitchen', procedure: 'Deep clean', frequency: 'DAILY', scheduledDate: '2026-02-15',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/sanitation').send({ area: 'Kitchen' });
    expect(res.status).toBe(400);
  });

  it('should handle database errors', async () => {
    (prisma as any).fsSanitation.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/sanitation').send({
      area: 'Kitchen', procedure: 'Deep clean', frequency: 'DAILY', scheduledDate: '2026-02-15',
    });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/sanitation/:id', () => {
  it('should return a sanitation task', async () => {
    (prisma as any).fsSanitation.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });

    const res = await request(app).get('/api/sanitation/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent task', async () => {
    (prisma as any).fsSanitation.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/sanitation/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/sanitation/:id', () => {
  it('should update a sanitation task', async () => {
    (prisma as any).fsSanitation.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsSanitation.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', area: 'Updated' });

    const res = await request(app).put('/api/sanitation/00000000-0000-0000-0000-000000000001').send({ area: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent task', async () => {
    (prisma as any).fsSanitation.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/sanitation/00000000-0000-0000-0000-000000000099').send({ area: 'Test' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/sanitation/:id', () => {
  it('should soft delete a sanitation task', async () => {
    (prisma as any).fsSanitation.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsSanitation.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });

    const res = await request(app).delete('/api/sanitation/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent task', async () => {
    (prisma as any).fsSanitation.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/sanitation/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/sanitation/:id/complete', () => {
  it('should complete a sanitation task', async () => {
    (prisma as any).fsSanitation.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'SCHEDULED' });
    (prisma as any).fsSanitation.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'COMPLETED' });

    const res = await request(app).put('/api/sanitation/00000000-0000-0000-0000-000000000001/complete').send({ result: 'PASS' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject completing an already completed task', async () => {
    (prisma as any).fsSanitation.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'COMPLETED' });

    const res = await request(app).put('/api/sanitation/00000000-0000-0000-0000-000000000001/complete').send({});
    expect(res.status).toBe(400);
  });

  it('should return 404 for non-existent task', async () => {
    (prisma as any).fsSanitation.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/sanitation/00000000-0000-0000-0000-000000000099/complete').send({});
    expect(res.status).toBe(404);
  });
});

describe('GET /api/sanitation/overdue', () => {
  it('should return overdue sanitation tasks', async () => {
    (prisma as any).fsSanitation.findMany.mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001', status: 'OVERDUE' }]);

    const res = await request(app).get('/api/sanitation/overdue');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should handle database errors', async () => {
    (prisma as any).fsSanitation.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/sanitation/overdue');
    expect(res.status).toBe(500);
  });
});
