import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    gdprDataCategory: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    dataProcessingAgreement: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    dataRequest: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: (_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', email: 'a@b.com' };
    next();
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import gdprRouter from '../src/routes/gdpr';
import { prisma } from '../src/prisma';
import { runGdprMonitorJob } from '../src/jobs/gdpr-monitor.job';

const app = express();
app.use(express.json());
app.use('/api/gdpr', gdprRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/gdpr/categories', () => {
  it('lists all GDPR data categories', async () => {
    (prisma.gdprDataCategory.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'cat-1',
        category: 'Customer PII',
        legalBasis: 'CONTRACT',
        complianceStatus: 'COMPLIANT',
      },
    ]);

    const res = await request(app).get('/api/gdpr/categories');
    expect(res.status).toBe(200);
    expect(res.body.data.categories).toHaveLength(1);
  });
});

describe('GET /api/gdpr/dpas', () => {
  it('lists data processing agreements', async () => {
    (prisma.dataProcessingAgreement.findMany as jest.Mock).mockResolvedValue([
      { id: 'dpa-1', processorName: 'AWS', purpose: 'Cloud hosting', isActive: true },
    ]);

    const res = await request(app).get('/api/gdpr/dpas');
    expect(res.status).toBe(200);
    expect(res.body.data.dpas).toHaveLength(1);
  });
});

describe('GET /api/gdpr/report', () => {
  it('returns GDPR compliance report with summary', async () => {
    (prisma.gdprDataCategory.findMany as jest.Mock).mockResolvedValue([
      { id: 'cat-1', category: 'Customer PII', complianceStatus: 'COMPLIANT' },
      { id: 'cat-2', category: 'Employee Data', complianceStatus: 'AT_RISK' },
    ]);
    (prisma.dataProcessingAgreement.findMany as jest.Mock).mockResolvedValue([
      { id: 'dpa-1', processorName: 'AWS', isActive: true },
    ]);
    (prisma.dataRequest.findMany as jest.Mock).mockResolvedValue([
      { id: 'dr-1', status: 'COMPLETED' },
      { id: 'dr-2', status: 'PROCESSING' },
    ]);

    const res = await request(app).get('/api/gdpr/report');
    expect(res.status).toBe(200);
    expect(res.body.data.summary.totalCategories).toBe(2);
    expect(res.body.data.summary.atRiskCategories).toBe(1);
    expect(res.body.data.summary.totalDpas).toBe(1);
    expect(res.body.data.summary.activeDpas).toBe(1);
    expect(res.body.data.requestStats.completed).toBe(1);
    expect(res.body.data.requestStats.processing).toBe(1);
  });
});

describe('POST /api/gdpr/categories', () => {
  it('creates a data category', async () => {
    (prisma.gdprDataCategory.create as jest.Mock).mockResolvedValue({
      id: 'cat-new',
      category: 'Marketing Data',
      legalBasis: 'CONSENT',
    });

    const res = await request(app)
      .post('/api/gdpr/categories')
      .send({ category: 'Marketing Data', legalBasis: 'CONSENT' });
    expect(res.status).toBe(201);
    expect(res.body.data.category.category).toBe('Marketing Data');
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app).post('/api/gdpr/categories').send({ category: 'Missing Basis' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/gdpr/dpas', () => {
  it('creates a DPA', async () => {
    (prisma.dataProcessingAgreement.create as jest.Mock).mockResolvedValue({
      id: 'dpa-new',
      processorName: 'Stripe',
      purpose: 'Payments',
    });

    const res = await request(app)
      .post('/api/gdpr/dpas')
      .send({ processorName: 'Stripe', purpose: 'Payments' });
    expect(res.status).toBe(201);
    expect(res.body.data.dpa.processorName).toBe('Stripe');
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app).post('/api/gdpr/dpas').send({ processorName: 'Incomplete' });
    expect(res.status).toBe(400);
  });
});

describe('GDPR monitor job', () => {
  it('flags overdue categories as AT_RISK', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 400);

    (prisma.gdprDataCategory.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'cat-1',
        category: 'Old Data',
        retentionDays: 365,
        complianceStatus: 'COMPLIANT',
        createdAt: oldDate,
      },
    ]);
    (prisma.gdprDataCategory.update as jest.Mock).mockResolvedValue({});

    await runGdprMonitorJob();

    expect(prisma.gdprDataCategory.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cat-1' },
        data: { complianceStatus: 'AT_RISK' },
      })
    );
  });

  it('does not flag categories within retention period', async () => {
    (prisma.gdprDataCategory.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'cat-1',
        category: 'Recent Data',
        retentionDays: 365,
        complianceStatus: 'COMPLIANT',
        createdAt: new Date(),
      },
    ]);

    await runGdprMonitorJob();

    expect(prisma.gdprDataCategory.update).not.toHaveBeenCalled();
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET /categories returns 500 on DB error', async () => {
    (prisma.gdprDataCategory.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/gdpr/categories');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /dpas returns 500 on DB error', async () => {
    (prisma.dataProcessingAgreement.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/gdpr/dpas');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /categories returns 500 when create fails', async () => {
    (prisma.gdprDataCategory.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/gdpr/categories').send({ category: 'Marketing Data', legalBasis: 'CONSENT' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /dpas returns 500 when create fails', async () => {
    (prisma.dataProcessingAgreement.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/gdpr/dpas').send({ processorName: 'Vendor Corp', purpose: 'Analytics' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GDPR Monitor — extended', () => {
  it('GET /report returns success true on 200', async () => {
    (prisma.gdprDataCategory.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.dataProcessingAgreement.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.dataRequest.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/gdpr/report');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /categories returns empty categories array when none exist', async () => {
    (prisma.gdprDataCategory.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/gdpr/categories');
    expect(res.status).toBe(200);
    expect(res.body.data.categories).toHaveLength(0);
  });
});
