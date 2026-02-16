import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { docVersion: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/versions';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/versions', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/versions', () => {
  it('should return list of versions with pagination', async () => {
    (prisma as any).docVersion.findMany.mockResolvedValue([{ id: '1', documentId: 'doc-1', version: 1 }]);
    (prisma as any).docVersion.count.mockResolvedValue(1);
    const res = await request(app).get('/api/versions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by status', async () => {
    (prisma as any).docVersion.findMany.mockResolvedValue([]);
    (prisma as any).docVersion.count.mockResolvedValue(0);
    const res = await request(app).get('/api/versions?status=ACTIVE');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should support pagination params', async () => {
    (prisma as any).docVersion.findMany.mockResolvedValue([]);
    (prisma as any).docVersion.count.mockResolvedValue(0);
    const res = await request(app).get('/api/versions?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).docVersion.findMany.mockRejectedValue(new Error('DB error'));
    (prisma as any).docVersion.count.mockResolvedValue(0);
    const res = await request(app).get('/api/versions');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FETCH_ERROR');
  });
});

describe('GET /api/versions/:id', () => {
  it('should return a version by id', async () => {
    (prisma as any).docVersion.findFirst.mockResolvedValue({ id: '1', documentId: 'doc-1', version: 2 });
    const res = await request(app).get('/api/versions/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('1');
    expect(res.body.data.version).toBe(2);
  });

  it('should return 404 if not found', async () => {
    (prisma as any).docVersion.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/versions/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/versions', () => {
  it('should create a version', async () => {
    (prisma as any).docVersion.create.mockResolvedValue({ id: '1', documentId: 'doc-1', version: 1, changeNotes: 'Initial version' });
    const res = await request(app).post('/api/versions').send({ documentId: 'doc-1', version: 1, changeNotes: 'Initial version' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('1');
  });

  it('should return 400 if documentId is missing', async () => {
    const res = await request(app).post('/api/versions').send({ version: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if version is missing', async () => {
    const res = await request(app).post('/api/versions').send({ documentId: 'doc-1' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if version is less than 1', async () => {
    const res = await request(app).post('/api/versions').send({ documentId: 'doc-1', version: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 on create error', async () => {
    (prisma as any).docVersion.create.mockRejectedValue(new Error('Unique constraint failed'));
    const res = await request(app).post('/api/versions').send({ documentId: 'doc-1', version: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('CREATE_ERROR');
  });
});

describe('PUT /api/versions/:id', () => {
  it('should update a version', async () => {
    (prisma as any).docVersion.findFirst.mockResolvedValue({ id: '1', documentId: 'doc-1', version: 1 });
    (prisma as any).docVersion.update.mockResolvedValue({ id: '1', documentId: 'doc-1', version: 2, changeNotes: 'Updated' });
    const res = await request(app).put('/api/versions/1').send({ version: 2, changeNotes: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma as any).docVersion.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/versions/nope').send({ version: 2 });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 on validation error', async () => {
    const res = await request(app).put('/api/versions/1').send({ version: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('DELETE /api/versions/:id', () => {
  it('should soft delete a version', async () => {
    (prisma as any).docVersion.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).docVersion.update.mockResolvedValue({ id: '1' });
    const res = await request(app).delete('/api/versions/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('deleted');
  });

  it('should return 404 if not found', async () => {
    (prisma as any).docVersion.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/versions/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
