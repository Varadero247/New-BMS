import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    riskRegister: { findFirst: jest.fn() },
    riskKri: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    riskKriReading: { create: jest.fn() },
  },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/kri';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/risks', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/risks/:id/kri', () => {
  it('should return KRIs for a risk', async () => {
    (prisma as any).riskKri.findMany.mockResolvedValue([{ id: 'k1', name: 'Test KRI' }]);
    const res = await request(app).get('/api/risks/r1/kri');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('POST /api/risks/:id/kri', () => {
  it('should create KRI', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue({ id: 'r1' });
    (prisma as any).riskKri.create.mockResolvedValue({ id: 'k1', name: 'Incident rate' });
    const res = await request(app).post('/api/risks/r1/kri').send({ name: 'Incident rate', unit: 'per month' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if risk not found', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue(null);
    const res = await request(app).post('/api/risks/r1/kri').send({ name: 'Test' });
    expect(res.status).toBe(404);
  });

  it('should validate name required', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue({ id: 'r1' });
    const res = await request(app).post('/api/risks/r1/kri').send({});
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/risks/:riskId/kri/:id', () => {
  it('should update KRI', async () => {
    (prisma as any).riskKri.findFirst.mockResolvedValue({ id: 'k1' });
    (prisma as any).riskKri.update.mockResolvedValue({ id: 'k1', name: 'Updated' });
    const res = await request(app).put('/api/risks/r1/kri/k1').send({ name: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('POST /api/risks/:riskId/kri/:id/reading', () => {
  it('should record KRI reading and update status', async () => {
    (prisma as any).riskKri.findFirst.mockResolvedValue({
      id: 'k1', greenThreshold: 5, amberThreshold: 10, redThreshold: 15, thresholdDirection: 'INCREASING_IS_WORSE',
    });
    (prisma as any).riskKriReading.create.mockResolvedValue({ id: 'rd1', value: 12, status: 'AMBER' });
    (prisma as any).riskKri.update.mockResolvedValue({ id: 'k1', currentValue: 12, currentStatus: 'AMBER' });
    const res = await request(app).post('/api/risks/r1/kri/k1/reading').send({ value: 12, notes: 'Monthly reading' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('AMBER');
  });

  it('should return GREEN for low value', async () => {
    (prisma as any).riskKri.findFirst.mockResolvedValue({
      id: 'k1', greenThreshold: 5, amberThreshold: 10, redThreshold: 15, thresholdDirection: 'INCREASING_IS_WORSE',
    });
    (prisma as any).riskKriReading.create.mockResolvedValue({ id: 'rd2', value: 3, status: 'GREEN' });
    (prisma as any).riskKri.update.mockResolvedValue({});
    const res = await request(app).post('/api/risks/r1/kri/k1/reading').send({ value: 3 });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('GREEN');
  });

  it('should return RED for high value', async () => {
    (prisma as any).riskKri.findFirst.mockResolvedValue({
      id: 'k1', greenThreshold: 5, amberThreshold: 10, redThreshold: 15, thresholdDirection: 'INCREASING_IS_WORSE',
    });
    (prisma as any).riskKriReading.create.mockResolvedValue({ id: 'rd3', value: 20, status: 'RED' });
    (prisma as any).riskKri.update.mockResolvedValue({});
    const res = await request(app).post('/api/risks/r1/kri/k1/reading').send({ value: 20 });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('RED');
  });

  it('should require value', async () => {
    const res = await request(app).post('/api/risks/r1/kri/k1/reading').send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /api/risks/kri/breaches', () => {
  it('should return KRIs in amber or red', async () => {
    (prisma as any).riskKri.findMany.mockResolvedValue([{ id: 'k1', currentStatus: 'RED' }]);
    const res = await request(app).get('/api/risks/kri/breaches');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('GET /api/risks/kri/due', () => {
  it('should return KRIs due this week', async () => {
    (prisma as any).riskKri.findMany.mockResolvedValue([{ id: 'k1', nextMeasurementDue: new Date() }]);
    const res = await request(app).get('/api/risks/kri/due');
    expect(res.status).toBe(200);
  });
});
