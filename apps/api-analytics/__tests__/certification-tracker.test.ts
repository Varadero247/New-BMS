import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    complianceDeadline: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: (_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', email: 'a@b.com' }; next(); },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import certificationsRouter from '../src/routes/certifications';
import { prisma } from '../src/prisma';
import { runCertificationTrackerJob } from '../src/jobs/certification-tracker.job';

const app = express();
app.use(express.json());
app.use('/api/certifications', certificationsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/certifications', () => {
  it('lists compliance deadlines with pagination', async () => {
    (prisma.complianceDeadline.findMany as jest.Mock).mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', name: 'SOC 2', category: 'COMPLIANCE', status: 'UPCOMING' },
    ]);
    (prisma.complianceDeadline.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/certifications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deadlines).toHaveLength(1);
    expect(res.body.data.pagination.total).toBe(1);
  });

  it('filters by status', async () => {
    (prisma.complianceDeadline.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.complianceDeadline.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/certifications?status=OVERDUE');
    expect(prisma.complianceDeadline.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'OVERDUE' }),
      })
    );
  });
});

describe('GET /api/certifications/seed', () => {
  it('seeds 5 compliance deadlines', async () => {
    (prisma.complianceDeadline.createMany as jest.Mock).mockResolvedValue({ count: 5 });

    const res = await request(app).get('/api/certifications/seed');
    expect(res.status).toBe(200);
    expect(res.body.data.created).toBe(5);
    expect(res.body.data.total).toBe(5);
  });
});

describe('GET /api/certifications/:id', () => {
  it('returns a single deadline', async () => {
    (prisma.complianceDeadline.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001', name: 'ISO 27001', category: 'COMPLIANCE', status: 'UPCOMING',
    });

    const res = await request(app).get('/api/certifications/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.deadline.name).toBe('ISO 27001');
  });

  it('returns 404 for missing deadline', async () => {
    (prisma.complianceDeadline.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/certifications/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/certifications', () => {
  it('creates a compliance deadline', async () => {
    (prisma.complianceDeadline.create as jest.Mock).mockResolvedValue({
      id: 'cd-new', name: 'GDPR Audit', category: 'COMPLIANCE', status: 'UPCOMING',
    });

    const res = await request(app).post('/api/certifications').send({
      name: 'GDPR Audit', category: 'COMPLIANCE', dueDate: '2026-12-01',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.deadline.name).toBe('GDPR Audit');
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app).post('/api/certifications').send({ name: 'Incomplete' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/certifications/:id', () => {
  it('updates deadline fields', async () => {
    (prisma.complianceDeadline.findUnique as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.complianceDeadline.update as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'COMPLETED' });

    const res = await request(app).patch('/api/certifications/00000000-0000-0000-0000-000000000001').send({ status: 'COMPLETED' });
    expect(res.status).toBe(200);
  });

  it('returns 404 for missing deadline', async () => {
    (prisma.complianceDeadline.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).patch('/api/certifications/00000000-0000-0000-0000-000000000099').send({ status: 'COMPLETED' });
    expect(res.status).toBe(404);
  });
});

describe('Certification tracker job', () => {
  it('marks overdue deadlines', async () => {
    const pastDate = new Date('2020-01-01');
    (prisma.complianceDeadline.findMany as jest.Mock).mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Overdue Cert', dueDate: pastDate, status: 'UPCOMING', lastCompletedAt: null },
    ]);
    (prisma.complianceDeadline.update as jest.Mock).mockResolvedValue({});

    await runCertificationTrackerJob();

    expect(prisma.complianceDeadline.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: { status: 'OVERDUE' },
      })
    );
  });

  it('marks deadlines due within 30 days as DUE_SOON', async () => {
    const soonDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    (prisma.complianceDeadline.findMany as jest.Mock).mockResolvedValue([
      { id: 'cd-2', name: 'Soon Cert', dueDate: soonDate, status: 'UPCOMING', lastCompletedAt: null },
    ]);
    (prisma.complianceDeadline.update as jest.Mock).mockResolvedValue({});

    await runCertificationTrackerJob();

    expect(prisma.complianceDeadline.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cd-2' },
        data: { status: 'DUE_SOON' },
      })
    );
  });

  it('marks deadlines with recent lastCompletedAt as COMPLETED', async () => {
    const futureDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const recentCompletion = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    (prisma.complianceDeadline.findMany as jest.Mock).mockResolvedValue([
      { id: 'cd-3', name: 'Done Cert', dueDate: futureDate, status: 'UPCOMING', lastCompletedAt: recentCompletion },
    ]);
    (prisma.complianceDeadline.update as jest.Mock).mockResolvedValue({});

    await runCertificationTrackerJob();

    expect(prisma.complianceDeadline.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cd-3' },
        data: { status: 'COMPLETED' },
      })
    );
  });
});
