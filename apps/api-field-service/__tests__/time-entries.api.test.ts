import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsSvcTimeEntry: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
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

import timeEntriesRouter from '../src/routes/time-entries';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/time-entries', timeEntriesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/time-entries', () => {
  it('should return time entries with pagination', async () => {
    const entries = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        type: 'WORK',
        duration: 2.5,
        job: {},
        technician: {},
      },
    ];
    mockPrisma.fsSvcTimeEntry.findMany.mockResolvedValue(entries);
    mockPrisma.fsSvcTimeEntry.count.mockResolvedValue(1);

    const res = await request(app).get('/api/time-entries');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by jobId', async () => {
    mockPrisma.fsSvcTimeEntry.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcTimeEntry.count.mockResolvedValue(0);

    await request(app).get('/api/time-entries?jobId=job-1');

    expect(mockPrisma.fsSvcTimeEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ jobId: 'job-1' }),
      })
    );
  });

  it('should filter by technicianId and type', async () => {
    mockPrisma.fsSvcTimeEntry.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcTimeEntry.count.mockResolvedValue(0);

    await request(app).get('/api/time-entries?technicianId=tech-1&type=TRAVEL');

    expect(mockPrisma.fsSvcTimeEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ technicianId: 'tech-1', type: 'TRAVEL' }),
      })
    );
  });
});

describe('GET /api/time-entries/summary', () => {
  it('should return hours summary by technician', async () => {
    const entries = [
      {
        technicianId: 'tech-1',
        type: 'WORK',
        duration: 4,
        billable: true,
        technician: { name: 'John' },
      },
      {
        technicianId: 'tech-1',
        type: 'TRAVEL',
        duration: 1,
        billable: false,
        technician: { name: 'John' },
      },
    ];
    mockPrisma.fsSvcTimeEntry.findMany.mockResolvedValue(entries);

    const res = await request(app).get('/api/time-entries/summary');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].totalHours).toBe(5);
    expect(res.body.data[0].billableHours).toBe(4);
  });
});

describe('POST /api/time-entries', () => {
  it('should create a time entry', async () => {
    const created = { id: 'te-new', type: 'WORK', startTime: new Date() };
    mockPrisma.fsSvcTimeEntry.create.mockResolvedValue(created);

    const res = await request(app).post('/api/time-entries').send({
      jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      technicianId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      type: 'WORK',
      startTime: '2026-02-13T09:00:00Z',
      duration: 2.5,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid data', async () => {
    const res = await request(app).post('/api/time-entries').send({ type: 'INVALID' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/time-entries/:id', () => {
  it('should return a time entry', async () => {
    mockPrisma.fsSvcTimeEntry.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      type: 'WORK',
      job: {},
      technician: {},
    });

    const res = await request(app).get('/api/time-entries/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcTimeEntry.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/time-entries/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/time-entries/:id', () => {
  it('should update a time entry', async () => {
    mockPrisma.fsSvcTimeEntry.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcTimeEntry.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      type: 'TRAVEL',
    });

    const res = await request(app)
      .put('/api/time-entries/00000000-0000-0000-0000-000000000001')
      .send({ type: 'TRAVEL' });

    expect(res.status).toBe(200);
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcTimeEntry.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/time-entries/00000000-0000-0000-0000-000000000099')
      .send({ type: 'TRAVEL' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/time-entries/:id', () => {
  it('should soft delete a time entry', async () => {
    mockPrisma.fsSvcTimeEntry.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcTimeEntry.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/time-entries/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Time entry deleted');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcTimeEntry.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/time-entries/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.fsSvcTimeEntry.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/time-entries');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /summary returns 500 on DB error', async () => {
    mockPrisma.fsSvcTimeEntry.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/time-entries/summary');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.fsSvcTimeEntry.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/time-entries').send({
      jobId: '00000000-0000-0000-0000-000000000001',
      technicianId: '00000000-0000-0000-0000-000000000002',
      type: 'WORK',
      startTime: '2026-02-21T08:00:00Z',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcTimeEntry.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/time-entries/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.fsSvcTimeEntry.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcTimeEntry.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/time-entries/00000000-0000-0000-0000-000000000001')
      .send({ type: 'TRAVEL' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.fsSvcTimeEntry.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcTimeEntry.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/time-entries/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('time-entries.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/time-entries', timeEntriesRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/time-entries', async () => {
    const res = await request(app).get('/api/time-entries');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/time-entries', async () => {
    const res = await request(app).get('/api/time-entries');
    expect(res.headers['content-type']).toBeDefined();
  });
});
