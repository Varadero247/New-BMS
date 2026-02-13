import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsTraceability: {
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

import traceabilityRouter from '../src/routes/traceability';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/traceability', traceabilityRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/traceability', () => {
  it('should return traceability records with pagination', async () => {
    (prisma as any).fsTraceability.findMany.mockResolvedValue([{ id: 't-1', productName: 'Product A' }]);
    (prisma as any).fsTraceability.count.mockResolvedValue(1);

    const res = await request(app).get('/api/traceability');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    (prisma as any).fsTraceability.findMany.mockResolvedValue([]);
    (prisma as any).fsTraceability.count.mockResolvedValue(0);

    await request(app).get('/api/traceability?status=IN_PRODUCTION');
    expect((prisma as any).fsTraceability.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'IN_PRODUCTION' }) })
    );
  });

  it('should filter by productName', async () => {
    (prisma as any).fsTraceability.findMany.mockResolvedValue([]);
    (prisma as any).fsTraceability.count.mockResolvedValue(0);

    await request(app).get('/api/traceability?productName=Milk');
    expect((prisma as any).fsTraceability.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          productName: expect.objectContaining({ contains: 'Milk' }),
        }),
      })
    );
  });

  it('should handle database errors', async () => {
    (prisma as any).fsTraceability.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/traceability');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/traceability', () => {
  it('should create a traceability record', async () => {
    const created = { id: 't-1', productName: 'Product A', batchNumber: 'B001' };
    (prisma as any).fsTraceability.create.mockResolvedValue(created);

    const res = await request(app).post('/api/traceability').send({
      productName: 'Product A', batchNumber: 'B001', productionDate: '2026-01-15',
      ingredients: [{ name: 'Flour', origin: 'Local' }],
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/traceability').send({ productName: 'Test' });
    expect(res.status).toBe(400);
  });

  it('should handle database errors', async () => {
    (prisma as any).fsTraceability.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/traceability').send({
      productName: 'Product A', batchNumber: 'B001', productionDate: '2026-01-15',
      ingredients: [],
    });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/traceability/:id', () => {
  it('should return a traceability record by id', async () => {
    (prisma as any).fsTraceability.findFirst.mockResolvedValue({ id: 't-1' });

    const res = await request(app).get('/api/traceability/t-1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('t-1');
  });

  it('should return 404 for non-existent record', async () => {
    (prisma as any).fsTraceability.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/traceability/non-existent');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/traceability/:id', () => {
  it('should update a traceability record', async () => {
    (prisma as any).fsTraceability.findFirst.mockResolvedValue({ id: 't-1' });
    (prisma as any).fsTraceability.update.mockResolvedValue({ id: 't-1', status: 'DISTRIBUTED' });

    const res = await request(app).put('/api/traceability/t-1').send({ status: 'DISTRIBUTED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent record', async () => {
    (prisma as any).fsTraceability.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/traceability/non-existent').send({ status: 'DISTRIBUTED' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/traceability/:id', () => {
  it('should soft delete a traceability record', async () => {
    (prisma as any).fsTraceability.findFirst.mockResolvedValue({ id: 't-1' });
    (prisma as any).fsTraceability.update.mockResolvedValue({ id: 't-1' });

    const res = await request(app).delete('/api/traceability/t-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent record', async () => {
    (prisma as any).fsTraceability.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/traceability/non-existent');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/traceability/batch/:batchNumber', () => {
  it('should return a traceability record by batch number', async () => {
    (prisma as any).fsTraceability.findFirst.mockResolvedValue({ id: 't-1', batchNumber: 'B001' });

    const res = await request(app).get('/api/traceability/batch/B001');
    expect(res.status).toBe(200);
    expect(res.body.data.batchNumber).toBe('B001');
  });

  it('should return 404 for non-existent batch', async () => {
    (prisma as any).fsTraceability.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/traceability/batch/NONEXISTENT');
    expect(res.status).toBe(404);
  });

  it('should handle database errors', async () => {
    (prisma as any).fsTraceability.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/traceability/batch/B001');
    expect(res.status).toBe(500);
  });
});
