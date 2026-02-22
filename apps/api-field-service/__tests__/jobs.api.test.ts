import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsSvcJob: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    fsSvcTechnician: {
      findFirst: jest.fn(),
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

import jobsRouter from '../src/routes/jobs';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/jobs', jobsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/jobs', () => {
  it('should return jobs with pagination', async () => {
    const jobs = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        number: 'JOB-2602-1234',
        title: 'Repair',
        status: 'UNASSIGNED',
        customer: {},
        site: {},
        technician: null,
      },
    ];
    mockPrisma.fsSvcJob.findMany.mockResolvedValue(jobs);
    mockPrisma.fsSvcJob.count.mockResolvedValue(1);

    const res = await request(app).get('/api/jobs');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    mockPrisma.fsSvcJob.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcJob.count.mockResolvedValue(0);

    await request(app).get('/api/jobs?status=UNASSIGNED');

    expect(mockPrisma.fsSvcJob.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'UNASSIGNED' }),
      })
    );
  });

  it('should filter by priority and type', async () => {
    mockPrisma.fsSvcJob.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcJob.count.mockResolvedValue(0);

    await request(app).get('/api/jobs?priority=HIGH&type=REPAIR');

    expect(mockPrisma.fsSvcJob.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ priority: 'HIGH', type: 'REPAIR' }),
      })
    );
  });

  it('should handle server errors', async () => {
    mockPrisma.fsSvcJob.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/jobs');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/jobs/dispatch-board', () => {
  it('should return jobs grouped by status', async () => {
    mockPrisma.fsSvcJob.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/jobs/dispatch-board');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('UNASSIGNED');
    expect(res.body.data).toHaveProperty('ASSIGNED');
  });
});

describe('GET /api/jobs/unassigned', () => {
  it('should return unassigned jobs', async () => {
    mockPrisma.fsSvcJob.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', status: 'UNASSIGNED' },
    ]);

    const res = await request(app).get('/api/jobs/unassigned');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('POST /api/jobs', () => {
  it('should create a job with generated number', async () => {
    const created = {
      id: 'job-new',
      number: 'JOB-2602-5678',
      title: 'Install AC',
      status: 'UNASSIGNED',
    };
    mockPrisma.fsSvcJob.create.mockResolvedValue(created);

    const res = await request(app).post('/api/jobs').send({
      title: 'Install AC',
      customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      siteId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      type: 'INSTALLATION',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should set status to ASSIGNED if technicianId provided', async () => {
    mockPrisma.fsSvcJob.create.mockResolvedValue({ id: 'job-new', status: 'ASSIGNED' });

    await request(app).post('/api/jobs').send({
      title: 'Install AC',
      customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      siteId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      technicianId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      type: 'INSTALLATION',
    });

    expect(mockPrisma.fsSvcJob.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'ASSIGNED' }),
      })
    );
  });

  it('should reject invalid data', async () => {
    const res = await request(app).post('/api/jobs').send({ title: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/jobs/:id', () => {
  it('should return a job with relations', async () => {
    const job = {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Repair',
      customer: {},
      site: {},
      technician: null,
      timeEntries: [],
      partsUsed: [],
      jobNotes: [],
    };
    mockPrisma.fsSvcJob.findFirst.mockResolvedValue(job);

    const res = await request(app).get('/api/jobs/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcJob.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/jobs/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/jobs/:id/assign', () => {
  it('should assign a technician to a job', async () => {
    mockPrisma.fsSvcJob.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'UNASSIGNED',
    });
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue({ id: 'tech-1' });
    mockPrisma.fsSvcJob.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'ASSIGNED',
      technicianId: 'tech-1',
    });

    const res = await request(app)
      .put('/api/jobs/00000000-0000-0000-0000-000000000001/assign')
      .send({ technicianId: 'tech-1' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ASSIGNED');
  });

  it('should reject if no technicianId', async () => {
    mockPrisma.fsSvcJob.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app)
      .put('/api/jobs/00000000-0000-0000-0000-000000000001/assign')
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 404 if technician not found', async () => {
    mockPrisma.fsSvcJob.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcTechnician.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/jobs/00000000-0000-0000-0000-000000000001/assign')
      .send({ technicianId: 'missing' });

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/jobs/:id/dispatch', () => {
  it('should dispatch an assigned job', async () => {
    mockPrisma.fsSvcJob.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      technicianId: 'tech-1',
    });
    mockPrisma.fsSvcJob.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'ASSIGNED',
    });

    const res = await request(app).put('/api/jobs/00000000-0000-0000-0000-000000000001/dispatch');

    expect(res.status).toBe(200);
  });

  it('should reject if job has no technician', async () => {
    mockPrisma.fsSvcJob.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      technicianId: null,
    });

    const res = await request(app).put('/api/jobs/00000000-0000-0000-0000-000000000001/dispatch');

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/jobs/:id/en-route', () => {
  it('should set job status to EN_ROUTE', async () => {
    mockPrisma.fsSvcJob.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcJob.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'EN_ROUTE',
    });

    const res = await request(app).put('/api/jobs/00000000-0000-0000-0000-000000000001/en-route');

    expect(res.status).toBe(200);
  });
});

describe('PUT /api/jobs/:id/on-site', () => {
  it('should set job status to ON_SITE with timestamp', async () => {
    mockPrisma.fsSvcJob.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcJob.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'ON_SITE',
      actualStart: new Date(),
    });

    const res = await request(app).put('/api/jobs/00000000-0000-0000-0000-000000000001/on-site');

    expect(res.status).toBe(200);
  });
});

