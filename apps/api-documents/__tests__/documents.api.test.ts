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
  it('should return documents with pagination', async () => {
    (prisma as any).docDocument.findMany.mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001', title: 'Test' }]);
    (prisma as any).docDocument.count.mockResolvedValue(1);
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by status', async () => {
    (prisma as any).docDocument.findMany.mockResolvedValue([]);
    (prisma as any).docDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/documents?status=APPROVED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should search by title', async () => {
    (prisma as any).docDocument.findMany.mockResolvedValue([]);
    (prisma as any).docDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/documents?search=policy');
    expect(res.status).toBe(200);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).docDocument.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/documents/:id', () => {
  it('should return 404 if not found', async () => {
    (prisma as any).docDocument.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/documents/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return item by id', async () => {
    (prisma as any).docDocument.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Policy Doc' });
    const res = await request(app).get('/api/documents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).docDocument.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/documents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/documents', () => {
  it('should create', async () => {
    (prisma as any).docDocument.count.mockResolvedValue(0);
    (prisma as any).docDocument.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'New', referenceNumber: 'DOC-2026-0001' });
    const res = await request(app).post('/api/documents').send({ title: 'New' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 when title is missing', async () => {
    const res = await request(app).post('/api/documents').send({ description: 'No title' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when title is empty', async () => {
    const res = await request(app).post('/api/documents').send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on database create error', async () => {
    (prisma as any).docDocument.count.mockResolvedValue(0);
    (prisma as any).docDocument.create.mockRejectedValue(new Error('Unique constraint'));
    const res = await request(app).post('/api/documents').send({ title: 'Duplicate' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/documents/:id', () => {
  it('should update', async () => {
    (prisma as any).docDocument.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).docDocument.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Updated' });
    const res = await request(app).put('/api/documents/00000000-0000-0000-0000-000000000001').send({ title: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when document not found', async () => {
    (prisma as any).docDocument.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/documents/00000000-0000-0000-0000-000000000099').send({ title: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database update error', async () => {
    (prisma as any).docDocument.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).docDocument.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).put('/api/documents/00000000-0000-0000-0000-000000000001').send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('DELETE /api/documents/:id', () => {
  it('should soft delete', async () => {
    (prisma as any).docDocument.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).docDocument.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/documents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when document not found', async () => {
    (prisma as any).docDocument.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/documents/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).docDocument.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).docDocument.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/documents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
