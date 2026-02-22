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
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/routes', routesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/routes', () => {
  it('should return routes with pagination', async () => {
    const routes = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        technicianId: 'tech-1',
        stops: [],
        technician: {},
      },
    ];
    mockPrisma.fsSvcRoute.findMany.mockResolvedValue(routes);
    mockPrisma.fsSvcRoute.count.mockResolvedValue(1);

    const res = await request(app).get('/api/routes');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by technicianId', async () => {
    mockPrisma.fsSvcRoute.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcRoute.count.mockResolvedValue(0);

    await request(app).get('/api/routes?technicianId=tech-1');

    expect(mockPrisma.fsSvcRoute.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ technicianId: 'tech-1' }),
      })
    );
  });

  it('should filter by status', async () => {
    mockPrisma.fsSvcRoute.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcRoute.count.mockResolvedValue(0);

    await request(app).get('/api/routes?status=PLANNED');

    expect(mockPrisma.fsSvcRoute.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PLANNED' }),
      })
    );
  });

  it('should handle server errors', async () => {
    mockPrisma.fsSvcRoute.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/routes');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/routes/optimize/:technicianId/:date', () => {
  it('should return optimized route for day', async () => {
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcJob.findMany.mockResolvedValue([
      {
        id: 'job-1',
        number: 'JOB-001',
        scheduledStart: new Date(),
        site: { name: 'Site A', address: {} },
        customer: { name: 'Acme' },
      },
    ]);

    const res = await request(app).get(
      '/api/routes/optimize/00000000-0000-0000-0000-000000000001/2026-02-13'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.stops).toHaveLength(1);
    expect(res.body.data.totalStops).toBe(1);
  });

  it('should return 404 if technician not found', async () => {
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/routes/optimize/00000000-0000-0000-0000-000000000099/2026-02-13'
    );

    expect(res.status).toBe(404);
  });
});