describe('PUT /api/jobs/:id/complete', () => {
  it('should complete a job', async () => {
    mockPrisma.fsSvcJob.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      notes: null,
    });
    mockPrisma.fsSvcJob.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'COMPLETED',
      actualEnd: new Date(),
    });

    const res = await request(app)
      .put('/api/jobs/00000000-0000-0000-0000-000000000001/complete')
      .send({ notes: 'All done' });

    expect(res.status).toBe(200);
  });
});

describe('PUT /api/jobs/:id/cancel', () => {
  it('should cancel a job', async () => {
    mockPrisma.fsSvcJob.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      notes: '',
    });
    mockPrisma.fsSvcJob.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'CANCELLED',
    });

    const res = await request(app)
      .put('/api/jobs/00000000-0000-0000-0000-000000000001/cancel')
      .send({ reason: 'Customer cancelled' });

    expect(res.status).toBe(200);
  });
});

describe('PUT /api/jobs/:id', () => {
  it('should update a job', async () => {
    mockPrisma.fsSvcJob.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcJob.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });

    const res = await request(app)
      .put('/api/jobs/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });

    expect(res.status).toBe(200);
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcJob.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/jobs/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/jobs/:id', () => {
  it('should soft delete a job', async () => {
    mockPrisma.fsSvcJob.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcJob.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/jobs/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Job deleted');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcJob.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/jobs/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.fsSvcJob.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.fsSvcJob.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/jobs').send({
      title: 'Install AC',
      customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      siteId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      type: 'INSTALLATION',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcJob.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcJob.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/jobs/00000000-0000-0000-0000-000000000001').send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Field Service Jobs — additional coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/jobs returns totalPages in pagination meta', async () => {
    mockPrisma.fsSvcJob.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcJob.count.mockResolvedValue(50);

    const res = await request(app).get('/api/jobs?page=1&limit=10');
    expect(res.status).toBe(200);
    const body = res.body;
    const totalPages =
      body.meta?.totalPages ?? body.pagination?.totalPages ?? body.totalPages;
    expect(totalPages).toBe(5);
  });

  it('GET /api/jobs response shape has success and data array', async () => {
    mockPrisma.fsSvcJob.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcJob.count.mockResolvedValue(0);

    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('DELETE /:id returns 500 when update throws', async () => {
    mockPrisma.fsSvcJob.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcJob.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/jobs/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
