import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsMonitoringRecord: {
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

import monitoringRouter from '../src/routes/monitoring';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/monitoring', monitoringRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/monitoring', () => {
  it('should return monitoring records with pagination', async () => {
    const records = [{ id: '00000000-0000-0000-0000-000000000001', value: '76C', withinLimits: true }];
    (prisma as any).fsMonitoringRecord.findMany.mockResolvedValue(records);
    (prisma as any).fsMonitoringRecord.count.mockResolvedValue(1);

    const res = await request(app).get('/api/monitoring');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by ccpId', async () => {
    (prisma as any).fsMonitoringRecord.findMany.mockResolvedValue([]);
    (prisma as any).fsMonitoringRecord.count.mockResolvedValue(0);

    await request(app).get('/api/monitoring?ccpId=ccp-1');
    expect((prisma as any).fsMonitoringRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ ccpId: 'ccp-1' }) })
    );
  });

  it('should filter by withinLimits', async () => {
    (prisma as any).fsMonitoringRecord.findMany.mockResolvedValue([]);
    (prisma as any).fsMonitoringRecord.count.mockResolvedValue(0);

    await request(app).get('/api/monitoring?withinLimits=false');
    expect((prisma as any).fsMonitoringRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ withinLimits: false }) })
    );
  });

  it('should handle date range filters', async () => {
    (prisma as any).fsMonitoringRecord.findMany.mockResolvedValue([]);
    (prisma as any).fsMonitoringRecord.count.mockResolvedValue(0);

    await request(app).get('/api/monitoring?dateFrom=2026-01-01&dateTo=2026-01-31');
    expect((prisma as any).fsMonitoringRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          monitoredAt: expect.objectContaining({ gte: expect.any(Date), lte: expect.any(Date) }),
        }),
      })
    );
  });

  it('should handle database errors', async () => {
    (prisma as any).fsMonitoringRecord.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/monitoring');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/monitoring', () => {
  it('should create a monitoring record', async () => {
    const created = { id: '00000000-0000-0000-0000-000000000001', ccpId: 'ccp-1', value: '76C', withinLimits: true };
    (prisma as any).fsMonitoringRecord.create.mockResolvedValue(created);

    const res = await request(app).post('/api/monitoring').send({
      ccpId: '550e8400-e29b-41d4-a716-446655440000',
      monitoredAt: '2026-01-15T10:00:00Z',
      value: '76C',
      withinLimits: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/monitoring').send({});
    expect(res.status).toBe(400);
  });

  it('should handle database errors', async () => {
    (prisma as any).fsMonitoringRecord.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/monitoring').send({
      ccpId: '550e8400-e29b-41d4-a716-446655440000',
      monitoredAt: '2026-01-15T10:00:00Z',
      value: '76C',
      withinLimits: true,
    });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/monitoring/:id', () => {
  it('should return a monitoring record', async () => {
    (prisma as any).fsMonitoringRecord.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', value: '76C' });

    const res = await request(app).get('/api/monitoring/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent record', async () => {
    (prisma as any).fsMonitoringRecord.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/monitoring/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/monitoring/:id', () => {
  it('should update a monitoring record', async () => {
    (prisma as any).fsMonitoringRecord.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsMonitoringRecord.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', value: '78C' });

    const res = await request(app).put('/api/monitoring/00000000-0000-0000-0000-000000000001').send({ value: '78C' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent record', async () => {
    (prisma as any).fsMonitoringRecord.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/monitoring/00000000-0000-0000-0000-000000000099').send({ value: '78C' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/monitoring/:id', () => {
  it('should soft delete a monitoring record', async () => {
    (prisma as any).fsMonitoringRecord.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsMonitoringRecord.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });

    const res = await request(app).delete('/api/monitoring/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent record', async () => {
    (prisma as any).fsMonitoringRecord.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/monitoring/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/monitoring/deviations', () => {
  it('should return only records where withinLimits=false', async () => {
    const deviations = [{ id: '00000000-0000-0000-0000-000000000001', withinLimits: false, deviation: 'Temp too low' }];
    (prisma as any).fsMonitoringRecord.findMany.mockResolvedValue(deviations);
    (prisma as any).fsMonitoringRecord.count.mockResolvedValue(1);

    const res = await request(app).get('/api/monitoring/deviations');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect((prisma as any).fsMonitoringRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ withinLimits: false }) })
    );
  });

  it('should handle database errors', async () => {
    (prisma as any).fsMonitoringRecord.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/monitoring/deviations');
    expect(res.status).toBe(500);
  });
});