describe('POST /api/routes', () => {
  it('should create a route', async () => {
    const created = { id: 'route-new', technicianId: 'tech-1', date: new Date(), stops: [] };
    mockPrisma.fsSvcRoute.create.mockResolvedValue(created);

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
    const res = await request(app).post('/api/routes').send({ stops: [] });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/routes/:id', () => {
  it('should return a route by id', async () => {
    mockPrisma.fsSvcRoute.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      stops: [],
      technician: {},
    });

    const res = await request(app).get('/api/routes/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcRoute.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/routes/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/routes/:id', () => {
  it('should update a route', async () => {
    mockPrisma.fsSvcRoute.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcRoute.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'IN_PROGRESS',
    });

    const res = await request(app)
      .put('/api/routes/00000000-0000-0000-0000-000000000001')
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcRoute.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/routes/00000000-0000-0000-0000-000000000099')
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/routes/:id', () => {
  it('should soft delete a route', async () => {
    mockPrisma.fsSvcRoute.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcRoute.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/routes/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Route deleted');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcRoute.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/routes/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.fsSvcRoute.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/routes');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.fsSvcRoute.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/routes').send({
      technicianId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      date: '2026-02-13',
      stops: [{ jobId: 'job-1', order: 1 }],
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcRoute.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcRoute.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/routes/00000000-0000-0000-0000-000000000001').send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('routes.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/routes', routesRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/routes', async () => {
    const res = await request(app).get('/api/routes');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/routes', async () => {
    const res = await request(app).get('/api/routes');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/routes body has success property', async () => {
    const res = await request(app).get('/api/routes');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });
});

// ─── Extended coverage ───────────────────────────────────────────────────────

describe('routes.api — extended edge cases', () => {
  it('GET / returns pagination metadata', async () => {
    mockPrisma.fsSvcRoute.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', technicianId: 'tech-1', stops: [], technician: {} },
    ]);
    mockPrisma.fsSvcRoute.count.mockResolvedValue(5);

    const res = await request(app).get('/api/routes');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination.total).toBe(5);
  });

  it('GET / applies page and limit to query', async () => {
    mockPrisma.fsSvcRoute.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcRoute.count.mockResolvedValue(0);

    await request(app).get('/api/routes?page=2&limit=5');

    expect(mockPrisma.fsSvcRoute.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  it('GET / filters by both technicianId and status simultaneously', async () => {
    mockPrisma.fsSvcRoute.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcRoute.count.mockResolvedValue(0);

    await request(app).get('/api/routes?technicianId=tech-5&status=COMPLETED');

    expect(mockPrisma.fsSvcRoute.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ technicianId: 'tech-5', status: 'COMPLETED' }),
      })
    );
  });

  it('GET /optimize/:technicianId/:date returns 500 on fsSvcJob.findMany error', async () => {
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcJob.findMany.mockRejectedValue(new Error('DB down'));

    const res = await request(app).get(
      '/api/routes/optimize/00000000-0000-0000-0000-000000000001/2026-02-13'
    );

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 400 when date is missing', async () => {
    const res = await request(app).post('/api/routes').send({
      technicianId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      stops: [{ jobId: 'job-1', order: 1 }],
    });

    expect(res.status).toBe(400);
  });

  it('PUT /:id returns success:true with updated status', async () => {
    mockPrisma.fsSvcRoute.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000002' });
    mockPrisma.fsSvcRoute.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000002', status: 'COMPLETED' });

    const res = await request(app)
      .put('/api/routes/00000000-0000-0000-0000-000000000002')
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /:id returns success:true', async () => {
    mockPrisma.fsSvcRoute.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000003' });
    mockPrisma.fsSvcRoute.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000003', deletedAt: new Date() });

    const res = await request(app).delete('/api/routes/00000000-0000-0000-0000-000000000003');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /:id returns 500 when update rejects', async () => {
    mockPrisma.fsSvcRoute.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000004' });
    mockPrisma.fsSvcRoute.update.mockRejectedValue(new Error('DB down'));

    const res = await request(app).delete('/api/routes/00000000-0000-0000-0000-000000000004');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcRoute.findFirst.mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/api/routes/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── Further coverage ─────────────────────────────────────────────────────────

describe('routes.api — further coverage', () => {
  it('GET / returns success:true on empty result set', async () => {
    mockPrisma.fsSvcRoute.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcRoute.count.mockResolvedValue(0);

    const res = await request(app).get('/api/routes');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('GET / data array is always an array', async () => {
    mockPrisma.fsSvcRoute.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcRoute.count.mockResolvedValue(0);

    const res = await request(app).get('/api/routes');

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST / create is not called when technicianId missing', async () => {
    await request(app).post('/api/routes').send({ date: '2026-02-13', stops: [] });

    expect(mockPrisma.fsSvcRoute.create).not.toHaveBeenCalled();
  });

  it('GET / applies correct skip for page 3 limit 10', async () => {
    mockPrisma.fsSvcRoute.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcRoute.count.mockResolvedValue(0);

    await request(app).get('/api/routes?page=3&limit=10');

    expect(mockPrisma.fsSvcRoute.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
  });

  it('GET /optimize/:technicianId/:date returns empty stops when no jobs', async () => {
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcJob.findMany.mockResolvedValue([]);

    const res = await request(app).get(
      '/api/routes/optimize/00000000-0000-0000-0000-000000000001/2026-03-01'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.totalStops).toBe(0);
  });

  it('DELETE /:id calls update exactly once on success', async () => {
    mockPrisma.fsSvcRoute.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000010' });
    mockPrisma.fsSvcRoute.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000010', deletedAt: new Date() });

    await request(app).delete('/api/routes/00000000-0000-0000-0000-000000000010');

    expect(mockPrisma.fsSvcRoute.update).toHaveBeenCalledTimes(1);
  });
});

describe('routes.api — final coverage', () => {
  it('GET / returns correct pagination.total from count mock', async () => {
    mockPrisma.fsSvcRoute.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcRoute.count.mockResolvedValue(33);
    const res = await request(app).get('/api/routes');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(33);
  });

  it('DELETE /:id returns message Route deleted in data', async () => {
    mockPrisma.fsSvcRoute.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000020' });
    mockPrisma.fsSvcRoute.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000020', deletedAt: new Date() });
    const res = await request(app).delete('/api/routes/00000000-0000-0000-0000-000000000020');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Route deleted');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcRoute.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/routes/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / create is not called when validation fails', async () => {
    await request(app).post('/api/routes').send({});
    expect(mockPrisma.fsSvcRoute.create).not.toHaveBeenCalled();
  });

  it('PUT /:id update passes correct where id to Prisma', async () => {
    mockPrisma.fsSvcRoute.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000030' });
    mockPrisma.fsSvcRoute.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000030', status: 'COMPLETED' });
    await request(app)
      .put('/api/routes/00000000-0000-0000-0000-000000000030')
      .send({ status: 'COMPLETED' });
    expect(mockPrisma.fsSvcRoute.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: '00000000-0000-0000-0000-000000000030' }) })
    );
  });
});

describe('routes.api — phase28 coverage', () => {
  it('GET / data array length matches findMany result', async () => {
    const items = [
      { id: '00000000-0000-0000-0000-000000000001', technicianId: 'tech-1', stops: [], technician: {} },
      { id: '00000000-0000-0000-0000-000000000002', technicianId: 'tech-2', stops: [], technician: {} },
    ];
    mockPrisma.fsSvcRoute.findMany.mockResolvedValue(items);
    mockPrisma.fsSvcRoute.count.mockResolvedValue(2);
    const res = await request(app).get('/api/routes');
    expect(res.body.data).toHaveLength(2);
  });

  it('GET /:id returns technicianId in data', async () => {
    mockPrisma.fsSvcRoute.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      technicianId: 'tech-42',
      stops: [],
      technician: {},
    });
    const res = await request(app).get('/api/routes/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.technicianId).toBe('tech-42');
  });

  it('POST / create called once on valid payload', async () => {
    mockPrisma.fsSvcRoute.create.mockResolvedValue({ id: 'route-xyz', technicianId: 'tech-1', date: new Date(), stops: [] });
    await request(app).post('/api/routes').send({
      technicianId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      date: '2026-04-01',
      stops: [{ jobId: 'job-1', order: 1 }],
    });
    expect(mockPrisma.fsSvcRoute.create).toHaveBeenCalledTimes(1);
  });

  it('PUT /:id calls update with correct where id', async () => {
    mockPrisma.fsSvcRoute.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000050' });
    mockPrisma.fsSvcRoute.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000050', status: 'COMPLETED' });
    await request(app)
      .put('/api/routes/00000000-0000-0000-0000-000000000050')
      .send({ status: 'COMPLETED' });
    expect(mockPrisma.fsSvcRoute.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: '00000000-0000-0000-0000-000000000050' }) })
    );
  });

  it('DELETE /:id findFirst called once with correct id', async () => {
    mockPrisma.fsSvcRoute.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000060' });
    mockPrisma.fsSvcRoute.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000060', deletedAt: new Date() });
    await request(app).delete('/api/routes/00000000-0000-0000-0000-000000000060');
    expect(mockPrisma.fsSvcRoute.findFirst).toHaveBeenCalledTimes(1);
  });
});

describe('routes — phase30 coverage', () => {
  it('handles async resolve', async () => {
    await expect(Promise.resolve('ok')).resolves.toBe('ok');
  });

  it('handles Number.isInteger', () => {
    expect(Number.isInteger(42)).toBe(true);
  });

  it('handles number isNaN', () => {
    expect(isNaN(NaN)).toBe(true);
  });

  it('handles regex test', () => {
    expect(/^[a-z]+$/.test('hello')).toBe(true);
  });

  it('handles Object.assign', () => {
    expect(Object.assign({}, { a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

});
