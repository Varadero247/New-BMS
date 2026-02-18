import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsSvcRoute: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    fsSvcTechnician: {
      findFirst: jest.fn(),
    },
    fsSvcJob: {
      findMany: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import routesRouter from '../src/routes/routes';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/routes', routesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/routes', () => {
  it('should return routes with pagination', async () => {
    const routes = [{ id: '00000000-0000-0000-0000-000000000001', technicianId: 'tech-1', stops: [], technician: {} }];
    (prisma as any).fsSvcRoute.findMany.mockResolvedValue(routes);
    (prisma as any).fsSvcRoute.count.mockResolvedValue(1);

    const res = await request(app).get('/api/routes');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by technicianId', async () => {
    (prisma as any).fsSvcRoute.findMany.mockResolvedValue([]);
    (prisma as any).fsSvcRoute.count.mockResolvedValue(0);

    await request(app).get('/api/routes?technicianId=tech-1');

    expect((prisma as any).fsSvcRoute.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ technicianId: 'tech-1' }),
      })
    );
  });

  it('should filter by status', async () => {
    (prisma as any).fsSvcRoute.findMany.mockResolvedValue([]);
    (prisma as any).fsSvcRoute.count.mockResolvedValue(0);

    await request(app).get('/api/routes?status=PLANNED');

    expect((prisma as any).fsSvcRoute.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PLANNED' }),
      })
    );
  });

  it('should handle server errors', async () => {
    (prisma as any).fsSvcRoute.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/routes');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/routes/optimize/:technicianId/:date', () => {
  it('should return optimized route for day', async () => {
    (prisma as any).fsSvcTechnician.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsSvcJob.findMany.mockResolvedValue([
      { id: 'job-1', number: 'JOB-001', scheduledStart: new Date(), site: { name: 'Site A', address: {} }, customer: { name: 'Acme' } },
    ]);

    const res = await request(app).get('/api/routes/optimize/00000000-0000-0000-0000-000000000001/2026-02-13');

    expect(res.status).toBe(200);
    expect(res.body.data.stops).toHaveLength(1);
    expect(res.body.data.totalStops).toBe(1);
  });

  it('should return 404 if technician not found', async () => {
    (prisma as any).fsSvcTechnician.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/routes/optimize/00000000-0000-0000-0000-000000000099/2026-02-13');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/routes', () => {
  it('should create a route', async () => {
    const created = { id: 'route-new', technicianId: 'tech-1', date: new Date(), stops: [] };
    (prisma as any).fsSvcRoute.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/routes')
      .send({
        technicianId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        date: '2026-02-13',
        stops: [{ jobId: 'job-1', order: 1 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid data', async () => {
    const res = await request(app)
      .post('/api/routes')
      .send({ stops: [] });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/routes/:id', () => {
  it('should return a route by id', async () => {
    (prisma as any).fsSvcRoute.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', stops: [], technician: {} });

    const res = await request(app).get('/api/routes/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcRoute.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/routes/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/routes/:id', () => {
  it('should update a route', async () => {
    (prisma as any).fsSvcRoute.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsSvcRoute.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'IN_PROGRESS' });

    const res = await request(app)
      .put('/api/routes/00000000-0000-0000-0000-000000000001')
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcRoute.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/routes/00000000-0000-0000-0000-000000000099')
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/routes/:id', () => {
  it('should soft delete a route', async () => {
    (prisma as any).fsSvcRoute.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsSvcRoute.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: new Date() });

    const res = await request(app).delete('/api/routes/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Route deleted');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcRoute.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/routes/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});
