import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    riskRegister: { findFirst: jest.fn() },
    riskAction: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
  },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/actions';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/risks', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/risks/:id/actions', () => {
  it('should return actions for a risk', async () => {
    (prisma as any).riskAction.findMany.mockResolvedValue([{ id: 'a1', actionTitle: 'Test' }]);
    const res = await request(app).get('/api/risks/r1/actions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('POST /api/risks/:id/actions', () => {
  it('should create action', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue({ id: 'r1' });
    (prisma as any).riskAction.create.mockResolvedValue({ id: 'a1', actionTitle: 'Install LEV' });
    const res = await request(app).post('/api/risks/r1/actions').send({
      actionTitle: 'Install LEV', description: 'Install local exhaust ventilation', actionType: 'PREVENTIVE', targetDate: '2026-06-01T00:00:00Z',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if risk not found', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue(null);
    const res = await request(app).post('/api/risks/r1/actions').send({
      actionTitle: 'Test', description: 'Test', actionType: 'PREVENTIVE', targetDate: '2026-06-01T00:00:00Z',
    });
    expect(res.status).toBe(404);
  });

  it('should validate required fields', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue({ id: 'r1' });
    const res = await request(app).post('/api/risks/r1/actions').send({ actionTitle: 'Test' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/risks/:riskId/actions/:id', () => {
  it('should update action', async () => {
    (prisma as any).riskAction.findFirst.mockResolvedValue({ id: 'a1' });
    (prisma as any).riskAction.update.mockResolvedValue({ id: 'a1', priority: 'HIGH' });
    const res = await request(app).put('/api/risks/r1/actions/a1').send({ priority: 'HIGH' });
    expect(res.status).toBe(200);
  });

  it('should return 404 if action not found', async () => {
    (prisma as any).riskAction.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/risks/r1/actions/a1').send({ priority: 'HIGH' });
    expect(res.status).toBe(404);
  });
});

describe('POST /api/risks/:riskId/actions/:id/complete', () => {
  it('should mark action complete', async () => {
    (prisma as any).riskAction.findFirst.mockResolvedValue({ id: 'a1' });
    (prisma as any).riskAction.update.mockResolvedValue({ id: 'a1', status: 'COMPLETED' });
    const res = await request(app).post('/api/risks/r1/actions/a1/complete').send({ evidenceOfCompletion: 'Photo uploaded', effectiveness: 'Effective' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });
});

describe('GET /api/risks/actions/overdue', () => {
  it('should return overdue actions', async () => {
    (prisma as any).riskAction.findMany.mockResolvedValue([{ id: 'a1', status: 'OPEN', targetDate: '2025-01-01' }]);
    const res = await request(app).get('/api/risks/actions/overdue');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/risks/actions/due-soon', () => {
  it('should return actions due within 14 days', async () => {
    (prisma as any).riskAction.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/risks/actions/due-soon');
    expect(res.status).toBe(200);
  });
});
