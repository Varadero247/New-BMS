import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    suppDocument: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
  },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/documents';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/documents', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/documents', () => {
  it('should return documents list', async () => {
    (prisma as any).suppDocument.findMany.mockResolvedValue([{ id: '1', title: 'Certificate' }]);
    (prisma as any).suppDocument.count.mockResolvedValue(1);
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should support search and status filters', async () => {
    (prisma as any).suppDocument.findMany.mockResolvedValue([]);
    (prisma as any).suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/documents?search=cert&status=ACTIVE');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on DB error', async () => {
    (prisma as any).suppDocument.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FETCH_ERROR');
  });
});

describe('GET /api/documents/:id', () => {
  it('should return a document by id', async () => {
    (prisma as any).suppDocument.findFirst.mockResolvedValue({ id: '1', title: 'Certificate' });
    const res = await request(app).get('/api/documents/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('1');
  });

  it('should return 404 if not found', async () => {
    (prisma as any).suppDocument.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/documents/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/documents', () => {
  it('should create a document', async () => {
    (prisma as any).suppDocument.count.mockResolvedValue(0);
    (prisma as any).suppDocument.create.mockResolvedValue({ id: '1', title: 'New Doc', supplierId: 'sup-1' });
    const res = await request(app).post('/api/documents').send({
      supplierId: 'sup-1',
      title: 'New Doc',
      type: 'CERTIFICATE',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 on validation error (missing required fields)', async () => {
    const res = await request(app).post('/api/documents').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 on invalid document type', async () => {
    const res = await request(app).post('/api/documents').send({
      supplierId: 'sup-1',
      title: 'Doc',
      type: 'INVALID_TYPE',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/documents/:id', () => {
  it('should update a document', async () => {
    (prisma as any).suppDocument.findFirst.mockResolvedValue({ id: '1', title: 'Old Title' });
    (prisma as any).suppDocument.update.mockResolvedValue({ id: '1', title: 'Updated Title' });
    const res = await request(app).put('/api/documents/1').send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if document not found on update', async () => {
    (prisma as any).suppDocument.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/documents/nope').send({ title: 'Title' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('DELETE /api/documents/:id', () => {
  it('should soft delete a document', async () => {
    (prisma as any).suppDocument.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).suppDocument.update.mockResolvedValue({ id: '1' });
    const res = await request(app).delete('/api/documents/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('document deleted successfully');
  });

  it('should return 404 if document not found on delete', async () => {
    (prisma as any).suppDocument.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/documents/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
