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

const app = express();
app.use(express.json());
app.use('/api/jobs', jobsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/jobs', () => {
  it('should return jobs with pagination', async () => {
    const jobs = [
      { id: 'job-1', number: 'JOB-2602-1234', title: 'Repair', status: 'UNASSIGNED', customer: {}, site: {}, technician: null },
    ];
    (prisma as any).fsSvcJob.findMany.mockResolvedValue(jobs);
    (prisma as any).fsSvcJob.count.mockResolvedValue(1);

    const res = await request(app).get('/api/jobs');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    (prisma as any).fsSvcJob.findMany.mockResolvedValue([]);
    (prisma as any).fsSvcJob.count.mockResolvedValue(0);

    await request(app).get('/api/jobs?status=UNASSIGNED');

    expect((prisma as any).fsSvcJob.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'UNASSIGNED' }),
      })
    );
  });

  it('should filter by priority and type', async () => {
    (prisma as any).fsSvcJob.findMany.mockResolvedValue([]);
    (prisma as any).fsSvcJob.count.mockResolvedValue(0);

    await request(app).get('/api/jobs?priority=HIGH&type=REPAIR');

    expect((prisma as any).fsSvcJob.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ priority: 'HIGH', type: 'REPAIR' }),
      })
    );
  });

  it('should handle server errors', async () => {
    (prisma as any).fsSvcJob.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/jobs');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/jobs/dispatch-board', () => {
  it('should return jobs grouped by status', async () => {
    (prisma as any).fsSvcJob.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/jobs/dispatch-board');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('UNASSIGNED');
    expect(res.body.data).toHaveProperty('ASSIGNED');
  });
});

describe('GET /api/jobs/unassigned', () => {
  it('should return unassigned jobs', async () => {
    (prisma as any).fsSvcJob.findMany.mockResolvedValue([{ id: 'job-1', status: 'UNASSIGNED' }]);

    const res = await request(app).get('/api/jobs/unassigned');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('POST /api/jobs', () => {
  it('should create a job with generated number', async () => {
    const created = { id: 'job-new', number: 'JOB-2602-5678', title: 'Install AC', status: 'UNASSIGNED' };
    (prisma as any).fsSvcJob.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/jobs')
      .send({
        title: 'Install AC',
        customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        siteId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        type: 'INSTALLATION',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should set status to ASSIGNED if technicianId provided', async () => {
    (prisma as any).fsSvcJob.create.mockResolvedValue({ id: 'job-new', status: 'ASSIGNED' });

    await request(app)
      .post('/api/jobs')
      .send({
        title: 'Install AC',
        customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        siteId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        technicianId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        type: 'INSTALLATION',
      });

    expect((prisma as any).fsSvcJob.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'ASSIGNED' }),
      })
    );
  });

  it('should reject invalid data', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .send({ title: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/jobs/:id', () => {
  it('should return a job with relations', async () => {
    const job = { id: 'job-1', title: 'Repair', customer: {}, site: {}, technician: null, timeEntries: [], partsUsed: [], jobNotes: [] };
    (prisma as any).fsSvcJob.findFirst.mockResolvedValue(job);

    const res = await request(app).get('/api/jobs/job-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('job-1');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcJob.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/jobs/missing');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/jobs/:id/assign', () => {
  it('should assign a technician to a job', async () => {
    (prisma as any).fsSvcJob.findFirst.mockResolvedValue({ id: 'job-1', status: 'UNASSIGNED' });
    (prisma as any).fsSvcTechnician.findFirst.mockResolvedValue({ id: 'tech-1' });
    (prisma as any).fsSvcJob.update.mockResolvedValue({ id: 'job-1', status: 'ASSIGNED', technicianId: 'tech-1' });

    const res = await request(app)
      .put('/api/jobs/job-1/assign')
      .send({ technicianId: 'tech-1' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ASSIGNED');
  });

  it('should reject if no technicianId', async () => {
    (prisma as any).fsSvcJob.findFirst.mockResolvedValue({ id: 'job-1' });

    const res = await request(app)
      .put('/api/jobs/job-1/assign')
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 404 if technician not found', async () => {
    (prisma as any).fsSvcJob.findFirst.mockResolvedValue({ id: 'job-1' });
    (prisma as any).fsSvcTechnician.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/jobs/job-1/assign')
      .send({ technicianId: 'missing' });

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/jobs/:id/dispatch', () => {
  it('should dispatch an assigned job', async () => {
    (prisma as any).fsSvcJob.findFirst.mockResolvedValue({ id: 'job-1', technicianId: 'tech-1' });
    (prisma as any).fsSvcJob.update.mockResolvedValue({ id: 'job-1', status: 'ASSIGNED' });

    const res = await request(app).put('/api/jobs/job-1/dispatch');

    expect(res.status).toBe(200);
  });

  it('should reject if job has no technician', async () => {
    (prisma as any).fsSvcJob.findFirst.mockResolvedValue({ id: 'job-1', technicianId: null });

    const res = await request(app).put('/api/jobs/job-1/dispatch');

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/jobs/:id/en-route', () => {
  it('should set job status to EN_ROUTE', async () => {
    (prisma as any).fsSvcJob.findFirst.mockResolvedValue({ id: 'job-1' });
    (prisma as any).fsSvcJob.update.mockResolvedValue({ id: 'job-1', status: 'EN_ROUTE' });

    const res = await request(app).put('/api/jobs/job-1/en-route');

    expect(res.status).toBe(200);
  });
});

describe('PUT /api/jobs/:id/on-site', () => {
  it('should set job status to ON_SITE with timestamp', async () => {
    (prisma as any).fsSvcJob.findFirst.mockResolvedValue({ id: 'job-1' });
    (prisma as any).fsSvcJob.update.mockResolvedValue({ id: 'job-1', status: 'ON_SITE', actualStart: new Date() });

    const res = await request(app).put('/api/jobs/job-1/on-site');

    expect(res.status).toBe(200);
  });
});

describe('PUT /api/jobs/:id/complete', () => {
  it('should complete a job', async () => {
    (prisma as any).fsSvcJob.findFirst.mockResolvedValue({ id: 'job-1', notes: null });
    (prisma as any).fsSvcJob.update.mockResolvedValue({ id: 'job-1', status: 'COMPLETED', actualEnd: new Date() });

    const res = await request(app)
      .put('/api/jobs/job-1/complete')
      .send({ notes: 'All done' });

    expect(res.status).toBe(200);
  });
});

describe('PUT /api/jobs/:id/cancel', () => {
  it('should cancel a job', async () => {
    (prisma as any).fsSvcJob.findFirst.mockResolvedValue({ id: 'job-1', notes: '' });
    (prisma as any).fsSvcJob.update.mockResolvedValue({ id: 'job-1', status: 'CANCELLED' });

    const res = await request(app)
      .put('/api/jobs/job-1/cancel')
      .send({ reason: 'Customer cancelled' });

    expect(res.status).toBe(200);
  });
});

describe('PUT /api/jobs/:id', () => {
  it('should update a job', async () => {
    (prisma as any).fsSvcJob.findFirst.mockResolvedValue({ id: 'job-1' });
    (prisma as any).fsSvcJob.update.mockResolvedValue({ id: 'job-1', title: 'Updated' });

    const res = await request(app)
      .put('/api/jobs/job-1')
      .send({ title: 'Updated' });

    expect(res.status).toBe(200);
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcJob.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/jobs/missing')
      .send({ title: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/jobs/:id', () => {
  it('should soft delete a job', async () => {
    (prisma as any).fsSvcJob.findFirst.mockResolvedValue({ id: 'job-1' });
    (prisma as any).fsSvcJob.update.mockResolvedValue({ id: 'job-1', deletedAt: new Date() });

    const res = await request(app).delete('/api/jobs/job-1');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Job deleted');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcJob.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/jobs/missing');

    expect(res.status).toBe(404);
  });
});
