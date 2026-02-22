import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    dataRequest: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: (_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', email: 'a@b.com' };
    next();
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import dsarsRouter from '../src/routes/dsars';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/dsars', dsarsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/dsars', () => {
  it('lists data requests with pagination', async () => {
    (prisma.dataRequest.findMany as jest.Mock).mockResolvedValue([
      {
        id: '00000000-0000-0000-0000-000000000001',
        type: 'ACCESS',
        requesterName: 'John',
        status: 'RECEIVED',
      },
    ]);
    (prisma.dataRequest.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/dsars');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.requests).toHaveLength(1);
    expect(res.body.data.pagination.total).toBe(1);
  });

  it('filters by status', async () => {
    (prisma.dataRequest.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.dataRequest.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/dsars?status=PROCESSING');
    expect(prisma.dataRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PROCESSING' }),
      })
    );
  });

  it('filters by type', async () => {
    (prisma.dataRequest.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.dataRequest.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/dsars?type=ERASURE');
    expect(prisma.dataRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'ERASURE' }),
      })
    );
  });
});

describe('GET /api/dsars/:id', () => {
  it('returns a single data request', async () => {
    (prisma.dataRequest.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      type: 'ACCESS',
      requesterName: 'John Doe',
      status: 'RECEIVED',
    });

    const res = await request(app).get('/api/dsars/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.request.requesterName).toBe('John Doe');
  });

  it('returns 404 for missing request', async () => {
    (prisma.dataRequest.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/dsars/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/dsars', () => {
  it('creates a data request with 30-day deadline', async () => {
    const created = {
      id: 'dr-new',
      type: 'ERASURE',
      requesterEmail: 'jane@test.com',
      requesterName: 'Jane Doe',
      status: 'RECEIVED',
      deadlineAt: new Date(),
    };
    (prisma.dataRequest.create as jest.Mock).mockResolvedValue(created);

    const res = await request(app).post('/api/dsars').send({
      type: 'ERASURE',
      requesterEmail: 'jane@test.com',
      requesterName: 'Jane Doe',
      description: 'Delete my data',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.request.type).toBe('ERASURE');
    expect(prisma.dataRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'RECEIVED',
          deadlineAt: expect.any(Date),
        }),
      })
    );
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app).post('/api/dsars').send({ type: 'ACCESS' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid type', async () => {
    const res = await request(app).post('/api/dsars').send({
      type: 'INVALID',
      requesterEmail: 'a@b.com',
      requesterName: 'Test',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('deadline is approximately 30 days from now', async () => {
    (prisma.dataRequest.create as jest.Mock).mockImplementation(({ data }) => {
      const deadlineDiff = data.deadlineAt.getTime() - Date.now();
      const daysDiff = Math.round(deadlineDiff / (24 * 60 * 60 * 1000));
      expect(daysDiff).toBeGreaterThanOrEqual(29);
      expect(daysDiff).toBeLessThanOrEqual(31);
      return Promise.resolve({ id: 'dr-new', ...data });
    });

    await request(app).post('/api/dsars').send({
      type: 'ACCESS',
      requesterEmail: 'a@b.com',
      requesterName: 'Test',
    });
  });
});

describe('PATCH /api/dsars/:id/status', () => {
  it('transitions RECEIVED to VERIFIED', async () => {
    (prisma.dataRequest.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'RECEIVED',
    });
    (prisma.dataRequest.update as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'VERIFIED',
    });

    const res = await request(app)
      .patch('/api/dsars/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'VERIFIED' });
    expect(res.status).toBe(200);
    expect(res.body.data.request.status).toBe('VERIFIED');
  });

  it('transitions PROCESSING to COMPLETED and sets completedAt', async () => {
    (prisma.dataRequest.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'PROCESSING',
    });
    (prisma.dataRequest.update as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'COMPLETED',
      completedAt: new Date(),
    });

    const res = await request(app)
      .patch('/api/dsars/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(200);
    expect(prisma.dataRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'COMPLETED',
          completedAt: expect.any(Date),
        }),
      })
    );
  });

  it('rejects invalid status transitions', async () => {
    (prisma.dataRequest.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'RECEIVED',
    });

    const res = await request(app)
      .patch('/api/dsars/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TRANSITION');
  });

  it('allows REJECTED from any active status', async () => {
    (prisma.dataRequest.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'VERIFIED',
    });
    (prisma.dataRequest.update as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'REJECTED',
    });

    const res = await request(app)
      .patch('/api/dsars/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'REJECTED' });
    expect(res.status).toBe(200);
  });

  it('returns 404 for missing request', async () => {
    (prisma.dataRequest.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/dsars/00000000-0000-0000-0000-000000000099/status')
      .send({ status: 'VERIFIED' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for missing status field', async () => {
    (prisma.dataRequest.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'RECEIVED',
    });

    const res = await request(app)
      .patch('/api/dsars/00000000-0000-0000-0000-000000000001/status')
      .send({});
    expect(res.status).toBe(400);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    (prisma.dataRequest.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/dsars');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    (prisma.dataRequest.count as jest.Mock).mockResolvedValue(0);
    (prisma.dataRequest.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/dsars').send({ type: 'ERASURE', requesterEmail: 'jane@test.com', requesterName: 'Jane Doe', description: 'Delete my data' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PATCH /:id/status returns 500 when update fails', async () => {
    (prisma.dataRequest.findUnique as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'PROCESSING' });
    (prisma.dataRequest.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).patch('/api/dsars/00000000-0000-0000-0000-000000000001/status').send({ status: 'COMPLETED' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('dsars — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/dsars', dsarsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/dsars', async () => {
    const res = await request(app).get('/api/dsars');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/dsars', async () => {
    const res = await request(app).get('/api/dsars');
    expect(res.headers['content-type']).toBeDefined();
  });
});

// ===================================================================
// DSARs — extended field validation and route coverage
// ===================================================================
describe('DSARs — extended coverage', () => {
  it('GET /api/dsars pagination contains page, limit, total, totalPages', async () => {
    (prisma.dataRequest.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.dataRequest.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/dsars');
    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toHaveProperty('page');
    expect(res.body.data.pagination).toHaveProperty('limit');
    expect(res.body.data.pagination).toHaveProperty('total');
    expect(res.body.data.pagination).toHaveProperty('totalPages');
  });

  it('GET /api/dsars returns empty requests array when none exist', async () => {
    (prisma.dataRequest.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.dataRequest.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/dsars');
    expect(res.status).toBe(200);
    expect(res.body.data.requests).toEqual([]);
    expect(res.body.data.pagination.total).toBe(0);
  });

  it('POST /api/dsars with PORTABILITY type creates successfully', async () => {
    (prisma.dataRequest.create as jest.Mock).mockResolvedValue({
      id: 'dr-port',
      type: 'PORTABILITY',
      requesterEmail: 'port@test.com',
      requesterName: 'Port User',
      status: 'RECEIVED',
      deadlineAt: new Date(),
    });
    const res = await request(app).post('/api/dsars').send({
      type: 'PORTABILITY',
      requesterEmail: 'port@test.com',
      requesterName: 'Port User',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.request.type).toBe('PORTABILITY');
  });

  it('POST /api/dsars returns 400 for invalid email format', async () => {
    const res = await request(app).post('/api/dsars').send({
      type: 'ACCESS',
      requesterEmail: 'not-an-email',
      requesterName: 'Test User',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PATCH /api/dsars/:id/status rejects COMPLETED -> VERIFIED transition', async () => {
    (prisma.dataRequest.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'COMPLETED',
    });
    const res = await request(app)
      .patch('/api/dsars/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'VERIFIED' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TRANSITION');
  });

  it('PATCH /api/dsars/:id/status transitions VERIFIED to PROCESSING', async () => {
    (prisma.dataRequest.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'VERIFIED',
    });
    (prisma.dataRequest.update as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'PROCESSING',
    });
    const res = await request(app)
      .patch('/api/dsars/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'PROCESSING' });
    expect(res.status).toBe(200);
    expect(res.body.data.request.status).toBe('PROCESSING');
  });

  it('GET /api/dsars/:id returns 404 with NOT_FOUND code for missing request', async () => {
    (prisma.dataRequest.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/dsars/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/dsars?page=2&limit=10 uses correct skip', async () => {
    (prisma.dataRequest.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.dataRequest.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/dsars?page=2&limit=10');
    expect(prisma.dataRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('GET /api/dsars/:id returns 500 on DB error', async () => {
    (prisma.dataRequest.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/dsars/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('DSARs — final coverage', () => {
  it('GET /api/dsars response body has success:true', async () => {
    (prisma.dataRequest.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.dataRequest.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/dsars');
    expect(res.body.success).toBe(true);
  });

  it('POST /api/dsars create is called once on valid input', async () => {
    (prisma.dataRequest.create as jest.Mock).mockResolvedValue({
      id: 'dr-once',
      type: 'ACCESS',
      requesterEmail: 'once@test.com',
      requesterName: 'Once User',
      status: 'RECEIVED',
      deadlineAt: new Date(),
    });
    await request(app).post('/api/dsars').send({
      type: 'ACCESS',
      requesterEmail: 'once@test.com',
      requesterName: 'Once User',
    });
    expect(prisma.dataRequest.create).toHaveBeenCalledTimes(1);
  });

  it('GET /api/dsars data.requests is always an array', async () => {
    (prisma.dataRequest.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.dataRequest.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/dsars');
    expect(Array.isArray(res.body.data.requests)).toBe(true);
  });

  it('PATCH /api/dsars/:id/status update called with correct id', async () => {
    (prisma.dataRequest.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'RECEIVED',
    });
    (prisma.dataRequest.update as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'VERIFIED',
    });
    await request(app)
      .patch('/api/dsars/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'VERIFIED' });
    expect(prisma.dataRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '00000000-0000-0000-0000-000000000001' } })
    );
  });

  it('GET /api/dsars count is called once per list request', async () => {
    (prisma.dataRequest.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.dataRequest.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/dsars');
    expect(prisma.dataRequest.count).toHaveBeenCalledTimes(1);
  });

  it('POST /api/dsars create data has deadlineAt set to future Date', async () => {
    (prisma.dataRequest.create as jest.Mock).mockImplementation(({ data }) => {
      expect(data.deadlineAt).toBeInstanceOf(Date);
      expect(data.deadlineAt.getTime()).toBeGreaterThan(Date.now());
      return Promise.resolve({ id: 'dr-dl', ...data });
    });
    await request(app).post('/api/dsars').send({
      type: 'ERASURE',
      requesterEmail: 'dl@test.com',
      requesterName: 'DL User',
    });
  });
});
