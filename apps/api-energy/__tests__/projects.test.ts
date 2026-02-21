import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    energyProject: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-4000-a000-000000000123',
      email: 'test@test.com',
      role: 'ADMIN',
    };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import projectsRouter from '../src/routes/projects';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/projects', projectsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/projects', () => {
  it('should return paginated projects', async () => {
    (prisma.energyProject.findMany as jest.Mock).mockResolvedValue([
      { id: 'eb000000-0000-4000-a000-000000000001', title: 'LED Upgrade' },
    ]);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/projects');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by type', async () => {
    (prisma.energyProject.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/projects?type=EFFICIENCY');

    expect(prisma.energyProject.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'EFFICIENCY' }),
      })
    );
  });

  it('should filter by status', async () => {
    (prisma.energyProject.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/projects?status=IN_PROGRESS');

    expect(prisma.energyProject.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'IN_PROGRESS' }),
      })
    );
  });

  it('should handle errors', async () => {
    (prisma.energyProject.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
    (prisma.energyProject.count as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/projects', () => {
  const validBody = {
    title: 'LED Lighting Upgrade',
    type: 'EFFICIENCY',
    estimatedSavings: 12000,
    investmentCost: 25000,
    paybackMonths: 24,
  };

  it('should create a project', async () => {
    (prisma.energyProject.create as jest.Mock).mockResolvedValue({
      id: 'new-id',
      ...validBody,
      status: 'PROPOSED',
    });

    const res = await request(app).post('/api/projects').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('LED Lighting Upgrade');
  });

  it('should reject invalid body', async () => {
    const res = await request(app).post('/api/projects').send({ title: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/projects/:id', () => {
  it('should return a project', async () => {
    (prisma.energyProject.findFirst as jest.Mock).mockResolvedValue({
      id: 'eb000000-0000-4000-a000-000000000001',
      title: 'Project 1',
    });

    const res = await request(app).get('/api/projects/eb000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('eb000000-0000-4000-a000-000000000001');
  });

  it('should return 404 if not found', async () => {
    (prisma.energyProject.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/projects/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/projects/:id', () => {
  it('should update a project', async () => {
    (prisma.energyProject.findFirst as jest.Mock).mockResolvedValue({
      id: 'eb000000-0000-4000-a000-000000000001',
    });
    (prisma.energyProject.update as jest.Mock).mockResolvedValue({
      id: 'eb000000-0000-4000-a000-000000000001',
      title: 'Updated',
    });

    const res = await request(app)
      .put('/api/projects/eb000000-0000-4000-a000-000000000001')
      .send({ title: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated');
  });

  it('should return 404 if not found', async () => {
    (prisma.energyProject.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/projects/00000000-0000-0000-0000-000000000099')
      .send({ title: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/projects/:id', () => {
  it('should soft delete a project', async () => {
    (prisma.energyProject.findFirst as jest.Mock).mockResolvedValue({
      id: 'eb000000-0000-4000-a000-000000000001',
    });
    (prisma.energyProject.update as jest.Mock).mockResolvedValue({
      id: 'eb000000-0000-4000-a000-000000000001',
    });

    const res = await request(app).delete('/api/projects/eb000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyProject.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/projects/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/projects/:id/complete', () => {
  it('should complete a project', async () => {
    (prisma.energyProject.findFirst as jest.Mock).mockResolvedValue({
      id: 'eb000000-0000-4000-a000-000000000001',
      status: 'IN_PROGRESS',
      investmentCost: 25000,
      estimatedSavings: 30000,
    });
    (prisma.energyProject.update as jest.Mock).mockResolvedValue({
      id: 'eb000000-0000-4000-a000-000000000001',
      status: 'COMPLETED',
    });

    const res = await request(app)
      .put('/api/projects/eb000000-0000-4000-a000-000000000001/complete')
      .send({ actualSavings: 28000 });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });

  it('should reject if already completed', async () => {
    (prisma.energyProject.findFirst as jest.Mock).mockResolvedValue({
      id: 'eb000000-0000-4000-a000-000000000001',
      status: 'COMPLETED',
    });

    const res = await request(app).put(
      '/api/projects/eb000000-0000-4000-a000-000000000001/complete'
    );

    expect(res.status).toBe(400);
  });

  it('should reject if cancelled', async () => {
    (prisma.energyProject.findFirst as jest.Mock).mockResolvedValue({
      id: 'eb000000-0000-4000-a000-000000000001',
      status: 'CANCELLED',
    });

    const res = await request(app).put(
      '/api/projects/eb000000-0000-4000-a000-000000000001/complete'
    );

    expect(res.status).toBe(400);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyProject.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put(
      '/api/projects/00000000-0000-0000-0000-000000000099/complete'
    );

    expect(res.status).toBe(404);
  });
});

describe('GET /api/projects/roi-summary', () => {
  it('should return ROI summary', async () => {
    (prisma.energyProject.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'eb000000-0000-4000-a000-000000000001',
        status: 'COMPLETED',
        investmentCost: 25000,
        estimatedSavings: 30000,
        actualSavings: 28000,
        paybackMonths: 24,
      },
      {
        id: 'eb000000-0000-4000-a000-000000000002',
        status: 'IN_PROGRESS',
        investmentCost: 10000,
        estimatedSavings: 15000,
        actualSavings: 5000,
        paybackMonths: 12,
      },
    ]);

    const res = await request(app).get('/api/projects/roi-summary');

    expect(res.status).toBe(200);
    expect(res.body.data.totalInvestment).toBe(35000);
    expect(res.body.data.totalActualSavings).toBe(33000);
    expect(res.body.data.completedProjects).toBe(1);
    expect(res.body.data.inProgressProjects).toBe(1);
  });

  it('should handle empty projects', async () => {
    (prisma.energyProject.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/projects/roi-summary');

    expect(res.status).toBe(200);
    expect(res.body.data.totalInvestment).toBe(0);
    expect(res.body.data.overallROI).toBe(0);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    (prisma.energyProject.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    (prisma.energyProject.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/projects').send({
      title: 'LED Lighting Upgrade',
      type: 'EFFICIENCY',
      estimatedSavings: 12000,
      investmentCost: 25000,
      paybackMonths: 24,
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
