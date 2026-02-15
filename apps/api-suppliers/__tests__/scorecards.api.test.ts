import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { suppScorecard: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/scorecards';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/scorecards', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/scorecards', () => {
  it('should return scorecards', async () => {
    (prisma as any).suppScorecard.findMany.mockResolvedValue([{ id: '1', title: 'Test' }]);
    (prisma as any).suppScorecard.count.mockResolvedValue(1);
    const res = await request(app).get('/api/scorecards');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/scorecards/:id', () => {
  it('should return 404 if not found', async () => {
    (prisma as any).suppScorecard.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/scorecards/nope');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    (prisma as any).suppScorecard.findFirst.mockResolvedValue({ id: '1' });
    const res = await request(app).get('/api/scorecards/1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('1');
  });
});

describe('POST /api/scorecards', () => {
  it('should create', async () => {
    (prisma as any).suppScorecard.count.mockResolvedValue(0);
    (prisma as any).suppScorecard.create.mockResolvedValue({ id: '1', title: 'New' });
    const res = await request(app).post('/api/scorecards').send({ title: 'New' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/scorecards/:id', () => {
  it('should update', async () => {
    (prisma as any).suppScorecard.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).suppScorecard.update.mockResolvedValue({ id: '1', title: 'Updated' });
    const res = await request(app).put('/api/scorecards/1').send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/scorecards/:id', () => {
  it('should soft delete', async () => {
    (prisma as any).suppScorecard.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).suppScorecard.update.mockResolvedValue({ id: '1' });
    const res = await request(app).delete('/api/scorecards/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
