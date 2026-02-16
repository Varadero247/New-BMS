import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    riskRegister: { findFirst: jest.fn(), update: jest.fn() },
    riskControl: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
  },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/controls';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/risks', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('POST /api/risks/:id/controls', () => {
  it('should create a control', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue({ id: 'r1' });
    (prisma as any).riskControl.create.mockResolvedValue({ id: 'c1', controlType: 'PREVENTIVE' });
    (prisma as any).riskControl.findMany.mockResolvedValue([{ effectiveness: 'ADEQUATE' }]);
    (prisma as any).riskRegister.update.mockResolvedValue({});
    const res = await request(app).post('/api/risks/r1/controls').send({ controlType: 'PREVENTIVE', description: 'Test control' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if risk not found', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue(null);
    const res = await request(app).post('/api/risks/r1/controls').send({ controlType: 'PREVENTIVE', description: 'Test' });
    expect(res.status).toBe(404);
  });

  it('should validate control type', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue({ id: 'r1' });
    const res = await request(app).post('/api/risks/r1/controls').send({ controlType: 'INVALID', description: 'Test' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/risks/:id/controls', () => {
  it('should return controls', async () => {
    (prisma as any).riskControl.findMany.mockResolvedValue([{ id: 'c1' }]);
    const res = await request(app).get('/api/risks/r1/controls');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('PUT /api/risks/:riskId/controls/:id', () => {
  it('should update control', async () => {
    (prisma as any).riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    (prisma as any).riskControl.update.mockResolvedValue({ id: 'c1', effectiveness: 'STRONG' });
    (prisma as any).riskControl.findMany.mockResolvedValue([{ effectiveness: 'STRONG' }]);
    (prisma as any).riskRegister.update.mockResolvedValue({});
    const res = await request(app).put('/api/risks/r1/controls/c1').send({ effectiveness: 'STRONG' });
    expect(res.status).toBe(200);
  });

  it('should return 404 if control not found', async () => {
    (prisma as any).riskControl.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/risks/r1/controls/c1').send({ effectiveness: 'STRONG' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/risks/:riskId/controls/:id', () => {
  it('should soft delete control', async () => {
    (prisma as any).riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    (prisma as any).riskControl.update.mockResolvedValue({ id: 'c1', isActive: false });
    const res = await request(app).delete('/api/risks/r1/controls/c1');
    expect(res.status).toBe(200);
  });
});

describe('POST /api/risks/:riskId/controls/:id/test', () => {
  it('should record test result', async () => {
    (prisma as any).riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    (prisma as any).riskControl.update.mockResolvedValue({ id: 'c1', lastTestedDate: new Date() });
    const res = await request(app).post('/api/risks/r1/controls/c1/test').send({ testingNotes: 'Passed', effectiveness: 'STRONG' });
    expect(res.status).toBe(200);
  });
});
