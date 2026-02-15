import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { trainCourse: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/courses';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/courses', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/courses', () => {
  it('should return courses', async () => {
    (prisma as any).trainCourse.findMany.mockResolvedValue([{ id: '1', title: 'Test' }]);
    (prisma as any).trainCourse.count.mockResolvedValue(1);
    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/courses/:id', () => {
  it('should return 404 if not found', async () => {
    (prisma as any).trainCourse.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/courses/nope');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    (prisma as any).trainCourse.findFirst.mockResolvedValue({ id: '1' });
    const res = await request(app).get('/api/courses/1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('1');
  });
});

describe('POST /api/courses', () => {
  it('should create', async () => {
    (prisma as any).trainCourse.count.mockResolvedValue(0);
    (prisma as any).trainCourse.create.mockResolvedValue({ id: '1', title: 'New' });
    const res = await request(app).post('/api/courses').send({ title: 'New' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/courses/:id', () => {
  it('should update', async () => {
    (prisma as any).trainCourse.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).trainCourse.update.mockResolvedValue({ id: '1', title: 'Updated' });
    const res = await request(app).put('/api/courses/1').send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/courses/:id', () => {
  it('should soft delete', async () => {
    (prisma as any).trainCourse.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).trainCourse.update.mockResolvedValue({ id: '1' });
    const res = await request(app).delete('/api/courses/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
