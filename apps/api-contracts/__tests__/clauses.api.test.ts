import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { contClause: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/clauses';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/clauses', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/clauses', () => {
  it('should return clauses list', async () => {
    (prisma as any).contClause.findMany.mockResolvedValue([{ id: '1', title: 'Clause A' }]);
    (prisma as any).contClause.count.mockResolvedValue(1);
    const res = await request(app).get('/api/clauses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should support search and status filters', async () => {
    (prisma as any).contClause.findMany.mockResolvedValue([]);
    (prisma as any).contClause.count.mockResolvedValue(0);
    const res = await request(app).get('/api/clauses?status=ACTIVE&search=payment');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on db error', async () => {
    (prisma as any).contClause.findMany.mockRejectedValue(new Error('DB error'));
    (prisma as any).contClause.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/clauses');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/clauses/:id', () => {
  it('should return clause by id', async () => {
    (prisma as any).contClause.findFirst.mockResolvedValue({ id: '1', title: 'Clause A' });
    const res = await request(app).get('/api/clauses/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('1');
  });

  it('should return 404 if not found', async () => {
    (prisma as any).contClause.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/clauses/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on db error', async () => {
    (prisma as any).contClause.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/clauses/1');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/clauses', () => {
  it('should create a clause', async () => {
    (prisma as any).contClause.count.mockResolvedValue(0);
    (prisma as any).contClause.create.mockResolvedValue({ id: '1', contractId: 'c-1', title: 'New Clause' });
    const res = await request(app).post('/api/clauses').send({ contractId: 'c-1', title: 'New Clause' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('New Clause');
  });

  it('should return 400 if contractId missing', async () => {
    const res = await request(app).post('/api/clauses').send({ title: 'No Contract' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if title missing', async () => {
    const res = await request(app).post('/api/clauses').send({ contractId: 'c-1' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on create error', async () => {
    (prisma as any).contClause.count.mockResolvedValue(0);
    (prisma as any).contClause.create.mockRejectedValue(new Error('Create failed'));
    const res = await request(app).post('/api/clauses').send({ contractId: 'c-1', title: 'New Clause' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/clauses/:id', () => {
  it('should update a clause', async () => {
    (prisma as any).contClause.findFirst.mockResolvedValue({ id: '1', title: 'Old Title' });
    (prisma as any).contClause.update.mockResolvedValue({ id: '1', title: 'Updated Title' });
    const res = await request(app).put('/api/clauses/1').send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if clause not found', async () => {
    (prisma as any).contClause.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/clauses/nope').send({ title: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on update error', async () => {
    (prisma as any).contClause.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).contClause.update.mockRejectedValue(new Error('Update failed'));
    const res = await request(app).put('/api/clauses/1').send({ title: 'New' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('DELETE /api/clauses/:id', () => {
  it('should soft delete a clause', async () => {
    (prisma as any).contClause.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).contClause.update.mockResolvedValue({ id: '1', deletedAt: new Date() });
    const res = await request(app).delete('/api/clauses/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toMatch(/deleted/i);
  });

  it('should return 404 if clause not found', async () => {
    (prisma as any).contClause.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/clauses/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on delete error', async () => {
    (prisma as any).contClause.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).contClause.update.mockRejectedValue(new Error('Delete failed'));
    const res = await request(app).delete('/api/clauses/1');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
