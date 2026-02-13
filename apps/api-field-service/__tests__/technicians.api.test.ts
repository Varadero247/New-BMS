import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsSvcTechnician: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    fsSvcJob: {
      findMany: jest.fn(),
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

import techniciansRouter from '../src/routes/technicians';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/technicians', techniciansRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/technicians', () => {
  it('should return a list of technicians with pagination', async () => {
    const technicians = [
      { id: 'tech-1', name: 'John Smith', email: 'john@test.com', status: 'AVAILABLE', skills: ['electrical'] },
      { id: 'tech-2', name: 'Jane Doe', email: 'jane@test.com', status: 'ON_JOB', skills: ['plumbing'] },
    ];
    (prisma as any).fsSvcTechnician.findMany.mockResolvedValue(technicians);
    (prisma as any).fsSvcTechnician.count.mockResolvedValue(2);

    const res = await request(app).get('/api/technicians');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by status', async () => {
    (prisma as any).fsSvcTechnician.findMany.mockResolvedValue([]);
    (prisma as any).fsSvcTechnician.count.mockResolvedValue(0);

    await request(app).get('/api/technicians?status=AVAILABLE');

    expect((prisma as any).fsSvcTechnician.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'AVAILABLE' }),
      })
    );
  });

  it('should filter by zone', async () => {
    (prisma as any).fsSvcTechnician.findMany.mockResolvedValue([]);
    (prisma as any).fsSvcTechnician.count.mockResolvedValue(0);

    await request(app).get('/api/technicians?zone=North');

    expect((prisma as any).fsSvcTechnician.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ zone: 'North' }),
      })
    );
  });

  it('should handle server errors', async () => {
    (prisma as any).fsSvcTechnician.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/technicians');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/technicians/available', () => {
  it('should return available technicians', async () => {
    const available = [{ id: 'tech-1', name: 'John', status: 'AVAILABLE' }];
    (prisma as any).fsSvcTechnician.findMany.mockResolvedValue(available);

    const res = await request(app).get('/api/technicians/available');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('POST /api/technicians', () => {
  it('should create a technician', async () => {
    const created = { id: 'tech-new', name: 'New Tech', email: 'new@test.com', skills: ['hvac'] };
    (prisma as any).fsSvcTechnician.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/technicians')
      .send({ name: 'New Tech', email: 'new@test.com', skills: ['hvac'] });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('New Tech');
  });

  it('should reject invalid data', async () => {
    const res = await request(app)
      .post('/api/technicians')
      .send({ name: '', email: 'not-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should handle duplicate email', async () => {
    const error: any = new Error('Unique constraint');
    error.code = 'P2002';
    (prisma as any).fsSvcTechnician.create.mockRejectedValue(error);

    const res = await request(app)
      .post('/api/technicians')
      .send({ name: 'Dup Tech', email: 'dup@test.com', skills: ['hvac'] });

    expect(res.status).toBe(409);
  });
});

describe('GET /api/technicians/:id', () => {
  it('should return a technician by id', async () => {
    const tech = { id: 'tech-1', name: 'John', jobs: [] };
    (prisma as any).fsSvcTechnician.findFirst.mockResolvedValue(tech);

    const res = await request(app).get('/api/technicians/tech-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('tech-1');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcTechnician.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/technicians/missing');

    expect(res.status).toBe(404);
  });
});

describe('GET /api/technicians/:id/schedule', () => {
  it('should return technician schedule', async () => {
    (prisma as any).fsSvcTechnician.findFirst.mockResolvedValue({ id: 'tech-1' });
    (prisma as any).fsSvcJob.findMany.mockResolvedValue([{ id: 'job-1', scheduledStart: new Date() }]);

    const res = await request(app).get('/api/technicians/tech-1/schedule');

    expect(res.status).toBe(200);
    expect(res.body.data.jobs).toHaveLength(1);
  });

  it('should return 404 if technician not found', async () => {
    (prisma as any).fsSvcTechnician.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/technicians/missing/schedule');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/technicians/:id', () => {
  it('should update a technician', async () => {
    (prisma as any).fsSvcTechnician.findFirst.mockResolvedValue({ id: 'tech-1' });
    (prisma as any).fsSvcTechnician.update.mockResolvedValue({ id: 'tech-1', name: 'Updated' });

    const res = await request(app)
      .put('/api/technicians/tech-1')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcTechnician.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/technicians/missing')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/technicians/:id', () => {
  it('should soft delete a technician', async () => {
    (prisma as any).fsSvcTechnician.findFirst.mockResolvedValue({ id: 'tech-1' });
    (prisma as any).fsSvcTechnician.update.mockResolvedValue({ id: 'tech-1', deletedAt: new Date() });

    const res = await request(app).delete('/api/technicians/tech-1');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Technician deleted');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcTechnician.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/technicians/missing');

    expect(res.status).toBe(404);
  });
});
