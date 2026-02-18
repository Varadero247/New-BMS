import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { trainCompetency: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/competencies';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/competencies', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/competencies', () => {
  it('should return competencies', async () => {
    (prisma as any).trainCompetency.findMany.mockResolvedValue([{ id: '1', name: 'Safety Awareness' }]);
    (prisma as any).trainCompetency.count.mockResolvedValue(1);
    const res = await request(app).get('/api/competencies');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should support status and search filters', async () => {
    (prisma as any).trainCompetency.findMany.mockResolvedValue([]);
    (prisma as any).trainCompetency.count.mockResolvedValue(0);
    const res = await request(app).get('/api/competencies?status=ACTIVE&search=safety&page=2&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(5);
  });

  it('should return 500 on error', async () => {
    (prisma as any).trainCompetency.findMany.mockRejectedValue(new Error('DB error'));
    (prisma as any).trainCompetency.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/competencies');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/competencies/:id', () => {
  it('should return competency by id', async () => {
    (prisma as any).trainCompetency.findFirst.mockResolvedValue({ id: '1', name: 'Safety Awareness' });
    const res = await request(app).get('/api/competencies/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('1');
  });

  it('should return 404 if not found', async () => {
    (prisma as any).trainCompetency.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/competencies/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on error', async () => {
    (prisma as any).trainCompetency.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/competencies/1');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/competencies', () => {
  it('should create a competency', async () => {
    (prisma as any).trainCompetency.count.mockResolvedValue(0);
    (prisma as any).trainCompetency.create.mockResolvedValue({ id: '1', name: 'New Competency' });
    const res = await request(app).post('/api/competencies').send({ name: 'New Competency' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should create with all optional fields', async () => {
    (prisma as any).trainCompetency.count.mockResolvedValue(0);
    (prisma as any).trainCompetency.create.mockResolvedValue({ id: '2', name: 'Full Competency' });
    const res = await request(app).post('/api/competencies').send({
      name: 'Full Competency',
      description: 'A test competency',
      department: 'Operations',
      role: 'Manager',
      requiredLevel: 'COMPETENT',
      assessmentMethod: 'Practical',
      isActive: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 if name is missing', async () => {
    const res = await request(app).post('/api/competencies').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if requiredLevel is invalid', async () => {
    const res = await request(app).post('/api/competencies').send({ name: 'Test', requiredLevel: 'INVALID_LEVEL' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on create error', async () => {
    (prisma as any).trainCompetency.count.mockResolvedValue(0);
    (prisma as any).trainCompetency.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/competencies').send({ name: 'New' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/competencies/:id', () => {
  it('should update a competency', async () => {
    (prisma as any).trainCompetency.findFirst.mockResolvedValue({ id: '1', name: 'Old' });
    (prisma as any).trainCompetency.update.mockResolvedValue({ id: '1', name: 'Updated' });
    const res = await request(app).put('/api/competencies/1').send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma as any).trainCompetency.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/competencies/nope').send({ name: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 on invalid requiredLevel', async () => {
    const res = await request(app).put('/api/competencies/1').send({ requiredLevel: 'INVALID' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on update error', async () => {
    (prisma as any).trainCompetency.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).trainCompetency.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).put('/api/competencies/1').send({ name: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/competencies/:id', () => {
  it('should soft delete a competency', async () => {
    (prisma as any).trainCompetency.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).trainCompetency.update.mockResolvedValue({ id: '1' });
    const res = await request(app).delete('/api/competencies/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('deleted');
  });

  it('should return 404 if not found', async () => {
    (prisma as any).trainCompetency.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/competencies/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on delete error', async () => {
    (prisma as any).trainCompetency.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).trainCompetency.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/competencies/1');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
