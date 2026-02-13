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

const app = express();
app.use(express.json());
app.use('/api/time-entries', timeEntriesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/time-entries', () => {
  it('should return time entries with pagination', async () => {
    const entries = [{ id: 'te-1', type: 'WORK', duration: 2.5, job: {}, technician: {} }];
    (prisma as any).fsSvcTimeEntry.findMany.mockResolvedValue(entries);
    (prisma as any).fsSvcTimeEntry.count.mockResolvedValue(1);

    const res = await request(app).get('/api/time-entries');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by jobId', async () => {
    (prisma as any).fsSvcTimeEntry.findMany.mockResolvedValue([]);
    (prisma as any).fsSvcTimeEntry.count.mockResolvedValue(0);

    await request(app).get('/api/time-entries?jobId=job-1');

    expect((prisma as any).fsSvcTimeEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ jobId: 'job-1' }),
      })
    );
  });

  it('should filter by technicianId and type', async () => {
    (prisma as any).fsSvcTimeEntry.findMany.mockResolvedValue([]);
    (prisma as any).fsSvcTimeEntry.count.mockResolvedValue(0);

    await request(app).get('/api/time-entries?technicianId=tech-1&type=TRAVEL');

    expect((prisma as any).fsSvcTimeEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ technicianId: 'tech-1', type: 'TRAVEL' }),
      })
    );
  });
});

describe('GET /api/time-entries/summary', () => {
  it('should return hours summary by technician', async () => {
    const entries = [
      { technicianId: 'tech-1', type: 'WORK', duration: 4, billable: true, technician: { name: 'John' } },
      { technicianId: 'tech-1', type: 'TRAVEL', duration: 1, billable: false, technician: { name: 'John' } },
    ];
    (prisma as any).fsSvcTimeEntry.findMany.mockResolvedValue(entries);

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
    (prisma as any).fsSvcTimeEntry.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/time-entries')
      .send({
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
    const res = await request(app)
      .post('/api/time-entries')
      .send({ type: 'INVALID' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/time-entries/:id', () => {
  it('should return a time entry', async () => {
    (prisma as any).fsSvcTimeEntry.findFirst.mockResolvedValue({ id: 'te-1', type: 'WORK', job: {}, technician: {} });

    const res = await request(app).get('/api/time-entries/te-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('te-1');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcTimeEntry.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/time-entries/missing');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/time-entries/:id', () => {
  it('should update a time entry', async () => {
    (prisma as any).fsSvcTimeEntry.findFirst.mockResolvedValue({ id: 'te-1' });
    (prisma as any).fsSvcTimeEntry.update.mockResolvedValue({ id: 'te-1', type: 'TRAVEL' });

    const res = await request(app)
      .put('/api/time-entries/te-1')
      .send({ type: 'TRAVEL' });

    expect(res.status).toBe(200);
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcTimeEntry.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/time-entries/missing')
      .send({ type: 'TRAVEL' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/time-entries/:id', () => {
  it('should soft delete a time entry', async () => {
    (prisma as any).fsSvcTimeEntry.findFirst.mockResolvedValue({ id: 'te-1' });
    (prisma as any).fsSvcTimeEntry.update.mockResolvedValue({ id: 'te-1', deletedAt: new Date() });

    const res = await request(app).delete('/api/time-entries/te-1');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Time entry deleted');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcTimeEntry.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/time-entries/missing');

    expect(res.status).toBe(404);
  });
});
