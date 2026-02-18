import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    analyticsReport: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    analyticsReportRun: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
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

import reportsRouter from '../src/routes/reports';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/reports', reportsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/reports — List reports
// ===================================================================
describe('GET /api/reports', () => {
  it('should return a list of reports with pagination', async () => {
    const reports = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Monthly Safety',
        type: 'SCHEDULED',
        format: 'PDF',
      },
      { id: 'rpt-2', name: 'Ad Hoc Quality', type: 'AD_HOC', format: 'EXCEL' },
    ];
    (prisma as any).analyticsReport.findMany.mockResolvedValue(reports);
    (prisma as any).analyticsReport.count.mockResolvedValue(2);

    const res = await request(app).get('/api/reports');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by type', async () => {
    (prisma as any).analyticsReport.findMany.mockResolvedValue([]);
    (prisma as any).analyticsReport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/reports?type=SCHEDULED');

    expect(res.status).toBe(200);
    expect((prisma as any).analyticsReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'SCHEDULED' }) })
    );
  });

  it('should handle server errors', async () => {
    (prisma as any).analyticsReport.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/reports');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/reports — Create report
// ===================================================================
describe('POST /api/reports', () => {
  it('should create a new report', async () => {
    const created = { id: 'rpt-new', name: 'New Report', type: 'AD_HOC', format: 'PDF' };
    (prisma as any).analyticsReport.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/reports')
      .send({
        name: 'New Report',
        type: 'AD_HOC',
        format: 'PDF',
        query: { table: 'incidents' },
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('New Report');
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/reports').send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ===================================================================
// GET /api/reports/:id — Get by ID
// ===================================================================
describe('GET /api/reports/:id', () => {
  it('should return a report with recent runs', async () => {
    const report = { id: '00000000-0000-0000-0000-000000000001', name: 'Test', runs: [] };
    (prisma as any).analyticsReport.findFirst.mockResolvedValue(report);

    const res = await request(app).get('/api/reports/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent report', async () => {
    (prisma as any).analyticsReport.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/reports/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// PUT /api/reports/:id — Update
// ===================================================================
describe('PUT /api/reports/:id', () => {
  it('should update a report', async () => {
    (prisma as any).analyticsReport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).analyticsReport.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated',
    });

    const res = await request(app)
      .put('/api/reports/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 for non-existent report', async () => {
    (prisma as any).analyticsReport.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/reports/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// DELETE /api/reports/:id — Soft delete
// ===================================================================
describe('DELETE /api/reports/:id', () => {
  it('should soft delete a report', async () => {
    (prisma as any).analyticsReport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).analyticsReport.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/reports/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Report deleted');
  });

  it('should return 404 for non-existent report', async () => {
    (prisma as any).analyticsReport.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/reports/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// POST /api/reports/:id/run — Execute report
// ===================================================================
describe('POST /api/reports/:id/run', () => {
  it('should queue a report run', async () => {
    (prisma as any).analyticsReport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).analyticsReportRun.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      reportId: 'rpt-1',
      status: 'QUEUED',
    });
    (prisma as any).analyticsReport.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).post('/api/reports/00000000-0000-0000-0000-000000000001/run');

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('QUEUED');
  });

  it('should return 404 for non-existent report', async () => {
    (prisma as any).analyticsReport.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/reports/00000000-0000-0000-0000-000000000099/run');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// GET /api/reports/:id/runs — List runs
// ===================================================================
describe('GET /api/reports/:id/runs', () => {
  it('should list report runs', async () => {
    (prisma as any).analyticsReport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).analyticsReportRun.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', status: 'COMPLETED' },
    ]);
    (prisma as any).analyticsReportRun.count.mockResolvedValue(1);

    const res = await request(app).get('/api/reports/00000000-0000-0000-0000-000000000001/runs');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return 404 for non-existent report', async () => {
    (prisma as any).analyticsReport.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/reports/00000000-0000-0000-0000-000000000099/runs');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// GET /api/reports/:id/runs/:runId — Get specific run
// ===================================================================
describe('GET /api/reports/:id/runs/:runId', () => {
  it('should return a specific run', async () => {
    const run = {
      id: '00000000-0000-0000-0000-000000000001',
      reportId: 'rpt-1',
      status: 'COMPLETED',
      report: { id: '00000000-0000-0000-0000-000000000001' },
    };
    (prisma as any).analyticsReportRun.findFirst.mockResolvedValue(run);

    const res = await request(app).get(
      '/api/reports/00000000-0000-0000-0000-000000000001/runs/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent run', async () => {
    (prisma as any).analyticsReportRun.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/reports/00000000-0000-0000-0000-000000000001/runs/00000000-0000-0000-0000-000000000099'
    );

    expect(res.status).toBe(404);
  });
});
