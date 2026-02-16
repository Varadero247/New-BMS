import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { riskRegister: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/risks';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/risks', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/risks', () => {
  it('should return risks', async () => {
    (prisma as any).riskRegister.findMany.mockResolvedValue([{ id: '1', title: 'Test' }]);
    (prisma as any).riskRegister.count.mockResolvedValue(1);
    const res = await request(app).get('/api/risks');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/risks/:id', () => {
  it('should return 404 if not found', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/risks/nope');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue({ id: '1' });
    const res = await request(app).get('/api/risks/1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('1');
  });
});

describe('POST /api/risks', () => {
  it('should create', async () => {
    (prisma as any).riskRegister.count.mockResolvedValue(0);
    (prisma as any).riskRegister.create.mockResolvedValue({ id: '1', title: 'New' });
    const res = await request(app).post('/api/risks').send({ title: 'New', category: 'OPERATIONAL' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/risks/:id', () => {
  it('should update', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).riskRegister.update.mockResolvedValue({ id: '1', title: 'Updated' });
    const res = await request(app).put('/api/risks/1').send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/risks/:id', () => {
  it('should soft delete', async () => {
    (prisma as any).riskRegister.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).riskRegister.update.mockResolvedValue({ id: '1' });
    const res = await request(app).delete('/api/risks/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
