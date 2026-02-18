import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsRecall: {
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

import recallsRouter from '../src/routes/recalls';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/recalls', recallsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/recalls', () => {
  it('should return recalls with pagination', async () => {
    (prisma as any).fsRecall.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', productName: 'Product A' },
    ]);
    (prisma as any).fsRecall.count.mockResolvedValue(1);

    const res = await request(app).get('/api/recalls');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should filter by status', async () => {
    (prisma as any).fsRecall.findMany.mockResolvedValue([]);
    (prisma as any).fsRecall.count.mockResolvedValue(0);

    await request(app).get('/api/recalls?status=INITIATED');
    expect((prisma as any).fsRecall.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'INITIATED' }) })
    );
  });

  it('should filter by severity', async () => {
    (prisma as any).fsRecall.findMany.mockResolvedValue([]);
    (prisma as any).fsRecall.count.mockResolvedValue(0);

    await request(app).get('/api/recalls?severity=CRITICAL');
    expect((prisma as any).fsRecall.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ severity: 'CRITICAL' }) })
    );
  });

  it('should filter by type', async () => {
    (prisma as any).fsRecall.findMany.mockResolvedValue([]);
    (prisma as any).fsRecall.count.mockResolvedValue(0);

    await request(app).get('/api/recalls?type=VOLUNTARY');
    expect((prisma as any).fsRecall.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'VOLUNTARY' }) })
    );
  });

  it('should handle database errors', async () => {
    (prisma as any).fsRecall.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/recalls');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/recalls', () => {
  it('should create a recall with auto-generated number', async () => {
    const created = {
      id: '00000000-0000-0000-0000-000000000001',
      number: 'RCL-2602-1234',
      productName: 'Product A',
    };
    (prisma as any).fsRecall.create.mockResolvedValue(created);

    const res = await request(app).post('/api/recalls').send({
      productName: 'Product A',
      batchNumber: 'B001',
      reason: 'Contamination',
      type: 'VOLUNTARY',
      severity: 'HIGH',
      initiatedDate: '2026-02-01',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/recalls').send({ productName: 'Test' });
    expect(res.status).toBe(400);
  });

  it('should handle database errors', async () => {
    (prisma as any).fsRecall.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/recalls').send({
      productName: 'Product A',
      batchNumber: 'B001',
      reason: 'Contamination',
      type: 'VOLUNTARY',
      severity: 'HIGH',
      initiatedDate: '2026-02-01',
    });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/recalls/:id', () => {
  it('should return a recall by id', async () => {
    (prisma as any).fsRecall.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).get('/api/recalls/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent recall', async () => {
    (prisma as any).fsRecall.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/recalls/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/recalls/:id', () => {
  it('should update a recall', async () => {
    (prisma as any).fsRecall.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).fsRecall.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'IN_PROGRESS',
    });

    const res = await request(app)
      .put('/api/recalls/00000000-0000-0000-0000-000000000001')
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
  });

  it('should return 404 for non-existent recall', async () => {
    (prisma as any).fsRecall.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/recalls/00000000-0000-0000-0000-000000000099')
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/recalls/:id', () => {
  it('should soft delete a recall', async () => {
    (prisma as any).fsRecall.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).fsRecall.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).delete('/api/recalls/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent recall', async () => {
    (prisma as any).fsRecall.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/recalls/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/recalls/:id/complete', () => {
  it('should complete a recall', async () => {
    (prisma as any).fsRecall.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'IN_PROGRESS',
    });
    (prisma as any).fsRecall.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'COMPLETED',
    });

    const res = await request(app)
      .put('/api/recalls/00000000-0000-0000-0000-000000000001/complete')
      .send({ unitsRecovered: 500 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject completing an already completed recall', async () => {
    (prisma as any).fsRecall.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'COMPLETED',
    });

    const res = await request(app)
      .put('/api/recalls/00000000-0000-0000-0000-000000000001/complete')
      .send({});
    expect(res.status).toBe(400);
  });

  it('should return 404 for non-existent recall', async () => {
    (prisma as any).fsRecall.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/recalls/00000000-0000-0000-0000-000000000099/complete')
      .send({});
    expect(res.status).toBe(404);
  });
});

describe('GET /api/recalls/active', () => {
  it('should return active recalls', async () => {
    (prisma as any).fsRecall.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', status: 'INITIATED' },
    ]);

    const res = await request(app).get('/api/recalls/active');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should handle database errors', async () => {
    (prisma as any).fsRecall.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/recalls/active');
    expect(res.status).toBe(500);
  });
});
