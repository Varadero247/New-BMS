import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { trainMatrix: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/matrix';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/matrix', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/matrix', () => {
  it('should return matrix entries', async () => {
    (prisma as any).trainMatrix.findMany.mockResolvedValue([{ id: '1', competencyId: 'comp-1', employeeId: 'emp-1' }]);
    (prisma as any).trainMatrix.count.mockResolvedValue(1);
    const res = await request(app).get('/api/matrix');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should support pagination', async () => {
    (prisma as any).trainMatrix.findMany.mockResolvedValue([]);
    (prisma as any).trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/matrix?page=2&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(5);
  });

  it('should return 500 on error', async () => {
    (prisma as any).trainMatrix.findMany.mockRejectedValue(new Error('DB error'));
    (prisma as any).trainMatrix.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/matrix');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/matrix/:id', () => {
  it('should return matrix entry by id', async () => {
    (prisma as any).trainMatrix.findFirst.mockResolvedValue({ id: '1', competencyId: 'comp-1' });
    const res = await request(app).get('/api/matrix/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('1');
  });

  it('should return 404 if not found', async () => {
    (prisma as any).trainMatrix.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/matrix/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on error', async () => {
    (prisma as any).trainMatrix.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/matrix/1');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/matrix', () => {
  it('should create a matrix entry', async () => {
    (prisma as any).trainMatrix.count.mockResolvedValue(0);
    (prisma as any).trainMatrix.create.mockResolvedValue({ id: '1', competencyId: 'comp-1', employeeId: 'emp-1' });
    const res = await request(app).post('/api/matrix').send({
      competencyId: 'comp-1',
      employeeId: 'emp-1',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should create with all optional fields', async () => {
    (prisma as any).trainMatrix.count.mockResolvedValue(0);
    (prisma as any).trainMatrix.create.mockResolvedValue({ id: '2' });
    const res = await request(app).post('/api/matrix').send({
      competencyId: 'comp-1',
      employeeId: 'emp-1',
      employeeName: 'John Doe',
      currentLevel: 'DEVELOPING',
      targetLevel: 'COMPETENT',
      assessedDate: '2026-01-01T00:00:00.000Z',
      assessedBy: 'user-1',
      nextReviewDate: '2027-01-01T00:00:00.000Z',
      gap: true,
      notes: 'Needs improvement',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 if competencyId is missing', async () => {
    const res = await request(app).post('/api/matrix').send({ employeeId: 'emp-1' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if employeeId is missing', async () => {
    const res = await request(app).post('/api/matrix').send({ competencyId: 'comp-1' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if currentLevel is invalid', async () => {
    const res = await request(app).post('/api/matrix').send({
      competencyId: 'comp-1',
      employeeId: 'emp-1',
      currentLevel: 'INVALID_LEVEL',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 on create error', async () => {
    (prisma as any).trainMatrix.count.mockResolvedValue(0);
    (prisma as any).trainMatrix.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/matrix').send({
      competencyId: 'comp-1',
      employeeId: 'emp-1',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/matrix/:id', () => {
  it('should update a matrix entry', async () => {
    (prisma as any).trainMatrix.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).trainMatrix.update.mockResolvedValue({ id: '1', currentLevel: 'COMPETENT' });
    const res = await request(app).put('/api/matrix/1').send({ currentLevel: 'COMPETENT' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma as any).trainMatrix.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/matrix/nope').send({ currentLevel: 'COMPETENT' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 on invalid targetLevel', async () => {
    const res = await request(app).put('/api/matrix/1').send({ targetLevel: 'INVALID' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on update error', async () => {
    (prisma as any).trainMatrix.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).trainMatrix.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).put('/api/matrix/1').send({ currentLevel: 'COMPETENT' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/matrix/:id', () => {
  it('should soft delete a matrix entry', async () => {
    (prisma as any).trainMatrix.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).trainMatrix.update.mockResolvedValue({ id: '1' });
    const res = await request(app).delete('/api/matrix/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('deleted');
  });

  it('should return 404 if not found', async () => {
    (prisma as any).trainMatrix.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/matrix/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on delete error', async () => {
    (prisma as any).trainMatrix.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).trainMatrix.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/matrix/1');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
