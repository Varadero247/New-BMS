import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsTraining: {
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

import trainingRouter from '../src/routes/training';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/training', trainingRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/training', () => {
  it('should return training records with pagination', async () => {
    (prisma as any).fsTraining.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'HACCP Training' },
    ]);
    (prisma as any).fsTraining.count.mockResolvedValue(1);

    const res = await request(app).get('/api/training');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by type', async () => {
    (prisma as any).fsTraining.findMany.mockResolvedValue([]);
    (prisma as any).fsTraining.count.mockResolvedValue(0);

    await request(app).get('/api/training?type=HACCP');
    expect((prisma as any).fsTraining.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'HACCP' }) })
    );
  });

  it('should filter by status', async () => {
    (prisma as any).fsTraining.findMany.mockResolvedValue([]);
    (prisma as any).fsTraining.count.mockResolvedValue(0);

    await request(app).get('/api/training?status=PLANNED');
    expect((prisma as any).fsTraining.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'PLANNED' }) })
    );
  });

  it('should handle database errors', async () => {
    (prisma as any).fsTraining.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/training');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/training', () => {
  it('should create a training record', async () => {
    const created = {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'HACCP Training',
      type: 'HACCP',
    };
    (prisma as any).fsTraining.create.mockResolvedValue(created);

    const res = await request(app).post('/api/training').send({
      title: 'HACCP Training',
      type: 'HACCP',
      scheduledDate: '2026-03-01',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/training').send({ title: 'Test' });
    expect(res.status).toBe(400);
  });

  it('should handle database errors', async () => {
    (prisma as any).fsTraining.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/training').send({
      title: 'HACCP Training',
      type: 'HACCP',
      scheduledDate: '2026-03-01',
    });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/training/:id', () => {
  it('should return a training record', async () => {
    (prisma as any).fsTraining.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).get('/api/training/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent record', async () => {
    (prisma as any).fsTraining.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/training/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/training/:id', () => {
  it('should update a training record', async () => {
    (prisma as any).fsTraining.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).fsTraining.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });

    const res = await request(app)
      .put('/api/training/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent record', async () => {
    (prisma as any).fsTraining.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/training/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Test' });
    expect(res.status).toBe(404);
  });

  it('should reject invalid update', async () => {
    (prisma as any).fsTraining.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app)
      .put('/api/training/00000000-0000-0000-0000-000000000001')
      .send({ type: 'INVALID' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/training/:id', () => {
  it('should soft delete a training record', async () => {
    (prisma as any).fsTraining.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).fsTraining.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).delete('/api/training/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent record', async () => {
    (prisma as any).fsTraining.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/training/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/training/:id/complete', () => {
  it('should complete a training record', async () => {
    (prisma as any).fsTraining.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'PLANNED',
    });
    (prisma as any).fsTraining.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'COMPLETED',
    });

    const res = await request(app)
      .put('/api/training/00000000-0000-0000-0000-000000000001/complete')
      .send({
        attendees: ['John', 'Jane'],
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject completing an already completed training', async () => {
    (prisma as any).fsTraining.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'COMPLETED',
    });

    const res = await request(app)
      .put('/api/training/00000000-0000-0000-0000-000000000001/complete')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ALREADY_COMPLETED');
  });

  it('should return 404 for non-existent record', async () => {
    (prisma as any).fsTraining.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/training/00000000-0000-0000-0000-000000000099/complete')
      .send({});
    expect(res.status).toBe(404);
  });

  it('should handle database errors', async () => {
    (prisma as any).fsTraining.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'PLANNED',
    });
    (prisma as any).fsTraining.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/training/00000000-0000-0000-0000-000000000001/complete')
      .send({});
    expect(res.status).toBe(500);
  });
});
