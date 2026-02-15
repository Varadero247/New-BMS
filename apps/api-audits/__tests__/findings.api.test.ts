import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { audFinding: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/findings';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/findings', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/findings', () => {
  it('should return findings', async () => {
    (prisma as any).audFinding.findMany.mockResolvedValue([{ id: '1', title: 'Test' }]);
    (prisma as any).audFinding.count.mockResolvedValue(1);
    const res = await request(app).get('/api/findings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/findings/:id', () => {
  it('should return 404 if not found', async () => {
    (prisma as any).audFinding.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/findings/nope');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    (prisma as any).audFinding.findFirst.mockResolvedValue({ id: '1' });
    const res = await request(app).get('/api/findings/1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('1');
  });
});

describe('POST /api/findings', () => {
  it('should create', async () => {
    (prisma as any).audFinding.count.mockResolvedValue(0);
    (prisma as any).audFinding.create.mockResolvedValue({ id: '1', title: 'New' });
    const res = await request(app).post('/api/findings').send({ title: 'New' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/findings/:id', () => {
  it('should update', async () => {
    (prisma as any).audFinding.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).audFinding.update.mockResolvedValue({ id: '1', title: 'Updated' });
    const res = await request(app).put('/api/findings/1').send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/findings/:id', () => {
  it('should soft delete', async () => {
    (prisma as any).audFinding.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).audFinding.update.mockResolvedValue({ id: '1' });
    const res = await request(app).delete('/api/findings/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
