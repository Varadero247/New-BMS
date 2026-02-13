import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsCcp: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    fsMonitoringRecord: {
      findMany: jest.fn(),
      create: jest.fn(),
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

import ccpsRouter from '../src/routes/ccps';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/ccps', ccpsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/ccps', () => {
  it('should return a list of CCPs with pagination', async () => {
    const ccps = [
      { id: 'ccp-1', name: 'Cooking Temperature', number: 'CCP-001', isActive: true },
    ];
    (prisma as any).fsCcp.findMany.mockResolvedValue(ccps);
    (prisma as any).fsCcp.count.mockResolvedValue(1);

    const res = await request(app).get('/api/ccps');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by isActive', async () => {
    (prisma as any).fsCcp.findMany.mockResolvedValue([]);
    (prisma as any).fsCcp.count.mockResolvedValue(0);

    const res = await request(app).get('/api/ccps?isActive=true');
    expect(res.status).toBe(200);
    expect((prisma as any).fsCcp.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true }) })
    );
  });

  it('should handle database errors', async () => {
    (prisma as any).fsCcp.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/ccps');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/ccps', () => {
  it('should create a CCP with auto-generated number', async () => {
    (prisma as any).fsCcp.count.mockResolvedValue(5);
    const created = { id: 'ccp-1', name: 'Cooking Temp', number: 'CCP-006', processStep: 'Cooking', criticalLimit: '75C', monitoringMethod: 'Thermometer', monitoringFrequency: 'PER_BATCH' };
    (prisma as any).fsCcp.create.mockResolvedValue(created);

    const res = await request(app).post('/api/ccps').send({
      name: 'Cooking Temp', processStep: 'Cooking', criticalLimit: '75C',
      monitoringMethod: 'Thermometer', monitoringFrequency: 'PER_BATCH',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/ccps').send({ name: 'Test' });
    expect(res.status).toBe(400);
  });

  it('should handle database errors on create', async () => {
    (prisma as any).fsCcp.count.mockResolvedValue(0);
    (prisma as any).fsCcp.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/ccps').send({
      name: 'Cooking Temp', processStep: 'Cooking', criticalLimit: '75C',
      monitoringMethod: 'Thermometer', monitoringFrequency: 'PER_BATCH',
    });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/ccps/:id', () => {
  it('should return a CCP with monitoring records', async () => {
    const ccp = { id: 'ccp-1', name: 'Cooking Temp', hazard: null, monitoringRecords: [] };
    (prisma as any).fsCcp.findFirst.mockResolvedValue(ccp);

    const res = await request(app).get('/api/ccps/ccp-1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('ccp-1');
  });

  it('should return 404 for non-existent CCP', async () => {
    (prisma as any).fsCcp.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/ccps/non-existent');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/ccps/:id', () => {
  it('should update a CCP', async () => {
    (prisma as any).fsCcp.findFirst.mockResolvedValue({ id: 'ccp-1' });
    (prisma as any).fsCcp.update.mockResolvedValue({ id: 'ccp-1', name: 'Updated' });

    const res = await request(app).put('/api/ccps/ccp-1').send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent CCP', async () => {
    (prisma as any).fsCcp.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/ccps/non-existent').send({ name: 'Test' });
    expect(res.status).toBe(404);
  });

  it('should reject invalid update', async () => {
    (prisma as any).fsCcp.findFirst.mockResolvedValue({ id: 'ccp-1' });

    const res = await request(app).put('/api/ccps/ccp-1').send({ monitoringFrequency: 'INVALID' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/ccps/:id', () => {
  it('should soft delete a CCP', async () => {
    (prisma as any).fsCcp.findFirst.mockResolvedValue({ id: 'ccp-1' });
    (prisma as any).fsCcp.update.mockResolvedValue({ id: 'ccp-1', deletedAt: new Date() });

    const res = await request(app).delete('/api/ccps/ccp-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent CCP', async () => {
    (prisma as any).fsCcp.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/ccps/non-existent');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/ccps/:id/monitoring-records', () => {
  it('should return monitoring records for a CCP', async () => {
    (prisma as any).fsCcp.findFirst.mockResolvedValue({ id: 'ccp-1' });
    (prisma as any).fsMonitoringRecord.findMany.mockResolvedValue([{ id: 'mr-1', value: '76C' }]);
    (prisma as any).fsMonitoringRecord.count.mockResolvedValue(1);

    const res = await request(app).get('/api/ccps/ccp-1/monitoring-records');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return 404 if CCP not found', async () => {
    (prisma as any).fsCcp.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/ccps/non-existent/monitoring-records');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/ccps/:id/monitoring-records', () => {
  it('should create a monitoring record for a CCP', async () => {
    (prisma as any).fsCcp.findFirst.mockResolvedValue({ id: 'ccp-1' });
    const created = { id: 'mr-1', ccpId: 'ccp-1', value: '76C', withinLimits: true };
    (prisma as any).fsMonitoringRecord.create.mockResolvedValue(created);

    const res = await request(app).post('/api/ccps/ccp-1/monitoring-records').send({
      monitoredAt: '2026-01-15T10:00:00Z', value: '76C', withinLimits: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if CCP not found', async () => {
    (prisma as any).fsCcp.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/ccps/non-existent/monitoring-records').send({
      monitoredAt: '2026-01-15', value: '76C', withinLimits: true,
    });
    expect(res.status).toBe(404);
  });

  it('should reject invalid monitoring record', async () => {
    (prisma as any).fsCcp.findFirst.mockResolvedValue({ id: 'ccp-1' });

    const res = await request(app).post('/api/ccps/ccp-1/monitoring-records').send({});
    expect(res.status).toBe(400);
  });
});
