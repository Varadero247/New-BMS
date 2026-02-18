import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsSvcSchedule: {
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

import schedulesRouter from '../src/routes/schedules';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/schedules', schedulesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/schedules', () => {
  it('should return schedules with pagination', async () => {
    const schedules = [{ id: '00000000-0000-0000-0000-000000000001', technicianId: 'tech-1', date: new Date(), slots: [], technician: {} }];
    (prisma as any).fsSvcSchedule.findMany.mockResolvedValue(schedules);
    (prisma as any).fsSvcSchedule.count.mockResolvedValue(1);

    const res = await request(app).get('/api/schedules');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by technicianId', async () => {
    (prisma as any).fsSvcSchedule.findMany.mockResolvedValue([]);
    (prisma as any).fsSvcSchedule.count.mockResolvedValue(0);

    await request(app).get('/api/schedules?technicianId=tech-1');

    expect((prisma as any).fsSvcSchedule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ technicianId: 'tech-1' }),
      })
    );
  });

  it('should filter by isAvailable', async () => {
    (prisma as any).fsSvcSchedule.findMany.mockResolvedValue([]);
    (prisma as any).fsSvcSchedule.count.mockResolvedValue(0);

    await request(app).get('/api/schedules?isAvailable=true');

    expect((prisma as any).fsSvcSchedule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isAvailable: true }),
      })
    );
  });

  it('should handle server errors', async () => {
    (prisma as any).fsSvcSchedule.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/schedules');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/schedules/calendar/:technicianId', () => {
  it('should return calendar view with schedules and jobs', async () => {
    (prisma as any).fsSvcTechnician.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', name: 'John' });
    (prisma as any).fsSvcSchedule.findMany.mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001', date: new Date() }]);
    (prisma as any).fsSvcJob.findMany.mockResolvedValue([{ id: 'job-1', title: 'Repair' }]);

    const res = await request(app).get('/api/schedules/calendar/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.technician.id).toBe('00000000-0000-0000-0000-000000000001');
    expect(res.body.data.schedules).toHaveLength(1);
    expect(res.body.data.jobs).toHaveLength(1);
  });

  it('should return 404 if technician not found', async () => {
    (prisma as any).fsSvcTechnician.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/schedules/calendar/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/schedules', () => {
  it('should create a schedule', async () => {
    const created = { id: 'sched-new', technicianId: 'tech-1', date: new Date(), slots: [] };
    (prisma as any).fsSvcSchedule.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/schedules')
      .send({
        technicianId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        date: '2026-02-13',
        slots: [{ start: '09:00', end: '17:00' }],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid data', async () => {
    const res = await request(app)
      .post('/api/schedules')
      .send({ slots: [] });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/schedules/:id', () => {
  it('should return a schedule by id', async () => {
    (prisma as any).fsSvcSchedule.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', slots: [], technician: {} });

    const res = await request(app).get('/api/schedules/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcSchedule.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/schedules/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/schedules/:id', () => {
  it('should update a schedule', async () => {
    (prisma as any).fsSvcSchedule.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsSvcSchedule.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', isAvailable: false });

    const res = await request(app)
      .put('/api/schedules/00000000-0000-0000-0000-000000000001')
      .send({ isAvailable: false });

    expect(res.status).toBe(200);
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcSchedule.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/schedules/00000000-0000-0000-0000-000000000099')
      .send({ isAvailable: false });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/schedules/:id', () => {
  it('should soft delete a schedule', async () => {
    (prisma as any).fsSvcSchedule.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsSvcSchedule.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: new Date() });

    const res = await request(app).delete('/api/schedules/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Schedule deleted');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcSchedule.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/schedules/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});
