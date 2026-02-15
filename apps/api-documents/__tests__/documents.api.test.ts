import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { docDocument: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/documents';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/documents', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/documents', () => {
  it('should return documents', async () => {
    (prisma as any).docDocument.findMany.mockResolvedValue([{ id: '1', title: 'Test' }]);
    (prisma as any).docDocument.count.mockResolvedValue(1);
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/documents/:id', () => {
  it('should return 404 if not found', async () => {
    (prisma as any).docDocument.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/documents/nope');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    (prisma as any).docDocument.findFirst.mockResolvedValue({ id: '1' });
    const res = await request(app).get('/api/documents/1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('1');
  });
});

describe('POST /api/documents', () => {
  it('should create', async () => {
    (prisma as any).docDocument.count.mockResolvedValue(0);
    (prisma as any).docDocument.create.mockResolvedValue({ id: '1', title: 'New' });
    const res = await request(app).post('/api/documents').send({ title: 'New' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/documents/:id', () => {
  it('should update', async () => {
    (prisma as any).docDocument.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).docDocument.update.mockResolvedValue({ id: '1', title: 'Updated' });
    const res = await request(app).put('/api/documents/1').send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/documents/:id', () => {
  it('should soft delete', async () => {
    (prisma as any).docDocument.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).docDocument.update.mockResolvedValue({ id: '1' });
    const res = await request(app).delete('/api/documents/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
