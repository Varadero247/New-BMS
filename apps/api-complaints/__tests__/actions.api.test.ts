import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { compAction: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/actions';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/actions', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/actions', () => {
  it('should return actions', async () => {
    (prisma as any).compAction.findMany.mockResolvedValue([{ id: '1', title: 'Test' }]);
    (prisma as any).compAction.count.mockResolvedValue(1);
    const res = await request(app).get('/api/actions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/actions/:id', () => {
  it('should return 404 if not found', async () => {
    (prisma as any).compAction.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/actions/nope');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    (prisma as any).compAction.findFirst.mockResolvedValue({ id: '1' });
    const res = await request(app).get('/api/actions/1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('1');
  });
});

describe('POST /api/actions', () => {
  it('should create', async () => {
    (prisma as any).compAction.count.mockResolvedValue(0);
    (prisma as any).compAction.create.mockResolvedValue({ id: '1', title: 'New' });
    const res = await request(app).post('/api/actions').send({ complaintId: 'comp-1', action: 'New' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/actions/:id', () => {
  it('should update', async () => {
    (prisma as any).compAction.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).compAction.update.mockResolvedValue({ id: '1', title: 'Updated' });
    const res = await request(app).put('/api/actions/1').send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/actions/:id', () => {
  it('should soft delete', async () => {
    (prisma as any).compAction.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).compAction.update.mockResolvedValue({ id: '1' });
    const res = await request(app).delete('/api/actions/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
