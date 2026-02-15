import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    monthlySnapshot: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    planTarget: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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

jest.mock('../src/jobs/monthly-snapshot.job', () => ({
  runMonthlySnapshot: jest.fn().mockResolvedValue('snap-new-001'),
}));

import monthlyReviewRouter from '../src/routes/monthly-review';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/monthly-review', monthlyReviewRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/monthly-review', () => {
  it('lists snapshots with pagination', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([
      { id: 'snap-1', month: '2026-03', monthNumber: 1, mrr: 0, trajectory: null },
    ]);
    (prisma.monthlySnapshot.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/monthly-review');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.snapshots).toHaveLength(1);
    expect(res.body.data.pagination.total).toBe(1);
  });

  it('handles pagination params', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.monthlySnapshot.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/monthly-review?page=2&limit=5');
    expect(res.status).toBe(200);
    expect(prisma.monthlySnapshot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });
});

describe('GET /api/monthly-review/:snapshotId', () => {
  it('returns snapshot with plan target', async () => {
    (prisma.monthlySnapshot.findUnique as jest.Mock).mockResolvedValue({
      id: 'snap-1', month: '2026-03', monthNumber: 1, mrr: 500,
    });
    (prisma.planTarget.findUnique as jest.Mock).mockResolvedValue({
      month: '2026-03', plannedMrr: 0, plannedCustomers: 0,
    });

    const res = await request(app).get('/api/monthly-review/snap-1');
    expect(res.status).toBe(200);
    expect(res.body.data.snapshot.id).toBe('snap-1');
    expect(res.body.data.planTarget).toBeDefined();
  });

  it('returns 404 for missing snapshot', async () => {
    (prisma.monthlySnapshot.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/monthly-review/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/monthly-review/:snapshotId/approve', () => {
  const mockSnapshot = {
    id: 'snap-1', month: '2026-05', monthNumber: 3,
    targetsApproved: false,
    aiRecommendations: [{ metric: 'MRR', current: 1500, suggested: 2800, rationale: 'test' }],
  };

  it('approves with default AI targets', async () => {
    (prisma.monthlySnapshot.findUnique as jest.Mock).mockResolvedValue(mockSnapshot);
    (prisma.monthlySnapshot.update as jest.Mock).mockResolvedValue({ ...mockSnapshot, targetsApproved: true });
    (prisma.planTarget.findMany as jest.Mock).mockResolvedValue([
      { id: 'pt-4', monthNumber: 4, plannedMrr: 3000 },
    ]);
    (prisma.planTarget.update as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post('/api/monthly-review/snap-1/approve')
      .send({ action: 'approve' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(prisma.monthlySnapshot.update).toHaveBeenCalled();
    expect(prisma.planTarget.update).toHaveBeenCalled();
  });

  it('approves with custom overrides', async () => {
    (prisma.monthlySnapshot.findUnique as jest.Mock).mockResolvedValue(mockSnapshot);
    (prisma.monthlySnapshot.update as jest.Mock).mockResolvedValue({ ...mockSnapshot, targetsApproved: true });
    (prisma.planTarget.findFirst as jest.Mock).mockResolvedValue({ id: 'pt-4', monthNumber: 4 });
    (prisma.planTarget.update as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post('/api/monthly-review/snap-1/approve')
      .send({ action: 'override', overrides: { revisedMrr: 4000, revisedCustomers: 12 } });
    expect(res.status).toBe(200);
    expect(prisma.planTarget.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ revisedMrr: 4000, revisedCustomers: 12 }),
      })
    );
  });

  it('keeps original targets', async () => {
    (prisma.monthlySnapshot.findUnique as jest.Mock).mockResolvedValue(mockSnapshot);
    (prisma.monthlySnapshot.update as jest.Mock).mockResolvedValue({ ...mockSnapshot, targetsApproved: true });

    const res = await request(app)
      .post('/api/monthly-review/snap-1/approve')
      .send({ action: 'keep-original' });
    expect(res.status).toBe(200);
    expect(prisma.planTarget.update).not.toHaveBeenCalled();
  });

  it('is idempotent — double approve returns success', async () => {
    (prisma.monthlySnapshot.findUnique as jest.Mock).mockResolvedValue({
      ...mockSnapshot, targetsApproved: true,
    });

    const res = await request(app)
      .post('/api/monthly-review/snap-1/approve')
      .send({ action: 'approve' });
    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Already approved');
    expect(prisma.monthlySnapshot.update).not.toHaveBeenCalled();
  });

  it('returns 404 for missing snapshot', async () => {
    (prisma.monthlySnapshot.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/monthly-review/nonexistent/approve')
      .send({ action: 'approve' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid action', async () => {
    const res = await request(app)
      .post('/api/monthly-review/snap-1/approve')
      .send({ action: 'invalid-action' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/monthly-review/trigger', () => {
  it('triggers a manual snapshot', async () => {
    const res = await request(app).post('/api/monthly-review/trigger').send({});
    expect(res.status).toBe(200);
    expect(res.body.data.snapshotId).toBe('snap-new-001');
  });
});

describe('POST /api/monthly-review/seed-targets', () => {
  it('seeds plan targets', async () => {
    (prisma.planTarget.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.planTarget.create as jest.Mock).mockResolvedValue({});

    const res = await request(app).post('/api/monthly-review/seed-targets').send({});
    expect(res.status).toBe(200);
    expect(res.body.data.created).toBe(36);
    expect(res.body.data.skipped).toBe(0);
  });

  it('skips existing targets', async () => {
    (prisma.planTarget.findUnique as jest.Mock).mockResolvedValue({ id: 'existing' });

    const res = await request(app).post('/api/monthly-review/seed-targets').send({});
    expect(res.status).toBe(200);
    expect(res.body.data.created).toBe(0);
    expect(res.body.data.skipped).toBe(36);
  });
});
