import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { audProgramme: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/programmes';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/programmes', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/programmes', () => {
  it('should return programmes with pagination', async () => {
    (prisma as any).audProgramme.findMany.mockResolvedValue([{ id: '1', title: 'Annual Audit Programme 2026' }]);
    (prisma as any).audProgramme.count.mockResolvedValue(1);
    const res = await request(app).get('/api/programmes');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by status', async () => {
    (prisma as any).audProgramme.findMany.mockResolvedValue([]);
    (prisma as any).audProgramme.count.mockResolvedValue(0);
    const res = await request(app).get('/api/programmes?status=ACTIVE');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should filter by search term', async () => {
    (prisma as any).audProgramme.findMany.mockResolvedValue([{ id: '1', title: 'ISO Programme' }]);
    (prisma as any).audProgramme.count.mockResolvedValue(1);
    const res = await request(app).get('/api/programmes?search=ISO');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should support pagination parameters', async () => {
    (prisma as any).audProgramme.findMany.mockResolvedValue([]);
    (prisma as any).audProgramme.count.mockResolvedValue(0);
    const res = await request(app).get('/api/programmes?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).audProgramme.findMany.mockRejectedValue(new Error('DB error'));
    (prisma as any).audProgramme.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/programmes');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/programmes/:id', () => {
  it('should return programme by id', async () => {
    (prisma as any).audProgramme.findFirst.mockResolvedValue({ id: '1', title: 'Test Programme', year: 2026 });
    const res = await request(app).get('/api/programmes/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('1');
  });

  it('should return 404 when programme not found', async () => {
    (prisma as any).audProgramme.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/programmes/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).audProgramme.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/programmes/1');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/programmes', () => {
  it('should create a programme', async () => {
    (prisma as any).audProgramme.count.mockResolvedValue(0);
    (prisma as any).audProgramme.create.mockResolvedValue({
      id: 'new-1',
      title: 'Audit Programme 2026',
      year: 2026,
      referenceNumber: `APR-${new Date().getFullYear()}-0001`,
    });
    const res = await request(app).post('/api/programmes').send({
      title: 'Audit Programme 2026',
      year: 2026,
      description: 'Annual audit programme',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('new-1');
  });

  it('should return 400 on missing title', async () => {
    const res = await request(app).post('/api/programmes').send({ year: 2026 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 on missing year', async () => {
    const res = await request(app).post('/api/programmes').send({ title: 'Programme' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 on empty title', async () => {
    const res = await request(app).post('/api/programmes').send({ title: '', year: 2026 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 on database create error', async () => {
    (prisma as any).audProgramme.count.mockResolvedValue(0);
    (prisma as any).audProgramme.create.mockRejectedValue(new Error('Create failed'));
    const res = await request(app).post('/api/programmes').send({ title: 'Programme', year: 2026 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CREATE_ERROR');
  });
});

describe('PUT /api/programmes/:id', () => {
  it('should update a programme', async () => {
    (prisma as any).audProgramme.findFirst.mockResolvedValue({ id: '1', title: 'Old Programme', year: 2025 });
    (prisma as any).audProgramme.update.mockResolvedValue({ id: '1', title: 'Updated Programme', year: 2026 });
    const res = await request(app).put('/api/programmes/1').send({ title: 'Updated Programme', year: 2026 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated Programme');
  });

  it('should return 404 if programme not found', async () => {
    (prisma as any).audProgramme.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/programmes/nonexistent').send({ title: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on update error', async () => {
    (prisma as any).audProgramme.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).audProgramme.update.mockRejectedValue(new Error('Update failed'));
    const res = await request(app).put('/api/programmes/1').send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('DELETE /api/programmes/:id', () => {
  it('should soft-delete a programme', async () => {
    (prisma as any).audProgramme.findFirst.mockResolvedValue({ id: '1', title: 'To Delete' });
    (prisma as any).audProgramme.update.mockResolvedValue({ id: '1', deletedAt: new Date() });
    const res = await request(app).delete('/api/programmes/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('programme deleted successfully');
  });

  it('should return 404 if programme not found', async () => {
    (prisma as any).audProgramme.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/programmes/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on delete error', async () => {
    (prisma as any).audProgramme.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).audProgramme.update.mockRejectedValue(new Error('Delete failed'));
    const res = await request(app).delete('/api/programmes/1');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
